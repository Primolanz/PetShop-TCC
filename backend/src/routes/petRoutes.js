const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { nome, especie, raca, cliente_id } = req.body;

    try {
        const sql = 'INSERT INTO pets (nome, especie, raca, cliente_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [nome, especie, raca, cliente_id]);

        res.status(201).json({
            message: 'Pet cadastrado com sucesso!',
            id_pet: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar pet:', error.message);
        res.status(500).json({ error: 'Erro ao cadastrar pet no banco.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT
                pets.id_pet,
                pets.nome,
                pets.especie,
                pets.raca,
                pets.cliente_id,
                clientes.nome AS nome_cliente
            FROM pets
            INNER JOIN clientes ON clientes.id_cliente = pets.cliente_id
            ORDER BY pets.id_pet DESC
        `;
        const [results] = await db.query(sql);

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar pets:', error.message);
        res.status(500).json({ error: 'Erro ao buscar pets.' });
    }
});

router.put('/:id_pet', async (req, res) => {
    const { id_pet } = req.params;
    const { nome, especie, raca, cliente_id } = req.body;

    try {
        const sql = `
            UPDATE pets
            SET nome = ?, especie = ?, raca = ?, cliente_id = ?
            WHERE id_pet = ?
        `;
        const [result] = await db.query(sql, [nome, especie, raca, cliente_id, id_pet]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pet nao encontrado.' });
        }

        res.json({ message: 'Pet atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar pet:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar pet.' });
    }
});

router.delete('/:id_pet', async (req, res) => {
    const { id_pet } = req.params;

    try {
        const sql = 'DELETE FROM pets WHERE id_pet = ?';
        const [result] = await db.query(sql, [id_pet]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pet nao encontrado.' });
        }

        res.json({ message: 'Pet excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir pet:', error.message);
        res.status(500).json({ error: 'Erro ao excluir pet.' });
    }
});

module.exports = router;
