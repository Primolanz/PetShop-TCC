const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const petRoutes = require('./routes/petRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

// Rota inicial
app.get('/', (req, res) => {
    res.send('Servidor do PetShop rodando e conectado!');
});

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Aguardando conexoes...');
});
