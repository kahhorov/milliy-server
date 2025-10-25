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
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ users: [], attendanceHistory: [] }, null, 2)
    );
  }
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

// 🔹 JSON faylga yozish
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------
// 🔹 USERS ENDPOINTS
// ---------------------

// GET /users - barcha foydalanuvchilar
app.get("/users", (req, res) => {
  const data = readDB();
  res.json(data.users || []);
});

// POST /users - yangi foydalanuvchi qo‘shish
app.post("/users", (req, res) => {
  try {
    const db = readDB();
    if (!db.users) db.users = [];

    // id avtomatik beriladi: oxirgi id +1
    const newId =
      db.users.length > 0 ? Math.max(...db.users.map((u) => u.id || 0)) + 1 : 1;
    const newOrder =
      db.users.length > 0
        ? Math.max(...db.users.map((u) => u.order || 0)) + 1
        : 1;

    const newUser = { id: newId, order: newOrder, checked: false, ...req.body };
    db.users.push(newUser);
    writeDB(db);

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ POST /users xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// PATCH /users/:id - foydalanuvchini yangilash
app.patch("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    db.users[index] = { ...db.users[index], ...req.body };
    writeDB(db);
    res.json(db.users[index]);
  } catch (err) {
    console.error("❌ PATCH /users/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// DELETE /users/:id - foydalanuvchini o‘chirish
app.delete("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    db.users = db.users.filter((u) => u.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Foydalanuvchi o‘chirildi!" });
  } catch (err) {
    console.error("❌ DELETE /users/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
// 🔹 ATTENDANCE HISTORY ENDPOINTS (sizning eski kod)
// ---------------------

app.get("/attendanceHistory", (req, res) => {
  const data = readDB();
  res.json(data.attendanceHistory || []);
});

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
    console.error("❌ POST /attendanceHistory xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

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
    console.error("❌ DELETE /attendanceHistory/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

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
    console.error("❌ PUT /attendanceHistory/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

app.put("/attendanceHistory/:id/student/:studentIndex", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const studentIndex = Number(req.params.studentIndex);
    const updateData = req.body;

    const record = db.attendanceHistory.find((r) => r.id === id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Davomat topilmadi!" });
    if (!record.students[studentIndex])
      return res
        .status(404)
        .json({ success: false, message: "O‘quvchi topilmadi!" });

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
