import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME
})

export const testarConexao = async () => {
    try {
        const cliente = await pool.connect();
        console.log('✅ Conexão com o banco de dados realizada com sucesso!');
        cliente.release();
    }catch(err){
        console.log('❌ Erro ao conectar com o banco de dados:', err);
    }
}