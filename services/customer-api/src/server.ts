import express from "express";
import cors from "cors";
import customersRouter from "./routes/customers";
import { connectMongo } from "./db/mongo";
import * as config from "./config/envconfig";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = config.port;
const MONGO_URI = config.mongoUri;
const DB_NAME = config.dbName;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/customers", customersRouter);


async function start() {
  await connectMongo(MONGO_URI, DB_NAME);
  app.listen(PORT, () => console.log(`✅ API listening on :${PORT}`));
}

start().catch((e) => {
  console.error("❌ Failed to start", e);
  process.exit(1);
});
