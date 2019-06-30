"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const server = new server_1.Server();
server.boostrap().then(server => {
    console.log('Server is listening on:', server.application.address());
}).catch((err) => {
    console.log('failed to start', err);
    process.exit(1);
});
