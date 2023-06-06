const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

const uri =
  "mongodb+srv://lucas:1301@trabalhoweb.kovi2sp.mongodb.net/trabalho?retryWrites=true&w=majority";

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get("/usuarios", async (req, res) => {
  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("<Trabalho>");
    const usersCollection = db.collection("users");

    const usuarios = await usersCollection.find().toArray();

    let tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            background: linear-gradient(to bottom, #dcdcdc, #808080, #dcdcdc);
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }

          th {
            background-color: #808080;
            color: #fff;
          }

          .button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
          }

          .button:hover {
            background-color: #666666;
          }

          .back-button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
            margin-bottom: 20px;
          }

          .back-button:hover {
            background-color: #666666;
          }

          .edit-button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
            margin-right: 10px;
          }

          .edit-button:hover {
            background-color: #666666;
          }
        </style>
      </head>
      <body>
        <h1>Usuários Cadastrados</h1>
        <table>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Senha</th>
            <th>Ações</th>
          </tr>
    `;
    usuarios.forEach((usuario) => {
      tableHTML += `
        <tr>
          <td>${usuario._id}</td>
          <td>${usuario.username}</td>
          <td>${usuario.email}</td>
          <td>${usuario.password}</td>
          <td>
            <button class="button edit-button" onclick="window.location.href='/editar/${usuario._id}'">Editar</button>
            <form action="/excluir/${usuario._id}" method="POST" style="display: inline">
              <button type="submit" class="button">Excluir</button>
            </form>
          </td>
        </tr>
      `;
    });
    tableHTML += "</table>";

    const backButtonHTML =
      '<a class="button back-button" href="http://localhost:3000">Voltar para o Cadastro</a>';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            background: linear-gradient(to bottom, #dcdcdc, #808080, #dcdcdc);
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
          }

          form {
            max-width: 500px;
            margin: 0 auto;
          }

          label {
            display: block;
            margin-bottom: 5px;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 6px 12px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }

          .button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
          }

          .button:hover {
            background-color: #666666;
          }

          .back-button {
            position: absolute;
            top: 20px;
            right: 20px;
          }

          .edit-button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
            margin-right: 10px;
          }

          .edit-button:hover {
            background-color: #666666;
          }
        </style>
      </head>
      <body>
        ${tableHTML}
        ${backButtonHTML}
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return res.status(500).json({ message: "Erro ao obter usuários." });
  }
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/cadastro.html"));
});

app.get("/editar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("<Trabalho>");
    const usersCollection = db.collection("users");

    const usuario = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const backButtonHTML =
      '<a class="button back-button" href="/usuarios">Voltar para Usuários</a>';

    const editFormHTML = `
      <h1>Editar Usuário</h1>
      <form action="/salvar/${id}" method="POST">
        <label for="username">Nome:</label>
        <input type="text" id="username" name="username" value="${usuario.username}" required>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="${usuario.email}" required>

        <label for="password">Senha:</label>
        <input type="password" id="password" name="password" value="${usuario.password}" required>

        <button type="submit" class="button">Salvar</button>
      </form>
      ${backButtonHTML}
    `;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            background: linear-gradient(to bottom, #dcdcdc, #808080, #dcdcdc);
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
          }

          form {
            max-width: 500px;
            margin: 0 auto;
          }

          label {
            display: block;
            margin-bottom: 5px;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 6px 12px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }

          .button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
          }

          .button:hover {
            background-color: #666666;
          }

          .back-button {
            position: absolute;
            top: 20px;
            right: 20px;
          }

          .edit-button {
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 4px;
            margin-right: 10px;
          }

          .edit-button:hover {
            background-color: #666666;
          }
        </style>
      </head>
      <body>
        ${editFormHTML}
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return res.status(500).json({ message: "Erro ao obter usuário." });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("<Trabalho>");
    const usersCollection = db.collection("users");

    // Verifica se o usuário já está cadastrado
    const userExists = await usersCollection.findOne({
      $or: [{ email }, { username }],
    });
    if (userExists) {
      return res.status(409).json({ message: "Usuário já cadastrado." });
    }

    // Cria um novo usuário
    const newUser = { username, email, password };
    await usersCollection.insertOne(newUser);

    // Redireciona para a página de usuários cadastrados
    res.redirect("/usuarios");
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

app.post("/salvar/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("<Trabalho>");
    const usersCollection = db.collection("users");

    const usuario = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { username, email, password } }
    );

    // Redireciona para a página de usuários cadastrados
    res.redirect("/usuarios");
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return res.status(500).json({ message: "Erro ao salvar usuário." });
  }
});

app.post("/excluir/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("<Trabalho>");
    const usersCollection = db.collection("users");

    const usuario = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    // Redireciona para a página de usuários cadastrados
    res.redirect("/usuarios");
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return res.status(500).json({ message: "Erro ao excluir usuário." });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
