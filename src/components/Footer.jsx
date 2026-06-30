import React from 'react';

export default function Footer({ role, onNavigate }) {
  // Menu cepat berdasarkan role
  const getQuickLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: 'admin-dashboard' },
          { name: 'Kelola Akun', path: 'manajemen-pengguna' },
          { name: 'Kelola Mata Kuliah', path: 'kelola-matakuliah' },
          { name: 'Manajemen Enrollment', path: 'manajemen-enrollment' },
        ];
      case 'dosen':
        return [
          { name: 'Dashboard', path: 'dosen-dashboard' },
          { name: 'Rekap Absensi', path: 'rekap-absensi' },
          { name: 'Bantuan', path: 'bantuan' },
        ];
      case 'mahasiswa':
        return [
          { name: 'Dashboard', path: 'mahasiswa-dashboard' },
          { name: 'Absensi', path: 'face-recognition' },
          { name: 'Bantuan', path: 'bantuan' },
        ];
      default:
        return [
          { name: 'Beranda', path: 'landing' },
          { name: 'Login Admin', path: 'admin-login' },
          { name: 'Login Dosen', path: 'dosen-login' },
          { name: 'Login Mahasiswa', path: 'mahasiswa-login' },
        ];
    }
  };

  const quickLinks = getQuickLinks();

  const handleNavigate = (path) => {
    console.log('Footer navigate to:', path, 'role:', role);
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(path);
    } else {
      console.warn('Footer: onNavigate tidak tersedia');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border-t-2 border-blue-200/50 mt-16 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* 3 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom 1: Informasi Sistem */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 w-1.5 h-6 rounded-full inline-block"></span>
              Sistem Absensi Mahasiswa Berbasis Face Recognition
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed pl-2">
              Sistem absensi digital yang memanfaatkan teknologi pengenalan wajah, geolokasi, dan liveness detection untuk meningkatkan keamanan dan validitas data kehadiran mahasiswa.
            </p>
          </div>

          {/* Kolom 2: Menu Cepat */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 w-1.5 h-6 rounded-full inline-block"></span>
              Menu Cepat
            </h3>
            <ul className="space-y-2 text-sm pl-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(link.path)}
                    className="text-gray-700 hover:text-blue-700 hover:font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-1.5 bg-blue-600 rounded-full transition-all duration-200"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Informasi Kampus & Teknologi */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 w-1.5 h-6 rounded-full inline-block"></span>
              Sekolah Tinggi Teknik Pati
            </h3>
            <address className="not-italic text-sm text-gray-700 space-y-1 pl-2">
              <p className="flex items-center gap-2">
                <span className="text-blue-600">📍</span> Jl. Raya Pati - Tayu Km. 4,5 , Pati, Jawa Tengah
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600">✉️</span> sttpati@yahoo.com
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600">📞</span> +62897-1329-888
              </p>
            </address>
            <div className="mt-4 pl-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Teknologi</h4>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Express.js', 'FastAPI', 'MongoDB', 'FaceNet', 'MediaPipe', 'OpenCV'].map(tech => (
                  <span key={tech} className="inline-block px-3 py-1 bg-white/80 text-blue-800 text-xs font-medium rounded-full border border-blue-300/50 shadow-sm hover:shadow-md hover:scale-105 hover:bg-blue-50 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hak Cipta */}
        <div className="border-t border-blue-200/50 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Sistem Absensi Mahasiswa Berbasis Face Recognition.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sekolah Tinggi Teknik Pati. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
// import React from 'react';

// export default function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 mt-auto">
//       <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
//         <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
//           {/* Bagian kiri: identitas sistem dan institusi */}
//           <div className="flex-1 space-y-3">
//             <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">
//               Smart Face Attendance
//             </h2>
//             <p className="text-sm text-gray-600 max-w-md leading-relaxed">
//               Sistem absensi mahasiswa berbasis pengenalan wajah dengan dukungan geolokasi, liveness detection, serta integrasi real‑time. Dikembangkan untuk mendukung digitalisasi kampus yang akurat dan aman.
//             </p>
//             <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
//               <span className="flex items-center gap-1">📧 info@sttp.ac.id</span>
//               <span className="flex items-center gap-1">📞 (0295) 123456</span>
//               <span className="flex items-center gap-1">📍 Pati, Jawa Tengah</span>
//             </div>
//           </div>

//           {/* Bagian kanan: tautan & teknologi */}
//           <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
//             {/* Tautan statis (opsional) */}
//             <div>
//               <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
//                 Tautan
//               </h3>
//               <ul className="space-y-1 text-sm text-gray-600">
//                 <li><a href="#" className="hover:text-indigo-600 transition">Tentang Sistem</a></li>
//                 <li><a href="#" className="hover:text-indigo-600 transition">Bantuan</a></li>
//                 <li><a href="#" className="hover:text-indigo-600 transition">Kebijakan Privasi</a></li>
//               </ul>
//             </div>

//             {/* Stack teknologi */}
//             <div>
//               <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
//                 Teknologi
//               </h3>
//               <div className="flex flex-wrap gap-2 max-w-[220px]">
//                 {['React', 'Vite', 'Tailwind', 'Express', 'FastAPI', 'MongoDB', 'FaceNet', 'MediaPipe'].map(tech => (
//                   <span key={tech} className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
//                     {tech}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Garis pemisah dan hak cipta */}
//         <div className="border-t border-gray-200 mt-6 pt-5 text-center text-xs text-gray-500">
//           <p>
//             © {currentYear} Sistem Absensi Mahasiswa Berbasis Face Recognition – 
//             Sekolah Tinggi Teknik Pati. All rights reserved.
//           </p>
//           <p className="mt-1">
//             Dibangun untuk mendukung akurasi dan keamanan presensi digital.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }