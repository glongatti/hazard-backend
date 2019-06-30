import * as mongoose from 'mongoose'
import { AlertType, alertTypeSchema } from './alert-type.model'
import { User } from './user.model'

export interface Alert extends mongoose.Document {
    name: String,
    description: String,
    createdAt: Date,
    lat: Number,
    lng: Number,
    userId: mongoose.Types.ObjectId | User,
    alertType: AlertType
}


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
        type: alertTypeSchema,
        ref: 'alert-type',
        required: true,
        select: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
})

export const Alert = mongoose.model<Alert>('Alert', alertSchema)