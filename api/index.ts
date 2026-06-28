import express from "express";
import { db } from "../src/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, query, where, addDoc } from "firebase/firestore";

const app = express();

function getJakartaDateTime() {
  const now = new Date();
  
  const dateStr = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Jakarta', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(now);
  
  const timeStr = new Intl.DateTimeFormat('en-GB', { 
    timeZone: 'Asia/Jakarta', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  }).format(now);
  
  return { date: dateStr, time: timeStr };
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Set the requested admin credentials
const initAdmin = async () => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty || !usersSnap.docs.some(doc => doc.id === "1")) {
      await setDoc(doc(db, "users", "1"), { id: 1, username: 'Kels', password: 'kelsbeautyas', role: 'admin' });
    } else {
      // Ensure admin credentials are correct
      await updateDoc(doc(db, "users", "1"), { username: 'Kels', password: 'kelsbeautyas' });
    }
  } catch (error) {
    console.error("Firebase connection error:", error);
  }
};
initAdmin();

// --- API Routes ---

// Users CRUD
app.get("/api/users", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "users"));
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users: users.filter((u: any) => u.role !== 'admin') });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
  }
  
  try {
    const snap = await getDocs(collection(db, "users"));
    const existing = snap.docs.find(doc => doc.data().username?.toLowerCase() === username.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: "Username sudah terdaftar" });
    }

    const users = snap.docs.map(doc => doc.data());
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const newUser = { id: newId, username, password, role: "employee" };
    
    await setDoc(doc(db, "users", newId.toString()), newUser);
    res.json({ success: true, message: "Karyawan berhasil ditambahkan", user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menyimpan data karyawan" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await deleteDoc(doc(db, "users", id));
    res.json({ success: true, message: "Karyawan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus karyawan" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const snap = await getDocs(collection(db, "users"));
    const user = snap.docs.find(doc => {
      const d = doc.data();
      return d.username === username && d.password === password;
    })?.data();
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

// Get Today's Attendance for Employee
app.get("/api/attendance/today/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { date } = getJakartaDateTime(); // YYYY-MM-DD
  
  try {
    const q = query(collection(db, "attendance"), where("userId", "==", userId), where("date", "==", date));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      res.json({ success: true, attendance: snap.docs[0].data() });
    } else {
      res.json({ success: true, attendance: null });
    }
  } catch (error) {
    console.error("Fetch attendance error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  }
});

// Clock In
app.post("/api/attendance/in", async (req, res) => {
  const { userId, photoIn } = req.body;
  const { date, time: timeIn } = getJakartaDateTime(); // YYYY-MM-DD and HH:MM:SS
  
  try {
    const q = query(collection(db, "attendance"), where("userId", "==", userId), where("date", "==", date));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      return res.status(400).json({ success: false, message: "Sudah absen masuk hari ini" });
    }

    // Read users to get username
    const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", userId)));
    const username = !userSnap.empty ? userSnap.docs[0].data().username : "Unknown";

    const newRecord = {
      userId,
      username,
      date,
      timeIn,
      timeOut: null,
      photoIn: photoIn, // Saving base64 directly to Firestore
      photoOut: null,
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, "attendance"), newRecord);
    res.json({ success: true, message: "Absen masuk berhasil" });
  } catch (error) {
    console.error("Clock In error:", error);
    res.status(500).json({ success: false, message: "Gagal absen masuk" });
  }
});

// Clock Out
app.post("/api/attendance/out", async (req, res) => {
  const { userId, photoOut } = req.body;
  const { date, time: timeOut } = getJakartaDateTime();

  try {
    const q = query(collection(db, "attendance"), where("userId", "==", userId), where("date", "==", date));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return res.status(400).json({ success: false, message: "Belum absen masuk hari ini" });
    }
    
    const docRef = snap.docs[0].ref;
    const existing = snap.docs[0].data();
    
    if (existing.timeOut) {
      return res.status(400).json({ success: false, message: "Sudah absen keluar hari ini" });
    }

    await updateDoc(docRef, {
      timeOut,
      photoOut: photoOut // Saving base64 directly to Firestore
    });
    
    res.json({ success: true, message: "Absen keluar berhasil" });
  } catch (error) {
    console.error("Clock Out error:", error);
    res.status(500).json({ success: false, message: "Gagal absen keluar" });
  }
});

// Get All Attendance (For Admin)
app.get("/api/attendance", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "attendance"));
    const records = snap.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    }).sort((a: any, b: any) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.timeIn.localeCompare(a.timeIn);
    });
    
    res.json({ success: true, records });
  } catch (error) {
    console.error("Fetch all attendance error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  }
});

// Delete Attendance Record (For Admin)
app.delete("/api/attendance/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await deleteDoc(doc(db, "attendance", id));
    res.json({ success: true, message: "Data absensi berhasil dihapus" });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus data absensi" });
  }
});

export default app;
