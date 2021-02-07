require("express-async-errors");
require("dotenv").config();

const express = require("express");
const app = express();
const connection = require("./db");
const cors = require("cors");
const port = 8080;

let exphbs = require("express-handlebars");
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

(async function db() {
  await connection();
})();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// API routes
app.use("/api/v1", require("./routes/api/index.route"));
app.use("/", require("./routes/ui/index.route"));
app.use(express.static("public"));

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log("Listening to Port ", port);
});

module.exports = app;
