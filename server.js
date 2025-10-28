import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();         // Carrega e processa o arquivo .env
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados
app.use(express.json());
// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada
  
  const db = new Pool({
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
  });
  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

app.get("/", async (req, res) => {        // Cria endpoint na rota da raiz do projeto
  const db = new Pool({
    connectionString: process.env.URL_BD,
  });

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }
  console.log("Rota GET / solicitada");
 res.json({
		message: "API para teste",      // Substitua pelo conteúdo da sua API
    author: "Kailene Rodrigues de Souza",    // Substitua pelo seu nome
    statusBD: dbStatus   // Acrescente esta linha
  });
});

//server.js
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta ="UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

//Projetos
// GET /projetos → retorna todos os projetos

app.get("/projetos", async (req, res) => {
  try {
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM projetos ORDER BY id_projeto ASC");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar projetos:", e);
    res.status(500).json({ erro: "Erro interno ao buscar projetos" });
  }
});

// GET /projetos/:id → retorna um projeto específico
app.get("/projetos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM projetos WHERE id_projeto = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar projeto:", e);
    res.status(500).json({ erro: "Erro interno ao buscar projeto" });
  }
});

// POST /projetos → cria um novo projeto
app.post("/projetos", async (req, res) => {
  try {
    const {
      nome,
      descricao,
      cliente_nome,
      cliente_email,
      data_inicio,
      data_entrega,
      status,
      servicos_contratados,
      valor_total,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "Dados inválidos", mensagem: "O campo nome é obrigatório." });
    }

    const db = conectarBD();
    const consulta = `
      INSERT INTO projetos
      (nome, descricao, cliente_nome, cliente_email, data_inicio, data_entrega, status, servicos_contratados, valor_total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;
    const valores = [nome, descricao, cliente_nome, cliente_email, data_inicio, data_entrega, status, servicos_contratados, valor_total];
    const resultado = await db.query(consulta, valores);

    res.status(201).json({ mensagem: "Projeto criado com sucesso!", projeto: resultado.rows[0] });
  } catch (e) {
    console.error("Erro ao criar projeto:", e);
    res.status(500).json({ erro: "Erro interno ao criar projeto" });
  }
});

// PUT /projetos/:id → atualiza um projeto existente
app.put("/projetos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nome,
      descricao,
      cliente_nome,
      cliente_email,
      data_inicio,
      data_entrega,
      status,
      servicos_contratados,
      valor_total,
    } = req.body;

    const db = conectarBD();
    const existente = await db.query("SELECT * FROM projetos WHERE id_projeto = $1", [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }

    const atual = existente.rows[0];

    const consulta = `
      UPDATE projetos
      SET nome = $1, descricao = $2, cliente_nome = $3, cliente_email = $4,
          data_inicio = $5, data_entrega = $6, status = $7, servicos_contratados = $8, valor_total = $9
      WHERE id_projeto = $10
      RETURNING *;
    `;
    const valores = [
      nome || atual.nome,
      descricao || atual.descricao,
      cliente_nome || atual.cliente_nome,
      cliente_email || atual.cliente_email,
      data_inicio || atual.data_inicio,
      data_entrega || atual.data_entrega,
      status || atual.status,
      servicos_contratados || atual.servicos_contratados,
      valor_total || atual.valor_total,
      id
    ];

    const resultado = await db.query(consulta, valores);
    res.json({ mensagem: "Projeto atualizado com sucesso!", projeto: resultado.rows[0] });
  } catch (e) {
    console.error("Erro ao atualizar projeto:", e);
    res.status(500).json({ erro: "Erro interno ao atualizar projeto" });
  }
});

// DELETE /projetos/:id → exclui um projeto
app.delete("/projetos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const db = conectarBD();
    const resultado = await db.query("DELETE FROM projetos WHERE id_projeto = $1 RETURNING *;", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }

    res.json({ mensagem: "Projeto excluído com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir projeto:", e);
    res.status(500).json({ erro: "Erro interno ao excluir projeto" });
  }
});

app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});