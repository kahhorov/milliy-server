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

    // ID avtomatik beriladi
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
    console.error("❌ DELETE xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
// 🔹 Davomatni tahrirlash (PUT)
// ---------------------
// PUT /attendanceHistory/:id  -> butun davomatni yangilash
// yoki PUT /attendanceHistory/:id/student/:studentIndex -> bitta o‘quvchini yangilash
app.put("/attendanceHistory/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const updatedRecord = req.body;

    const index = db.attendanceHistory.findIndex((r) => r.id === id);
    if (index === -1)
      return res.status(404).json({ success: false, message: "Topilmadi!" });

    db.attendanceHistory[index] = {
      ...db.attendanceHistory[index],
      ...updatedRecord,
    };

    writeDB(db);
    res.json({ success: true, message: "Davomat yangilandi!" });
  } catch (err) {
    console.error("❌ PUT xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// 🔹 Faqat bitta o‘quvchini yangilash (masalan statusni o‘zgartirish)
app.put("/attendanceHistory/:id/student/:studentIndex", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const studentIndex = Number(req.params.studentIndex);
    const updateData = req.body; // { status: "keldi", delay: "5 daqiqa" }

    const record = db.attendanceHistory.find((r) => r.id === id);
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Davomat topilmadi!" });
    }

    if (!record.students[studentIndex]) {
      return res
        .status(404)
        .json({ success: false, message: "O‘quvchi topilmadi!" });
    }

    record.students[studentIndex] = {
      ...record.students[studentIndex],
      ...updateData,
    };

    writeDB(db);
    res.json({ success: true, message: "O‘quvchi holati yangilandi!" });
  } catch (err) {
    console.error("❌ Student PUT xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
