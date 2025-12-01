const mongoose = require('mongoose');

const ActivationCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    codeType: { type: String, enum: ['single', 'multi'], default: 'single' },
    quantity: { type: Number, default: 1 },
    used: { type: Number, default: 0 },
    usageDays: { type: Number, default: 30 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, {
    timestamps: true
});

ActivationCodeSchema.pre('save', function (next) {
    if (this.codeType === 'single') {
        this.quantity = 1;
    }
    next();
});

module.exports = mongoose.model('ActivationCode', ActivationCodeSchema);
