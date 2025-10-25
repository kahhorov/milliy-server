import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const DB_PATH = "./db.json";

// 🔹 JSON fayldan o‘qish
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

// ---------------------
// 🔹 USERS API
// ---------------------

// 🔹 Foydalanuvchilarni olish
app.get("/users", (req, res) => {
  const data = readDB();
  res.json(data.users || []);
});

// 🔹 Foydalanuvchini qo‘shish
app.post("/users", (req, res) => {
  try {
    const db = readDB();
    const newUser = req.body;

    if (!db.users) db.users = [];

    const newId =
      db.users.length > 0 ? Math.max(...db.users.map((u) => u.id || 0)) + 1 : 1;

    const userWithId = { id: newId, ...newUser };
    db.users.push(userWithId);
    writeDB(db);

    res
      .status(201)
      .json({
        success: true,
        message: "Foydalanuvchi qo‘shildi!",
        user: userWithId,
      });
  } catch (err) {
    console.error("❌ User POST xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatolik!" });
  }
});

// 🔹 Foydalanuvchini tahrirlash
app.patch("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const updatedUser = req.body;

    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1)
      return res
        .status(404)
        .json({ success: false, message: "Foydalanuvchi topilmadi!" });

    db.users[index] = { ...db.users[index], ...updatedUser };
    writeDB(db);

    res.json({ success: true, message: "Foydalanuvchi yangilandi!" });
  } catch (err) {
    console.error("❌ PATCH xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatolik!" });
  }
});

// 🔹 Foydalanuvchini o‘chirish
app.delete("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    db.users = db.users.filter((u) => u.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Foydalanuvchi o‘chirildi!" });
  } catch (err) {
    console.error("❌ DELETE xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatolik!" });
  }
});

// ---------------------
// 🔹 ATTENDANCE HISTORY API
// ---------------------

// 🔹 Davomatni olish
app.get("/attendanceHistory", (req, res) => {
  const data = readDB();
  res.json(data.attendanceHistory || []);
});

// 🔹 Davomatni saqlash (POST)
app.post("/attendanceHistory", (req, res) => {
  try {
    const db = readDB();
    const newRecord = req.body;

    if (!db.attendanceHistory) db.attendanceHistory = [];
    const newId =
      db.attendanceHistory.length > 0
        ? Math.max(...db.attendanceHistory.map((r) => r.id || 0)) + 1
        : 1;
    newRecord.id = newId;

    db.attendanceHistory.push(newRecord);
    writeDB(db);

    res.status(201).json({ success: true, message: "Davomat saqlandi!" });
  } catch (err) {
    console.error("❌ POST xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// 🔹 Davomatni o‘chirish (DELETE)
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
    console.error("❌ DELETE xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
