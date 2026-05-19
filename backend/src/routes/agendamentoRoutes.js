const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendError } = require('../utils/responses');
const { getPagination, validateAgendamento } = require('../utils/validation');

router.use(authMiddleware);

function getHojeSaoPaulo() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const getPart = (type) => parts.find((part) => part.type === type).value;

    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

function dataEhPassada(data_servico) {
    return String(data_servico) < getHojeSaoPaulo();
}

async function petExiste(pet_id) {
    const [pets] = await db.query('SELECT id_pet FROM pets WHERE id_pet = ?', [pet_id]);
    return pets.length > 0;
}

async function horarioOcupado(data_servico, horario_servico, id_agendamento = null) {
    const params = [data_servico, horario_servico];
    let sql = `
        SELECT id_agendamento
        FROM agendamentos
        WHERE data_servico = ?
          AND horario_servico = ?
          AND status <> 'Cancelado'
    `;

    if (id_agendamento) {
        sql += ' AND id_agendamento <> ?';
        params.push(id_agendamento);
    }

    const [agendamentos] = await db.query(sql, params);
    return agendamentos.length > 0;
}

async function validarAgendamento({ pet_id, data_servico, horario_servico, status }, id_agendamento = null) {
    const statusFinal = status || 'Agendado';

    if (!(await petExiste(pet_id))) {
        return 'Pet informado nao existe.';
    }

    if (dataEhPassada(data_servico)) {
        return 'Nao e permitido agendar servico em data passada.';
    }

    if (statusFinal !== 'Cancelado' && await horarioOcupado(data_servico, horario_servico, id_agendamento)) {
        return 'Ja existe um agendamento ativo para esta data e horario.';
    }

    return null;
}

router.post('/', async (req, res) => {
    const { pet_id, servico, data_servico, horario_servico, status, observacao } = req.body;
    const errors = validateAgendamento(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const erroValidacao = await validarAgendamento(req.body);

        if (erroValidacao) {
            return sendError(res, 400, erroValidacao);
        }

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
        return sendError(res, 500, 'Erro ao cadastrar agendamento no banco.');
    }
});

router.get('/', async (req, res) => {
    try {
        const { page, limit, offset } = getPagination(req.query);
        const { status, data, pet_id, busca } = req.query;
        const where = [];
        const params = [];

        if (status) {
            where.push('agendamentos.status = ?');
            params.push(status);
        }

        if (data) {
            where.push('agendamentos.data_servico = ?');
            params.push(data);
        }

        if (pet_id) {
            where.push('agendamentos.pet_id = ?');
            params.push(pet_id);
        }

        if (busca) {
            where.push('(pets.nome LIKE ? OR clientes.nome LIKE ? OR agendamentos.servico LIKE ?)');
            const termo = `%${busca}%`;
            params.push(termo, termo, termo);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const fromSql = `
            FROM agendamentos
            INNER JOIN pets ON pets.id_pet = agendamentos.pet_id
            INNER JOIN clientes ON clientes.id_cliente = pets.cliente_id
            ${whereSql}
        `;
        const [results] = await db.query(
            `SELECT
                agendamentos.id_agendamento,
                agendamentos.pet_id,
                pets.nome AS nome_pet,
                clientes.nome AS nome_cliente,
                agendamentos.servico,
                agendamentos.data_servico,
                agendamentos.horario_servico,
                agendamentos.status,
                agendamentos.observacao
             ${fromSql}
             ORDER BY agendamentos.data_servico DESC, agendamentos.horario_servico DESC
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
        console.error('Erro ao buscar agendamentos:', error.message);
        return sendError(res, 500, 'Erro ao buscar agendamentos.');
    }
});

router.put('/:id_agendamento', async (req, res) => {
    const { id_agendamento } = req.params;
    const { pet_id, servico, data_servico, horario_servico, status, observacao } = req.body;
    const errors = validateAgendamento(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const erroValidacao = await validarAgendamento(req.body, id_agendamento);

        if (erroValidacao) {
            return sendError(res, 400, erroValidacao);
        }

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
            return sendError(res, 404, 'Agendamento nao encontrado.');
        }

        res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error.message);
        return sendError(res, 500, 'Erro ao atualizar agendamento.');
    }
});

router.delete('/:id_agendamento', async (req, res) => {
    const { id_agendamento } = req.params;

    try {
        const sql = 'DELETE FROM agendamentos WHERE id_agendamento = ?';
        const [result] = await db.query(sql, [id_agendamento]);

        if (result.affectedRows === 0) {
            return sendError(res, 404, 'Agendamento nao encontrado.');
        }

        res.json({ message: 'Agendamento excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error.message);
        return sendError(res, 500, 'Erro ao excluir agendamento.');
    }
});

module.exports = router;
