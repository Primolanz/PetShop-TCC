const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const petRoutes = require('./routes/petRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

app.get('/', (req, res) => {
    res.send('Servidor do PetShop rodando e conectado!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀Servidor rodando na porta http://localhost:${PORT}`);
    console.log('Aguardando conexoes...');
});
