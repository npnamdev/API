const mongoose = require('mongoose');

const userGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: true
    }]
}, { timestamps: true });

const UserGroup = mongoose.model('UserGroup', userGroupSchema);

module.exports = UserGroup;
