import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { testarConexao, pool } from './database';

const app = express();
const PORTA = 3000;

app.use(express.json());

app.get('/usuarios', async (req, res) => {
    try{
        const resultado = await pool.query('SELECT * FROM usuarios');

        res.status(200).json(resultado.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({err: 'Erro ao buscar usuários.'});
    }
});

app.post('/usuarios', async(req, res) => {
    try{
        const {nome, email, senha, tipo} = req.body;

        //blindagem de senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = await pool.query(
            `INSERT INTO usuarios (nome, email, senha, tipo)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nome, email, tipo`,
             [nome, email, senhaCriptografada, tipo]
        );
        res.status(201).json(novoUsuario.rows[0]);
    }catch(err){
        console.error(err);
        res.status(500).json({err: 'Erro ao criar usuário, verifique os dados.'});
    }
});

app.post('/login', async (req, res) => {
    try{
        const {email, senha} = req.body;

        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if(resultado.rows.length === 0){
            return res.status(401).json({err: 'Usuário ou senha incorretos.'});
        }
        const usuario = resultado.rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida){
            return res.status(401).json({err: 'Usuário ou senha incorretos.'})
        }

        const token = jwt.sign(
            { id: usuario.id, tipo: usuario.tipo },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
        }catch(err){
            console.log(err);
            res.status(500).json({err: 'Erro interno no servidor.'});
        }
        });

        //autenticaçao
        const verificarToken = async (req: any, res: any, next: any) => {
            //token enviado pelo frontend pelo Header
            const authHeader = req.headers['authorization'];

            //cortando espaço do token para pegar só a segunda parte ex: "Bearer eyaSJADJwa..."
            const token = authHeader && authHeader.split(' ')[1];

            if(!token){
                return res.status(401).json({err: 'Acesso Negado. Token não fornecido.'});
            }

            try{
                //biblioteca jwt tenta decifrar token usando chave .env (se nao bater vai direto pro catch)
                jwt.verify(token, process.env.JWT_SECRET as string);

                next();
            }catch(err){
                return res.status(401).json({err: 'Token inválido.'});
            }
        }

        app.post('/produtos', verificarToken, async (req, res) => {
            try{
                const { nome, preco, estoque, id_loja } = req.body;

                const resultado = await pool.query(
                    `INSERT INTO produtos (nome, preco, estoque, id_loja)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                     [nome, preco, estoque , id_loja]
                );

                res.status(201).json(resultado.rows[0]);
            }catch(err){
                console.error(err);
                res.status(500).json({erro: 'Erro ao cadastrar produto.'})
            }
        });

        app.get('/produtos', verificarToken, async (req, res) => {
            try{
                const resultado = await pool.query('SELECT * FROM produtos ORDER BY criado_em DESC');
                res.status(200).json(resultado.rows);
            }catch(err){
                console.error(err);
                res.status(500).json({erro: 'Erro ao buscar produtos.'});
            }
        });

        app.put('/produtos/:id', verificarToken, async (req, res) => {
            try{
                const { id } = req.params;
                const { nome, preco, estoque } = req.body

                const resultado = await pool.query(
                    `UPDATE produtos
                     SET nome = $1, preco = $2, estoque = $3
                     WHERE id = $4
                     RETURNING *`,
                     [nome,preco,estoque,id]
                );
                if(resultado.rows.length === 0){
                    return res.status(404).json({erro: 'Produto não encontrado.'});
                }

                res.status(200).json(resultado.rows[0]);
            }catch(err){
                console.error(err);
                res.status(500).json({erro: 'Erro ao atualizar produto.'});
            }
        });

        app.delete('/produtos/:id', verificarToken, async (req, res) => {
            try{
                const {id} = req.params;
                
                const resultado = await pool.query(`DELETE FROM produtos WHERE id = $1 RETURNING *`, [id]);

                if (resultado.length === 0){
                    return res.status(404).json({erro: 'Produto não encontrado.'});
                }
                res.status(204).send();
            }catch(err){
                console.error(err);
                res.status(500).json({erro: 'Erro ao deletar produto.'});
            }
        })

app.listen(PORTA, async () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORTA}`)

    await testarConexao();

})