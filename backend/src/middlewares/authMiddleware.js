const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responses');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return sendError(res, 401, 'Token nao informado.');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return sendError(res, 401, 'Token mal formatado.');
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY_TCC');
        req.usuario = decoded;
        next();
    } catch (error) {
        return sendError(res, 401, 'Token invalido ou expirado.');
    }
};
