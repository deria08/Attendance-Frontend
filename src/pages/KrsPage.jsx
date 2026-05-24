import React, { useState, useEffect } from 'react';

export default function KrsPage({ onNavigate, userId, userName }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cari mahasiswa berdasarkan nim_nidn (userId) untuk mendapatkan _id
        const resUsers = await fetch('http://localhost:5000/api/auth/users');
        if (!resUsers.ok) throw new Error('Gagal mengambil data user');
        const users = await resUsers.json();
        const mahasiswa = users.find(u => u.nim_nidn === userId && u.role === 'mahasiswa');
        if (!mahasiswa) throw new Error('Mahasiswa tidak ditemukan');
        const objectId = mahasiswa._id;

        // 2. Ambil enrollment berdasarkan objectId
        const resEnroll = await fetch(`http://localhost:5000/api/enrollments/mahasiswa/${objectId}`);
        if (!resEnroll.ok) throw new Error('Gagal mengambil enrollment');
        const data = await resEnroll.json();
        // data berupa array enrollment dengan field course yang sudah di-populate
        setEnrolledCourses(data.map(e => e.course));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="text-center py-12">Memuat data KRS...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate('mahasiswa-dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Kartu Rencana Studi (KRS)</h1>
          <p className="text-gray-600 mt-1">Mahasiswa: {userName}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Mata Kuliah yang Diambil</h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-500">Belum ada mata kuliah yang diambil.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {enrolledCourses.map(course => (
                <li key={course._id} className="py-4">
                  <p className="font-medium text-gray-900">{course.nama_mk}</p>
                  <p className="text-sm text-gray-500">
                    {course.kode_mk} | {course.sks} SKS | Dosen: {course.dosen_pengampu?.name || '-'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Jadwal: {course.hari}, {course.jam_mulai} - {course.jam_selesai} | Ruang: {course.ruangan}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}