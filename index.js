const express = require("express");
const app = express();
const port = 8000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/mouse2.html");
});

app.listen(port);

console.log(`Servidor express escuchando en puerto: http://localhost:${port}`);
