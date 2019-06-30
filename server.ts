import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as corsMiddleware from 'restify-cors-middleware'

import { environment } from './common/environment'
import { handleError } from './common/error.handler'
import { validateId } from './common/helpers'

import { UserController } from './controllers/user.controller'
import { AlertController } from './controllers/alert.controller'
import { AlertTypeController } from './controllers/alert-type.controller'

import { tokenParser } from './common/helpers'
export class Server {

    application: restify.Server



    initRoutes(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'hazard-api',
                    version: '1.0.0'
                })

                const cors = corsMiddleware({
                    origins: ['http://localhost:3000', 'http://localhost'],
                    allowHeaders: ["*"],
                    exposeHeaders: ["*"]
                })

                this.application.pre(cors.preflight)
                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(tokenParser)
                this.application.on('restifyError', handleError)
                this.application.use(cors.actual)

                this.application.listen(environment.server.port, () => resolve(this.application))

                /* ROTAS */

                this.application.get('/users/:id', [validateId, UserController.find])
                this.application.post('/users', UserController.create)
                this.application.post('/users/authenticate', UserController.authenticate)


                this.application.get('/alerts', AlertController.getAll)
                this.application.get('/alerts/:id', [validateId, AlertController.findOne])
                this.application.post('/alerts', AlertController.create)
                this.application.put('/alerts/:id', [validateId, AlertController.update])
                this.application.del('/alerts/:id', [validateId, AlertController.delete])

                this.application.get('/alert-types', AlertTypeController.getAll)
                this.application.post('/alert-types', AlertTypeController.create)




            } catch (error) {
                reject(error)
            }
        })
    }

    initDb(): mongoose.MongooseThenable {
        (<any>mongoose).Promise = global.Promise
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    boostrap(): Promise<Server> {
        return this.initDb().then(
            () => this.initRoutes().then(() => this))
    }
}