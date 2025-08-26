require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const indexRouter = require("./routes");

const app = express();

app.options("*", cors());
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", async (req, res) => {
  res.status(200).send("Server is up and running");
});

app.use(
  "/api-docs",
  swaggerUi.serveFiles(swaggerDocument, {}),
  swaggerUi.setup(swaggerDocument)
);

app.use("/v1", indexRouter);

module.exports = app;
