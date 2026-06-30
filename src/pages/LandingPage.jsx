'use client';

import React from 'react'
import logoSTTP from '../assets/logostt.png'
import Footer from '../components/Footer';

export default function LandingPage({ onNavigate }) {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md mx-auto">

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">

            {/* HEADER */}
            <div className="text-center mb-10">

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full blur-md opacity-30 scale-110"></div>

                  <img
                    src={logoSTTP}
                    alt="Logo STT Pati"
                    className="relative w-24 h-24 md:w-28 md:h-28 object-contain"
                  />
                </div>
              </div>

              {/* Nama Sistem */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-blue-700">
                SIPATI
              </h1>

              {/* Kepanjangan */}
              <p className="mt-2 text-lg md:text-xl font-semibold text-gray-800">
                Sistem Informasi Presensi
              </p>

              {/* Kampus */}
              <p className="mt-1 text-base text-gray-500">
                Sekolah Tinggi Teknik Pati
              </p>

              {/* Garis */}
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-500 mx-auto rounded-full mt-5"></div>

              {/* Deskripsi */}
              <p className="mt-5 text-sm text-gray-500 italic leading-relaxed px-4">
                Presensi mahasiswa berbasis Face Recognition,
                Liveness Detection, dan Geolocation.
              </p>

            </div>

            {/* BUTTON ROLE */}
            <div className="space-y-4 mb-8">

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Masuk Sebagai
                </h3>

                <p className="text-sm text-gray-500">
                  Pilih peran untuk melanjutkan
                </p>
              </div>

              {/* ADMIN */}
              <button
                onClick={() => onNavigate('admin-login', 'admin')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
              >
                <span className="text-lg">Admin</span>

                <svg
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

              </button>

              {/* DOSEN */}
              <button
                onClick={() => onNavigate('dosen-login', 'dosen')}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
              >
                <span className="text-lg">Dosen</span>

                <svg
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

              </button>

              {/* MAHASISWA */}
              <button
                onClick={() => onNavigate('mahasiswa-login', 'mahasiswa')}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
              >
                <span className="text-lg">Mahasiswa</span>

                <svg
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>

              </button>

            </div>

            {/* FOOTER CARD */}
            <div className="border-t border-gray-100 pt-6">

              <p className="text-sm text-gray-500 text-center leading-relaxed">
                SIPATI merupakan sistem informasi presensi mahasiswa
                yang memanfaatkan teknologi Face Recognition,
                Liveness Detection, dan Geolocation
                untuk mendukung proses absensi yang aman, akurat,
                dan efisien.
              </p>

            </div>

          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()} Sekolah Tinggi Teknik Pati
            </p>
          </div>

        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </>
  )
}