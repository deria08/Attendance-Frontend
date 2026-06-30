import React from 'react';
import Footer from '../components/Footer';

export default function BantuanPage({ onNavigate, role }) {
  // Konten berdasarkan role
  const getContent = () => {
    if (role === 'mahasiswa') {
      return {
        title: 'Pusat Bantuan Mahasiswa',
        sections: [
          {
            title: '📸 Registrasi Wajah',
            items: [
              'Masuk ke menu "Registrasi Wajah" di dashboard.',
              'Aktifkan kamera dan posisikan wajah di dalam lingkaran panduan.',
              'Pastikan pencahayaan cukup dan wajah terlihat jelas.',
              'Klik "Ambil Foto", lalu "Simpan Wajah" untuk menyimpan.',
            ],
          },
          {
            title: '✅ Absensi (Scan Wajah)',
            items: [
              'Pilih mata kuliah yang sedang berlangsung.',
              'Pastikan dosen sudah membuka sesi absensi (munjuk status "Sesi aktif").',
              'Klik "Mulai Scan" dan ikuti instruksi liveness (berkedip, gerak kepala).',
              'Tunggu proses verifikasi wajah dan lokasi, absensi otomatis tercatat.',
            ],
          },
          {
            title: '📊 Melihat Rekap Kehadiran',
            items: [
              'Klik menu "Rekap Absensi" di dashboard.',
              'Pilih mata kuliah untuk melihat persentase kehadiran per pertemuan.',
            ],
          },
          {
            title: '⚠️ Mengatasi Masalah Umum',
            items: [
              'Kamera tidak aktif: Berikan izin kamera di browser dan refresh halaman.',
              'Liveness gagal: Pastikan gerakan kepala/kedipan terlihat jelas, hindari latar belakang ramai.',
              'Lokasi tidak valid: Aktifkan GPS dan izinkan akses lokasi di browser.',
              'Wajah tidak cocok: Lakukan registrasi ulang wajah dengan pencahayaan lebih baik.',
            ],
          },
        ],
      };
    } else if (role === 'dosen') {
      return {
        title: 'Pusat Bantuan Dosen',
        sections: [
          {
            title: '📂 Membuka Sesi Absensi',
            items: [
              'Di dashboard, pilih mata kuliah yang ingin dibuka.',
              'Masukkan nomor pertemuan (1-16) pada kolom yang tersedia.',
              'Klik "Buka Absensi". Mahasiswa dapat melakukan scan wajah.',
            ],
          },
          {
            title: '🔒 Menutup Sesi Absensi',
            items: [
              'Klik tombol "Tutup Sesi" pada kartu mata kuliah yang sedang aktif.',
              'Sesi akan ditutup dan mahasiswa tidak bisa absen lagi untuk pertemuan tersebut.',
            ],
          },
          {
            title: '📈 Rekap Absensi Per Mata Kuliah',
            items: [
              'Klik "Lihat Rekap Absensi" pada kartu mata kuliah.',
              'Tampilkan daftar mahasiswa dengan status hadir, terlambat, atau tidak hadir per pertemuan.',
            ],
          },
          {
            title: '⚙️ Catatan untuk Dosen',
            items: [
              'Pastikan jadwal mata kuliah sudah benar sebelum membuka sesi.',
              'Toleransi keterlambatan dapat diatur oleh admin di menu Kelola Mata Kuliah.',
            ],
          },
        ],
      };
    } else {
      // Default untuk admin atau role lain
      return {
        title: 'Pusat Bantuan',
        sections: [
          {
            title: 'Informasi Sistem',
            items: [
              'Sistem Absensi Wajah STTP menggunakan teknologi pengenalan wajah, geolokasi, dan liveness detection.',
              'Untuk manajemen pengguna, mata kuliah, dan enrollment, gunakan menu yang tersedia di dashboard admin.',
              'Jika mengalami kendala teknis, hubungi helpdesk.',
            ],
          },
        ],
      };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate(`${role}-dashboard`)}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
          {content.sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 border-l-4 border-indigo-500 pl-3">
                {section.title}
              </h2>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <p className="text-sm text-blue-800">
              📞 Jika masih mengalami kendala, hubungi 
              {/* helpdesk: 
              <strong> helpdesk@sttp.ac.id</strong> atau  */}
              <strong> (0295)382470</strong> (Jam kerja 08.00 - 16.00)
            </p>
          </div>
        </div>
      </main>

      <Footer role={role} onNavigate={onNavigate} />
    </div>
  );
}