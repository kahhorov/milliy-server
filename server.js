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
// 🔹 Foydalanuvchilarni olish
// ---------------------
app.get("/users", (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

// ---------------------
// 🔹 Foydalanuvchi qo‘shish
// ---------------------
app.post("/users", (req, res) => {
  try {
    const db = readDB();
    const newUser = req.body;

    // ID va order avtomatik beriladi
    const newId =
      db.users.length > 0 ? Math.max(...db.users.map((u) => u.id || 0)) + 1 : 1;
    const newOrder =
      db.users.length > 0
        ? Math.max(...db.users.map((u) => u.order || 0)) + 1
        : 1;

    newUser.id = newId;
    newUser.order = newOrder;
    newUser.checked = false;

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ POST /users xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
// 🔹 Foydalanuvchini tahrirlash
// ---------------------
app.patch("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "User topilmadi!" });

    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    writeDB(db);

    res.json(db.users[userIndex]);
  } catch (err) {
    console.error("❌ PATCH /users/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

// ---------------------
// 🔹 Foydalanuvchini o‘chirish
// ---------------------
app.delete("/users/:id", (req, res) => {
  try {
    const db = readDB();
    const id = Number(req.params.id);
    db.users = db.users.filter((u) => u.id !== id);
    writeDB(db);
    res.json({ success: true, message: "User o‘chirildi!" });
  } catch (err) {
    console.error("❌ DELETE /users/:id xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda xatolik!" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
