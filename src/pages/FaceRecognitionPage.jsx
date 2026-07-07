import React, { useState, useRef, useEffect } from 'react'
import Modal from '../components/Modal'
import { apiFetch } from '../utils/api'
import { FASTAPI_API_URL } from '../config'
import { EXPRESS_API_URL } from '../config'
import Footer from '../components/Footer'
import logoSTTP from '../assets/logostt.png';
import LivenessChallenge from '../components/LivenessChallenge';

export default function FaceRecognitionPage({ 
    onNavigate, 
    userName,
    userId, 
    userData 
    }) {
  // State kamera
  // State untuk instruksi liveness
  
  const [livenessInstruction, setLivenessInstruction] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  // State baru
  const [showLiveness, setShowLiveness] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  // State proses scan
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)

  // Status absensi hari ini (per course)
  const [attendanceStatus, setAttendanceStatus] = useState({})

  // Data mata kuliah yang diikuti mahasiswa
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')

  // Meeting aktif (dari backend Express)
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [activeMeetingLoading, setActiveMeetingLoading] = useState(false)
  // Fungsi generate instruksi acak
  const generateRandomInstruction = () => {
    const instructions = [
      'Kedipkan mata Anda',
      'Gerakkan kepala ke kanan',
      'Gerakkan kepala ke kiri',
      'Angkat kepala (lihat ke atas)',
      'Tundukkan kepala (lihat ke bawah)',
      'Kedipkan mata dan gelengkan kepala'
    ] 
    const random = instructions[Math.floor(Math.random() * instructions.length)]
    setLivenessInstruction(random)
  }

  // ========== 1. Ambil daftar course mahasiswa ==========
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${FASTAPI_API_URL}/api/courses/mahasiswa?name=${encodeURIComponent(userName)}`)
        // const res = await fetch(`http://127.0.0.1:8000/api/courses/mahasiswa?user_id=${userId}`)
        const data = await res.json()
        setCourses(data)
        if (data.length > 0) setSelectedCourse(data[0].kode_mk)
      } catch (err) {
        console.error('Gagal mengambil mata kuliah', err)
      }
    }
    fetchCourses()
  }, [userName])

  // ========== 2. Cek meeting aktif untuk course yang dipilih ==========
  useEffect(() => {
    if (selectedCourse && courses.length) {
      const course = courses.find(c => c.kode_mk === selectedCourse)
      if (course && course.id) {
        setActiveMeetingLoading(true)
        apiFetch(`${EXPRESS_API_URL}/meetings/active/${course.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => setActiveMeeting(data))
          .catch(() => setActiveMeeting(null))
          .finally(() => setActiveMeetingLoading(false))
      } else {
        setActiveMeeting(null)
      }
    }
  }, [selectedCourse, courses])

  // ========== 3. Cek status absensi (sudah absen hari ini) ==========
  const checkAttendanceStatus = async (courseKode) => {
    try {
      const res = await fetch(`${FASTAPI_API_URL}/api/attendance-status?name=${encodeURIComponent(userName)}&course_kode=${encodeURIComponent(courseKode)}`)
      const data = await res.json()
      setAttendanceStatus(prev => ({ ...prev, [courseKode]: data.hasAttended }))
    } catch (err) {
      console.error('Gagal mengecek status absensi:', err)
    }
  }

  // Refresh instruksi saat mata kuliah berubah
  useEffect(() => {
    generateRandomInstruction()
  }, [selectedCourse])

  useEffect(() => {
    if (selectedCourse) checkAttendanceStatus(selectedCourse)
  }, [selectedCourse])

  // ========== 4. Default course jika belum dipilih ==========
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].kode_mk)
    }
  }, [courses])

  // ========== 5. Inisialisasi kamera ==========
  useEffect(() => {
    initCamera()
    return () => {
      stopCameraTracks()
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [userName])

  const handleCancel = () => {
    stopCameraTracks()
    onNavigate('mahasiswa-dashboard')
  }

  const initCamera = async () => {
    setCameraError('')
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(err => console.error('Error playing video:', err))
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.')
      setCameraActive(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !cameraActive) return
    const handleCanPlay = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) setCameraReady(true)
    }
    video.addEventListener('canplay', handleCanPlay)
    const timeout = setTimeout(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) setCameraReady(true)
      else if (cameraActive) setCameraError('Kamera tidak merespons, coba refresh halaman.')
    }, 2000)
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      clearTimeout(timeout)
    }
  }, [cameraActive])

  const stopCameraTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) throw new Error('Camera not ready')
    if (!cameraReady || video.videoWidth === 0) throw new Error('Camera masih memuat, tunggu sebentar')

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    const cropSize = 400
    const centerX = videoWidth / 2
    const centerY = videoHeight / 2
    const startX = Math.max(0, centerX - cropSize / 2)
    const startY = Math.max(0, centerY - cropSize / 2)
    const actualCropWidth = Math.min(cropSize, videoWidth - startX)
    const actualCropHeight = Math.min(cropSize, videoHeight - startY)

    canvas.width = actualCropWidth
    canvas.height = actualCropHeight
    const context = canvas.getContext('2d')
    context.drawImage(video, startX, startY, actualCropWidth, actualCropHeight, 0, 0, actualCropWidth, actualCropHeight)
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const captureMultipleFrames = async (frameCount = 15, intervalMs = 700) => {
  const frames = []
  for (let i = 0; i < frameCount; i++) {
    const dataUrl = capturePhoto()
    frames.push(dataUrl)
    if (i < frameCount - 1) await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  return frames
}



  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Geolocation tidak didukung browser ini'))
      else navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
    })
  }

  // ========== TAKE ATTENDANCE (tanpa mengirim pertemuan manual) ==========
  const takeAttendance = async (framesDataUrls, lat, lon) => {
  const formData = new FormData()
  formData.append('name', userName)
  formData.append('course_kode', selectedCourse)
  formData.append('lat', lat.toString())
  formData.append('lon', lon.toString())
  for (let i = 0; i < framesDataUrls.length; i++) {
    const blob = await fetch(framesDataUrls[i]).then(res => res.blob())
    formData.append('files', blob, `frame${i}.jpg`)
  }

  const response = await fetch(`${FASTAPI_API_URL}/api/attendance`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  console.log("Status HTTP:", response.status);
  console.log("Data response:", data);
  // console.log('Attendance response:', data)

  if (!response.ok) {
    // Ambil pesan error dari detail (FastAPI) atau error (fallback)
    const errorMsg = data.detail || data.error || data.message || 'Absensi gagal'
    throw new Error(errorMsg)
  }

  return {
    success: data.status === 'success',
    message: data.message,
    timestamp: new Date().toLocaleTimeString('id-ID')
  }
}

  const handleStartScan = async () => {
  // Validasi awal
  if (!cameraReady) {
    setCameraError('Kamera belum siap, tunggu sebentar...');
    return;
  }
  if (attendanceStatus[selectedCourse]) {
    setScanResult({
      success: false,
      message: 'Anda sudah melakukan absensi untuk pertemuan ini',
      timestamp: new Date().toLocaleTimeString('id-ID')
    });
    setShowResultModal(true);
    return;
  }
  if (!activeMeeting) {
    setScanResult({
      success: false,
      message: 'Belum ada sesi absensi yang dibuka oleh dosen untuk mata kuliah ini',
      timestamp: new Date().toLocaleTimeString('id-ID')
    });
    setShowResultModal(true);
    return;
  }

  // ⭐ Tampilkan Liveness Challenge
  setShowLiveness(true);
};

  // ===== PROSES ABSENSI (Face Recognition) =====
  const processAttendance = async () => {
    setIsScanning(true);
    setCameraError('');

    try {
      // Ambil frame
      const frames = await captureMultipleFrames(15, 700);
      if (frames.length < 10) {
        throw new Error('Gagal mengambil cukup frame (kurang dari 10)');
      }

      // Ambil lokasi
      let position;
      try {
        position = await getLocation();
      } catch (locError) {
        throw new Error('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan izinkan akses lokasi.');
      }
      const { latitude, longitude } = position.coords;

      // Kirim ke backend
      const result = await takeAttendance(frames, latitude, longitude);

      setScanResult(result);
      setShowResultModal(true);
      if (result.success) {
        setAttendanceStatus(prev => ({ ...prev, [selectedCourse]: true }));
      }
    } catch (error) {
      console.error('Full error:', error);
      let userMessage = error.message || 'Gagal melakukan scan wajah';
      if (userMessage.includes('Liveness detection gagal')) {
        userMessage = '❌ Liveness detection gagal.\n\nPastikan Anda:\n• Berkedip secara alami\n• Menggerakkan kepala sedikit (angguk/geleng)\n• Pencahayaan cukup\n• Wajah terlihat jelas\n\nSilakan coba lagi.';
      }
      setScanResult({
        success: false,
        message: userMessage,
        timestamp: new Date().toLocaleTimeString('id-ID')
      });
      setShowResultModal(true);
    } finally {
      setIsScanning(false);
    }
  };

  // ===== HANDLER LIVENESS =====
const handleLivenessSuccess = async () => {
  setShowLiveness(false);
  setLivenessPassed(true);

  // Lanjutkan ke proses Face Recognition (capture frame, lokasi, absensi)
  await processAttendance();
};

  const handleLivenessCancel = () => {
    setShowLiveness(false);
    // Kamera tetap menyala, user kembali ke halaman scan
  };

  const handleCloseModal = () => {
    setShowResultModal(false)
    if (scanResult?.success) onNavigate('mahasiswa-dashboard')
  }

  const handleRetry = () => {
    setShowResultModal(false)
    handleStartScan()
  }

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
    {/* Grid 3 kolom simetris: kiri (1fr), tengah (auto), kanan (1fr) */}
    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-4">
      
      {/* Kiri: Brand (logo + SIPATI + badge) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src={logoSTTP}
          alt="Logo STT Pati"
          className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <h1 className="text-base sm:text-2xl md:text-[36px] font-bold text-blue-700 tracking-tight truncate">
              SIPATI
            </h1>
            <span className="bg-blue-100 text-blue-700 text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
              Mahasiswa
            </span>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium truncate hidden sm:block">
            Sistem Informasi Presensi STT Pati
          </p>
        </div>
      </div>

      {/* Tengah: Judul Halaman */}
      <div className="text-center min-w-0">
        <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 truncate">
          Scan Wajah
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate hidden sm:block">
          Lakukan absensi dengan pengenalan wajah
        </p>
      </div>

      {/* Kanan: Tombol Kembali */}
      <div className="flex justify-end">
        <button
          onClick={() => onNavigate('mahasiswa-dashboard')}
          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-0.5 sm:gap-1 transition whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Kembali</span>
        </button>
      </div>

    </div>
  </div>
</header>

      {/* ===== MAIN ===== */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Layout Grid: 2/3 untuk kamera+kontrol, 1/3 untuk info pendukung */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Kolom Kiri (2/3) - Kamera & Kontrol */}
              <div className="lg:col-span-2 space-y-4">
                {/* Peringatan */}
                {attendanceStatus[selectedCourse] && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-yellow-800 font-medium">Anda sudah absen Pertemuan ini untuk mata kuliah ini.</p>
                  </div>
                )}
                {!activeMeetingLoading && !activeMeeting && selectedCourse && !attendanceStatus[selectedCourse] && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                    <p className="text-orange-700">Belum ada sesi absensi aktif untuk mata kuliah ini.</p>
                  </div>
                )}

                {/* Kamera */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-inner">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-gray-400 text-sm text-center mb-3">{cameraError}</p>
                      <button onClick={initCamera} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm">Coba Aktifkan Kamera</button>
                    </div>
                  ) : !cameraActive ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-sm">Menghidupkan kamera...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-40 h-56 border-2 border-yellow-400 rounded-2xl opacity-70">
                          <div className="absolute top-12 left-6 w-6 h-6 border-2 border-white rounded-full opacity-50"></div>
                          <div className="absolute top-12 right-6 w-6 h-6 border-2 border-white rounded-full opacity-50"></div>
                          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-6 h-1.5 border-2 border-white rounded-full opacity-50"></div>
                        </div>
                      </div>
                    </>
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-center">
                        <div className="mb-3"><div className="inline-block"><div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div></div></div>
                        <p className="text-white font-semibold text-sm">Mencocokkan wajah...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kontrol: Mata Kuliah + Tombol Scan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Mata Kuliah</label>
                    {courses.length === 0 ? (
                      <p className="text-red-600 text-sm">Belum terdaftar di mata kuliah apapun.</p>
                    ) : (
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {courses.map(course => (
                          <option key={course.kode_mk} value={course.kode_mk}>
                            {course.nama_mk} ({course.kode_mk})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={handleStartScan}
                      disabled={isScanning || !cameraReady || !cameraActive || attendanceStatus[selectedCourse] || !activeMeeting || courses.length === 0}
                      className={`w-full font-semibold py-2.5 rounded-lg transition text-sm ${
                        isScanning || !cameraReady || !cameraActive || attendanceStatus[selectedCourse] || !activeMeeting || courses.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isScanning ? 'Memproses...' : !cameraActive ? 'Memuat Kamera...' : !cameraReady ? 'Kamera Belum Siap' : attendanceStatus[selectedCourse] ? 'Sudah Absen' : !activeMeeting ? 'Tidak Ada Sesi' : 'Mulai Scan'}
                    </button>
                  </div>
                </div>

                {/* Tombol Batal */}
                <button onClick={handleCancel} className="w-full border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
              </div>

              {/* Kolom Kanan (1/3): Informasi Pendukung */}
              <div className="space-y-4">
                {/* Instruksi Liveness */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 font-semibold text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                    Instruksi Liveness
                  </p>
                  <p className="text-blue-700 text-base font-medium mt-1">Ikuti instruksi saat proses scan</p>
                  {/* <p className="text-xs text-blue-500 mt-1">Ikuti instruksi saat proses scan</p> */}
                </div>

                {/* Info Meeting Aktif */}
                {activeMeeting && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 font-semibold text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                      Sesi aktif
                    </p>
                    <p className="text-green-600 text-sm font-medium">Pertemuan {activeMeeting.pertemuan_ke}</p>
                  </div>
                )}

                {/* Panduan Ringkas */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                    Panduan
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                    <li>Jarak optimal <span className="font-medium">30-60 cm</span></li>
                    <li>Pencahayaan <span className="font-medium">cukup terang</span></li>
                    <li>Posisi kepala <span className="font-medium">lurus</span></li>
                    <li>Ikuti instruksi liveness</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
              {/* ===== LIVENESS CHALLENGE ===== */}
              {showLiveness && (
                <LivenessChallenge
                  userId={userId}
                  onSuccess={handleLivenessSuccess}
                  onCancel={handleLivenessCancel}
                />
              )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {showResultModal && scanResult && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <div className="w-full max-w-md text-center">
            {scanResult.success ? (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
                <p className="text-gray-600 mb-1">{scanResult.message}</p>
                <p className="text-sm text-gray-500 mb-6">Waktu: {scanResult.timestamp}</p>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal!</h2>
                <p className="text-gray-600 mb-6">{scanResult.message}</p>
                <button onClick={handleRetry} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition">Coba Lagi</button>
              </>
            )}
          </div>
        </Modal>
      )}
      <Footer role="mahasiswa" onNavigate={onNavigate}/>
    </div>
  )
}