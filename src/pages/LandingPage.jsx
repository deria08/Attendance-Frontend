'use client';

import React from 'react'
import logoSTTP from '../assets/logostt.png'

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md mx-auto">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
          
          {/* HEADER + LOGO */}
          <div className="text-center mb-10 md:mb-12">
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-md opacity-30 transform scale-110"></div>
                <img
                  src={logoSTTP}
                  alt="Logo Sekolah Tinggi Teknik Pati"
                  className="relative w-24 h-24 md:w-28 md:h-28 object-contain"
                />
              </div>
            </div>

            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Sistem Absensi Wajah
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full mb-3"></div>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Sekolah Tinggi Teknik Pati
              </p>
            </div>
          </div>

          {/* BUTTON ROLE */}
          <div className="space-y-4 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-gray-700 font-semibold text-lg mb-1">Masuk Sebagai</h3>
              <p className="text-sm text-gray-500">Pilih peran untuk melanjutkan</p>
            </div>
            
            <button
              onClick={() => onNavigate('admin-login', 'admin')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">Admin</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>

            <button
              onClick={() => onNavigate('dosen-login', 'dosen')}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">Dosen</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>

            <button
              onClick={() => onNavigate('mahasiswa-login', 'mahasiswa')}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">Mahasiswa</span>
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>

          {/* INFO FOOTER */}
          <div className="border-t border-gray-100 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Sistem absensi berbasis pengenalan wajah yang aman dan akurat
              </p>
            </div>
          </div>

        </div>

        {/* Mobile-friendly footer info */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-xs md:text-sm text-gray-500">
            © {new Date().getFullYear()} Sekolah Tinggi Teknik Pati
          </p>
        </div>

      </div>
    </div>
  )
}