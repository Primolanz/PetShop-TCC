const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    criarAgendamento,
    listarAgendamentos,
    atualizarAgendamento,
    excluirAgendamento
} = require('../controllers/agendamentoControllers');

router.use(authMiddleware);

router.post('/', criarAgendamento);
router.get('/', listarAgendamentos);
router.put('/:id_agendamento', atualizarAgendamento);
router.delete('/:id_agendamento', excluirAgendamento);

module.exports = router;
