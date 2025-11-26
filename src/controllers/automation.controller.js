const Automation = require('../models/automation.model');
const axios = require('axios');
const Notification = require('../models/notification.model');

exports.getAllAutomations = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search } = request.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const automations = await Automation.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Automation.countDocuments(query);

        reply.send({
            data: automations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        reply.code(500).send({ message: 'Error fetching automations', error: error.message });
    }
};

exports.getAutomationById = async (request, reply) => {
    try {
        const { id } = request.params;
        const automation = await Automation.findById(id);

        if (!automation) {
            return reply.code(404).send({ message: 'Automation not found' });
        }

        reply.send(automation);
    } catch (error) {
        reply.code(500).send({ message: 'Error fetching automation', error: error.message });
    }
};

exports.createAutomation = async (request, reply) => {
    try {
        const { name, description, triggers, conditionLogic, conditions, actions, enabled } = request.body;

        // Sanitize actions config based on type
        const sanitizedActions = sanitizeActions(actions);

        const automation = new Automation({
            name,
            description,
            triggers,
            conditionLogic,
            conditions,
            actions: sanitizedActions,
            enabled
        });

        await automation.save();
        reply.code(201).send(automation);
    } catch (error) {
        reply.code(500).send({ message: 'Error creating automation', error: error.message });
    }
};

exports.updateAutomation = async (request, reply) => {
    try {
        const { id } = request.params;
        const updates = request.body;

        // Sanitize actions config based on type
        if (updates.actions && Array.isArray(updates.actions)) {
            updates.actions = sanitizeActions(updates.actions);
        }

        const automation = await Automation.findOneAndUpdate(
            { _id: id },
            updates,
            { new: true, runValidators: true }
        );

        if (!automation) {
            return reply.code(404).send({ message: 'Automation not found' });
        }

        reply.send(automation);
    } catch (error) {
        reply.code(500).send({ message: 'Error updating automation', error: error.message });
    }
};

exports.deleteAutomation = async (request, reply) => {
    try {
        const { id } = request.params;
        const automation = await Automation.findOneAndDelete({ _id: id });

        if (!automation) {
            return reply.code(404).send({ message: 'Automation not found' });
        }

        reply.send({ message: 'Automation deleted successfully' });
    } catch (error) {
        reply.code(500).send({ message: 'Error deleting automation', error: error.message });
    }
};

exports.deleteMultipleAutomations = async (request, reply) => {
    try {
        const { ids } = request.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ error: 'IDs must be a non-empty array' });
        }
        const result = await Automation.deleteMany({ _id: { $in: ids } });
        reply.send({ message: `${result.deletedCount} automations deleted successfully` });
    } catch (error) {
        reply.code(500).send({ message: 'Error deleting automations', error: error.message });
    }
};

exports.runAutomation = async (request, reply) => {
    try {
        const { id } = request.params;
        const automation = await Automation.findById(id);

        if (!automation) {
            return reply.code(404).send({ message: 'Automation not found' });
        }

        if (!automation.enabled) {
            return reply.code(400).send({ message: 'Automation is disabled' });
        }

        // Increment run count
        await automation.incrementRunCount();

        // Check conditions
        let conditionMet = await checkConditions(automation.conditions, automation.conditionLogic);

        if (conditionMet) {
            // Execute actions
            await executeActions(automation.actions, request.server);
            await automation.incrementSuccessCount();
        } else {
            await automation.incrementFailureCount();
        }

        reply.send({ message: 'Automation executed', success: conditionMet });
    } catch (error) {
        reply.code(500).send({ message: 'Error running automation', error: error.message });
    }
};

// Helper function to check conditions
async function checkConditions(conditions, logic) {
    if (conditions.length === 0) return true;

    const results = [];
    for (const condition of conditions) {
        const result = await evaluateCondition(condition);
        results.push(result);
    }

    if (logic === 'AND') {
        return results.every(r => r);
    } else {
        return results.some(r => r);
    }
}

// Simple condition evaluation (can be expanded)
async function evaluateCondition(condition) {
    // For now, assume conditions are met (placeholder)
    // In real implementation, you would check against data sources
    return true;
}

// Execute actions
async function executeActions(actions, fastify) {
    for (const action of actions) {
        try {
            if (action.type === 'send_email') {
                await sendEmailAction(action.config, fastify);
            } else if (action.type === 'http_request') {
                await httpRequestAction(action.config);
            } else if (action.type === 'notification') {
                await sendNotificationAction(action.config, fastify);
            }
        } catch (error) {
            console.error(`Error executing action ${action.type}:`, error);
            // Continue with other actions or handle error
        }
    }
}

// Send email action
async function sendEmailAction(config, fastify) {
    const { to, subject, text, html } = config;
    await fastify.sendEmail({ to, subject, text, html });
}

// HTTP request action
async function httpRequestAction(config) {
    const { method = 'GET', url, headers = {}, body } = config;
    const options = {
        method,
        url,
        headers,
        data: body
    };
    await axios(options);
}

// Send notification action
async function sendNotificationAction(config, fastify) {
    const { message, type = 'info' } = config;
    const notification = new Notification({
        message,
        type
    });

    await notification.save();
    fastify.io.emit('notify', notification);
}

// Sanitize actions config based on type
function sanitizeActions(actions) {
    const actionConfigs = {
        send_email: ['to', 'subject', 'text', 'html'],
        http_request: ['method', 'url', 'headers', 'body'],
        notification: ['message', 'type']
    };

    return actions.map(action => {
        if (action.type && actionConfigs[action.type]) {
            const allowedKeys = actionConfigs[action.type];
            const sanitizedConfig = {};
            allowedKeys.forEach(key => {
                if (action.config && action.config[key] !== undefined) {
                    sanitizedConfig[key] = action.config[key];
                }
            });
            return {
                ...action,
                config: sanitizedConfig
            };
        }
        return action;
    });
}
