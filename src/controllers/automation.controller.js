const Automation = require('../models/automation.model');

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
            .limit(parseInt(limit))
            .lean();

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

        // Use AutomationService for consistency
        const AutomationService = require('../services/automation.service');
        await AutomationService.executeAutomation(automation, request.body || {}, request.server);

        reply.send({ message: 'Automation executed', success: true });
    } catch (error) {
        reply.code(500).send({ message: 'Error running automation', error: error.message });
    }
};

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
