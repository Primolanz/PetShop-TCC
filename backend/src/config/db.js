const { Pool, types } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

types.setTypeParser(1082, (value) => value);
types.setTypeParser(1083, (value) => value);
types.setTypeParser(20, (value) => Number(value));

const idColumns = {
    clientes: 'id_cliente',
    pets: 'id_pet',
    agendamentos: 'id_agendamento',
    usuarios: 'id_usuario'
};

function buildConfig() {
    const ssl = process.env.DB_SSL === 'false'
        ? false
        : { rejectUnauthorized: false };

    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl
        };
    }

    return {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl
    };
}

const pool = new Pool(buildConfig());

function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => {
        index += 1;
        return `$${index}`;
    });
}

function addReturningId(sql) {
    const match = sql.match(/^\s*INSERT\s+INTO\s+([a-z_]+)/i);

    if (!match) return sql;

    const table = match[1].toLowerCase();
    const idColumn = idColumns[table];

    if (!idColumn || /\bRETURNING\b/i.test(sql)) return sql;

    return `${sql} RETURNING ${idColumn}`;
}

async function query(sql, params = []) {
    try {
        const preparedSql = addReturningId(convertPlaceholders(sql));
        const result = await pool.query(preparedSql, params);

        if (/^\s*SELECT\b/i.test(sql)) {
            return [result.rows];
        }

        const insertId = result.rows[0] ? Object.values(result.rows[0])[0] : undefined;

        return [{
            affectedRows: result.rowCount,
            insertId
        }];
    } catch (error) {
        if (error.code === '23505') {
            error.code = 'ER_DUP_ENTRY';
        }

        throw error;
    }
}

pool.query('SELECT 1')
    .then(() => console.log('Conexao com PostgreSQL/Supabase: sucesso!'))
    .catch((error) => console.error('Erro ao conectar no PostgreSQL/Supabase:', error.message));

module.exports = { query };
