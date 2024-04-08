import express from "express";
import dotenv from "dotenv";
import { appsRoute } from "./routes/apps-route.js";
import { mongooseConnection } from "./controllers/mongose-connection.js";

dotenv.config();

// Connect to the database
mongooseConnection();

// Initialize the app
const app = express();
app.use(express.static("uploads"));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/apps", appsRoute);

const port = process.env.PORT || 3000;

app.listen(port);
