
import * as restify from 'restify'
import { User } from '../models/user.model';
import { Alert } from '../models/alert.model';
import * as jwt from 'jsonwebtoken'
import { environment } from '../common/environment'
import { ConflictError, NotFoundError, NotAuthorizedError } from 'restify-errors'

export class UserController {

    /**
     * Método para criação do usuário
     */
    static create = (req: restify.Request, res: restify.Response, next) => {
        // Pega e-mail do body
        const { email } = req.body;

        // Primeiro verifica se não existe nenhum e-mail já cadastrado com o email enviado
        User.findOne({ email }).then(result => {
            if (!result) {
                // Se não tiver, cria o usuário
                let newUser = new User(req.body)
                newUser.save().then(userSaved => {
                    // Deixa o password como undefined somente para não mostrar ao usuário na hora de enviar a resposta
                    userSaved.password = undefined

                    const token = jwt.sign({ subject: userSaved.email, iss: 'hazard-api' }, environment.security.apiSecret)


                    res.send(200, {
                        user: {
                            _id: userSaved._id,
                            name: userSaved.name,
                            email: userSaved.email,
                            alerts: [],
                            accessToken: token
                        }
                    })

                    return next(false)
                }).catch(next)
            } else {
                return next(new ConflictError('E-mail already registered'))
            }
        }).catch(next)

    }

    /**
     * Função para buscar os dados de um usuário e trazer os seus alertas criados tb
     */
    static find = (req: restify.Request, res: restify.Response, next) => {
        User.findById(req.params.id).then(user => {
            if (user) {

                Alert.find({ userId: user._id }).then(alerts => {

                    res.send(200, {
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            alerts: alerts ? alerts : []
                        }
                    })
                    return next(false)
                }).catch(next)


            } else {
                return next(new NotFoundError('User not found'))
            }
        }).catch(next)
    }

    static authenticate = (req: restify.Request, res: restify.Response, next) => {
        const { email, password } = req.body;

        User.findOne({ email }, "+password").then(user => {

            if (user && user.matches(password)) {
                const token = jwt.sign({ subject: user.email, iss: 'hazard-api' }, environment.security.apiSecret)

                Alert.find({ userId: user._id }).then(alerts => {
                    res.send(200, {
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            alerts: alerts ? alerts : [],
                            accessToken: token
                        }
                    })
                    return next(false)
                }).catch(next)


            } else {
                return next(new NotAuthorizedError('Invalid credentials'))
            }
        }).catch(next)
    }

}