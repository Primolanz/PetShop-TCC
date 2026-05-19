const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

function getPagination(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

async function clienteExiste(cliente_id) {
    const [clientes] = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [cliente_id]);
    return clientes.length > 0;
}

router.post('/', async (req, res) => {
    const { nome, especie, raca, cliente_id } = req.body;

    try {
        if (!(await clienteExiste(cliente_id))) {
            return res.status(400).json({ error: 'Cliente informado nao existe.' });
        }

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
        const { page, limit, offset } = getPagination(req.query);
        const { busca, cliente_id, especie } = req.query;
        const where = [];
        const params = [];

        if (busca) {
            where.push('(pets.nome LIKE ? OR pets.raca LIKE ? OR clientes.nome LIKE ?)');
            const termo = `%${busca}%`;
            params.push(termo, termo, termo);
        }

        if (cliente_id) {
            where.push('pets.cliente_id = ?');
            params.push(cliente_id);
        }

        if (especie) {
            where.push('pets.especie = ?');
            params.push(especie);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const fromSql = `
            FROM pets
            INNER JOIN clientes ON clientes.id_cliente = pets.cliente_id
            ${whereSql}
        `;
        const [results] = await db.query(
            `SELECT
                pets.id_pet,
                pets.nome,
                pets.especie,
                pets.raca,
                pets.cliente_id,
                clientes.nome AS nome_cliente
             ${fromSql}
             ORDER BY pets.id_pet DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[totalResult]] = await db.query(
            `SELECT COUNT(*) AS total ${fromSql}`,
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
        console.error('Erro ao buscar pets:', error.message);
        res.status(500).json({ error: 'Erro ao buscar pets.' });
    }
});

router.put('/:id_pet', async (req, res) => {
    const { id_pet } = req.params;
    const { nome, especie, raca, cliente_id } = req.body;

    try {
        if (!(await clienteExiste(cliente_id))) {
            return res.status(400).json({ error: 'Cliente informado nao existe.' });
        }

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
