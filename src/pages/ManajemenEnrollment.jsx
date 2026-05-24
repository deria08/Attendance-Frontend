import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { apiFetch } from '../utils/api';

export default function ManajemenEnrollment({ onNavigate }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allMahasiswa, setAllMahasiswa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState('');
  

  // Ambil daftar mata kuliah
  useEffect(() => {
    fetchCourses();
    fetchAllMahasiswa();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchEnrolledStudents();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('http://localhost:5000/api/courses');
      const data = await res.json();
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllMahasiswa = async () => {
    try {
      const res = await apiFetch('http://localhost:5000/api/users');
      const users = await res.json();
      const mahasiswa = users.filter(u => u.role === 'mahasiswa');
      setAllMahasiswa(mahasiswa);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrolledStudents = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await apiFetch(`http://localhost:5000/api/enrollments/course/${selectedCourse}`);
      const data = await res.json();
      setEnrolledStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStudents = () => {
    const enrolledIds = enrolledStudents.map(e => e.mahasiswa?._id);
    const currentCourse = courses.find(c => c._id === selectedCourse);
    if (!currentCourse) return [];
    // Filter mahasiswa yang belum terdaftar dan memiliki prodi & semester sama dengan course
    return allMahasiswa.filter(m => 
        !enrolledIds.includes(m._id) &&
        m.prodi === currentCourse.prodi &&
        m.semester === currentCourse.semester
    );
    };

  const handleAddEnrollment = async () => {
    if (!selectedMahasiswa) return;
    try {
        const res = await apiFetch('http://localhost:5000/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mahasiswaId: selectedMahasiswa,
            courseId: selectedCourse
        })
        });
        const data = await res.json();
        if (!res.ok) {
        throw new Error(data.message || 'Gagal menambahkan');
        }
        setMessage({ text: 'Mahasiswa berhasil ditambahkan', type: 'success' });
        setShowAddModal(false);
        setSelectedMahasiswa('');
        fetchEnrolledStudents();
    } catch (err) {
        setMessage({ text: err.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      const res = await apiFetch(`http://localhost:5000/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setMessage({ text: 'Mahasiswa dihapus dari mata kuliah', type: 'success' });
      fetchEnrolledStudents();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const currentCourse = courses.find(c => c._id === selectedCourse);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Enrollment</h1>
          <p className="text-gray-600 mt-1">Daftarkan mahasiswa ke mata kuliah</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Pilih Mata Kuliah */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Kuliah</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.nama_mk} ({course.kode_mk})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mahasiswa Terdaftar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Mahasiswa Terdaftar</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  + Tambah Mahasiswa
                </button>
              </div>
              {loading ? (
                <p className="text-gray-500">Memuat...</p>
              ) : enrolledStudents.length === 0 ? (
                <p className="text-gray-500">Belum ada mahasiswa terdaftar.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {enrolledStudents.map(enrollment => (
                    <li key={enrollment._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{enrollment.mahasiswa?.name}</p>
                        <p className="text-sm text-gray-500">NIM: {enrollment.mahasiswa?.nim_nidn}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Preview Mata Kuliah */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detail Mata Kuliah</h2>
              {currentCourse && (
                <div className="space-y-2">
                  <p><span className="font-semibold">Kode:</span> {currentCourse.kode_mk}</p>
                  <p><span className="font-semibold">Nama:</span> {currentCourse.nama_mk}</p>
                  <p><span className="font-semibold">Prodi:</span> {currentCourse.prodi}</p>
                  <p><span className="font-semibold">Semester:</span> {currentCourse.semester}</p>
                  <p><span className="font-semibold">Dosen:</span> {currentCourse.dosen_pengampu?.name}</p>
                  <p><span className="font-semibold">Jadwal:</span> {currentCourse.hari}, {currentCourse.jam_mulai} - {currentCourse.jam_selesai}</p>
                  <p><span className="font-semibold">Ruangan:</span> {currentCourse.ruangan}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Tambah Mahasiswa */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Tambah Mahasiswa ke Mata Kuliah">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mahasiswa</label>
              <select
                value={selectedMahasiswa}
                onChange={(e) => setSelectedMahasiswa(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {getAvailableStudents().map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.nim_nidn})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleAddEnrollment} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Tambah</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-400 text-white py-2 rounded-lg">Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}