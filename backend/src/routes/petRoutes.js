const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    criarPet,
    listarPets,
    atualizarPet,
    excluirPet
} = require('../controllers/petControllers');

router.use(authMiddleware);

router.post('/', criarPet);
router.get('/', listarPets);
router.put('/:id_pet', atualizarPet);
router.delete('/:id_pet', excluirPet);

module.exports = router;
