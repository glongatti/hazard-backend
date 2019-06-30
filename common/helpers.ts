import * as mongoose from 'mongoose'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'
import * as jwt from 'jsonwebtoken'

import { environment } from './environment'
import { User } from '../models/user.model'

/**
     * Função utilizada em todas as requisições que possue o parâmetro :id no path
     * Ela valida caso o ID passado é um ObjectId de fato
     */
export const validateId = (req: restify.Request, res: restify.Response, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        next(new NotFoundError('Documento não encontrado'))
    } else {
        next()
    }
}

export const tokenParser: restify.RequestHandler =  (req, res, next) => {
    const token = extractToken(req)
    if (token) {
        jwt.verify(token, environment.security.apiSecret, applyBearer(req, next))
    } else {
        next()
    }
}

export function extractToken(req: restify.Request) {

    let token = undefined
    const authorization = req.header('authorization')

    if (authorization) {
        const parts: string[] = authorization.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1]
        }
    }
    return token
}

function applyBearer(req: restify.Request, next): (error, decoded) => void {
    return (error, decoded) => {
       
        if (decoded) {
            User.findOne({ email: decoded.subject }).then(user => {
                if (user) {
                    // associar o usuario no request
                     req.authenticated = user
                }
                next()
            }).catch(next)
        } else {
             next()
        }
    }
}