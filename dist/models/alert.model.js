"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const alert_type_model_1 = require("./alert-type.model");
const alertSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 80
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 250
    },
    createdAt: {
        type: Date,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    alertType: {
        type: alert_type_model_1.alertTypeSchema,
        ref: 'alert-type',
        required: true,
        select: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
});
exports.Alert = mongoose.model('Alert', alertSchema);
