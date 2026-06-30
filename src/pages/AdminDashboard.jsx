'use client';

import React from 'react';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.png';

export default function AdminDashboard(
  { onNavigate, 
    userName, 
    // userData, 
    onLogout, 
    totalMahasiswa, 
    totalDosen 
  }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
   
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

      {/* ===== MAIN ===== */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tombol Kelola Akun */}
          <button
            onClick={() => onNavigate('manajemen-pengguna')}
            className="bg-white border-2 border-blue-200 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-20 0v2h2v-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kelola Akun</h2>
                <p className="text-gray-600 text-sm mt-1">Tambah, edit, atau hapus akun mahasiswa dan dosen</p>
              </div>
            </div>
          </button>

          {/* Tombol Kelola Mata Kuliah */}
          <button
            onClick={() => onNavigate('kelola-matakuliah')}
            className="bg-white border-2 border-teal-200 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-teal-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kelola Mata Kuliah</h2>
                <p className="text-gray-600 text-sm mt-1">Manage mata kuliah per dosen</p>
              </div>
            </div>
          </button>

          {/* Tombol Manajemen Enrollment */}
          <button
            onClick={() => onNavigate('manajemen-enrollment')}
            className="bg-white border-2 border-purple-200 rounded-lg p-8 hover:shadow-lg transition transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-20 0v2h2v-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Enrollment</h2>
                <p className="text-gray-600 text-sm mt-1">Daftarkan mahasiswa ke mata kuliah</p>
              </div>
            </div>
          </button>
        </div>

        {/* Informasi Sistem */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Sistem</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Mahasiswa</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalMahasiswa || 0}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Dosen</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{totalDosen || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Status Sistem</p>
              <p className="text-lg font-bold text-green-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Aktif
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Versi</p>
              <p className="text-lg font-bold text-yellow-600 mt-2">1.0.0</p>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <Footer role="admin" onNavigate={onNavigate} />
    </div>
  );
}
// 'use client';

// import React from 'react';
// import Footer from '../components/Footer';

// export default function AdminDashboard({
//   onNavigate,
//   userName,
//   onLogout,
//   totalMahasiswa,
//   totalDosen
// }) {
//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
//       {/* ===== HEADER ===== */}
//       <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border-b border-blue-500">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

//           {/* Informasi Sistem */}
//           <div>
//             <div className="flex items-center gap-3">
//               <h1 className="text-4xl font-extrabold text-white tracking-wide">
//                 SIPATI
//               </h1>

//               <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
//                 v1.0
//               </span>
//             </div>

//             <p className="mt-1 text-blue-100 text-base font-medium">
//               Sistem Informasi Presensi STT Pati
//             </p>

//             <p className="mt-3 text-white text-lg">
//               Selamat datang,
//               <span className="font-semibold text-yellow-200">
//                 {" "}
//                 {userName}
//                 {/* {userData?.gelar ? `, ${userData.gelar}` : ""} */}
//               </span>
//             </p>
//           </div>
//           {/* Tombol Logout */}
//           <button
//             onClick={onLogout}
//             className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-2.5 px-6 rounded-lg shadow transition duration-200 hover:scale-105"
//           >
//             Logout
//           </button>

//         </div>
//       </header>

//       {/* ===== MAIN ===== */}
//       <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
//         {/* Grid Menu dengan Warna Kontras */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Tombol Kelola Akun */}
//           <button
//             onClick={() => onNavigate('manajemen-pengguna')}
//             className="group relative bg-white border-2 border-blue-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-400 text-left overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//             <div className="relative flex items-center gap-4">
//               <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-20 0v2h2v-2z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Kelola Akun</h2>
//                 <p className="text-gray-500 text-sm mt-1 group-hover:text-gray-700 transition-colors">Tambah, edit, atau hapus akun mahasiswa dan dosen</p>
//               </div>
//             </div>
//           </button>

//           {/* Tombol Kelola Mata Kuliah */}
//           <button
//             onClick={() => onNavigate('kelola-matakuliah')}
//             className="group relative bg-white border-2 border-teal-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-teal-400 text-left overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//             <div className="relative flex items-center gap-4">
//               <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors">Kelola Mata Kuliah</h2>
//                 <p className="text-gray-500 text-sm mt-1 group-hover:text-gray-700 transition-colors">Manage mata kuliah per dosen</p>
//               </div>
//             </div>
//           </button>

//           {/* Tombol Manajemen Enrollment */}
//           <button
//             onClick={() => onNavigate('manajemen-enrollment')}
//             className="group relative bg-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-purple-400 text-left overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//             <div className="relative flex items-center gap-4">
//               <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-20 0v2h2v-2z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">Manajemen Enrollment</h2>
//                 <p className="text-gray-500 text-sm mt-1 group-hover:text-gray-700 transition-colors">Daftarkan mahasiswa ke mata kuliah</p>
//               </div>
//             </div>
//           </button>
//         </div>

//         {/* Informasi Sistem dengan Warna Kontras */}
//         <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/60 hover:shadow-2xl transition-shadow duration-300">
//           <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//             <span className="bg-gradient-to-r from-blue-600 to-indigo-600 w-1.5 h-8 rounded-full inline-block"></span>
//             Informasi Sistem
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
//               <p className="text-gray-600 text-sm font-medium">Total Mahasiswa</p>
//               <p className="text-4xl font-extrabold text-blue-700 mt-2">{totalMahasiswa || 0}</p>
//             </div>
//             <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-xl border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow">
//               <p className="text-gray-600 text-sm font-medium">Total Dosen</p>
//               <p className="text-4xl font-extrabold text-indigo-700 mt-2">{totalDosen || 0}</p>
//             </div>
//             <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-shadow">
//               <p className="text-gray-600 text-sm font-medium">Status Sistem</p>
//               <p className="text-lg font-bold text-green-700 mt-2 flex items-center gap-2">
//                 <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
//                 Aktif
//               </p>
//             </div>
//             <div className="bg-gradient-to-br from-yellow-50 to-amber-100/50 p-5 rounded-xl border border-yellow-200/50 shadow-sm hover:shadow-md transition-shadow">
//               <p className="text-gray-600 text-sm font-medium">Versi</p>
//               <p className="text-4xl font-extrabold text-amber-700 mt-2">1.0.0</p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* ===== FOOTER ===== */}
//       <Footer role="admin" onNavigate={onNavigate} />
//     </div>
//   );
// }