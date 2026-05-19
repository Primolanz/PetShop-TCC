const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responses');
const { validateAuthRegister, validateAuthLogin } = require('../utils/validation');

exports.registrar = async (req, res) => {
    const { nome, email, senha } = req.body;
    const errors = validateAuthRegister(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        await db.query(sql, [nome, email, senhaCriptografada]);

        res.status(201).json({ message: 'Usuario cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuario:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 409, 'E-mail ja cadastrado.');
        }

        return sendError(res, 500, 'Erro no servidor.');
    }
};


exports.login = async (req, res) => {
    const { email, senha } = req.body;
    const errors = validateAuthLogin(req.body);

    if (errors.length) {
        return sendError(res, 400, 'Dados invalidos.', errors);
    }

    try {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            return sendError(res, 401, 'E-mail ou senha incorretos.');
        }

        const usuario = results[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return sendError(res, 401, 'E-mail ou senha incorretos.');
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
        return sendError(res, 500, 'Erro no servidor.');
    }
};
