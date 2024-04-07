import mongoose from "mongoose";

const mongoAtlasUri = `mongodb://localhost:27017/ota_dist`;

export function mongooseConnection() {
  try {
    // Connect to the MongoDB cluster
    mongoose.connect(mongoAtlasUri, {});
  } catch (e) {
    console.log("could not connect");
  }
  const dbConnection = mongoose.connection;
  dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
  dbConnection.once("open", () => console.log("Connected to DB!"));
}
