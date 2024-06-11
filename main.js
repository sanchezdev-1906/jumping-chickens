const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const http = require("http");
require("dotenv").config();
const { Client } = require("pg");
const connectionData = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
};

const app = express();
const server = http.createServer(app);
const port = 8000;
const io = new Server(server);

function agregarUsuario(user, socket) {
  const client = new Client(connectionData);
  let status = 0;

  let query = `SELECT username, cell FROM users WHERE cell = ${user.cell} OR username = '${user.username}'`;

  client.connect();
  client
    .query(query)
    .then((response) => {
      let rows = response.rows;

      if (rows.length > 0) {
        rows.forEach((row) => {
          if (row.cell == user.cell) {
            status = 1;
          }
          if (row.username == user.username) {
            status = 3;
          }
        });
      }

      if (status != 0) {
        client.end();
        if (status == 1) {
          socket.emit("message", "La celda ya esta ocupada");
        } else if (status == 2) {
          socket.emit("message", "Error en el servidor");
        } else if (status == 3) {
          socket.emit("message", "El usuario ya existe");
        }
        return;
      }

      let param1 = "INSERT INTO users(id, username, color, cell) VALUES";
      let param2 = `('${user.id}', '${user.username}','${user.color}',${user.jump}, ${user.cell})`;
      query = param1 + param2;

      client
        .query(query)
        .then((res) => {
          let cell = user.cell;
          let color = user.color;

          io.emit("selected", { cell: cell, color: color });

          client.end();

          if (status == 0) {
            socket.emit("auth", status);
          }
        })
        .catch((err) => {
          client.end();
        });
    })
    .catch((err) => {
      client.end();
    });
}

function eliminarUsuario(id) {
  let status = 0;
  const client = new Client(connectionData);
  client.connect();
  client
    .query(`DELETE FROM users WHERE id = '${id}' RETURNING *`)
    .then((response) => {
      let cell = response.rows[0].cell;
      io.emit("deselected", cell);
      client.end();
    })
    .catch((err) => {
      status = 2;
      client.end();
    });
  return;
}
function obtenerCeldas(socket) {
  let status = 0;
  const client = new Client(connectionData);
  client.connect();
  client
    .query("SELECT cell, color FROM users")
    .then((response) => {
      let users = response.rows;
      socket.emit("cells", users);

      client.end();
    })
    .catch((err) => {
      status = 2;
      client.end();
    });
  return status;
}

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  obtenerCeldas(socket);
  socket.on("login", (user) => {
    agregarUsuario(
      {
        id: socket.id,
        username: user.username,
        color: user.color,
        cell: user.cell,
        jump: 0,
      },
      socket
    );
  });

  socket.on("jump", (cell) => {
    io.emit("jump", cell);
  });
  socket.on("disconnect", () => {
    eliminarUsuario(socket.id);
  });
});

server.listen(port, () => {
  console.log(
    `Servidor express escuchando en puerto: http://localhost:${port}`
  );
});
