import express from "express";
import dotenv from "dotenv";
import { appsRoute } from "./routes/apps-route.js";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/apps", appsRoute);

const port = process.env.PORT || 3000;

app.listen(port);
