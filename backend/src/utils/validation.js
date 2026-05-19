const STATUS_AGENDAMENTO = ['Agendado', 'Em Andamento', 'Conclu\u00eddo', 'Cancelado'];
const SERVICOS = ['Banho', 'Tosa', 'Banho e Tosa', 'Outros'];

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

function isPositiveInteger(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return false;
    }

    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
}

function isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(String(value));
}

function getPagination(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

function validateAuthRegister(body) {
    const errors = [];

    if (isBlank(body.nome)) errors.push('Nome e obrigatorio.');
    if (isBlank(body.email)) errors.push('E-mail e obrigatorio.');
    if (!isBlank(body.email) && !isEmail(body.email)) errors.push('E-mail invalido.');
    if (isBlank(body.senha)) errors.push('Senha e obrigatoria.');
    if (!isBlank(body.senha) && String(body.senha).length < 6) errors.push('Senha deve ter pelo menos 6 caracteres.');

    return errors;
}

function validateAuthLogin(body) {
    const errors = [];

    if (isBlank(body.email)) errors.push('E-mail e obrigatorio.');
    if (!isBlank(body.email) && !isEmail(body.email)) errors.push('E-mail invalido.');
    if (isBlank(body.senha)) errors.push('Senha e obrigatoria.');

    return errors;
}

function validateCliente(body) {
    const errors = [];

    if (isBlank(body.nome)) errors.push('Nome e obrigatorio.');
    if (isBlank(body.telefone)) errors.push('Telefone e obrigatorio.');
    if (!isBlank(body.email) && !isEmail(body.email)) errors.push('E-mail invalido.');
    if (!isBlank(body.cep) && String(body.cep).replace(/\D/g, '').length !== 8) errors.push('CEP invalido.');

    return errors;
}

function validatePet(body) {
    const errors = [];

    if (isBlank(body.nome)) errors.push('Nome do pet e obrigatorio.');
    if (isBlank(body.especie)) errors.push('Especie e obrigatoria.');
    if (!isPositiveInteger(body.cliente_id)) errors.push('Cliente_id deve ser um numero inteiro positivo.');

    return errors;
}

function validateAgendamento(body) {
    const errors = [];
    const status = body.status || 'Agendado';

    if (!isPositiveInteger(body.pet_id)) errors.push('Pet_id deve ser um numero inteiro positivo.');
    if (!SERVICOS.includes(body.servico)) errors.push('Servico invalido.');
    if (!isValidDate(body.data_servico)) errors.push('Data do servico invalida. Use o formato YYYY-MM-DD.');
    if (!isValidTime(body.horario_servico)) errors.push('Horario do servico invalido. Use o formato HH:mm:ss.');
    if (!STATUS_AGENDAMENTO.includes(status)) errors.push('Status invalido.');

    return errors;
}

module.exports = {
    STATUS_AGENDAMENTO,
    SERVICOS,
    getPagination,
    isPositiveInteger,
    isValidDate,
    isValidTime,
    validateAuthRegister,
    validateAuthLogin,
    validateCliente,
    validatePet,
    validateAgendamento
};
