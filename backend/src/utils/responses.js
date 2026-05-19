function sendError(res, status, message, details) {
    const body = { error: message };

    if (details && details.length) {
        body.details = details;
    }

    return res.status(status).json(body);
}

module.exports = { sendError };
