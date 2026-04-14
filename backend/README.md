# Integrated Digital Environment for Tracking System (PTS)

Aplikasi berbasis web untuk pelacakan status dokumen secara real-time pada PT. Putra Tangerang Sejati. Sistem ini memudahkan klien untuk memantau progres perizinan mereka melalui nomor registrasi.

## 🚀 Fitur Utama
- **Tracking Berkas:** Pencarian status dokumen berdasarkan nomor registrasi unik.
- **Admin Dashboard:** Manajemen data klien (Create, Read, Update, Delete).
- **Digital Document:** Unggah dan unduh file PDF untuk berkas yang sudah selesai.
- **Status Monitoring:** Visualisasi status menggunakan indikator warna (Proses, Selesai, Ditolak).

## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, CSS Modules.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.
- **Middleware:** Multer (untuk pengolahan file PDF).

## 💻 Cara Install & Menjalankan

### 1. Clone Repository
```bash
git clone [https://github.com/yogamaysuhendra/proyek-pts-tracking.git](https://github.com/yogamaysuhendra/proyek-pts-tracking.git)
cd proyek-pts-tracking

cd backend
npm install
# Pastikan database MySQL sudah menyala dan buat database sesuai struktur di laporan
npm start

cd ../frontend
npm install
npm start