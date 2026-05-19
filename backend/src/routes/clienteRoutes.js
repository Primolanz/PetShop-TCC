const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendError } = require('../utils/responses');
const { getPagination, validateCliente } = require('../utils/validation');

router.use(authMiddleware);

async function montarEndereco({ endereco, cep, numero }) {
    if (!cep) {
        return endereco;
    }

    const cepLimpo = String(cep).replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
        const error = new Error('CEP invalido.');
        error.status = 400;
        throw error;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
        const error = new Error('Erro ao consultar o ViaCEP.');
        error.status = 502;
        throw error;
    }

    const data = await response.json();

    if (data.erro) {
        const error = new Error('CEP nao encontrado.');
        error.status = 404;
        throw error;
    }

    const numeroEndereco = numero || 's/n';

    return `${data.logradouro}, ${numeroEndereco} - ${data.bairro}, ${data.localidade}/${data.uf}`;
}

router.post('/', async (req, res) => {
    const { nome, telefone, email, cpf } = req.body;
    const errors = validateCliente(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const endereco = await montarEndereco(req.body);
        const sql = 'INSERT INTO clientes (nome, telefone, email, cpf, endereco) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nome, telefone, email, cpf, endereco]);

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            id_cliente: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 409, 'CPF ja cadastrado.');
        }

        return sendError(res, error.status || 500, error.status ? error.message : 'Erro ao cadastrar cliente no banco.');
    }
});

router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const { busca } = req.query;
        const where = [];
        const params = [];

        if (busca) {
            where.push('(nome LIKE ? OR telefone LIKE ? OR email LIKE ? OR cpf LIKE ?)');
            const termo = `%${busca}%`;
            params.push(termo, termo, termo, termo);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const [results] = await db.query(
            `SELECT id_cliente, nome, telefone, email, cpf, endereco
             FROM clientes
             ${whereSql}
             ORDER BY id_cliente DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[totalResult]] = await db.query(
            `SELECT COUNT(*) AS total FROM clientes ${whereSql}`,
            params
        );

        res.json({
            data: results,
            pagination: {
                page,
                limit,
                total: totalResult.total,
                totalPages: Math.ceil(totalResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar clientes:', error.message);
        return sendError(res, 500, 'Erro ao buscar clientes.');
    }
});

router.put('/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;
    const { nome, telefone, email, cpf } = req.body;
    const errors = validateCliente(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const endereco = await montarEndereco(req.body);
        const sql = `
            UPDATE clientes
            SET nome = ?, telefone = ?, email = ?, cpf = ?, endereco = ?
            WHERE id_cliente = ?
        `;
        const [result] = await db.query(sql, [nome, telefone, email, cpf, endereco, id_cliente]);

        if (result.affectedRows === 0) {
            return sendError(res, 404, 'Cliente nao encontrado.');
        }

        res.json({ message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 409, 'CPF ja cadastrado.');
        }

        return sendError(res, error.status || 500, error.status ? error.message : 'Erro ao atualizar cliente.');
    }
});

router.delete('/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;

    try {
        const sql = 'DELETE FROM clientes WHERE id_cliente = ?';
        const [result] = await db.query(sql, [id_cliente]);

        if (result.affectedRows === 0) {
            return sendError(res, 404, 'Cliente nao encontrado.');
        }

        res.json({ message: 'Cliente excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir cliente:', error.message);
        return sendError(res, 500, 'Erro ao excluir cliente.');
    }
});

module.exports = router;
