import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoAtlasUri = process.env.MONGO_URL;

export function mongooseConnection() {
  try {
    console.log("connecting to db " + mongoAtlasUri);
    // Connect to the MongoDB cluster
    mongoose.connect(mongoAtlasUri, {});
  } catch (e) {
    console.log("could not connect");
  }
  const dbConnection = mongoose.connection;
  dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
  dbConnection.once("open", () => console.log("Connected to DB!"));
}
