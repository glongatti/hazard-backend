
import * as restify from 'restify'
import { Alert } from '../models/alert.model';
import { AlertType } from '../models/alert-type.model';
import { NotFoundError, BadRequestError } from 'restify-errors'

export class AlertController {


    static create = async (req: restify.Request, res: restify.Response, next) => {

        /**
       * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição, 
       * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
       *  */

        if (!req.authenticated) {
            return next(new BadRequestError('Invalid token or not exist'))
        }

        let alert = new Alert(req.body)
        alert.createdAt = new Date()
        alert.userId = req.authenticated._id // credenciais vindo do token  (função tokenParser)

        await AlertType.findById(alert.alertType._id).then(type => {
            if (type) {
                alert.alertType = type
            } else {
                return next(new NotFoundError('Alert type not found'))
            }
        }).catch(next)

        alert.save().then(alert => {
            res.send(200, alert)
        }).catch(next)

        return next()
    }


    static getAll = (req: restify.Request, res: restify.Response, next) => {
        Alert.find().then(alerts => {
            res.send(200, alerts)
            return next(false)
        })
    }

    static findOne = (req: restify.Request, res: restify.Response, next) => {

        if (!req.authenticated) {
            return next(new BadRequestError('Invalid token or not exist'))
        }

        Alert.findById(req.params.id).then(alert => {
            if (alert) {
                res.send(200, alert)
                return next(false)
            } else {
                return next(new NotFoundError('Alert not found'))
            }

        }).catch(next)
    }

    static update = async (req: restify.Request, res: restify.Response, next) => {

        /**
         * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição, 
         * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
         *  */
        if (!req.authenticated) {
            return next(new BadRequestError('Invalid token or not exist'))
        }


        // Puxa as informações do antigo alerta para ver se o que ele tá querendo
        //  alterar é o que ele tem cadastrado

        Alert.findOne({ userId: req.authenticated._id }).then(async (alertResult) => {


            if (!alertResult) {
                return next(new NotFoundError('Alert not found'))
            }

            // Cria alerta 
            let alert: any = {
                name: req.body.name,
                description: req.body.description,
                lat: req.body.lat,
                lng: req.body.lng,
                alertType: alertResult.alertType,
                createdAt: alertResult.createdAt,
                userId: req.authenticated._id
            }



            // Se o id do tipoAlerta for diferente do antigo
            // Puxa as informações do novo e substitui, caso contrário mantém o antigo
            if (req.body.alertType._id !== alertResult.alertType._id) {
                await AlertType.findById(alertResult.alertType._id).then(type => {
                    alert.alertType = type
                }).catch(next)
            }



            const options = { overwrite: true, runValidators: true }

            // Faz o update do Alerta e retorna com 200 caso tenha ocorrido com sucesso
            Alert.update({ _id: req.params.id }, alert, options).exec().then(result => {
                if (result.n) {
                    return Alert.findById(req.params.id).exec()
                }
            }).then(newAlert => {
                res.send(200, newAlert)
            }).catch(next)

        }).catch(next)
    }

    static delete = (req: restify.Request, res: restify.Response, next) => {

        /**
         * Verifica se o usuário está autenticado pelo token ( Já tem uma função) que antes de toda requisição, 
         * verifica se o header tem o token, se tiver, decodifica e joga o user inteiro na propriedade req.authenticated
         *  */
        if (!req.authenticated) {
            return next(new BadRequestError('Invalid token or not exist'))
        }

        // Puxa as informações do antigo alerta para ver se o que ele tá querendo
        //  excluir é o que ele tem cadastrado
        Alert.findOne({ userId: req.authenticated._id }).then(async (alertResult) => {


            if (!alertResult) {
                return next(new NotFoundError('Alert not found'))
            }


            Alert.remove({ _id: req.params.id }).exec().then((cmdResult: any) => {
                if (cmdResult.result.n) {
                    res.send(204)
                }
            }).catch(next)

        }).catch(next)
    }
}