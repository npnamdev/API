const Automation = require('../models/automation.model');

class AutomationService {
    // Trigger automation based on event type
    static async triggerAutomation(eventType, data, fastify) {
        try {
            // Find all enabled automations with matching trigger
            const automations = await Automation.find({
                enabled: true,
                'triggers.type': eventType
            });

            for (const automation of automations) {
                await this.executeAutomation(automation, data, fastify);
            }
        } catch (error) {
            console.error('Error triggering automation:', error);
        }
    }

    // Execute a single automation
    static async executeAutomation(automation, data, fastify) {
        try {
            // Increment run count
            await automation.incrementRunCount();

            // Check conditions
            let conditionMet = await this.checkConditions(automation.conditions, automation.conditionLogic, data);

            if (conditionMet) {
                // Execute actions
                await this.executeActions(automation.actions, data, fastify);
                await automation.incrementSuccessCount();
            } else {
                await automation.incrementFailureCount();
            }
        } catch (error) {
            console.error('Error executing automation:', error);
            await automation.incrementFailureCount();
        }
    }

    // Check conditions with data context
    static async checkConditions(conditions, logic, data) {
        if (conditions.length === 0) return true;

        const results = [];
        for (const condition of conditions) {
            const result = await this.evaluateCondition(condition, data);
            results.push(result);
        }

        if (logic === 'AND') {
            return results.every(r => r);
        } else {
            return results.some(r => r);
        }
    }

    // Evaluate condition against data
    static async evaluateCondition(condition, data) {
        const { field, operator, value } = condition;
        const fieldValue = this.getNestedValue(data, field);

        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'not_equals':
                return fieldValue !== value;
            case 'contains':
                return String(fieldValue).includes(String(value));
            case 'starts_with':
                return String(fieldValue).startsWith(String(value));
            case 'ends_with':
                return String(fieldValue).endsWith(String(value));
            case 'greater_than':
                return Number(fieldValue) > Number(value);
            case 'less_than':
                return Number(fieldValue) < Number(value);
            case 'greater_or_equal':
                return Number(fieldValue) >= Number(value);
            case 'less_or_equal':
                return Number(fieldValue) <= Number(value);
            default:
                return false;
        }
    }

    // Get nested value from object
    static getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Execute actions with data context
    static async executeActions(actions, data, fastify) {
        const axios = require('axios');

        for (const action of actions) {
            try {
                if (action.type === 'send_email') {
                    await this.sendEmailAction(action.config, data, fastify);
                } else if (action.type === 'http_request') {
                    await this.httpRequestAction(action.config, data);
                }
            } catch (error) {
                console.error(`Error executing action ${action.type}:`, error);
            }
        }
    }

    // Send email action with data interpolation
    static async sendEmailAction(config, data, fastify) {
        const { to, subject, text, html } = config;

        // Simple template interpolation
        const interpolate = (str) => str.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);

        const interpolatedConfig = {
            to: interpolate(to),
            subject: interpolate(subject),
            text: text ? interpolate(text) : undefined,
            html: html ? interpolate(html) : undefined
        };

        await fastify.sendEmail(interpolatedConfig);
    }

    // HTTP request action
    static async httpRequestAction(config, data) {
        const axios = require('axios');
        const { method = 'GET', url, headers = {}, body } = config;

        // Interpolate URL and body
        const interpolate = (str) => str.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);

        const options = {
            method,
            url: interpolate(url),
            headers,
            data: body ? JSON.parse(interpolate(JSON.stringify(body))) : undefined
        };

        await axios(options);
    }
}

module.exports = AutomationService;