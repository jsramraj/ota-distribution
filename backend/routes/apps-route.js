// routes/users.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parseIpa } from "../controllers/app-controller.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const appsRoute = Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var destPath = path.join(__dirname, "../uploads", Date.now().toString());
    fs.mkdirSync(destPath, { recursive: true });
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// Create the multer instance
const upload = multer({ storage: storage });

// Define a route
appsRoute.get("/", (req, res) => {
  res.send("all apps");
});

appsRoute.post("/upload", upload.single("file"), (req, res) => {
  // Handle the uploaded file
  console.log("File uploaded successfully!");
  parseIpa(req.file.path)
    .then((data) => {
      res.json({ message: data });
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
});

appsRoute.get("/102", (req, res) => {
  res.send("app 102");
});
