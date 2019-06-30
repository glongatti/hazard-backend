import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

import { environment } from '../common/environment'

export interface User extends mongoose.Document {
    name: String,
    email: String,
    password: String,
    matches(password: String): boolean
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Campo nome é obrigatório'],
        minlength: [5,'Poucos caracteres no nome'],
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true, // campo unico
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

    },
    password: {
        type: String,
        required: true,
        select: false // indica pro mongoose q nao deve trazer por padrao na hora de exibir
    }

})

userSchema.methods.matches = function (password: String): boolean {
    return bcrypt.compareSync(password, this.password)
}

// Middlewares

const hashPassword = (obj: User, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds).then(hash => {
        obj.password = hash
        next()
    })
}

const createUserMiddleware = function (next) {
    const user: User = this
    if (!user.isModified('password')) {
        next()
    } else {
        hashPassword(user, next)
    }
}

const updateMiddleware = function (next) {

    if (!this.getUpdate().password) {
        // vai cair aqui quando o documento for novo, ou um post q nao alterou o password
        next()

    } else {
        hashPassword(this.getUpdate(), next)
    }
}
userSchema.pre('save', createUserMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware)
userSchema.pre('update', updateMiddleware)

export const User = mongoose.model<User>('User', userSchema);