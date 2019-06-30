"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const alert_model_1 = require("../models/alert.model");
const jwt = require("jsonwebtoken");
const environment_1 = require("../common/environment");
const restify_errors_1 = require("restify-errors");
class UserController {
}
/**
 * Método para criação do usuário
 */
UserController.create = (req, res, next) => {
    // Pega e-mail do body
    const { email } = req.body;
    // Primeiro verifica se não existe nenhum e-mail já cadastrado com o email enviado
    user_model_1.User.findOne({ email }).then(result => {
        if (!result) {
            // Se não tiver, cria o usuário
            let newUser = new user_model_1.User(req.body);
            newUser.save().then(userSaved => {
                // Deixa o password como undefined somente para não mostrar ao usuário
                userSaved.password = undefined;
                const token = jwt.sign({ subject: userSaved.email, iss: 'hazard-api' }, environment_1.environment.security.apiSecret);
                res.send(200, {
                    user: {
                        _id: userSaved._id,
                        name: userSaved.name,
                        email: userSaved.email,
                        alerts: [],
                        accessToken: token
                    }
                });
                return next(false);
            }).catch(next);
        }
        else {
            return next(new restify_errors_1.ConflictError('E-mail already registered'));
        }
    }).catch(next);
};
/**
 * Função para buscar os dados de um usuário e trazer os seus alertas criados tb
 */
UserController.find = (req, res, next) => {
    user_model_1.User.findById(req.params.id).then(user => {
        if (user) {
            alert_model_1.Alert.find({ userId: user._id }).then(alerts => {
                res.send(200, {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        alerts: alerts ? alerts : []
                    }
                });
                return next(false);
            }).catch(next);
        }
        else {
            return next(new restify_errors_1.NotFoundError('User not found'));
        }
    }).catch(next);
};
UserController.authenticate = (req, res, next) => {
    const { email, password } = req.body;
    user_model_1.User.findOne({ email }, "+password").then(user => {
        if (user && user.matches(password)) {
            const token = jwt.sign({ subject: user.email, iss: 'hazard-api' }, environment_1.environment.security.apiSecret);
            alert_model_1.Alert.find({ userId: user._id }).then(alerts => {
                res.send(200, {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        alerts: alerts ? alerts : [],
                        accessToken: token
                    }
                });
                return next(false);
            }).catch(next);
        }
        else {
            return next(new restify_errors_1.NotAuthorizedError('Invalid credencials'));
        }
    }).catch(next);
};
exports.UserController = UserController;
