const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    criarCliente,
    listarClientes,
    atualizarCliente,
    excluirCliente
} = require('../controllers/clienteControllers');

router.use(authMiddleware);

router.post('/', criarCliente);
router.get('/', listarClientes);
router.put('/:id_cliente', atualizarCliente);
router.delete('/:id_cliente', excluirCliente);

module.exports = router;
