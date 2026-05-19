const { sendError } = require('../utils/responses');

function notFoundHandler(req, res) {
    return sendError(res, 404, 'Rota nao encontrada.');
}

function errorHandler(error, req, res, next) {
    console.error('Erro nao tratado:', error.message);
    return sendError(res, error.status || 500, error.message || 'Erro interno no servidor.');
}

module.exports = {
    notFoundHandler,
    errorHandler
};
