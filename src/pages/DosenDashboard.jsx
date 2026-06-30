'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { EXPRESS_API_URL } from '../config';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.png';

export default function DosenDashboard({ 
  onNavigate, 
  userName, 
  onLogout, 
  onEnableManualAbsen, 
  manualAbsenEnabled,
  userId,
  userData 
}) {
  console.log('DosenDashboard rendered, userId:', userId);
  const [courses, setCourses] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState({});
  const [selectedPertemuan, setSelectedPertemuan] = useState({});

  // ⭐ Fungsi untuk menentukan periode akademik aktif (sama seperti di backend)
  const getCurrentAcademicPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1=Jan, 12=Des

    let tahun_ajaran, jenis_semester;

    // Aturan STTP:
    // Ganjil : Oktober (10) – Februari (2)
    // Genap  : April (4) – Agustus (8)
    if (month >= 10 && month <= 12) {
      tahun_ajaran = `${year}/${year + 1}`;
      jenis_semester = 'ganjil';
    } else if (month >= 1 && month <= 2) {
      tahun_ajaran = `${year - 1}/${year}`;
      jenis_semester = 'ganjil';
    } else if (month >= 4 && month <= 8) {
      tahun_ajaran = `${year - 1}/${year}`;
      jenis_semester = 'genap';
    } else {
      // Bulan transisi: Maret (3) dan September (9) -> fallback ke genap
      tahun_ajaran = `${year - 1}/${year}`;
      jenis_semester = 'genap';
    }

    return { tahun_ajaran, jenis_semester };
  };

  // ⭐ Filter courses berdasarkan periode aktif
  const activePeriod = useMemo(() => getCurrentAcademicPeriod(), []);
  const activeCourses = useMemo(() => {
    return courses.filter(course => {
      // Jika course tidak memiliki field tahun_ajaran atau jenis_semester (data lama), maka tidak ditampilkan
      if (!course.tahun_ajaran || !course.jenis_semester) return false;
      // Bandingkan dengan periode aktif
      return course.tahun_ajaran === activePeriod.tahun_ajaran && 
             course.jenis_semester === activePeriod.jenis_semester;
    });
  }, [courses, activePeriod]);

  useEffect(() => {
    if (userId) fetchCourses();
    else console.warn('DosenDashboard: userId tidak tersedia');
    
    const handlePageShow = (event) => {
      if (event.persisted && userId) {
        console.log('Page restored from bfcache, refreshing courses');
        fetchCourses();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [userId]);

  const fetchCourses = async () => {
    console.log('Fetching courses for userId:', userId);
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/courses/dosen/${userId}`);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      console.log('Courses data:', data);
      setCourses(data);
      data.forEach(async (course) => {
        try {
          const resMeet = await apiFetch(`${EXPRESS_API_URL}/meetings/active/${course._id}`);
          if (resMeet.ok) {
            const meeting = await resMeet.json();
            setActiveMeeting(prev => ({ ...prev, [course._id]: meeting }));
          }
        } catch(e) { console.error('Error fetching meeting for course', course._id, e); }
      });
    } catch (err) { console.error(err); }
  };

  const openMeeting = async (courseId, pertemuanKe) => {
    if (!pertemuanKe || pertemuanKe < 1 || pertemuanKe > 16) {
      alert('Masukkan nomor pertemuan (1-16)');
      return;
    }
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/meetings/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, pertemuan_ke: parseInt(pertemuanKe) })
      });
      if (res.ok) {
        alert('Sesi absensi dibuka');
        await fetchCourses();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuka sesi');
    }
  };

  const closeMeeting = async (meetingId, courseId) => {
    console.log('Token saat tutup:', sessionStorage.getItem('token'));
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/meetings/close/${meetingId}`, { method: 'PUT' });
      if (res.ok) {
        alert('Sesi ditutup');
        setActiveMeeting(prev => {
          const newState = { ...prev };
          delete newState[courseId];
          return newState;
        });
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menutup sesi');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menutup sesi');
    }
  };

  return (
    <div className="min-h-screen">
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
          {userData?.gelar ? `, ${userData.gelar}` : ''}
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
        {/* ⭐ Tampilkan informasi periode aktif */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-800">
            <span className="font-semibold">Periode Akademik Aktif:</span> {activePeriod.jenis_semester.charAt(0).toUpperCase() + activePeriod.jenis_semester.slice(1)} {activePeriod.tahun_ajaran}
          </p>
        </div>

        {activeCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Tidak ada mata kuliah untuk periode akademik saat ini.</p>
            {courses.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                * Anda memiliki {courses.length} mata kuliah, tetapi tidak ada yang sesuai dengan periode aktif.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border-t-4 border-indigo-600">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.nama_mk}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-semibold">Kode:</span> {course.kode_mk}</p>
                    <p><span className="font-semibold">SKS:</span> {course.sks || '-'}</p>
                    <p><span className="font-semibold">Semester:</span> {course.semester || '-'}</p>
                    <p><span className="font-semibold">Jadwal:</span> {course.hari} {course.jam_mulai} - {course.jam_selesai}</p>
                    <p><span className="font-semibold">Ruangan:</span> {course.ruangan}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {activeMeeting[course._id] ? (
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-semibold">
                        Sesi aktif: Pertemuan {activeMeeting[course._id].pertemuan_ke}
                      </span>
                      <button
                        onClick={() => closeMeeting(activeMeeting[course._id]._id, course._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Tutup Sesi
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="16"
                        placeholder="Pertemuan"
                        className="border rounded px-2 py-1 w-20 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedPertemuan[course._id] || ''}
                        onChange={(e) => setSelectedPertemuan({...selectedPertemuan, [course._id]: e.target.value})}
                      />
                      <button
                        onClick={() => openMeeting(course._id, selectedPertemuan[course._id])}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Buka Absensi
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('rekap-absensi', { courseId: course._id, courseName: course.nama_mk, courseKode: course.kode_mk })}
                  className="w-full py-3 text-indigo-700 font-semibold bg-indigo-50 hover:bg-indigo-100 transition text-sm"
                >
                  Lihat Rekap Absensi →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer role="dosen" onNavigate={onNavigate}/>
    </div>
  );
}