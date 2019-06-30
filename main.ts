import { Server } from "./server";

const server = new Server()

server.boostrap().then(server => {
    console.log('Server is listening on:', server.application.address())
}).catch((err) => {
    console.log('failed to start', err)
    process.exit(1)
})