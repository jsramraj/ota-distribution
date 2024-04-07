import mongoose from "mongoose";
import AppInfoParser from "app-info-parser";
import AppSchema from "../models/appModel.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function parseIpa(filePath) {
  return await new Promise(async (resolve, reject) => {
    console.log("Parsing IPA file...");

    const parser = new AppInfoParser(filePath);
    parser
      .parse()
      .then((result) => {
        console.log(result.CFBundleIdentifier);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
        console.log(err);
      });
  });
}

export async function saveAppIcon(metaData, folderPath) {
  return new Promise((resolve, reject) => {
    var appIconPath = path.join(folderPath, "appIcon.png");
    let base64Image = metaData.icon.split(";base64,").pop(); //remove the header
    fs.writeFile(appIconPath, base64Image, { encoding: "base64" }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(metaData);
      }
    });
  });
}

export function SaveAppInfo(metaData, filePath) {
  return new Promise(async (resolve, reject) => {
    var folderName = path.basename(path.dirname(filePath));

    console.log("Saving app info to the database...");
    const app = new AppSchema({
      name: metaData.CFBundleName,
      bundleId: metaData.CFBundleIdentifier,
      version: metaData.CFBundleShortVersionString,
      build: metaData.CFBundleVersion,
      icon: "appIcon.png",
      fileName: path.basename(filePath),
      folderName: folderName,
    });
    await app.save();
    resolve(app);
  });
}

export function createPlistFile(filePath, metaData) {
  return new Promise((resolve, reject) => {
    // Remove the last componentof th filePath
    var fileName = path.basename(filePath);
    var folderName = path.basename(path.dirname(filePath));
    var folderPath = path.dirname(filePath);

    var templatePlist = fs.readFileSync(
      path.join(__dirname, "../templates/app.plist"),
      "utf8"
    );
    var plist = templatePlist
      .replace("BUNDLE_IDENTIFIER", metaData.CFBundleIdentifier)
      .replace("BUNDLE_VERSION", metaData.CFBundleShortVersionString)
      .replace("TITLE_STRING", metaData.CFBundleName)
      .replace("IPA_URL", path.join("BASE_URL", folderName, fileName))
      .replace(
        "APP_ICON_URL",
        path.join("BASE_URL", folderName, "appIcon.png")
      );
    fs.writeFile(folderPath + "/app.plist", plist, "utf-8", (err) => {
      if (err) {
        console.log("Error writing plist file " + err);
        reject(err);
      }
      console.log("Plist file created successfully");
      resolve(metaData);
    });
  });
}

export async function getAllApps() {
  var cursor = AppSchema.find().cursor();
  var apps = [];
  for (
    let appInfo = await cursor.next();
    appInfo != null;
    appInfo = await cursor.next()
  ) {
    apps.push(appInfo);
  }

  return apps;
}

export async function deleteAppById(id) {
  var appInfo = await AppSchema.findByIdAndDelete(id);
  if (appInfo) {
    //Delete the folder
    var folderPath = path.join(__dirname, "../uploads", appInfo.folderName);
    try {
      fs.rmdirSync(folderPath, { recursive: true });
    } catch (err) {
      console.log("Error deleting folder " + err);
    }
  }
  return appInfo;
}
