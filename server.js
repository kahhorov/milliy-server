import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync } from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "./db.json";

// GET
app.get("/data", (req, res) => {
  const data = JSON.parse(readFileSync(DB_PATH));
  res.json(data);
});

// POST
app.post("/data", (req, res) => {
  const data = JSON.parse(readFileSync(DB_PATH));
  data.items.push(req.body);
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.json({ message: "Qo‘shildi!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server ishlayapti: " + PORT));
