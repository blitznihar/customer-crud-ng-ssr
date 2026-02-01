import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectMongo(uri: string, dbName: string) {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log("✅ MongoDB connected");
  return db;
}

export function customersCollection(): Collection {
  if (!db) throw new Error("MongoDB not connected");
  return db.collection("customers");
}

export async function closeMongo() {
  if (client) await client.close();
}
