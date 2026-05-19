const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { pet_id, servico, data_servico, horario_servico, status, observacao } = req.body;

    try {
        const sql = `
            INSERT INTO agendamentos
                (pet_id, servico, data_servico, horario_servico, status, observacao)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [
            pet_id,
            servico,
            data_servico,
            horario_servico,
            status || 'Agendado',
            observacao
        ]);

        res.status(201).json({
            message: 'Agendamento cadastrado com sucesso!',
            id_agendamento: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar agendamento:', error.message);
        res.status(500).json({ error: 'Erro ao cadastrar agendamento no banco.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT
                agendamentos.id_agendamento,
                agendamentos.pet_id,
                pets.nome AS nome_pet,
                clientes.nome AS nome_cliente,
                agendamentos.servico,
                agendamentos.data_servico,
                agendamentos.horario_servico,
                agendamentos.status,
                agendamentos.observacao
            FROM agendamentos
            INNER JOIN pets ON pets.id_pet = agendamentos.pet_id
            INNER JOIN clientes ON clientes.id_cliente = pets.cliente_id
            ORDER BY agendamentos.data_servico DESC, agendamentos.horario_servico DESC
        `;
        const [results] = await db.query(sql);

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
    }
});

router.put('/:id_agendamento', async (req, res) => {
    const { id_agendamento } = req.params;
    const { pet_id, servico, data_servico, horario_servico, status, observacao } = req.body;

    try {
        const sql = `
            UPDATE agendamentos
            SET pet_id = ?, servico = ?, data_servico = ?, horario_servico = ?, status = ?, observacao = ?
            WHERE id_agendamento = ?
        `;
        const [result] = await db.query(sql, [
            pet_id,
            servico,
            data_servico,
            horario_servico,
            status || 'Agendado',
            observacao,
            id_agendamento
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Agendamento nao encontrado.' });
        }

        res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
    }
});

router.delete('/:id_agendamento', async (req, res) => {
    const { id_agendamento } = req.params;

    try {
        const sql = 'DELETE FROM agendamentos WHERE id_agendamento = ?';
        const [result] = await db.query(sql, [id_agendamento]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Agendamento nao encontrado.' });
        }

        res.json({ message: 'Agendamento excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error.message);
        res.status(500).json({ error: 'Erro ao excluir agendamento.' });
    }
});

module.exports = router;
