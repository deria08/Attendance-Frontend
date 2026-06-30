import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
import { apiFetch } from '../utils/api';
import { EXPRESS_API_URL } from '../config';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.png';

export default function ManajemenEnrollment({ onNavigate, userData }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allMahasiswa, setAllMahasiswa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState('');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStudents, setShowAllStudents] = useState(false);

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
      const res = await apiFetch(`${EXPRESS_API_URL}/courses`);
      const data = await res.json();
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllMahasiswa = async () => {
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/users`);
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
      const res = await apiFetch(`${EXPRESS_API_URL}/enrollments/course/${selectedCourse}`);
      const data = await res.json();
      setEnrolledStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan daftar mahasiswa yang tersedia untuk didaftarkan
  const getAvailableStudents = () => {
    const enrolledIds = enrolledStudents.map(e => e.mahasiswa?._id);
    const currentCourse = courses.find(c => c._id === selectedCourse);
    if (!currentCourse) return [];

    let available = allMahasiswa.filter(m => !enrolledIds.includes(m._id));

    if (!showAllStudents) {
      available = available.filter(m =>
        m.prodi === currentCourse.prodi &&
        m.semester === currentCourse.semester
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      available = available.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.nim_nidn?.toLowerCase().includes(q)
      );
    }

    return available;
  };

  const getEditAvailableStudents = () => {
    const currentEnrolledIds = enrolledStudents
      .filter(e => e._id !== editingEnrollment?._id)
      .map(e => e.mahasiswa?._id);
    const currentCourse = courses.find(c => c._id === selectedCourse);
    if (!currentCourse) return [];

    let available = allMahasiswa.filter(m => !currentEnrolledIds.includes(m._id));

    if (!showAllStudents) {
      available = available.filter(m =>
        m.prodi === currentCourse.prodi &&
        m.semester === currentCourse.semester
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      available = available.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.nim_nidn?.toLowerCase().includes(q)
      );
    }

    return available;
  };

  const handleAddEnrollment = async () => {
    if (!selectedMahasiswa) return;
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mahasiswaId: selectedMahasiswa,
          courseId: selectedCourse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan');
      setMessage({ text: 'Mahasiswa berhasil ditambahkan', type: 'success' });
      setShowAddModal(false);
      setSelectedMahasiswa('');
      setSearchQuery('');
      fetchEnrolledStudents();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleEditEnrollment = async () => {
    if (!editingEnrollment || !selectedMahasiswa) return;
    try {
      const deleteRes = await apiFetch(`${EXPRESS_API_URL}/enrollments/${editingEnrollment._id}`, {
        method: 'DELETE',
      });
      if (!deleteRes.ok) throw new Error('Gagal menghapus enrollment lama');

      const addRes = await apiFetch(`${EXPRESS_API_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mahasiswaId: selectedMahasiswa,
          courseId: selectedCourse,
        }),
      });
      if (!addRes.ok) {
        const errData = await addRes.json();
        throw new Error(errData.message || 'Gagal menambahkan mahasiswa baru');
      }
      setMessage({ text: 'Enrollment berhasil diubah', type: 'success' });
      setShowEditModal(false);
      setEditingEnrollment(null);
      setSelectedMahasiswa('');
      setSearchQuery('');
      fetchEnrolledStudents();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/enrollments/${enrollmentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setMessage({ text: 'Mahasiswa dihapus dari mata kuliah', type: 'success' });
      fetchEnrolledStudents();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const currentCourse = courses.find(c => c._id === selectedCourse);

  // ⭐ Helper untuk mendapatkan nama dosen dengan gelar (sama seperti di DosenDashboard)
  // const getDosenName = (dosen) => {
  //   if (!dosen) return '-';
  //   if (dosen.gelar) {
  //     return `${dosen.name}, ${dosen.gelar}`;
  //   }
  //   return dosen.name;
  // };
  // ===== Helper untuk format nama dosen dengan gelar (sama seperti DosenDashboard) =====
  const formatDosenName = (dosen) => {
  if (!dosen) return '-';
  const name = dosen.name || '';
  // Gunakan optional chaining dan nullish coalescing
  const gelar = dosen?.gelar || '';
  return gelar ? `${name}, ${gelar}` : name;
};

  const resetAddModal = () => {
    setShowAddModal(false);
    setSelectedMahasiswa('');
    setSearchQuery('');
    setShowAllStudents(false);
  };

  const resetEditModal = () => {
    setShowEditModal(false);
    setEditingEnrollment(null);
    setSelectedMahasiswa('');
    setSearchQuery('');
    setShowAllStudents(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
            {/* Kiri: Brand */}
            <div className="flex items-center gap-3">
              <img
                src={logoSTTP}
                alt="Logo STT Pati"
                className="w-14 h-14 md:w-16 md:h-16 object-contain flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-[36px] font-extrabold text-blue-700 tracking-tight">
                    SIPATI
                  </h1>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Sistem Informasi Presensi STT Pati
                </p>
              </div>
            </div>

            {/* Tengah: Judul Halaman */}
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Manajemen Enrollment
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Daftarkan mahasiswa ke mata kuliah
              </p>
            </div>

            {/* Kanan: Tombol Kembali */}
            <div className="flex justify-end">
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
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
            {courses.map((course) => (
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
                  {enrolledStudents.map((enrollment) => (
                    <li key={enrollment._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{enrollment.mahasiswa?.name}</p>
                        <p className="text-sm text-gray-500">
                          NIM: {enrollment.mahasiswa?.nim_nidn} | Prodi: {enrollment.mahasiswa?.prodi || '-'} | Semester: {enrollment.mahasiswa?.semester || '-'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEnrollment({
                              _id: enrollment._id,
                              mahasiswa: enrollment.mahasiswa,
                            });
                            setSelectedMahasiswa(enrollment.mahasiswa?._id || '');
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEnrollment(enrollment._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
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
                <p>
                  <span className="font-semibold">Dosen:</span>{' '}
                  {currentCourse.dosen_pengampu ? (
                    <>
                      {currentCourse.dosen_pengampu.name}
                      {/* {userData?.gelar ? `, ${userData.gelar}` : ''} */}
                      {currentCourse.dosen_pengampu.gelar ? `, ${currentCourse.dosen_pengampu.gelar}` : ''}
                    </>
                  ) : '-'}
                </p>
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
        <Modal isOpen={true} onClose={resetAddModal} title="Tambah Mahasiswa ke Mata Kuliah">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Mahasiswa</label>
              <input
                type="text"
                placeholder="Nama atau NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mahasiswa</label>
              <select
                value={selectedMahasiswa}
                onChange={(e) => setSelectedMahasiswa(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {getAvailableStudents().map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.nim_nidn}) - {m.prodi || '-'} Semester {m.semester || '-'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAllAdd"
                checked={showAllStudents}
                onChange={(e) => setShowAllStudents(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showAllAdd" className="text-sm text-gray-700">
                Tampilkan semua mahasiswa (termasuk berbeda prodi/semester)
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddEnrollment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                Tambah
              </button>
              <button
                onClick={resetAddModal}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Edit Mahasiswa */}
      {showEditModal && (
        <Modal isOpen={true} onClose={resetEditModal} title="Edit Mahasiswa yang Terdaftar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Mahasiswa</label>
              <input
                type="text"
                placeholder="Nama atau NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mahasiswa Pengganti</label>
              <select
                value={selectedMahasiswa}
                onChange={(e) => setSelectedMahasiswa(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {getEditAvailableStudents().map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.nim_nidn}) - {m.prodi || '-'} Semester {m.semester || '-'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAllEdit"
                checked={showAllStudents}
                onChange={(e) => setShowAllStudents(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showAllEdit" className="text-sm text-gray-700">
                Tampilkan semua mahasiswa (termasuk berbeda prodi/semester)
              </label>
            </div>
            <div className="text-sm text-gray-500 bg-yellow-50 p-2 rounded">
              Mahasiswa saat ini: <strong>{editingEnrollment?.mahasiswa?.name}</strong> ({editingEnrollment?.mahasiswa?.nim_nidn})
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditEnrollment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                Simpan Perubahan
              </button>
              <button
                onClick={resetEditModal}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Footer role="admin" onNavigate={onNavigate} />
    </div>
  );
}