"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const mongoose = require("mongoose");
const corsMiddleware = require("restify-cors-middleware");
const environment_1 = require("./common/environment");
const error_handler_1 = require("./common/error.handler");
const helpers_1 = require("./common/helpers");
const user_controller_1 = require("./controllers/user.controller");
const alert_controller_1 = require("./controllers/alert.controller");
const alert_type_controller_1 = require("./controllers/alert-type.controller");
const helpers_2 = require("./common/helpers");
class Server {
    initRoutes() {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'hazard-api',
                    version: '1.0.0'
                });
                const cors = corsMiddleware({
                    origins: ['http://localhost:3000', 'http://localhost'],
                    allowHeaders: ["*"],
                    exposeHeaders: ["*"]
                });
                this.application.pre(cors.preflight);
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(helpers_2.tokenParser);
                this.application.on('restifyError', error_handler_1.handleError);
                this.application.use(cors.actual);
                this.application.listen(environment_1.environment.server.port, () => resolve(this.application));
                /* ROTAS */
                this.application.get('/users/:id', [helpers_1.validateId, user_controller_1.UserController.find]);
                this.application.post('/users', user_controller_1.UserController.create);
                this.application.post('/users/authenticate', user_controller_1.UserController.authenticate);
                this.application.get('/alerts', alert_controller_1.AlertController.getAll);
                this.application.get('/alerts/:id', [helpers_1.validateId, alert_controller_1.AlertController.findOne]);
                this.application.post('/alerts', alert_controller_1.AlertController.create);
                this.application.put('/alerts/:id', [helpers_1.validateId, alert_controller_1.AlertController.update]);
                this.application.del('/alerts/:id', [helpers_1.validateId, alert_controller_1.AlertController.delete]);
                this.application.get('/alert-types', alert_type_controller_1.AlertTypeController.getAll);
                this.application.post('/alert-types', alert_type_controller_1.AlertTypeController.create);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    initDb() {
        mongoose.Promise = global.Promise;
        return mongoose.connect(environment_1.environment.db.url, {
            useMongoClient: true
        });
    }
    boostrap() {
        return this.initDb().then(() => this.initRoutes().then(() => this));
    }
}
exports.Server = Server;
