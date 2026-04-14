import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // --- 1. STATE ---
  const [queryNo, setQueryNo] = useState('');
  const [hasil, setHasil] = useState(null);
  const [form, setForm] = useState({ no: '', nama: '', status: '', file: null });
  const [listProyek, setListProyek] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth & Edit
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ user: '', pass: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- 2. EFFECT (Persistence & Data Fetching) ---
  
  // Cek status login di browser saat pertama kali aplikasi dibuka
  useEffect(() => {
    const logged = localStorage.getItem('isAdmin');
    if (logged === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Ambil data hanya jika admin sudah login
  useEffect(() => {
    if (isLoggedIn) {
      fetchSemuaProyek();
    }
  }, [isLoggedIn]);

  // --- 3. LOGIKA SEARCH & STATISTIK ---
  const filteredProyek = listProyek.filter(p => 
    p.nama_klien.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.no_registrasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProyek = listProyek.length;
  // Perbaikan Logika Statistik: Menghitung status Selesai, Ditolak, dan Proses
  const totalSelesai = listProyek.filter(p => p.status_tahap?.toLowerCase() === 'selesai').length;
  const totalDitolak = listProyek.filter(p => p.status_tahap?.toLowerCase() === 'ditolak').length;

  // --- 4. FUNGSI-FUNGSI ---
  const fetchSemuaProyek = async () => {
    try {
      const res = await axios.get('http://localhost:5000/semua-proyek');
      setListProyek(res.data);
    } catch (err) { console.error("Gagal ambil data"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', {
        username: loginInput.user,
        password: loginInput.pass
      });

      if (res.data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('isAdmin', 'true'); // Menyimpan status login di browser
        alert("Selamat Datang, Admin!");
      }
    } catch (err) {
      alert("Login Gagal! Username atau password salah.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      setIsLoggedIn(false);
      localStorage.removeItem('isAdmin'); // Menghapus status login dari browser
    }
  };

  const handleCek = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/cek-status/${queryNo}`);
      setHasil(res.data);
    } catch (err) {
      alert("No. Registrasi tidak terdaftar");
      setHasil(null);
    }
  };

  const handleEdit = (p) => {
    setIsEdit(true); 
    setEditId(p.id);
    setForm({ no: p.no_registrasi, nama: p.nama_klien, status: p.status_tahap, file: null });
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleSimpan = async () => {
    const data = new FormData();
    data.append('no_registrasi', form.no);
    data.append('nama_klien', form.nama);
    data.append('status_tahap', form.status);
    
    if (form.file) {
      data.append('pdf', form.file);
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/update-proyek/${editId}`, data);
        alert("Data & Berkas Berhasil Diperbarui!");
      } else {
        await axios.post('http://localhost:5000/tambah-proyek', data);
        alert("Nama Klien Baru Berhasil Disimpan!");
      }

      setIsEdit(false); 
      setForm({ no: '', nama: '', status: '', file: null });
      fetchSemuaProyek(); 
      
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan! Pastikan Backend (server.js) sudah jalan.");
    }
  };

  // --- 5. RENDER TAMPILAN ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HEADER PERUSAHAAN */}
      <nav className="bg-slate-900 p-8 shadow-2xl mb-12 border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-white text-4xl font-black tracking-tight italic uppercase">PT. Putra Tangerang Sejati <span className="text-blue-500 font-light not-italic text-2xl ml-2 tracking-widest">Tracking</span></h1>
            <p className="text-slate-400 text-[10px] tracking-[0.4em] uppercase font-bold mt-1">Industrial Document Control System</p>
          </div>
          {isLoggedIn && (
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-full font-black text-[10px] transition shadow-lg">
              LOGOUT SYSTEM
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* AREA PUBLIK: CEK STATUS */}
        {!isLoggedIn && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none select-none">
                <h1 className="text-[12rem] font-black italic">PTS</h1>
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase">Lacak Status Berkas</h3>
              <p className="text-slate-500 text-sm mb-10 max-w-md uppercase tracking-widest font-semibold italic">Monitoring real-time perizinan dokumen perusahaan.</p>
              
              <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <input 
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 outline-none focus:border-blue-500 transition-all text-xl font-bold shadow-inner"
                  placeholder="NOMOR REGISTRASI" 
                  value={queryNo} onChange={e => setQueryNo(e.target.value)} 
                />
                <button onClick={handleCek} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-14 rounded-3xl shadow-xl transition-all active:scale-95 text-lg">TRACKING</button>
              </div>

              {hasil && (
                <div className="mt-14 animate-in zoom-in-95 duration-500">
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative shadow-2xl border-l-8 border-blue-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div>
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Client Information</span>
                        <h4 className="text-4xl font-black mt-2 uppercase">{hasil.nama_klien}</h4>
                        <div className="flex items-center gap-4 mt-6">
                          <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase shadow-lg ${
                            hasil.status_tahap?.toLowerCase() === 'selesai' ? 'bg-green-500' : 
                            hasil.status_tahap?.toLowerCase() === 'ditolak' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'
                          }`}>
                            {hasil.status_tahap}
                          </div>
                          <span className="text-slate-400 text-xs font-mono font-bold tracking-tighter">REF: {hasil.no_registrasi}</span>
                        </div>
                      </div>
                      
                      {hasil.status_tahap?.toLowerCase() === 'selesai' && hasil.file_surat ? (
                        <a href={`http://localhost:5000/uploads/${hasil.file_surat}`} target="_blank" rel="noreferrer" 
                           className="w-full md:w-auto bg-green-500 hover:bg-green-600 p-8 rounded-[2rem] flex flex-col items-center transition-all group shadow-xl">
                          <span className="text-4xl mb-3 group-hover:scale-110 transition">✅</span>
                          <span className="text-[10px] font-black tracking-widest uppercase">Unduh Berkas Digital</span>
                        </a>
                      ) : (
                        <div className="w-full md:w-auto bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col items-center opacity-40">
                          <span className="text-4xl mb-3">⏳</span>
                          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Belum Tersedia</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* PORTAL LOGIN */}
            <div className="mt-20 text-center border-t border-slate-200 pt-10">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em] mb-6">Secured Staff Access Only</p>
              <form onSubmit={handleLogin} className="inline-flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <input type="text" placeholder="USER" className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" onChange={e => setLoginInput({...loginInput, user: e.target.value})} />
                <input type="password" placeholder="PASS" className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" onChange={e => setLoginInput({...loginInput, pass: e.target.value})} />
                <button className="bg-slate-800 hover:bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black transition">LOGIN</button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD ADMIN */}
        {isLoggedIn && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS AREA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 border-l-8 border-slate-300">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">Data Terdaftar</p>
                <h3 className="text-4xl font-black text-slate-800 text-center">{totalProyek}</h3>
              </div>
              <div className="bg-green-600 p-8 rounded-[2rem] shadow-green-100 shadow-xl text-white border-l-8 border-green-400">
                <p className="text-green-100 text-[10px] font-black uppercase tracking-widest text-center">Status Selesai</p>
                <h3 className="text-4xl font-black text-center">{totalSelesai}</h3>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 md:col-span-2 relative overflow-hidden">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-3 ml-2 italic tracking-widest">Live Search</p>
                <input 
                  type="text" 
                  placeholder="Ketik Nama Klien atau Registrasi..." 
                  className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* FORM INPUT/EDIT */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-12 relative">
              <div className={`absolute top-6 right-10 text-[10px] font-black px-4 py-1 rounded-full ${isEdit ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                {isEdit ? "⚠️ MODE EDIT DATA" : "➕ REGISTRASI BARU"}
              </div>
              
              <h3 className="text-xl font-black mb-8 text-slate-700 tracking-tight italic uppercase">Data Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ID Registrasi</label>
                  <input className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm text-sm" placeholder="Contoh: PTS-001" value={form.no} onChange={e => setForm({...form, no: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Full Name Client</label>
                  <input className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm text-sm uppercase" placeholder="Nama Lengkap Klien" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Status Tahapan</label>
                  <select className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none font-bold text-sm shadow-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="">-- PILIH STATUS --</option>
                    <option value="PROSES">DALAM PROSES</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DITOLAK">DITOLAK / REVISI</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-6 items-center">
                {/* LOGIKA: Hanya muncul saat Edit DAN statusnya SELESAI */}
                {isEdit && form.status === 'SELESAI' ? (
                  <div className="w-full md:w-1/3 p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 animate-in zoom-in-95 duration-300">
                    <label className="text-[10px] font-black text-blue-600 uppercase block mb-2 tracking-widest">Unggah Softcopy (PDF)</label>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      className="text-[10px] block w-full file:bg-blue-600 file:text-white file:border-none file:rounded-lg file:px-4 file:py-1 cursor-pointer" 
                      onChange={e => setForm({...form, file: e.target.files[0]})} 
                    />
                    <p className="text-[8px] text-blue-400 mt-2 italic font-bold">*File ini akan dapat didownload oleh klien.</p>
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 opacity-60 flex items-center justify-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-tighter">
                      {isEdit ? "Status harus 'SELESAI' untuk unggah file" : "Fitur Unggah PDF tersedia di menu Edit"}
                    </p>
                  </div>
                )}

                <div className="flex-1 flex gap-3 w-full">
                  <button 
                    onClick={handleSimpan} 
                    className={`flex-1 py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${isEdit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-black'}`}
                  >
                    {isEdit ? "SIMPAN PERUBAHAN DATA" : "DAFTARKAN KLIEN BARU"}
                  </button>
                  
                  {isEdit && (
                    <button 
                      onClick={() => { setIsEdit(false); setForm({ no: '', nama: '', status: '', file: null }); }} 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-10 rounded-2xl font-black text-xs uppercase transition"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MASTER DATA TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-20">
               <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">Master Database PT. PTS</h3>
                  <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-tighter">{filteredProyek.length} Records found</span>
               </div>
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-slate-400 text-[9px] font-black uppercase border-b tracking-[0.2em] bg-slate-50">
                        <th className="px-10 py-5">Registrasi</th>
                        <th className="px-10 py-5">Nama Klien</th>
                        <th className="px-10 py-5">Tahapan</th>
                        <th className="px-10 py-5 text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredProyek.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/50 transition-all group">
                           <td className="px-10 py-6 font-mono text-xs font-black text-blue-600">{p.no_registrasi}</td>
                           <td className="px-10 py-6 font-black text-slate-800 text-sm uppercase tracking-tight">{p.nama_klien}</td>
                           <td className="px-10 py-6">
                              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 ${
                                p.status_tahap?.toLowerCase() === 'selesai' ? 'bg-green-50 text-green-600 border-green-100' : 
                                p.status_tahap?.toLowerCase() === 'ditolak' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-orange-50 text-orange-600 border-orange-100'
                              }`}>
                                {p.status_tahap}
                              </span>
                           </td>
                           <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => handleEdit(p)} className="text-slate-900 bg-slate-100 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all mr-2">
                                <span className="text-[10px] font-black uppercase">Edit</span>
                              </button>
                              <button onClick={() => { 
                                if(window.confirm("Hapus data ini secara permanen?")) {
                                  axios.delete(`http://localhost:5000/hapus-proyek/${p.id}`).then(() => fetchSemuaProyek());
                                }
                              }} className="text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <span className="text-[10px] font-black uppercase">Hapus</span>
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
      
      {/* CORPORATE FOOTER */}
      <footer className="mt-32 py-16 border-t border-slate-200 text-center bg-white">
        <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase text-center">
          Document Control System v1.0 | © 2026 PT. Putra Tangerang Sejati
        </p>
        <p className="text-blue-500 text-[9px] font-bold tracking-[0.5em] uppercase mt-4 text-center">
          Integrated Digital Tracking Environment
        </p>
        <p className="text-slate-300 text-[8px] mt-8 uppercase font-bold tracking-widest text-center">
          Developed by Yoga May Suhendra - Informatics UNPAM
        </p>
      </footer>
    </div>
  );
}

export default App;