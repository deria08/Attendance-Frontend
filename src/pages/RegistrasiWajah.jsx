'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function RegistrasiWajah({ mahasiswaList, userName, onNavigate, onRegisterFace, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const videoReadyCheckRef = useRef(null);

  const currentMahasiswa = mahasiswaList.find(m => m.nim === userId);

  useEffect(() => {
    return () => {
      stopCameraTracks();
      if (videoRef.current) videoRef.current.srcObject = null;
      if (videoReadyCheckRef.current) clearTimeout(videoReadyCheckRef.current);
    };
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      const handleCanPlay = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setCameraReady(true);
          if (videoReadyCheckRef.current) clearTimeout(videoReadyCheckRef.current);
        }
      };
      video.addEventListener('canplay', handleCanPlay);
      video.play().catch(err => console.error('Video play error:', err));

      videoReadyCheckRef.current = setTimeout(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setCameraReady(true);
        } else {
          setErrorMessage('Kamera tidak merespons, coba refresh halaman.');
          stopAndCleanCamera();
        }
      }, 2000);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        if (videoReadyCheckRef.current) clearTimeout(videoReadyCheckRef.current);
      };
    }
  }, [cameraActive]);

  const stopCameraTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const stopAndCleanCamera = () => {
    stopCameraTracks();
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setCameraReady(false);
    setCapturedPhoto(null);
    if (videoReadyCheckRef.current) clearTimeout(videoReadyCheckRef.current);
  };

  const handleActivateCamera = async () => {
    setErrorMessage('');
    setCameraReady(false);
    stopAndCleanCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
    }
  };

  const waitForVideoReady = () => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) return reject('Video element not found');
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
        return resolve(true);
      }
      const onReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve(true);
          video.removeEventListener('loadeddata', onReady);
        }
      };
      video.addEventListener('loadeddata', onReady);
      setTimeout(() => {
        video.removeEventListener('loadeddata', onReady);
        reject('Video tidak siap setelah timeout');
      }, 1000);
    });
  };

  const handleCapturePhoto = async () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) {
    setErrorMessage('Kamera belum tersedia');
    return;
  }
  if (!cameraReady) {
    setErrorMessage('Kamera masih memuat, tunggu sebentar...');
    return;
  }
  try {
    await waitForVideoReady();
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    if (videoWidth === 0 || videoHeight === 0) {
      throw new Error('Video dimensions are zero');
    }
    
    // Tentukan ukuran crop persegi (sesuai overlay lingkaran)
    const cropSize = 400; // atau lebih besar, misal 400
    // Hitung area tengah video
    const centerX = videoWidth / 2;
    const centerY = videoHeight / 2;
    const startX = Math.max(0, centerX - cropSize / 2);
    const startY = Math.max(0, centerY - cropSize / 2);
    const actualCropWidth = Math.min(cropSize, videoWidth - startX);
    const actualCropHeight = Math.min(cropSize, videoHeight - startY);
    
    // Set canvas ukuran crop (persegi)
    canvas.width = actualCropWidth;
    canvas.height = actualCropHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(
      video,
      startX, startY, actualCropWidth, actualCropHeight,
      0, 0, actualCropWidth, actualCropHeight
    );
    
    // Tingkatkan kualitas JPEG
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoData);
    setErrorMessage('');
  } catch (err) {
    console.error('Capture error:', err);
    setErrorMessage('Gagal mengambil foto. Pastikan kamera sudah aktif dan coba lagi.');
  }
};

  const handleRetake = () => {
    setCapturedPhoto(null);
    setErrorMessage('');
  };

  const handleSaveWajah = async () => {
  if (!capturedPhoto) return;

  setIsLoading(true);
  setErrorMessage('');
  setSuccessMessage('');

  try {
    // Konversi dataURL ke Blob dengan kualitas lebih baik
    const blob = await (await fetch(capturedPhoto)).blob();
    console.log('Ukuran gambar:', blob.size, 'bytes'); // debug

    const formData = new FormData();
    formData.append('name', userName);           // <- name sebagai form field
    formData.append('file', blob, 'face.jpg');

    const response = await fetch('http://127.0.0.1:8000/api/register-face', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Registrasi gagal');
    }

    setSuccessMessage('Wajah berhasil didaftarkan!');
    onRegisterFace(userId, capturedPhoto);
    setTimeout(() => onNavigate('mahasiswa-dashboard'), 1500);
  } catch (err) {
    console.error(err);
    setErrorMessage(err.message || 'Gagal registrasi wajah');
  } finally {
    setIsLoading(false);
  }
};

  // Jika wajah sudah terdaftar, tampilkan pesan dan tidak perlu registrasi ulang
  const isAlreadyRegistered = currentMahasiswa?.face_registered;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate('mahasiswa-dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Registrasi Wajah</h1>
          <p className="text-gray-600 mt-1">Daftarkan wajah Anda untuk sistem pengenalan wajah</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Informasi Mahasiswa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Nama Mahasiswa</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{userName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">NIM</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{currentMahasiswa?.nim || '-'}</p>
            </div>
            {isAlreadyRegistered && (
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Wajah Anda sudah terdaftar di sistem
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Camera Section - hanya tampilkan jika belum terdaftar */}
        {!isAlreadyRegistered ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ambil Foto Wajah</h2>

            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 flex items-center gap-2">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 flex items-center gap-2">{successMessage}</p>
              </div>
            )}

            {!cameraActive ? (
              <button
                onClick={handleActivateCamera}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                Aktifkan Kamera
              </button>
            ) : (
              <>
                <div className="relative bg-gray-800 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-64 rounded-full border-4 border-yellow-400 opacity-70" />
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <button
                    onClick={stopAndCleanCamera}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Matikan Kamera
                  </button>
                </div>

                <div className="flex gap-3 mb-6">
                  {!capturedPhoto ? (
                    <button
                      disabled={!cameraReady}
                      onClick={handleCapturePhoto}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Ambil Foto
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleRetake}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                      >
                        Ulangi
                      </button>
                      <button
                        onClick={handleSaveWajah}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Memproses...' : 'Simpan Wajah'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {capturedPhoto && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview Foto</h3>
                <img src={capturedPhoto} alt="Face preview" className="w-full rounded-lg border border-gray-200" style={{ maxHeight: '300px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Anda sudah melakukan registrasi wajah. Tidak perlu registrasi ulang.</p>
            <button
              onClick={() => onNavigate('mahasiswa-dashboard')}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Panduan Registrasi Wajah</h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">1</span>Klik tombol "Aktifkan Kamera" untuk membuka kamera</li>
            <li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">2</span>Posisikan wajah Anda di dalam lingkaran panduan</li>
            <li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">3</span>Pastikan cahaya cukup dan wajah jelas terlihat</li>
            <li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">4</span>Klik "Ambil Foto" untuk menangkap wajah Anda</li>
            <li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">5</span>Jika puas dengan foto, klik "Simpan Wajah" untuk menyimpan</li>
          </ul>
        </div>
      </main>
    </div>
  );
}