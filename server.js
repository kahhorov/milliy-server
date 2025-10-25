import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// JSON fayldan ma'lumotni o‘qish
function readDB() {
  const data = fs.readFileSync("./db.json", "utf-8");
  return JSON.parse(data);
}

// Barcha ma'lumotlarni ko‘rish
app.get("/data", (req, res) => {
  const data = readDB();
  res.json(data);
});

// Faqat users uchun
app.get("/users", (req, res) => {
  const data = readDB();
  res.json(data.users || []);
});

// Faqat attendanceHistory uchun
app.get("/attendanceHistory", (req, res) => {
  const data = readDB();
  res.json(data.attendanceHistory || []);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
