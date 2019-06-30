import * as mongoose from 'mongoose'

export interface AlertType extends mongoose.Document {
    name: String
}

export const alertTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
})

export const AlertType = mongoose.model<AlertType>('alert-type', alertTypeSchema);