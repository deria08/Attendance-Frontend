import React from 'react';
import Footer from '../components/Footer';
import logoSTTP from '../assets/logostt.webp';

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          {/* Flex dengan shrink 0 pada kiri dan kanan agar tidak terpotong */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Kiri: Brand (logo + SIPATI + badge) - flex-shrink-0 agar tidak terpotong */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <img
                src={logoSTTP}
                alt="Logo STT Pati"
                loading="lazy"
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
              />
              <div className="flex items-center gap-1 sm:gap-2">
                <h1 className="text-base sm:text-2xl md:text-[36px] font-bold text-blue-700 tracking-tight whitespace-nowrap">
                  SIPATI
                </h1>
                <span className="bg-blue-100 text-blue-700 text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  {role === 'admin' ? 'Admin' : role === 'dosen' ? 'Dosen' : role === 'mahasiswa' ? 'Mahasiswa' : 'SIPATI'}
                </span>
              </div>
            </div>

            {/* Tengah: Judul Halaman + Deskripsi - flex-1 agar mengambil ruang, min-w-0 agar bisa truncate */}
            <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
              <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                Pusat Bantuan
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate hidden sm:block">
                Panduan penggunaan sistem untuk {role === 'admin' ? 'Admin' : role === 'dosen' ? 'Dosen' : role === 'mahasiswa' ? 'Mahasiswa' : 'Pengguna'}
              </p>
            </div>

            {/* Kanan: Tombol Kembali - flex-shrink-0 agar tidak terpotong */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => onNavigate(`${role}-dashboard`)}
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