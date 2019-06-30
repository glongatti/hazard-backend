"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = {
    server: {
        port: { port: process.env.SERVER_PORT || 3001 }
    },
    db: { url: process.env.DB_URL || 'mongodb://localhost/hazard-api' },
    security: {
        saltRounds: process.env.SALT_ROUNDS || 10,
        apiSecret: process.env.API_SECRET || 'hazard-api-secret'
    }
};
