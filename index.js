const express = require("express");
const app = express();
const port = 8000;
let conectados = [
  {
    ip: "",
    name: "",
    token: "",
  },
];

function authMiddleware(req, res, next) {
  res.redirect("/login");
}

// Rutas publicas
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Rutas privadas
app.get("/", authMiddleware, (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// TODO
app.get("/sign-out", authMiddleware, (req, res) => {
  res.send("cerrando sesion");
});

app.listen(port);

console.log(`Servidor express escuchando en puerto: http://localhost:${port}`);
