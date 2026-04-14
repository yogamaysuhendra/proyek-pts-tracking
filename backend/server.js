const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Tambahan untuk cek folder

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Pastikan folder uploads ada, jika tidak ada maka buat otomatis
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// 1. Koneksi Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pts_tracking'
});

db.connect((err) => {
    if (err) console.error('Gagal koneksi MySQL:', err.message);
    else console.log('Terhubung ke Database MySQL!');
});

// 2. Konfigurasi Upload File (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. API - Login Admin
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json({ message: "Login Berhasil", success: true });
        } else {
            res.status(401).json({ message: "Username atau Password salah", success: false });
        }
    });
});

// 4. API - Tambah Proyek & Upload PDF
app.post('/tambah-proyek', upload.single('pdf'), (req, res) => {
    const { no_registrasi, nama_klien, status_tahap } = req.body;
    const file_surat = req.file ? req.file.filename : null;

    const sql = "INSERT INTO proyek (no_registrasi, nama_klien, status_tahap, file_surat) VALUES (?, ?, ?, ?)";
    db.query(sql, [no_registrasi, nama_klien, status_tahap, file_surat], (err, result) => {
        if (err) {
            console.error("Error Simpan:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Data berhasil disimpan!" });
    });
});

// 5. API - Update Data & PDF (BAGIAN YANG DIPERBAIKI)
app.put('/update-proyek/:id', upload.single('pdf'), (req, res) => {
    const id = req.params.id;
    const { no_registrasi, nama_klien, status_tahap } = req.body;
    const file_baru = req.file ? req.file.filename : null;

    let sql, params;

    if (file_baru) {
        // Jika admin upload file baru
        sql = "UPDATE proyek SET no_registrasi = ?, nama_klien = ?, status_tahap = ?, file_surat = ? WHERE id = ?";
        params = [no_registrasi, nama_klien, status_tahap, file_baru, id];
    } else {
        // Jika admin hanya update teks (file tetap yang lama)
        sql = "UPDATE proyek SET no_registrasi = ?, nama_klien = ?, status_tahap = ? WHERE id = ?";
        params = [no_registrasi, nama_klien, status_tahap, id];
    }
    
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error Update:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Data berhasil diupdate!" });
    });
});

// 6. API - Cek Status (Client)
app.get('/cek-status/:no_reg', (req, res) => {
    const no_reg = req.params.no_reg;
    const sql = "SELECT * FROM proyek WHERE no_registrasi = ?";
    db.query(sql, [no_reg], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) res.json(result[0]);
        else res.status(404).send('Data tidak ditemukan');
    });
});

// 7. API - Ambil Semua Data
app.get('/semua-proyek', (req, res) => {
    const sql = "SELECT * FROM proyek ORDER BY id DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 8. API - Hapus Data
app.delete('/hapus-proyek/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM proyek WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Data berhasil dihapus" });
    });
});

app.listen(5000, () => console.log('Backend jalan di port 5000'));