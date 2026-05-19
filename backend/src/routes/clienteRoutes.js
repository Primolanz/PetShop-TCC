const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { nome, telefone, email, cpf, endereco } = req.body;

    try {
        const sql = 'INSERT INTO clientes (nome, telefone, email, cpf, endereco) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nome, telefone, email, cpf, endereco]);

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            id_cliente: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error.message);
        res.status(500).json({ error: 'Erro ao cadastrar cliente no banco.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT id_cliente, nome, telefone, email, cpf, endereco FROM clientes ORDER BY id_cliente DESC';
        const [results] = await db.query(sql);

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error.message);
        res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }
});

router.put('/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;
    const { nome, telefone, email, cpf, endereco } = req.body;

    try {
        const sql = `
            UPDATE clientes
            SET nome = ?, telefone = ?, email = ?, cpf = ?, endereco = ?
            WHERE id_cliente = ?
        `;
        const [result] = await db.query(sql, [nome, telefone, email, cpf, endereco, id_cliente]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente nao encontrado.' });
        }

        res.json({ message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar cliente.' });
    }
});

router.delete('/:id_cliente', async (req, res) => {
    const { id_cliente } = req.params;

    try {
        const sql = 'DELETE FROM clientes WHERE id_cliente = ?';
        const [result] = await db.query(sql, [id_cliente]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente nao encontrado.' });
        }

        res.json({ message: 'Cliente excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir cliente:', error.message);
        res.status(500).json({ error: 'Erro ao excluir cliente.' });
    }
});

module.exports = router;
