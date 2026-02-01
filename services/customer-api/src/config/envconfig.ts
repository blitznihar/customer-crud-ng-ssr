import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT || 3000;
// export const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
export const mongoUri = process.env.MONGO_URI || "mongodb://localhost:32017";
export const dbName = process.env.DB_NAME || "customerdb";