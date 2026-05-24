import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../utils/api';

export default function RekapAbsensiPage({ onNavigate, userRole, userId, selectedCourse: initialCourse }) {
  // State untuk mata kuliah (dropdown)
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse?.courseKode || '');
  const [loadingCourses, setLoadingCourses] = useState(false);

  // State untuk rekap absensi
  const [rekapData, setRekapData] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Informasi course yang dipilih
  const courseName = initialCourse?.courseName || courses.find(c => c.kode_mk === selectedCourse)?.nama_mk || '';

  // Hitung statistik per pertemuan untuk grafik
  const calculateChartData = () => {
    if (!rekapData.length) return [];
    const pertemuanStats = Array(16).fill().map(() => ({ hadir: 0, tidakHadir: 0, izin: 0, terlambat: 0 }));
    rekapData.forEach(student => {
      student.attendance.forEach((status, idx) => {
        if (status === '✔') pertemuanStats[idx].hadir++;
        else if (status === '✖') pertemuanStats[idx].tidakHadir++;
        else if (status === 'i') pertemuanStats[idx].izin++;
        else if (status === 'L') pertemuanStats[idx].terlambat++;
      });
    });
    return pertemuanStats.map((stat, idx) => ({ pertemuan: idx + 1, ...stat }));
  };

  // Ambil daftar mata kuliah berdasarkan role
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        let url = 'http://localhost:5000/api/courses';
        if (userRole === 'dosen') {
          url = `http://localhost:5000/api/courses/dosen/${userId}`;
        }
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Gagal mengambil mata kuliah');
        const data = await res.json();
        setCourses(data);
        if (!selectedCourse && data.length > 0) {
          setSelectedCourse(data[0].kode_mk);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [userRole, userId]);

  // Ambil rekap absensi berdasarkan mata kuliah yang dipilih
  const fetchRekap = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/attendance-recap-by-course?course_kode=${selectedCourse}`);
      const data = await res.json();
      setRekapData(data);
    } catch (err) {
      console.error(err);
      setRekapData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, [selectedCourse]);

  // Update status manual
  const updateLocalStatus = async (studentIndex, pertemuanIndex, newStatus) => {
    const studentName = rekapData[studentIndex]?.nama;
    if (!studentName) return;
    const pertemuan = pertemuanIndex + 1;

    try {
      const res = await fetch('http://localhost:8000/api/attendance/manual-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          course_kode: selectedCourse,
          pertemuan: pertemuan,
          status: newStatus
        })
      });
      if (!res.ok) throw new Error('Gagal update');
      await fetchRekap();
    } catch (err) {
      console.error('Gagal simpan perubahan:', err);
      alert('Gagal menyimpan perubahan status');
    }
  };

  const statusOptions = [
    { symbol: '✔', label: 'Hadir', color: 'bg-green-100 text-green-700' },
    { symbol: '✖', label: 'Tidak Hadir', color: 'bg-red-100 text-red-700' },
    { symbol: 'i', label: 'Izin', color: 'bg-yellow-100 text-yellow-700' },
    { symbol: 'L', label: 'Terlambat', color: 'bg-orange-100 text-orange-700' }
  ];

  const handleCellClick = (studentIndex, pertemuanIndex) => {
    const student = rekapData[studentIndex];
    if (!student) return;
    setSelectedCell({ studentIndex, pertemuanIndex });
    setSelectedStatus(student.attendance[pertemuanIndex] || '');
  };

  const handleStatusChange = (newStatus) => {
    if (selectedCell) {
      updateLocalStatus(selectedCell.studentIndex, selectedCell.pertemuanIndex, newStatus);
      setSelectedCell(null);
      setSelectedStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate('dosen-dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Rekap Absensi Mahasiswa</h1>
          <p className="text-gray-600 mt-2">
            Mata Kuliah: {courseName || (courses.find(c => c.kode_mk === selectedCourse)?.nama_mk)} ({selectedCourse})
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Dropdown pilih mata kuliah */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Ganti Mata Kuliah:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            disabled={loadingCourses}
          >
            {loadingCourses && <option>Memuat...</option>}
            {courses.map((course) => (
              <option key={course.kode_mk} value={course.kode_mk}>
                {course.nama_mk} ({course.kode_mk})
              </option>
            ))}
          </select>
        </div>

        {/* Loading indikator untuk rekap */}
        {loading && (
          <div className="text-center py-12">Memuat data...</div>
        )}

        {!loading && rekapData.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Belum ada data absensi untuk mata kuliah ini.
          </div>
        )}

        {!loading && rekapData.length > 0 && (
          <>
            {/* Tabel Rekap */}
            <div className="bg-white rounded-lg shadow overflow-auto mb-8">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">
                      Nama Mahasiswa
                    </th>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((p) => (
                      <th key={p} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 whitespace-nowrap">
                        P{p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rekapData.map((student, studentIndex) => (
                    <tr key={studentIndex} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium sticky left-0 bg-white z-10">
                        {student.nama}
                      </td>
                      {student.attendance.map((status, pertemuanIndex) => {
                        const isSelected =
                          selectedCell &&
                          selectedCell.studentIndex === studentIndex &&
                          selectedCell.pertemuanIndex === pertemuanIndex;
                        return (
                          <td
                            key={pertemuanIndex}
                            onClick={() => handleCellClick(studentIndex, pertemuanIndex)}
                            className="px-4 py-4 text-center cursor-pointer"
                          >
                            <button
                              className={`w-8 h-8 rounded font-bold text-sm transition ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 ring-offset-2'
                                  : status === '✔'
                                  ? 'bg-green-100 text-green-700'
                                  : status === '✖'
                                  ? 'bg-red-100 text-red-700'
                                  : status === 'i'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : status === 'L'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {status || '-'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grafik Kehadiran */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grafik Kehadiran per Pertemuan</h3>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={calculateChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="pertemuan" label={{ value: 'Pertemuan ke-', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Jumlah Mahasiswa', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="hadir" name="Hadir" fill="#22c55e" />
                    <Bar dataKey="terlambat" name="Terlambat" fill="#f97316" />
                    <Bar dataKey="izin" name="Izin" fill="#eab308" />
                    <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legenda Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {statusOptions.map((option) => (
                <div key={option.symbol} className={`p-4 rounded-lg ${option.color}`}>
                  <p className="text-sm font-semibold mb-2">{option.symbol}</p>
                  <p className="text-sm">{option.label}</p>
                </div>
              ))}
            </div>

            {/* Info klik */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
              <p className="text-blue-900 font-semibold flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 000-2H8z" clipRule="evenodd" />
                </svg>
                <span>Klik pada sel untuk mengubah status kehadiran mahasiswa</span>
              </p>
            </div>
          </>
        )}
      </main>

      {/* Modal Ubah Status */}
      {selectedCell && (
        <Modal isOpen={true} onClose={() => setSelectedCell(null)}>
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ubah Status Absensi</h2>
            <p className="text-gray-600 mb-6">
              Mahasiswa: <span className="font-bold">{rekapData[selectedCell.studentIndex]?.nama}</span>
              <br />
              Pertemuan: <span className="font-bold">P{selectedCell.pertemuanIndex + 1}</span>
            </p>
            <div className="space-y-3 mb-6">
              {statusOptions.map((option) => (
                <button
                  key={option.symbol}
                  onClick={() => handleStatusChange(option.symbol)}
                  className={`w-full p-4 rounded-lg border-2 transition text-left font-semibold ${
                    selectedStatus === option.symbol
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-3 font-bold">{option.symbol}</span>
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}