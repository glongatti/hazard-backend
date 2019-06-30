"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alert_type_model_1 = require("../models/alert-type.model");
class AlertTypeController {
}
AlertTypeController.create = (req, res, next) => {
    let type = new alert_type_model_1.AlertType(req.body);
    type.save().then(type => {
        res.send(200, type);
    });
    return next();
};
AlertTypeController.getAll = (req, res, next) => {
    alert_type_model_1.AlertType.find().then(types => {
        res.send(200, types);
    });
    return next(false);
};
exports.AlertTypeController = AlertTypeController;
