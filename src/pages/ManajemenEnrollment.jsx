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

  // ===== STATE UNTUK IMPORT =====
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importId, setImportId] = useState(null);
  const [importStep, setImportStep] = useState('upload'); // upload | preview | confirm
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null); // ⬅️ TAMBAHKAN INI
   // ===== FUNGSI IMPORT =====
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(ext)) {
        alert('Hanya file Excel (.xlsx, .xls) yang diperbolehkan.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadPreview = async () => {
  if (!selectedFile) {
    alert('Pilih file terlebih dahulu.');
    return;
  }

  setImportLoading(true);
  setImportError(null);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('action', 'preview');

  try {
    // ⭐ Gunakan fetch langsung, JANGAN pakai apiFetch
    const res = await fetch(`${EXPRESS_API_URL}/enrollments/import`, {
      method: 'POST',
      body: formData, // browser akan set Content-Type otomatis
      headers: {
        // Jangan set Content-Type, biarkan browser yang set
        'Authorization': `Bearer ${sessionStorage.getItem('token')}` // jika perlu
      }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Gagal preview');
    }

    setPreviewData(data);
    setImportId(data.importId);
    setImportStep('preview');
  } catch (err) {
    setImportError(err.message);
    alert(err.message);
  } finally {
    setImportLoading(false);
  }
};

 const handleConfirmImport = async () => {
  if (!importId) {
    alert('Session import tidak ditemukan.');
    return;
  }

  setImportLoading(true);
  try {
    // ⭐ Gunakan fetch langsung
    const res = await fetch(`${EXPRESS_API_URL}/enrollments/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({
        action: 'confirm',
        importId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Gagal import');
    }

    setImportResult(data);
    setImportStep('confirm');

    // Refresh data
    fetchEnrolledStudents();

    setTimeout(() => {
      setShowImportModal(false);
      resetImportState();
    }, 3000);

  } catch (err) {
    setImportError(err.message);
    alert(err.message);
  } finally {
    setImportLoading(false);
  }
};

  const downloadTemplate = async () => {
    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/enrollments/template`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_enrollment.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal download template: ' + err.message);
    }
  };

  const downloadValidationResult = async () => {
    if (!previewData || previewData.errors.length === 0) {
      alert('Tidak ada error untuk diekspor.');
      return;
    }

    try {
      const res = await apiFetch(`${EXPRESS_API_URL}/enrollments/import/export-errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: previewData.errors })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hasil_validasi_import.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal download hasil validasi: ' + err.message);
    }
  };
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

  // ===== RENDER MODAL IMPORT =====
  const renderImportModal = () => {
    return (
      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); resetImportState(); }} title="Import Excel Enrollment" size="xl">
        <div className="space-y-4">
          {/* STEP 1: Upload */}
          {importStep === 'upload' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File Excel (.xlsx, .xls)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    File terpilih: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleUploadPreview}
                  disabled={!selectedFile || importLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {importLoading ? 'Memproses...' : 'Preview Data'}
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Download Template
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Preview */}
          {importStep === 'preview' && previewData && (
            <>
              <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Data</p>
                  <p className="text-2xl font-bold text-gray-800">{previewData.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Valid</p>
                  <p className="text-2xl font-bold text-green-600">{previewData.validCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-yellow-600">Duplikat</p>
                  <p className="text-2xl font-bold text-yellow-600">{previewData.duplicateCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600">Error</p>
                  <p className="text-2xl font-bold text-red-600">{previewData.errorCount}</p>
                </div>
              </div>

              {/* Tabel Preview */}
              <div className="overflow-auto max-h-80 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Baris</th>
                      <th className="px-3 py-2 text-left">Kode MK</th>
                      <th className="px-3 py-2 text-left">NIM</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.validData?.map((item, idx) => (
                      <tr key={`valid-${idx}`} className="bg-green-50">
                        <td className="px-3 py-1.5">{item.row}</td>
                        <td className="px-3 py-1.5">{item.kodeMk}</td>
                        <td className="px-3 py-1.5">{item.nim}</td>
                        <td className="px-3 py-1.5"><span className="text-green-600 font-semibold">✓ Valid</span></td>
                        <td className="px-3 py-1.5">{item.name}</td>
                      </tr>
                    ))}
                    {previewData.errors?.map((err, idx) => (
                      <tr key={`err-${idx}`} className={err.status === 'duplicate' ? 'bg-yellow-50' : 'bg-red-50'}>
                        <td className="px-3 py-1.5">{err.row}</td>
                        <td className="px-3 py-1.5">{err.kodeMk}</td>
                        <td className="px-3 py-1.5">{err.nim}</td>
                        <td className="px-3 py-1.5">
                          <span className={err.status === 'duplicate' ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {err.status === 'duplicate' ? '⚠ Duplikat' : '✗ Error'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">{err.errors || err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleConfirmImport}
                  disabled={importLoading || previewData.validCount === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {importLoading ? 'Menyimpan...' : `Import ${previewData.validCount} Data`}
                </button>
                {previewData.errors.length > 0 && (
                  <button
                    onClick={downloadValidationResult}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Download Error
                  </button>
                )}
                <button
                  onClick={() => { setImportStep('upload'); resetImportState(); }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Kembali
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Hasil */}
          {importStep === 'confirm' && importResult && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Import Berhasil!</h3>
              <p className="text-gray-600">{importResult.message}</p>
              <p className="text-sm text-gray-500 mt-4">
                {importResult.importedCount} data berhasil ditambahkan.
                {importResult.failedItems?.length > 0 && ` ${importResult.failedItems.length} data gagal.`}
              </p>
            </div>
          )}

          {importError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {importError}
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
        {/* Flex dengan shrink 0 pada kiri dan kanan agar tidak terpotong */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Kiri: Brand (logo + SIPATI + badge) - flex-shrink-0 agar tidak terpotong */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <img
              src={logoSTTP}
              alt="Logo STT Pati"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
            />
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className="text-base sm:text-2xl md:text-[36px] font-bold text-blue-700 tracking-tight whitespace-nowrap">
                SIPATI
              </h1>
              <span className="bg-blue-100 text-blue-700 text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                Admin
              </span>
            </div>
          </div>

          {/* Tengah: Judul Halaman + Deskripsi - flex-1 agar mengambil ruang, min-w-0 agar bisa truncate */}
          <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 truncate">
              Manajemen Enrollment
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate hidden sm:block">
              Daftarkan mahasiswa ke mata kuliah
            </p>
          </div>

          {/* Kanan: Tombol Kembali - flex-shrink-0 agar tidak terpotong */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate('admin-dashboard')}
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tombol Action di atas tabel */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Tambah Manual
          </button>
          <button
            onClick={downloadTemplate}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            📥 Download Template
          </button>
          <button
            onClick={() => { setImportStep('upload'); setShowImportModal(true); resetImportState(); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            📤 Import Excel
          </button>
        </div>

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
                {/* Tombol + Tambah Mahasiswa dihapus karena sudah ada di atas */}
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
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEnrollment(enrollment._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
      {/* Modal Import */}
      {renderImportModal()}
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