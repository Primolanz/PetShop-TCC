const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getPagination,
    validateAuthRegister,
    validateAuthLogin,
    validateCliente,
    validatePet,
    validateAgendamento
} = require('../src/utils/validation');

test('valida cadastro de usuario obrigando nome, e-mail valido e senha minima', () => {
    const errors = validateAuthRegister({
        nome: '',
        email: 'email-invalido',
        senha: '123'
    });

    assert.ok(errors.includes('Nome e obrigatorio.'));
    assert.ok(errors.includes('E-mail invalido.'));
    assert.ok(errors.includes('Senha deve ter pelo menos 6 caracteres.'));
});

test('valida login com campos obrigatorios', () => {
    const errors = validateAuthLogin({
        email: '',
        senha: ''
    });

    assert.deepEqual(errors, ['E-mail e obrigatorio.', 'Senha e obrigatoria.']);
});

test('valida cliente com telefone obrigatorio, e-mail e CEP', () => {
    const errors = validateCliente({
        nome: 'Maria',
        telefone: '',
        email: 'maria',
        cep: '123'
    });

    assert.ok(errors.includes('Telefone e obrigatorio.'));
    assert.ok(errors.includes('E-mail invalido.'));
    assert.ok(errors.includes('CEP invalido.'));
});

test('valida pet exigindo cliente_id inteiro positivo', () => {
    const errors = validatePet({
        nome: 'Thor',
        especie: 'Cachorro',
        cliente_id: 0
    });

    assert.deepEqual(errors, ['Cliente_id deve ser um numero inteiro positivo.']);
});

test('valida agendamento com servico, data, horario, status e pet_id corretos', () => {
    const errors = validateAgendamento({
        pet_id: 'abc',
        servico: 'Vacina',
        data_servico: '20/05/2026',
        horario_servico: '25:90:00',
        status: 'Finalizado'
    });

    assert.ok(errors.includes('Pet_id deve ser um numero inteiro positivo.'));
    assert.ok(errors.includes('Servico invalido.'));
    assert.ok(errors.includes('Data do servico invalida. Use o formato YYYY-MM-DD.'));
    assert.ok(errors.includes('Horario do servico invalido. Use o formato HH:mm:ss.'));
    assert.ok(errors.includes('Status invalido.'));
});

test('calcula paginacao com limites seguros', () => {
    assert.deepEqual(getPagination({ page: '2', limit: '5' }), {
        page: 2,
        limit: 5,
        offset: 5
    });

    assert.deepEqual(getPagination({ page: '-10', limit: '999' }), {
        page: 1,
        limit: 100,
        offset: 0
    });
});
