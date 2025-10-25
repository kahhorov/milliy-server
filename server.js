import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const DB_PATH = "./db.json";

// 🔹 JSON fayldan ma'lumotni o‘qish
function readDB() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

// 🔹 JSON faylga yozish
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------
// 🔹 Barcha ma'lumotlarni olish
// ---------------------
app.get("/data", (req, res) => {
  const data = readDB();
  res.json(data);
});

// 🔹 Foydalanuvchilarni olish
app.get("/users", (req, res) => {
  const data = readDB();
  res.json(data.users || []);
});

// 🔹 Davomat tarixini olish
app.get("/attendanceHistory", (req, res) => {
  const data = readDB();
  res.json(data.attendanceHistory || []);
});

// ---------------------
// 🔹 Davomatni saqlash (POST)
// ---------------------
app.post("/attendanceHistory", (req, res) => {
  try {
    const db = readDB();
    const newRecord = req.body;

    if (!db.attendanceHistory) db.attendanceHistory = [];
    db.attendanceHistory.push(newRecord);

    writeDB(db);
    res.status(201).json({ success: true, message: "Davomat saqlandi!" });
  } catch (err) {
    console.error("❌ Xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
// 🔹 Davomatni o‘chirish (DELETE)
// ---------------------
app.delete("/attendanceHistory/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);

    db.attendanceHistory = db.attendanceHistory.filter(
      (item) => item.id !== id
    );
    writeDB(db);

    res.json({ success: true, message: "Davomat o‘chirildi!" });
  } catch (err) {
    console.error("❌ O‘chirishda xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
