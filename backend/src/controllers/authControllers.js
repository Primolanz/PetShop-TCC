const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        await db.query(sql, [nome, email, senhaCriptografada]);

        res.status(201).json({ message: 'Usuario cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuario:', error.message);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};


exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const usuario = results[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, nome: usuario.nome },
            process.env.JWT_SECRET || 'SECRET_KEY_TCC',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login realizado com sucesso!',
            token: token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};
