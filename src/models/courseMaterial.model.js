const mongoose = require("mongoose");

const courseMaterialSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
        order: { type: Number, default: 0 },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    },
    { timestamps: true }
);

const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);

module.exports = CourseMaterial;
