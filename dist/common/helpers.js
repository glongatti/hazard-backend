"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
const jwt = require("jsonwebtoken");
const environment_1 = require("./environment");
const user_model_1 = require("../models/user.model");
/**
     * Função utilizada em todas as requisições que possue o parâmetro :id no path
     * Ela valida caso o ID passado é um ObjectId de fato
     */
exports.validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        next(new restify_errors_1.NotFoundError('Documento não encontrado'));
    }
    else {
        next();
    }
};
exports.tokenParser = (req, res, next) => {
    const token = extractToken(req);
    if (token) {
        jwt.verify(token, environment_1.environment.security.apiSecret, applyBearer(req, next));
    }
    else {
        next();
    }
};
function extractToken(req) {
    let token = undefined;
    const authorization = req.header('authorization');
    if (authorization) {
        const parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    return token;
}
exports.extractToken = extractToken;
function applyBearer(req, next) {
    return (error, decoded) => {
        // console.log('decoded', decoded)
        if (decoded) {
            // ou decoded.subject **************************
            user_model_1.User.findOne({ email: decoded.subject }).then(user => {
                if (user) {
                    // associar o usuario no request
                    req.authenticated = user;
                }
                next();
            }).catch(next);
        }
        else {
            next();
        }
    };
}
