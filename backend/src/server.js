require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Importante: verifique se o caminho do db.js está correto
const db = require('./config/db'); 

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste para saber se o servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor do PetShop rodando e conectado!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log('🚀 Aguardando conexões...');
});