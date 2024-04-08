import mongoose from "mongoose";

const AppSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  bundleId: { type: String, default: "" },
  version: { type: String, default: "" },
  build: { type: String, default: "" },
  icon: { type: String, default: "" },
  fileName: { type: String, default: "" },
  folderName: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("App", AppSchema);
