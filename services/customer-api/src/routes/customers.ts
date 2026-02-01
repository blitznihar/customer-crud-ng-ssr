import { Router } from "express";
import { ObjectId } from "mongodb";
import { customersCollection } from "../db/mongo";
import { z } from "zod";

const router = Router();

const CustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional()
});

router.get("/", async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  const docs = await customersCollection().find({}).toArray();
  const mapped = docs.map(d => ({ ...d, _id: d._id.toString() }));
  res.json(mapped);
});

router.get("/:id", async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const doc = await customersCollection().findOne({ _id: new ObjectId(id) });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json({ ...doc, _id: doc._id.toString() });
});

router.post("/", async (req, res) => {
  const parsed = CustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = await customersCollection().insertOne(parsed.data);
  res.status(201).json({ _id: result.insertedId.toString(), ...parsed.data });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = CustomerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = await customersCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: parsed.data },
    { returnDocument: "after" }
  );

  if (!result) return res.status(404).json({ error: "Not found" });
  const doc = result;
  res.json({ ...doc, _id: doc._id.toString() });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const result = await customersCollection().deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
