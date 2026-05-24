import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { apiFetch } from '../utils/api';

export default function ManualAttendancePage({ onNavigate, userName }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/courses/mahasiswa?name=${encodeURIComponent(userName)}`);
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].kode_mk);
      } catch (err) {
        console.error('Gagal mengambil mata kuliah', err);
      }
    };
    fetchCourses();
  }, [userName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setMessage({ text: 'Pilih mata kuliah terlebih dahulu', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await apiFetch('http://127.0.0.1:8000/api/attendance-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, course_kode: selectedCourse })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage({ text: data.message, type: 'success' });
        setShowModal(true);
      } else {
        setMessage({ text: data.error || data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Gagal melakukan absensi manual', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onNavigate('mahasiswa-dashboard');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Absensi Manual</h1>
          <p className="text-gray-600 mt-1">Lakukan absensi tanpa scan wajah (hanya jika diizinkan dosen)</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Kuliah</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {courses.map(course => (
                  <option key={course.kode_mk} value={course.kode_mk}>
                    {course.nama_mk} ({course.kode_mk})
                  </option>
                ))}
              </select>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Konfirmasi Absen Manual'}
            </button>
          </form>
        </div>
      </main>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
            <p className="text-gray-600 mb-6">Absensi manual telah tercatat.</p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}