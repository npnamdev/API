const mongoose = require('mongoose');

// === Trigger Schema ===
const TriggerSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['login', 'user_deleted'],
    },
    config: { type: Object, default: {} }
}, { _id: false });

// === Condition Schema ===
const ConditionSchema = new mongoose.Schema({
    field: { type: String, required: true },
    operator: {
        type: String,
        required: true,
        enum: [
            'equals', 'not_equals', 'contains', 'starts_with', 'ends_with',
            'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'
        ]
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

// === Action Schema ===
const ActionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['send_email', 'http_request', 'notification'],
        default: null
    },
    config: { type: Object, default: {} },
    order: { type: Number, default: 1 }
}, { _id: false });

// === Automation Schema ===
const AutomationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    triggers: { type: [TriggerSchema], default: [] },
    conditionLogic: { type: String, enum: ['AND', 'OR'], default: 'AND' },
    conditions: { type: [ConditionSchema], default: [] },
    actions: { type: [ActionSchema], default: [] },

    enabled: { type: Boolean, default: true },
    lastRun: Date,
    runCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },

    createdBy: String
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtuals
AutomationSchema.virtual('successRate').get(function () {
    if (this.runCount === 0) return 0;
    return ((this.successCount / this.runCount) * 100).toFixed(2);
});

AutomationSchema.virtual('isActive').get(function () {
    return this.enabled;
});

// Methods tăng counters
AutomationSchema.methods.incrementRunCount = async function () {
    this.runCount += 1;
    this.lastRun = new Date();
    await this.save();
};

AutomationSchema.methods.incrementSuccessCount = async function () {
    this.successCount += 1;
    await this.save();
};

AutomationSchema.methods.incrementFailureCount = async function () {
    this.failureCount += 1;
    await this.save();
};

// --- Custom validator cho update ---
// Kiểm tra triggers & actions bắt buộc khi update
AutomationSchema.pre('save', function (next) {
    if (!this.isNew) { // Chỉ check khi update
        if (!this.triggers || this.triggers.length === 0) {
            return next(new Error('Automation must have at least one trigger when updating.'));
        }
        if (!this.actions || this.actions.length === 0) {
            return next(new Error('Automation must have at least one action when updating.'));
        }
    }
    next();
});

const Automation = mongoose.model('Automation', AutomationSchema);
module.exports = Automation;