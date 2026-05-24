'use client';

import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Jika Anda sudah melakukan conditional rendering di parent, baris berikut boleh dihapus.
  // Tapi untuk keamanan, tetap biarkan.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto relative">
        {/* Tombol close (posisi absolute, tidak berubah) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title (jika ada) dengan padding atas dan kanan agar tidak tertutup tombol close */}
        {title && (
          <div className="text-xl font-bold pt-6 px-8 pr-12">
            {title}
          </div>
        )}

        {/* Konten utama dengan padding seperti semula (p-8) */}
        <div className={title ? 'p-8 pt-4' : 'p-8'}>
          {children}
        </div>
      </div>
    </div>
  );
}