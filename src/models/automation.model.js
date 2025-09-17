const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TriggerSchema = new Schema({
    type: { type: String, required: true },
    condition: { type: Schema.Types.Mixed }
});

const ActionSchema = new Schema({
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true }
});

const AutomationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    triggers: [TriggerSchema],
    actions: [ActionSchema],
}, { timestamps: true });

const Automation = model('Automation', AutomationSchema);

module.exports = Automation;
