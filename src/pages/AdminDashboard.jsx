'use client';

import React from 'react';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.webp';

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
              loading="lazy"
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