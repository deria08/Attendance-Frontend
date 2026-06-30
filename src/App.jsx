'use client';

import { useState,useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import AdminLoginPage from './pages/AdminLoginPage'
import DosenLoginPage from './pages/DosenLoginPage'
import MahasiswaLoginPage from './pages/MahasiswaLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import MahasiswaDashboard from './pages/MahasiswaDashboard'
import DosenDashboard from './pages/DosenDashboard'
import ManajemenPengguna from './pages/ManajemenPengguna'
import FaceRecognitionPage from './pages/FaceRecognitionPage'
import RekapAbsensiPage from './pages/RekapAbsensiPage'
import KelolaMataKuliah from './pages/KelolaMataKuliah'
import RegistrasiWajah from './pages/RegistrasiWajah';
import KrsPage from './pages/KrsPage';
import ManajemenEnrollment from './pages/ManajemenEnrollment';
import ManualAttendancePage from './pages/ManualAttendancePage';
import BantuanPage from './pages/BantuanPage';
import { apiFetch } from './utils/api';
import { EXPRESS_API_URL } from './config';

function App() {
  const [userId, setUserId] = useState('')
  const [currentPage, setCurrentPage] = useState('landing')
  const [users, setUsers] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [manualAbsenEnabled, setManualAbsenEnabled] = useState(false)
  const [userData, setUserData] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null);
  // Di App.jsx, tambahkan state
  const totalMahasiswa = users.filter(u => u.role === 'mahasiswa').length;
  const totalDosen = users.filter(u => u.role === 'dosen').length;
  const [faceStatus, setFaceStatus] = useState({}); // key: nim_nidn, value: boolean

  // Di handleLogin atau handleAdminLogin
  // sessionStorage.setItem('token', data.token);
// Fungsi fetch face status
const fetchFaceStatus = async () => {
  try {
    const res = await apiFetch(`${EXPRESS_API_URL}/users/mahasiswa/face-status`);
    const data = await res.json(); // array of { nim, name, face_registered }
    const map = {};
    data.forEach(item => {
      map[item.nim] = item.face_registered;
    });
    setFaceStatus(map);
  } catch (err) {
    console.error('Gagal fetch face status', err);
  }
};

// Panggil fetchFaceStatus saat mount dan setelah registrasi/reset
useEffect(() => {
  fetchFaceStatus();
}, []);

const fetchProfile = async () => {
  try {
    const res = await apiFetch(`${EXPRESS_API_URL}/profile`);
    if (res.ok) {
      const user = await res.json();
      setUserData(user);
      // Update users array: ganti data user yang lama dengan yang baru (termasuk face_registered)
      setUsers(prev => prev.map(u => u._id === user._id ? user : u));
    }
  } catch (err) {
    console.error('Gagal mengambil profil:', err);
  }
};

// Fungsi reset wajah (panggil dari admin)
const handleResetFace = async (userId, name) => {
  try {
    await apiFetch(`${EXPRESS_API_URL}/users/faces/${userId}`, { method: 'DELETE' });
    await fetchFaceStatus();
    alert('Data wajah berhasil direset');
  } catch (err) {
    alert('Gagal reset: ' + err.message);
  }
};
  const fetchUsers = async () => {
  try {
    // Ambil data user dari backend Express (seperti biasa)
    const resUsers = await apiFetch(`${EXPRESS_API_URL}/auth/users`);
    const usersData = await resUsers.json();
    
    // Ambil status face_registered dari endpoint baru (misal /api/faces/status)
    const resFaceStatus = await apiFetch(`${EXPRESS_API_URL}/users/mahasiswa/face-status`);
    const faceStatus = await resFaceStatus.json(); // array: [{ name, nim, face_registered }]
    
    // Gabungkan: tambahkan face_registered ke setiap user yang role mahasiswa
    const merged = usersData.map(user => {
      if (user.role === 'mahasiswa') {
        const status = faceStatus.find(f => f.name === user.name);
        return { ...user, face_registered: status ? status.face_registered : false };
      }
      return user;
    });
    setUsers(merged);
  } catch (err) {
    console.error(err);
  }
}

  useEffect(() => {
  if (userRole === 'admin') {
    fetchUsers();
  }
}, [userRole]);

  const mahasiswaList = users
  .filter(u => u.role === 'mahasiswa')
  .map(u => ({
    id: u._id,
    nama: u.name,
    nim: u.nim_nidn,
    email: u.email,
    status: 'Aktif',
    face_registered: u.face_registered || false,   // ← penting
    prodi: u.prodi || '',
    semester: u.semester || ''
  }));

const dosenList = users
  .filter(u => u.role === 'dosen')
  .map(u => ({
    id: u._id,
    nama: u.name,
    nidn: u.nim_nidn, // ← ini juga
    email: u.email || '-',
    status: 'Aktif',
    gelar: u.gelar || ''
  }))
  // registrasi mahasiswa
const handleNavigate = (page, data = null) => {
  setCurrentPage(page);
  if (data) {
    if (data.userName) setUserName(data.userName);
    if (data.userId) setUserId(data.userId);
    if (data.role) setUserRole(data.role);
  if (data.courseId) setSelectedCourse(data); // simpan data course

  // setUserData(data);
  }
};

  // Di App.jsx, tambahkan dalam fungsi handleLogin yang sudah ada atau buat khusus
const handleAdminLogin = async (username, password, expectedRole) => {
  try {
    const res = await fetch(`${EXPRESS_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, nim_nidn: password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const user = data.user;  // ← pastikan baris ini ada
    if (user.role !== 'admin') throw new Error('Bukan akun admin');
    sessionStorage.setItem('token', data.token);
    setUserRole('admin');
    setUserName(user.name);
    setUserId(user.id || user._id);
    setUserData(user);
    setCurrentPage('admin-dashboard');
    fetchUsers();
  } catch (err) {
    alert(err.message);
  }
};

  const handleLogin = async (name, nim_nidn, expectedRole) => {
  try {
    const res = await fetch(`${EXPRESS_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nim_nidn })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const user = data.user;
    if (user.role !== expectedRole) {
      throw new Error(`Anda terdaftar sebagai ${user.role}, bukan ${expectedRole}`);
    }
    // const identifier = data.user._id || data.user.nim_nidn;
    const userId = user.id || user._id;   // coba salah satu
    console.log('Login berhasil, userId =', userId, 'role =', user.role);
    sessionStorage.setItem('token', data.token);
    setUserRole(user.role);
    setUserName(user.name);
    setUserId(user.id || user._id);  // simpan ObjectId user
    setUserData(user);
    await fetchProfile();
    if (user.role === 'mahasiswa') setCurrentPage('mahasiswa-dashboard');
    else if (user.role === 'dosen') setCurrentPage('dosen-dashboard');
    else if (user.role === 'admin') setCurrentPage('admin-dashboard');
  } catch (err) {
    alert(err.message);
  }
};
  const handleLogout = () => {
    setCurrentPage('landing')
    setUserRole(null)
    setUserName('')
    sessionStorage.removeItem('token');
  }

  const handleAddMahasiswa = async (data) => {
    await apiFetch(`${EXPRESS_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.nama,
        nim_nidn: data.nim,
        email: data.email,
        role: 'mahasiswa',
        prodi: data.prodi,
        semester: data.semester
      })
    });
    fetchUsers();
  };

  const handleAddDosen = async (data) => {
  await apiFetch(`${EXPRESS_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.nama,
      nim_nidn: data.nidn, // ← kirim NIDN
      email: data.email,
      role: 'dosen',
      gelar: data.gelar || ''
    })
  })
  fetchUsers()
}

  const handleEditMahasiswa = async (id, data) => {
  await apiFetch(`${EXPRESS_API_URL}/auth/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.nama,
      nim_nidn: data.nim,
      email: data.email,
      role: 'mahasiswa',
      prodi: data.prodi,
      semester: data.semester
    })
  })
  fetchUsers()
}

  const handleEditDosen = async (id, data) => {
    await apiFetch(`${EXPRESS_API_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.nama,
        nim_nidn: data.nidn,
        email: data.email,
        role: 'dosen',
        gelar: data.gelar || ''
      })
    })
    fetchUsers()
  }

  const handleDeleteMahasiswa = async (id) => {
  await apiFetch(`${EXPRESS_API_URL}/auth/users/${id}`, {
    method: 'DELETE'
  })
  fetchUsers()
}

const handleDeleteDosen = async (id) => {
  await apiFetch(`${EXPRESS_API_URL}/auth/users/${id}`, {
    method: 'DELETE'
  })
  fetchUsers()
}
  const handleAddMataKuliah = async (data) => {
  await apiFetch(`${EXPRESS_API_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // refresh list
};

  const handleEditMataKuliah = async (id, data) => {
    await apiFetch(`${EXPRESS_API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  const handleDeleteMataKuliah = async (id) => {
    await apiFetch(`${EXPRESS_API_URL}/courses/${id}`, { method: 'DELETE' });
  };
  console.log('App - currentPage:', currentPage, 'userId:', userId);
  const currentMahasiswa = mahasiswaList?.find(m => m.nim === userId);
  return (
    <div>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}
      {currentPage === 'admin-login' && (
        <AdminLoginPage onNavigate={handleNavigate} onLogin={handleAdminLogin} />
      )}
      {currentPage === 'mahasiswa-login' && (
        <MahasiswaLoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {currentPage === 'dosen-login' && (
        <DosenLoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {currentPage === 'admin-dashboard' && (
        <AdminDashboard 
          onNavigate={handleNavigate} 
          userName={userName} 
          onLogout={handleLogout}
          totalMahasiswa={totalMahasiswa}
          totalDosen={totalDosen} 
        />
      )}
      {currentPage === 'manajemen-pengguna' && (
        <ManajemenPengguna
          mahasiswaList={mahasiswaList}
          dosenList={dosenList}
          faceStatus={faceStatus}
          onResetFace={handleResetFace}
          onNavigate={handleNavigate}
          onAddMahasiswa={handleAddMahasiswa}
          onEditMahasiswa={handleEditMahasiswa}
          onDeleteMahasiswa={handleDeleteMahasiswa}
          onAddDosen={handleAddDosen}
          onEditDosen={handleEditDosen}
          onDeleteDosen={handleDeleteDosen}
        />
      )}
      {currentPage === 'kelola-matakuliah' && (
        <KelolaMataKuliah 
          dosenList={dosenList}
          onNavigate={handleNavigate}
          onAdd={handleAddMataKuliah}
          onEdit={handleEditMataKuliah}
          onDelete={handleDeleteMataKuliah}
        />
)}
      {currentPage === 'mahasiswa-dashboard' && (
        <MahasiswaDashboard
          onNavigate={handleNavigate}
          userName={userName}
          userId={userId}
          mahasiswaList={mahasiswaList}
          manualAbsenEnabled={manualAbsenEnabled}
          onLogout={handleLogout}
          userData={userData}
          faceStatus={faceStatus}
        />
      )}
      {currentPage === 'face-recognition' && (
        <FaceRecognitionPage 
          onNavigate={handleNavigate} 
          userName={userName}
          userId={userId}
          userData={userData} 
        />
      )}
      {currentPage === 'dosen-dashboard' && (
        <DosenDashboard 
          onNavigate={handleNavigate} 
          userName={userName} 
          userId={userId}
          userData={userData}
          onLogout={handleLogout}
          onEnableManualAbsen={() => setManualAbsenEnabled(!manualAbsenEnabled)}
          manualAbsenEnabled={manualAbsenEnabled}
        />
      )}
      {currentPage === 'rekap-absensi' && (
        <RekapAbsensiPage 
          onNavigate={handleNavigate}
          userRole={userRole}
          userId={userId}
          selectedCourse={selectedCourse}  // ← kirim data course
          // selectedMataKuliah={selectedMataKuliah}
          // attendanceData={attendanceData}
          // onUpdateAttendance={handleUpdateAttendance}
        />
      )}
      {currentPage === 'registrasi-wajah' && (
      <RegistrasiWajah
        mahasiswaList={mahasiswaList}
        userName={userName}
        nim={userData?.nim_nidn}  // cukup userId, karena userData mungkin null
        onNavigate={handleNavigate}
        onRegisterFace={async (nim, image) => {
        // Update lokal state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.nim_nidn === nim
              ? { ...user, face_registered: true, face_image: image }
              : user
          )
        );
          // Optional: panggil API untuk simpan ke database
          await fetchProfile();
          await fetchFaceStatus();
          onNavigate('mahasiswa-dashboard');
        }}
      />
    )}
      {/* {currentPage === 'krs' && (
      <KrsPage
        onNavigate={handleNavigate}
        userId={userId}
        userName={userName}
        mahasiswa={userData} // Anda perlu menyediakan objek mahasiswa lengkap (prodi, semester)
      /> */}
    {/* )} */}
    {currentPage === 'manajemen-enrollment' && (
      <ManajemenEnrollment 
      onNavigate={handleNavigate}
      userData={userData} />
    )}
    {currentPage === 'bantuan' && (
      <BantuanPage onNavigate={handleNavigate} role={userRole} />
    )}
    {/* {currentPage === 'manual-attendance' && (
      <ManualAttendancePage onNavigate={handleNavigate} userName={userName} />
)} */}
    </div>
  )
}

export default App
