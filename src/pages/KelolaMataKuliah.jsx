import React, { useState, useEffect, useMemo } from 'react'
import Modal from '../components/Modal'
import { apiFetch } from '../utils/api'
import { EXPRESS_API_URL } from '../config' // gunakan config
import Footer from '../components/Footer'
import logoSTTP from '../assets/logostt.png'

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
    late_tolerance_minutes: 15,
    sks: 2,
    tahun_ajaran: '',    // ⭐ tambahan
    jenis_semester: ''   // ⭐ tambahan
  })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ⭐ State untuk filter
  const [filterTahun, setFilterTahun] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDosen, setFilterDosen] = useState('')

  const API_URL = `${EXPRESS_API_URL}/courses`

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

  // ⭐ Dapatkan daftar tahun ajaran unik dari data courses
  const tahunOptions = useMemo(() => {
    const tahunSet = new Set()
    courses.forEach(c => {
      if (c.tahun_ajaran) tahunSet.add(c.tahun_ajaran)
    })
    return ['', ...Array.from(tahunSet).sort()]
  }, [courses])

  // ⭐ Filter courses berdasarkan filter dan pencarian
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filter tahun ajaran
      if (filterTahun && course.tahun_ajaran !== filterTahun) return false
      // Filter semester (jenis_semester)
      if (filterSemester && course.jenis_semester !== filterSemester) return false
      // Filter dosen
      if (filterDosen) {
      const dosenId = course.dosen_pengampu?._id || course.dosen_pengampu
      if (dosenId !== filterDosen) return false
    }
      // Pencarian (kode_mk atau nama_mk)
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchKode = course.kode_mk?.toLowerCase().includes(q)
        const matchNama = course.nama_mk?.toLowerCase().includes(q)
        if (!matchKode && !matchNama) return false
      }
      return true
    })
  }, [courses, filterTahun, filterSemester, filterDosen, searchQuery])

  // ====== Handle Modal ======
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
      sks: 2,
      tahun_ajaran: '',
      jenis_semester: ''
    })
    setIsModalOpen(true)
  }

  const handleEditClick = (course) => {
    setIsEditMode(true)
    setEditingId(course._id)
    setFormData({
      kode_mk: course.kode_mk || '',
      nama_mk: course.nama_mk || '',
      prodi: course.prodi || '',
      semester: course.semester || '',
      dosen_pengampu: course.dosen_pengampu?._id || course.dosen_pengampu || '',
      hari: course.hari || '',
      jam_mulai: course.jam_mulai || '',
      jam_selesai: course.jam_selesai || '',
      ruangan: course.ruangan || '',
      late_tolerance_minutes: course.late_tolerance_minutes || 15,
      sks: course.sks || 2,
      tahun_ajaran: course.tahun_ajaran || '',
      jenis_semester: course.jenis_semester || ''
    })
    setIsModalOpen(true)
  }

  // ====== Submit ======
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validasi
    if (!formData.kode_mk || !formData.nama_mk || !formData.prodi || !formData.semester || 
        !formData.dosen_pengampu || !formData.hari || !formData.jam_mulai || 
        !formData.jam_selesai || !formData.ruangan || !formData.tahun_ajaran || !formData.jenis_semester) {
      setError('Semua field wajib diisi (termasuk Tahun Ajaran dan Semester)')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        semester: parseInt(formData.semester),
        late_tolerance_minutes: parseInt(formData.late_tolerance_minutes),
        sks: parseInt(formData.sks)
      }

      let url = API_URL
      let method = 'POST'
      if (isEditMode) {
        url = `${API_URL}/${editingId}`
        method = 'PUT'
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

  // ====== Delete ======
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
    const dosen = dosenList?.find(d => d.id === dosenId || d._id === dosenId)
    return dosen ? dosen.nama : (typeof dosenId === 'object' ? dosenId.name : 'Dosen tidak ditemukan')
  }

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const prodiOptions = ['Informatika', 'Elektro']
  const semesterOptions = ['ganjil', 'genap']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Grid 3 kolom agar judul benar-benar di tengah */}
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
      
            {/* Tengah: Judul Halaman + Deskripsi */}
            <div className="text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Kelola Akun
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Kelola Akun untuk Dosen, dan Mahasiswa
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

      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* ⭐ FILTER & SEARCH */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Tahun Ajaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              {tahunOptions.filter(t => t !== '').map(tahun => (
                <option key={tahun} value={tahun}>{tahun}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>

          {/* ⭐ Dosen Pengampu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosen</label>
            <select
              value={filterDosen}
              onChange={(e) => setFilterDosen(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Dosen</option>
              {dosenList.map(dosen => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.nama} ({dosen.nidn})
                </option>
              ))}
            </select>
          </div>

          {/* Cari */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
            <input
              type="text"
              placeholder="Kode atau nama MK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reset Filter */}
          <div>
            <button
              onClick={() => {
                setFilterTahun('')
                setFilterSemester('')
                setFilterDosen('')   // ⭐ reset filter dosen
                setSearchQuery('')
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
            >
              Reset Filter
            </button>
          </div>
        </div>
        </div>

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
                  <th className="px-6 py-4 text-left text-sm font-semibold">Semester (Tingkat)</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-semibold">Tahun Ajaran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Periode</th> */}
                  <th className="px-6 py-4 text-left text-sm font-semibold">Dosen</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Jadwal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ruangan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Toleransi</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data mata kuliah yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, idx) => (
                    <tr key={course._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.kode_mk}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.nama_mk}</td>
                      <td className="px-6 py-4 text-sm">{course.sks}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.prodi}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Semester {course.semester}</td>
                      {/* <td className="px-6 py-4 text-sm text-gray-600">{course.tahun_ajaran || '-'}</td> */}
                      {/* <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          course.jenis_semester === 'ganjil' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {course.jenis_semester || '-'}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 text-sm text-gray-600">{getDosenName(course.dosen_pengampu)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.hari} {course.jam_mulai} - {course.jam_selesai}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.ruangan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.late_tolerance_minutes || 15} mnt</td>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Mata Kuliah</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Mata Kuliah</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_mk}
                    onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Contoh: Pemrograman Web"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SKS</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.sks}
                    onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Program Studi</label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Semester (Tingkat)</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Pengampu</label>
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
              </div>

              {/* ⭐ FIELD TAHUN AJARAN & SEMESTER (PERIODE) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={formData.tahun_ajaran}
                    onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Contoh: 2024/2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Periode Semester</label>
                  <select
                    required
                    value={formData.jenis_semester}
                    onChange={(e) => setFormData({ ...formData, jenis_semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Pilih Periode</option>
                    <option value="ganjil">Ganjil</option>
                    <option value="genap">Genap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hari</label>
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    required
                    value={formData.ruangan}
                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Contoh: Lab. Komputer A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Selesai</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Toleransi Keterlambatan (menit)</label>
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
          <Modal isOpen={true} title="Konfirmasi Hapus" onClose={() => setConfirmDelete(null)}>
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
      <Footer role="admin" onNavigate={onNavigate}/>  
    </div>
  )
}