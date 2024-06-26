// routes/users.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  parseIpa,
  saveAppIcon,
  createPlistFile,
  SaveAppInfo,
  getAllApps,
  getAppById,
  deleteAppById,
} from "../controllers/app-controller.js";

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
appsRoute.get("/", async (req, res) => {
  res.send(await getAllApps());
});

appsRoute.get("/:id", async (req, res) => {
  getAppById(req.params.id)
    .then((app) => {
      res.json(app);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});

appsRoute.post("/upload", upload.single("file"), (req, res) => {
  // Handle the uploaded file
  console.log("File uploaded successfully!");

  parseIpa(req.file.path)
    .then((data) => {
      return saveAppIcon(data, path.dirname(req.file.path));
    })
    .then((data) => {
      return createPlistFile(req.file.path, data);
    })
    .then((data) => {
      return SaveAppInfo(data, req.file.path);
    })
    .then((data) => {
      //   res.json("File uploaded successfully!");
      res.json(data);
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
});

appsRoute.delete("/:id", async (req, res) => {
  var deleted = await deleteAppById(req.params.id);
  if (deleted) {
    res.status(200).send("Deleted successfully");
  } else {
    res.status(404).send("App not found");
  }
});
