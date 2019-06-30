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
        minlength: [5,'Mínimo de 5 caracteres no campo nome'], // Mensagens de erro para o model
        maxlength: [100, 'Máximo de 100 caracteres no campo nome']
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

// Adiciona método ao model
userSchema.methods.matches = function (password: String): boolean {
    return bcrypt.compareSync(password, this.password)
}

// Middlewares

// Função para criptografar um password
const hashPassword = (obj: User, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds).then(hash => {
        obj.password = hash
        next()
    })
}

// Middleware que será chamado sempre que for criar um usuário
// verifica se houver modificação no pass ( no caso na criação existe ), ele será criptografado
const createUserMiddleware = function (next) {
    const user: User = this
    if (!user.isModified('password')) {
        next()
    } else {
        hashPassword(user, next)
    }
}

// A mesma coisa acontece aqui caso aconteça um update no user
const updateMiddleware = function (next) {

    if (!this.getUpdate().password) {
        // vai cair aqui quando o documento for novo, ou um post q nao alterou o password
        next()

    } else {
        hashPassword(this.getUpdate(), next)
    }
}

// Utiliza cada uma dessas funções em determinadas ações do mongoose, ex: pra salvar um usuário (save) antes vai chamar o createUserMiddleware
userSchema.pre('save', createUserMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware)
userSchema.pre('update', updateMiddleware)

export const User = mongoose.model<User>('User', userSchema);