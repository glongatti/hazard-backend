
import * as restify from 'restify'
import { AlertType } from '../models/alert-type.model';


export class AlertTypeController {

    static create = (req: restify.Request, res: restify.Response, next) => {
        let type = new AlertType(req.body)
        type.save().then(type => {
            res.send(200, type)
        })
        return next()
    }

    static getAll = (req: restify.Request, res: restify.Response, next) => {

        AlertType.find().then(types => {
            res.send(200, types)
        })
        return next(false)
    }

}