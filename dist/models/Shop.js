"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shopSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Shop name is required'],
        unique: true,
        trim: true,
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required'],
    },
}, {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
});
exports.default = (0, mongoose_1.model)('Shop', shopSchema);
