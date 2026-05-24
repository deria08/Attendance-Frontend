import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { apiFetch } from '../utils/api'

export default function KelolaMataKuliah({ onNavigate, dosenList }) {
  const [courses, setCourses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    kode_mk: '',
    nama_mk: '',
    prodi: '',
    semester: '',
    dosen_pengampu: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    ruangan: '',
    late_tolerance_minutes: 15
  })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = 'http://localhost:5000/api/courses'

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await apiFetch(API_URL)
      if (!res.ok) throw new Error('Gagal mengambil data')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data mata kuliah')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleOpenModal = () => {
    setIsEditMode(false)
    setFormData({
      kode_mk: '',
      nama_mk: '',
      prodi: '',
      semester: '',
      dosen_pengampu: '',
      hari: '',
      jam_mulai: '',
      jam_selesai: '',
      ruangan: '',
      late_tolerance_minutes: 15,
      sks: 2
    })
    setIsModalOpen(true)
  }

  const handleEditClick = (course) => {
    setIsEditMode(true)
    setEditingId(course._id)
    setFormData({
      kode_mk: course.kode_mk,
      nama_mk: course.nama_mk,
      prodi: course.prodi,
      semester: course.semester,
      dosen_pengampu: course.dosen_pengampu?._id || course.dosen_pengampu,
      hari: course.hari,
      jam_mulai: course.jam_mulai,
      jam_selesai: course.jam_selesai,
      ruangan: course.ruangan,
      late_tolerance_minutes: course.late_tolerance_minutes || 15,
      sks: course.sks || 2
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validasi sederhana
    if (!formData.kode_mk || !formData.nama_mk || !formData.prodi || !formData.semester || !formData.dosen_pengampu || !formData.hari || !formData.jam_mulai || !formData.jam_selesai || !formData.ruangan) {
      setError('Semua field wajib diisi')
      setLoading(false)
      return
    }

    try {
      let url = API_URL
      let method = 'POST'
      if (isEditMode) {
        url = `${API_URL}/${editingId}`
        method = 'PUT'
      }

      const payload = {
        ...formData,
        semester: parseInt(formData.semester),
        late_tolerance_minutes: parseInt(formData.late_tolerance_minutes)
      }

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Gagal menyimpan')
      }
      await fetchCourses()
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async (id) => {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      await fetchCourses()
      setConfirmDelete(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  const getDosenName = (dosenId) => {
    if (!dosenId) return 'Tidak ada dosen'
    // dosenId bisa berupa object yang sudah di-populate atau string
    const dosen = dosenList?.find(d => d.id === dosenId || d._id === dosenId)
    return dosen ? dosen.nama : (typeof dosenId === 'object' ? dosenId.name : 'Dosen tidak ditemukan')
  }

  // Daftar hari
  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const prodiOptions = ['Informatika', 'Elektro', 'Manajemen']

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
          <h1 className="text-3xl font-bold text-gray-900">Kelola Mata Kuliah</h1>
          <p className="text-gray-600 mt-1">Manage semua mata kuliah dalam sistem</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleOpenModal}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Mata Kuliah
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kode MK</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nama MK</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">SKS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Prodi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Semester</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Dosen</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Jadwal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ruangan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Toleransi (menit)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      Belum ada data mata kuliah.
                    </td>
                  </tr>
                ) : (
                  courses.map((course, idx) => (
                    <tr key={course._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.kode_mk}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.nama_mk}</td>
                      <td className="px-6 py-4 text-sm">{course.sks}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.prodi}</td>                      
                      <td className="px-6 py-4 text-sm text-gray-600">Semester {course.semester}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getDosenName(course.dosen_pengampu)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.hari} {course.jam_mulai} - {course.jam_selesai}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.ruangan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.late_tolerance_minutes || 15} menit</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <button
                          onClick={() => handleEditClick(course)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold mr-4"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(course._id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          🗑️ Hapus
                        </button>
                       </td>
                     </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah/Edit */}
        {isModalOpen && (
          <Modal
            isOpen={true} 
            title={isEditMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
            onClose={() => setIsModalOpen(false)}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={formData.kode_mk}
                  onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: TI-301"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={formData.nama_mk}
                  onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: Pemrograman Web"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah SKS</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Contoh: 2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program Studi</label>
                <select
                  required
                  value={formData.prodi}
                  onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Prodi</option>
                  {prodiOptions.map(prodi => <option key={prodi} value={prodi}>{prodi}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: 3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dosen Pengampu</label>
                <select
                  required
                  value={formData.dosen_pengampu}
                  onChange={(e) => setFormData({ ...formData, dosen_pengampu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Pilih Dosen --</option>
                  {dosenList.map((dosen) => (
                    <option key={dosen.id} value={dosen.id}>
                      {dosen.nama} ({dosen.nidn})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hari</label>
                <select
                  required
                  value={formData.hari}
                  onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Hari</option>
                  {hariOptions.map(hari => <option key={hari} value={hari}>{hari}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_selesai}
                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ruangan</label>
                <input
                  type="text"
                  required
                  value={formData.ruangan}
                  onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: Lab. Komputer A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Toleransi Keterlambatan (menit)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.late_tolerance_minutes}
                  onChange={(e) => setFormData({ ...formData, late_tolerance_minutes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Default: 15"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Konfirmasi Hapus */}
        {confirmDelete && (
          <Modal 
          isOpen={true} 
          title="Konfirmasi Hapus" onClose={() => setConfirmDelete(null)}>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus mata kuliah ini? Data absensi yang terkait mungkin terpengaruh.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteConfirm(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Hapus
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}