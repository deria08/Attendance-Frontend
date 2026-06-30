import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.png'

export default function MahasiswaDashboard({ 
  onNavigate, 
  userName, 
  onLogout, 
  manualAbsenEnabled, 
  mahasiswaList, 
  userData,
  userId,
  faceStatus
}) {
  // const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const isFaceRegistered =
  faceStatus?.[userData?.nim_nidn] || false;
  const [attendanceRate, setAttendanceRate] = useState(0); // ← tambah state
  
  // useEffect(() => {
  //   const fetchFaceStatus = async () => {
  //     try {
  //       const res = await apiFetch('http://localhost:5000/api/users/mahasiswa/face-status');
  //       const data = await res.json();
  //       const nim = userData?.nim_nidn;
  //       if (nim) {
  //         const found = data.find(item => item.nim === nim);
  //         setIsFaceRegistered(found?.face_registered || false);
  //       }
  //     } catch (err) {
  //       console.error('Gagal fetch face status:', err);
  //     }
  //   };
  //   if (userData?.nim_nidn) fetchFaceStatus();
  // }, [userData]);
   // Ambil statistik kehadiran
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      try {
        // Gunakan FASTAPI_API_URL dari environment variable
        const baseUrl = import.meta.env.VITE_FASTAPI_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/attendance-stats?user_id=${userId}`);
        const data = await res.json();
        if (data.attendance_rate !== undefined) {
          setAttendanceRate(data.attendance_rate);
        }
      } catch (err) {
        console.error('Gagal mengambil statistik kehadiran:', err);
      }
    };
    fetchStats();
  }, [userId]);

  const currentMahasiswa = mahasiswaList?.find(m => m.id === userId);
  // Jika data belum ada, tampilkan loading (opsional)
//   if (!currentMahasiswa) {
//     return <div className="text-center py-12">Memuat data mahasiswa...</div>;
// }
  return (
    <div className="min-h-screen">
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-[36px] font-bold text-gray-900">Selamat Datang Di Website Absensi STTPati </h1>
            <p className="mt-4 text-gray-600 text-[24px]">Mahasiswa: {userName}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-[18px] text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header> */}
      {/* ===== HEADER (SAMA DENGAN DOSEN DASHBOARD) ===== */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Bagian Kiri: Logo & Info */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logoSTTP}
                alt="Logo STT Pati"
                className="w-14 h-14 md:w-16 md:h-16 object-contain flex-shrink-0"
              />        
              <h1 className="text-2xl sm:text-[48px] font-bold text-blue-700 tracking-tight">
                SIPATI
              </h1>
              {/* <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                v1.0
              </span> */}
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-0.5">
              Sistem Informasi Presensi STT Pati
            </p>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Selamat datang,{' '}
              <span className="font-semibold text-gray-800">
                {userName}
                {/* {userData?.gelar ? `, ${userData.gelar}` : ''} */}
              </span>
            </p>
          </div>

          {/* Bagian Kanan: Tombol Logout */}
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition text-sm shadow-sm hover:shadow-md flex-shrink-0 self-start sm:self-center"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Informasi Mahasiswa */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-teal-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Informasi Mahasiswa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Nama</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{userName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status Kehadiran</p>
              <p className="text-xl font-bold mt-1 flex items-center gap-2">
                <p className="text-xl font-bold text-green-600 mt-1">Aktif</p>
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Persentase Hadir</p>
              <p className="text-xl font-bold text-teal-600 mt-1">
                {attendanceRate !== undefined && attendanceRate !== null 
                  ? `${attendanceRate.toFixed(1)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Registrasi Wajah - disabled jika sudah terdaftar */}
          <button
            onClick={() => !isFaceRegistered && onNavigate('registrasi-wajah', { userId })}
            disabled={isFaceRegistered}
            className={`bg-white border-2 border-purple-200 rounded-lg p-8 text-left transition ${
              isFaceRegistered
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Registrasi Wajah</h2>
                <div className="text-sm mt-1">
                  {isFaceRegistered ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sudah terdaftar
                    </span>
                  ) : (
                    <span className="text-orange-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13 7H7v6h6V7zm-6-2a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1H7zm5-1a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h6z" clipRule="evenodd" />
                      </svg>
                      Belum terdaftar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
          {/* <button
            onClick={() => onNavigate('krs')}
            className="bg-white border-2 border-indigo-200 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kartu Rencana Studi</h2>
                <p className="text-gray-600 text-sm mt-1">Lihat mata kuliah semester ini</p>
              </div>
            </div>
          </button> */}
          {/* Scan Wajah untuk Absensi */}
          <button
            onClick={() => onNavigate('face-recognition')}
            className="bg-white border-2 border-teal-200 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-teal-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scan Wajah Anda</h2>
                <p className="text-gray-600 text-sm mt-1">Melakukan absensi dengan pengenalan wajah</p>
              </div>
            </div>
          </button>

          {/* Absen Manual (hanya jika diaktifkan dosen) */}
          {/* <button
            onClick={manualAbsenEnabled ? () => onNavigate('manual-attendance') : undefined}
            className={`border-2 rounded-lg p-8 text-left ${
              manualAbsenEnabled 
                ? 'border-blue-200 bg-white hover:shadow-lg transition transform hover:scale-105 cursor-pointer' 
                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
            }`}
            disabled={!manualAbsenEnabled}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${
                manualAbsenEnabled ? 'bg-blue-100' : 'bg-gray-200'
              }`}>
                <svg className={`w-8 h-8 ${
                  manualAbsenEnabled ? 'text-blue-600' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Absen Manual</h2>
                {!manualAbsenEnabled && (
                  <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-semibold">
                      ⓘ Belum diaktifkan oleh dosen
                    </span>
                  </p>
                )}
              </div>
            </div>
          </button> */}
        </div> 

        <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <p className="text-blue-900 font-semibold flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 000-2H8z" clipRule="evenodd" />
            </svg>
            <span>Pastikan pencahayaan cukup saat melakukan scan wajah untuk hasil optimal</span>
          </p>
        </div>
      </main>
      <Footer role="mahasiswa" onNavigate={onNavigate}/>
    </div>
  )
}