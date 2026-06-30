'use client';

import React, { useState, useMemo, useEffect } from 'react'
import Modal from '../components/Modal'
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.png';

export default function ManajemenPengguna({ 
  mahasiswaList, 
  dosenList, 
  onNavigate, 
  onAddMahasiswa, 
  onEditMahasiswa, 
  onDeleteMahasiswa, 
  onAddDosen, 
  onEditDosen, 
  onDeleteDosen,
  faceStatus,
  onResetFace
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('semua')
  const [filterProdi, setFilterProdi] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [sortBy, setSortBy] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const itemsPerPage = 10

  // Data user
  const allUsers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const mahasiswaUsers = (mahasiswaList || []).map(m => ({
      id: `mhs_${m.id}`,
      originalId: m.id,
      nama: m.nama || 'Tanpa Nama',
      username: m.nim || '-',
      email: m.email === '-' ? '' : (m.email || ''),
      role: 'Mahasiswa',
      tanggalDibuat: today,
      status: m.status || 'Tidak Aktif',
      face_registered: faceStatus?.[m.nim] || false,
      prodi: m.prodi || '',
      semester: String(m.semester || '')  // ⭐ pastikan string
    }));
    const dosenUsers = (dosenList || []).map(d => ({
      id: `dsn_${d.id}`,
      originalId: d.id,
      nama: d.nama || 'Tanpa Nama',
      username: d.nidn || '-',
      email: d.email === '-' ? '' : (d.email || ''),
      role: 'Dosen',
      tanggalDibuat: today,
      status: d.status || 'Tidak Aktif',
      gelar: d.gelar || '',
      prodi: '-',
      semester: '-'
    }));
    return [...mahasiswaUsers, ...dosenUsers];
  }, [mahasiswaList, dosenList, faceStatus]);

  // Ambil daftar prodi dan semester unik (hanya dari mahasiswa)
  const prodiOptions = useMemo(() => {
    const prodis = allUsers
      .filter(u => u.role === 'Mahasiswa' && u.prodi)
      .map(u => u.prodi);
    return ['', ...new Set(prodis)];
  }, [allUsers]);

  const semesterOptions = useMemo(() => {
    const semesters = allUsers
      .filter(u => u.role === 'Mahasiswa' && u.semester)
      .map(u => u.semester);
    // urutkan ascending
    return ['', ...new Set(semesters)].sort((a, b) => {
      if (a === '') return -1;
      if (b === '') return 1;
      return Number(a) - Number(b);
    });
  }, [allUsers]);

  // Filter & Sort
  const filteredAndSortedUsers = useMemo(() => {
    let result = allUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        (user.nama?.toLowerCase().includes(searchLower) ?? false) ||
        (user.username?.toLowerCase().includes(searchLower) ?? false) ||
        (user.email?.toLowerCase().includes(searchLower) ?? false)

      const matchesRole = filterRole === 'semua' || user.role?.toLowerCase() === filterRole.toLowerCase()

      // ⭐ Filter Prodi dan Semester (perbaikan perbandingan)
      let matchesProdiSemester = true
      if (filterProdi || filterSemester) {
        if (user.role !== 'Mahasiswa') {
          matchesProdiSemester = false
        } else {
          if (filterProdi && user.prodi !== filterProdi) matchesProdiSemester = false
          if (filterSemester && String(user.semester) !== filterSemester) matchesProdiSemester = false
        }
      }

      return matchesSearch && matchesRole && matchesProdiSemester
    })

    // Sorting
    const fieldMap = {
      nama: 'nama',
      username: 'username',
      role: 'role',
      prodi: 'prodi',
      semester: 'semester',
      status: 'status',
      tanggalDibuat: 'tanggalDibuat'
    };
    const field = fieldMap[sortBy] || 'nama';
    result.sort((a, b) => {
      let valA = a[field] || '';
      let valB = b[field] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allUsers, searchQuery, filterRole, filterProdi, filterSemester, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterProdi, filterSemester, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterRole('semua');
    setFilterProdi('');
    setFilterSemester('');
    setSortBy('nama');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const handleAddUser = (formData) => {
    if (formData.role === 'Mahasiswa') {
      onAddMahasiswa({
        nama: formData.nama,
        nim: formData.username,
        email: formData.email,
        status: 'Aktif',
        prodi: formData.prodi,
        semester: formData.semester
      })
    } else {
      onAddDosen({
        nama: formData.nama,
        nidn: formData.username,
        email: formData.email,
        status: 'Aktif',
        gelar: formData.gelar
      })
    }
    setFeedbackMessage('User berhasil ditambahkan')
    setIsAddModalOpen(false)
    setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const handleEditUser = (formData) => {
    if (editingUser.role === 'Mahasiswa') {
      onEditMahasiswa(editingUser.originalId, {
        nama: formData.nama,
        nim: formData.username,
        email: formData.email,
        prodi: formData.prodi,
        semester: formData.semester
      })
    } else {
      onEditDosen(editingUser.originalId, {
        nama: formData.nama,
        nidn: formData.username,
        email: formData.email,
        gelar: formData.gelar
      })
    }
    setFeedbackMessage('User berhasil diupdate')
    setIsEditModalOpen(false)
    setEditingUser(null)
    setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const handleDeleteUser = (user) => {
    if (user.role === 'Mahasiswa') {
      onDeleteMahasiswa(user.originalId)
    } else {
      onDeleteDosen(user.originalId)
    }
    setFeedbackMessage('User berhasil dihapus')
    setConfirmDelete(null)
    setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
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

            <div className="text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Kelola Akun
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Kelola Akun untuk Dosen dan Mahasiswa
              </p>
            </div>

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
        {feedbackMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {feedbackMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pengguna</label>
              <input
                type="text"
                placeholder="Nama atau username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semua">Semua</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prodi</label>
              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={filterRole === 'dosen'}
              >
                {prodiOptions.map(prodi => (
                  <option key={prodi || 'all'} value={prodi}>{prodi || 'Semua Prodi'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={filterRole === 'dosen'}
              >
                {semesterOptions.map(sem => (
                  <option key={sem || 'all'} value={sem}>{sem || 'Semua Semester'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nama">Nama</option>
                  {/* <option value="username">NIM/NIDN</option> */}
                  {/* <option value="role">Role</option> */}
                  <option value="prodi">Prodi</option>
                  <option value="semester">Semester</option>
                  {/* <option value="status">Status</option> */}
                  {/* <option value="tanggalDibuat">Tanggal Dibuat</option> */}
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition"
            >
              Reset Filter
            </button>
          </div>
        </div>

        <button
          onClick={() => { setEditingUser(null); setIsAddModalOpen(true); }}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah User
        </button>

        {paginatedUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {filterRole === 'mahasiswa' ? 'NIM' : filterRole === 'dosen' ? 'NIDN/NUPTK' : 'NIM / NIDN'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prodi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Semester</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Registrasi Wajah</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tanggal Dibuat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'Mahasiswa' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.role === 'Mahasiswa' ? (user.prodi || '-') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.role === 'Mahasiswa' ? (user.semester || '-') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.role === 'Mahasiswa' ? (
                          user.face_registered ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Sudah</span>
                              <button onClick={() => onResetFace?.(user.originalId, user.nama)} className="text-red-600 hover:text-red-800 text-sm underline">Reset</button>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Belum</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.tanggalDibuat}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition ${
                      currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-20 0v2h2v-2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">Belum ada data pengguna</p>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Menampilkan {paginatedUsers.length} dari {filteredAndSortedUsers.length} pengguna
        </p>
      </main>

      <Footer role="admin" onNavigate={onNavigate} />

      {(isAddModalOpen || isEditModalOpen) && (
        <UserFormModal
          isOpen={isAddModalOpen || isEditModalOpen}
          isEdit={isEditModalOpen}
          user={editingUser}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setEditingUser(null); }}
          onSubmit={isEditModalOpen ? handleEditUser : handleAddUser}
        />
      )}

      {confirmDelete && (
        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus">
          <div className="space-y-6">
            <p className="text-gray-700">Apakah Anda yakin ingin menghapus user <strong>{confirmDelete.nama}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">Batal</button>
              <button onClick={() => handleDeleteUser(confirmDelete)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium">Ya, Hapus</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ===================== UserFormModal =====================
function UserFormModal({ isOpen, isEdit, user, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    role: 'Mahasiswa',
    prodi: '',
    semester: '',
    gelar: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        nama: user.nama || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'Mahasiswa',
        prodi: user.prodi || '',
        semester: user.semester || '',
        gelar: user.gelar || ''
      });
    } else {
      setFormData({
        nama: '',
        username: '',
        email: '',
        role: 'Mahasiswa',
        prodi: '',
        semester: '',
        gelar: ''
      });
    }
    setErrors({});
  }, [isEdit, user]);

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({ 
        nama: '', 
        username: '', 
        email: '', 
        role: 'Mahasiswa',
        prodi: '',
        semester: '' 
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit User' : 'Tambah User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Nama lengkap"
          />
          {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.role === 'Mahasiswa' ? 'NIM *' : 'NIDN/NUPTK *'}
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={formData.role === 'Mahasiswa' ? 'Masukkan NIM' : 'Masukkan NIDN/NUPTK'}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (opsional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {formData.role === 'Dosen' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gelar Akademik</label>
            <input
              type="text"
              value={formData.gelar || ''}
              onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: S.Kom., M.Kom."
            />
          </div>
        )}

        {formData.role === 'Mahasiswa' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
            <select
              value={formData.prodi}
              onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Prodi</option>
              <option value="Informatika">Informatika</option>
              <option value="Elektro">Elektro</option>
            </select>
          </div>
        )}

        {formData.role === 'Mahasiswa' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1 - 8"
            />
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-6 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{isEdit ? 'Update' : 'Tambah'} User</button>
        </div>
      </form>
    </Modal>
  )
}