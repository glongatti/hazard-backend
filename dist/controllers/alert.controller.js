"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alert_model_1 = require("../models/alert.model");
const alert_type_model_1 = require("../models/alert-type.model");
const restify_errors_1 = require("restify-errors");
class AlertController {
}
AlertController.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    /**
   * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição,
   * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
   *  */
    if (!req.authenticated) {
        return next(new restify_errors_1.BadRequestError('Invalid token or not exist'));
    }
    let alert = new alert_model_1.Alert(req.body);
    alert.createdAt = new Date();
    alert.userId = req.authenticated._id;
    yield alert_type_model_1.AlertType.findById(alert.alertType._id).then(type => {
        if (type) {
            alert.alertType = type;
        }
        else {
            return next(new restify_errors_1.NotFoundError('Alert type not found'));
        }
    }).catch(next);
    alert.save().then(alert => {
        res.send(200, alert);
    }).catch(next);
    return next();
});
AlertController.getAll = (req, res, next) => {
    alert_model_1.Alert.find().then(alerts => {
        res.send(200, alerts);
        return next(false);
    });
};
AlertController.findOne = (req, res, next) => {
    if (!req.authenticated) {
        return next(new restify_errors_1.BadRequestError('Invalid token or not exist'));
    }
    alert_model_1.Alert.findById(req.params.id).then(alert => {
        if (alert) {
            res.send(200, alert);
            return next(false);
        }
        else {
            return next(new restify_errors_1.NotFoundError('Alert not found'));
        }
    }).catch(next);
};
AlertController.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    /**
     * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição,
     * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
     *  */
    if (!req.authenticated) {
        return next(new restify_errors_1.BadRequestError('Invalid token or not exist'));
    }
    // Puxa as informações do antigo alerta para ver se o que ele tá querendo
    //  alterar é o que ele tem cadastrado
    alert_model_1.Alert.findOne({ userId: req.authenticated._id }).then((alertResult) => __awaiter(this, void 0, void 0, function* () {
        if (!alertResult) {
            return next(new restify_errors_1.NotFoundError('Alert not found'));
        }
        // Cria alerta 
        let alert = {
            name: req.body.name,
            description: req.body.description,
            lat: req.body.lat,
            lng: req.body.lng,
            alertType: alertResult.alertType,
            createdAt: alertResult.createdAt,
            userId: req.authenticated._id
        };
        // Se o id do tipoAlerta for diferente do antigo
        // Puxa as informações do novo e substitui, caso contrário mantém o antigo
        if (req.body.alertType._id !== alertResult.alertType._id) {
            yield alert_type_model_1.AlertType.findById(alertResult.alertType._id).then(type => {
                alert.alertType = type;
            }).catch(next);
        }
        const options = { overwrite: true, runValidators: true };
        // Faz o update do Alerta e retorna com 200 caso tenha ocorrido com sucesso
        alert_model_1.Alert.update({ _id: req.params.id }, alert, options).exec().then(result => {
            if (result.n) {
                return alert_model_1.Alert.findById(req.params.id).exec();
            }
        }).then(newAlert => {
            res.send(200, newAlert);
        }).catch(next);
    })).catch(next);
});
AlertController.delete = (req, res, next) => {
    /**
     * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição,
     * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
     *  */
    if (!req.authenticated) {
        return next(new restify_errors_1.BadRequestError('Invalid token or not exist'));
    }
    // Puxa as informações do antigo alerta para ver se o que ele tá querendo
    //  excluir é o que ele tem cadastrado
    alert_model_1.Alert.findOne({ userId: req.authenticated._id }).then((alertResult) => __awaiter(this, void 0, void 0, function* () {
        if (!alertResult) {
            return next(new restify_errors_1.NotFoundError('Alert not found'));
        }
        alert_model_1.Alert.remove({ _id: req.params.id }).exec().then((cmdResult) => {
            if (cmdResult.result.n) {
                res.send(204);
            }
        }).catch(next);
    })).catch(next);
};
exports.AlertController = AlertController;
