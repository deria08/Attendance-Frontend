'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { EXPRESS_API_URL } from '../config';

export default function DosenDashboard({ 
  onNavigate, 
  userName, 
  onLogout, 
  onEnableManualAbsen, 
  manualAbsenEnabled,
  userId
}) {
  console.log('DosenDashboard rendered, userId:', userId);
  const [courses, setCourses] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState({});
  const [selectedPertemuan, setSelectedPertemuan] = useState({});

  useEffect(() => {
    if (userId) fetchCourses();
    else console.warn('DosenDashboard: userId tidak tersedia');
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Selamat datang, {userName}</h1>
            <p className="text-gray-600 mt-1">Website Absensi STTP</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button
            onClick={onEnableManualAbsen}
            className={`font-semibold py-3 px-6 rounded-lg transition ${
              manualAbsenEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {manualAbsenEnabled ? '✓ Absen Manual Aktif' : 'Aktifkan Absen Manual'}
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Anda belum diampu mata kuliah apapun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border-t-4 border-indigo-600">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.nama_mk}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-semibold">Kode:</span> {course.kode_mk}</p>
                    <p><span className="font-semibold">SKS:</span> {course.sks || '-'}</p>
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

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 border-l-4 border-indigo-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fitur Dosen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Lihat Rekap Absensi</h3>
                <p className="mt-2 text-base text-gray-600">Lihat detail kehadiran mahasiswa per pertemuan</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit Status Absensi</h3>
                <p className="mt-2 text-base text-gray-600">Ubah status kehadiran mahasiswa</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Aktifkan Absen Manual</h3>
                <p className="mt-2 text-base text-gray-600">Izinkan mahasiswa absen manual (jika diizinkan)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Bantuan</h3>
                <p className="mt-2 text-base text-gray-600">Panduan penggunaan sistem</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}