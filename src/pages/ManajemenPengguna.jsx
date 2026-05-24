'use client';

import React, { useState, useMemo, useEffect } from 'react'
import Modal from '../components/Modal'

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
  faceStatus,      // ← terima prop
  onResetFace      // ← terima prop
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const itemsPerPage = 10

  const allUsers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const mahasiswaUsers = (mahasiswaList || []).map(m => ({
      id: `mhs_${m.id}`,
      originalId: m.id,
      nama: m.nama || 'Tanpa Nama',
      username: m.nim || '-',
      email: m.email || '-',
      role: 'Mahasiswa',
      tanggalDibuat: today,
      status: m.status || 'Tidak Aktif',
      face_registered: faceStatus?.[m.nim] || false,
      prodi: m.prodi || '',         // ← tambah
      semester: m.semester || ''    // ← tambah
    }));
    const dosenUsers = (dosenList || []).map(d => ({
      id: `dsn_${d.id}`,
      originalId: d.id,
      nama: d.nama || 'Tanpa Nama',
      username: d.nidn || '-',
      email: d.email || '-',
      role: 'Dosen',
      tanggalDibuat: today,
      status: d.status || 'Tidak Aktif',
    }));
    return [...mahasiswaUsers, ...dosenUsers];
  }, [mahasiswaList, dosenList, faceStatus]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        (user.nama?.toLowerCase().includes(searchLower) ?? false) ||
        (user.username?.toLowerCase().includes(searchLower) ?? false) ||
        (user.email?.toLowerCase().includes(searchLower) ?? false)
      const matchesRole = filterRole === 'semua' || user.role?.toLowerCase() === filterRole.toLowerCase()
      return matchesSearch && matchesRole
    })
  }, [allUsers, searchQuery, filterRole])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAddUser = (formData) => {
    if (formData.role === 'Mahasiswa') {
      onAddMahasiswa({
        nama: formData.nama,
        nim: formData.username,
        email: formData.email,
        status: 'Aktif',
        prodi: formData.prodi,      // tambahkan
        semester: formData.semester // tambahkan
      })
    } else {
      onAddDosen({
        nama: formData.nama,
        nidn: formData.username,
        email: formData.email,
        status: 'Aktif',
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
        prodi: formData.prodi,      // tambahkan
        semester: formData.semester // tambahkan
      })
    } else {
      onEditDosen(editingUser.originalId, {
        nama: formData.nama,
        nidn: formData.username,
        email: formData.email,
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
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola data akun mahasiswa dan dosen dalam sistem</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {feedbackMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {feedbackMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pengguna</label>
              <input
                type="text"
                placeholder="Nama atau username..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Role</label>
              <select
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semua">Semua</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
              </select>
            </div>
            <button
              onClick={() => { setEditingUser(null); setIsAddModalOpen(true); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah User
            </button>
          </div>
        </div>

        {paginatedUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">NIM / NIDN</th>
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
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
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
                        {/* status badge - sama seperti sebelumnya */}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {/* registrasi wajah - sama seperti sebelumnya */}
                        {user.role === 'Mahasiswa' ? (
                          user.face_registered ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Sudah</span>
                              <button onClick={() => onResetFace?.(user.username, user.nama)} className="text-red-600 hover:text-red-800 text-sm underline">Reset</button>
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
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Tambah User
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Menampilkan {paginatedUsers.length} dari {filteredUsers.length} pengguna
        </p>
      </main>

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

function UserFormModal({ isOpen, isEdit, user, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    role: 'Mahasiswa',
    prodi: '',      // tambah
    semester: ''    // tambah
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
      semester: user.semester || ''
    });
    } else {
      setFormData({ 
        nama: '', 
        username: '', 
        email: '', 
        role: 'Mahasiswa', 
        prodi: '', 
        semester: '' 
      });
    }
    setErrors({});
  }, [isEdit, user]);

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
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
          <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIDN *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="NIM untuk mahasiswa / NIDN untuk dosen"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        {/* Prodi - hanya untuk mahasiswa */}
          {formData.role === 'Mahasiswa'&& (
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
                <option value="Manajemen">Manajemen</option>
              </select>
            </div>
          )}

          {/* Semester - hanya untuk mahasiswa */}
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