# Sistem Absensi Wajah STTP - Face Recognition Attendance System

Platform absensi mahasiswa berbasis pengenalan wajah (Face Recognition) menggunakan simulasi FaceNet. Dibangun dengan React + Vite + Tailwind CSS sebagai frontend-only application dengan dummy data.

## 📋 Daftar Isi

- [Status Proyek](#-status-proyek)
- [Setup & Instalasi](#-setup--instalasi)
- [Struktur Proyek](#-struktur-proyek)
- [Fitur yang Sudah Diimplementasi](#-fitur-yang-sudah-diimplementasi)
- [Panduan User](#-panduan-user)
- [Langkah Selanjutnya](#-langkah-selanjutnya-untuk-melengkapi-proyek)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Status Proyek

### Selesai ✅
- ✅ Struktur Vite + React JSX
- ✅ Tailwind CSS configuration
- ✅ Landing page dengan role selection (Admin, Dosen, Mahasiswa)
- ✅ Login pages untuk semua role
- ✅ Admin Dashboard dengan menu management
- ✅ Admin - Kelola Akun Mahasiswa (CRUD lengkap)
- ✅ Admin - Kelola Akun Dosen (CRUD lengkap)
- ✅ Mahasiswa Dashboard dengan info card
- ✅ Face Recognition Simulation dengan loading & hasil
- ✅ Dosen Dashboard dengan list mata kuliah
- ✅ Rekap Absensi dengan tabel interaktif
- ✅ Modal component reusable
- ✅ Responsive design mobile-first
- ✅ State management dengan React hooks
- ✅ Smooth animations & transitions

### Belum Dimulai ⏳
- ⏳ Backend API integration
- ⏳ Real face recognition library (FaceNet)
- ⏳ Real camera access (WebRTC)
- ⏳ Database connection
- ⏳ Real authentication
- ⏳ Liveness Detection
- ⏳ Geolocation Validation

---

## 🚀 Setup & Instalasi

### Prerequisites
- **Node.js** v16+ (versi 18+ recommended)
- **npm** atau **yarn**
- Code editor (VS Code recommended)

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka di browser
# http://localhost:5173

# Tekan 'q' di terminal untuk stop server
```

### Build untuk Production

```bash
# Build untuk production
npm run build

# Preview hasil build
npm run preview
```

---

## 📁 Struktur Proyek

```
sistem-absensi-wajah/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx           # Role selection
│   │   ├── AdminLoginPage.jsx        # Admin login
│   │   ├── DosenLoginPage.jsx        # Dosen login
│   │   ├── MahasiswaLoginPage.jsx    # Mahasiswa login
│   │   ├── AdminDashboard.jsx        # Admin main dashboard
│   │   ├── KelolaMahasiswa.jsx       # Admin - manage mahasiswa
│   │   ├── KelolaDosen.jsx           # Admin - manage dosen
│   │   ├── MahasiswaDashboard.jsx    # Mahasiswa main dashboard
│   │   ├── FaceRecognitionPage.jsx   # Face scan simulation
│   │   ├── DosenDashboard.jsx        # Dosen main dashboard
│   │   └── RekapAbsensiPage.jsx      # Attendance recap table
│   ├── components/
│   │   └── Modal.jsx                 # Reusable modal component
│   ├── App.jsx                       # Root component with routing
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global Tailwind styles
├── index.html                        # HTML template
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── package.json                      # Dependencies
├── .gitignore                        # Git ignore file
└── README.md                         # This file
```

---

## 🎯 Fitur yang Sudah Diimplementasi

### 1. Authentication & Landing
✅ **Landing Page**
- Tiga tombol besar: Admin, Dosen, Mahasiswa
- Desain modern dengan gradient background
- Informasi fitur utama sistem

✅ **Login Pages (3 variants)**
- Admin: Username + Password
- Dosen: Nama Dosen + NIDN
- Mahasiswa: Nama Mahasiswa + NIM
- Form validation (required fields)
- Back button ke landing page

### 2. Admin Dashboard
✅ **Dashboard Utama**
- Greeting text dengan nama user
- Menu cards untuk Kelola Mahasiswa & Kelola Dosen
- Sistem info stats (total data, status)
- Logout button

✅ **Kelola Akun Mahasiswa**
- Tabel dengan columns: Nama, NIM, Email, Status, Actions
- CRUD operations:
  - **Create**: Modal form "Tambah Mahasiswa"
  - **Read**: Lihat list di tabel
  - **Update**: Modal form edit dengan pre-filled data
  - **Delete**: Confirmation modal
- Dummy data: 3 mahasiswa sample
- Icons untuk edit & delete actions
- Status badge (Aktif/Nonaktif)

✅ **Kelola Akun Dosen**
- Similar structure seperti Kelola Mahasiswa
- Columns: Nama, NIDN, Email, Status, Actions
- CRUD lengkap dengan modals
- Dummy data: 2 dosen sample

### 3. Mahasiswa Dashboard
✅ **Dashboard Layout**
- Greeting dengan nama mahasiswa
- Info card dengan detail mahasiswa
- Persentase kehadiran
- Dua tombol utama:
  - "Scan Wajah Anda" (active)
  - "Absen Manual" (disabled by default, enabled via dosen toggle)
- Info badge: "Belum diaktifkan oleh dosen"

✅ **Face Recognition Simulation**
- Camera placeholder dengan face guide overlay
- Loading animation: "Mencocokkan wajah..."
- 2-second processing delay
- Random result: 70% success rate
- **Success Modal**: Anda sudah absen ✔
- **Failed Modal**: Wajah tidak valid ✖ + retry button
- Optimal distance & lighting info

### 4. Dosen Dashboard
✅ **Dashboard Utama**
- Greeting dengan nama dosen
- Button "Aktifkan Absen Manual" (toggle state)
- Grid cards untuk Mata Kuliah

✅ **Mata Kuliah List**
- 3 mata kuliah dummy: Pemrograman Web, Basis Data, Algoritma
- Clickable cards dengan info
- Navigasi ke Rekap Absensi

✅ **Rekap Absensi**
- Tabel attendance dengan:
  - Rows: Nama mahasiswa (3 records)
  - Columns: P1-P16 (16 pertemuan)
  - Cell values: ✔ (Hadir), ✖ (Tidak Hadir), i (Izin)
- Interactive cells: click → modal dropdown untuk ubah status
- Color-coded status
- Legend dengan penjelasan symbols
- Responsive horizontal scroll di mobile

### 5. UI/UX Components
✅ **Modal Component**
- Reusable modal dengan overlay
- Auto-centering
- Close button
- Customizable content

✅ **Form Handling**
- Input fields dengan validation
- Error messages
- Modal-based CRUD forms
- Confirmation dialogs

✅ **Responsive Design**
- Mobile-first approach
- Tailwind responsive classes
- Works on: mobile, tablet, desktop
- Touch-friendly buttons & spacing

✅ **Visual Design**
- Clean academic design
- Color coded by role: Blue (Admin), Indigo (Dosen), Teal (Mahasiswa)
- Soft shadows & rounded corners
- Smooth transitions
- SVG icons di buttons

---

## 👥 Panduan User

### Cara Login & Test

**Admin:**
1. Klik tombol "Admin" di landing page
2. Masukkan username & password (bisa apa saja, tidak ada validasi real)
3. Klik "Login" → Masuk ke Admin Dashboard

**Dosen:**
1. Klik tombol "Dosen" di landing page
2. Masukkan Nama Dosen & NIDN (bisa apa saja)
3. Klik "Login" → Masuk ke Dosen Dashboard

**Mahasiswa:**
1. Klik tombol "Mahasiswa" di landing page
2. Masukkan Nama Mahasiswa & NIM (bisa apa saja)
3. Klik "Login" → Masuk ke Mahasiswa Dashboard

### Testing Admin Features

**Kelola Mahasiswa:**
1. Di Admin Dashboard, klik "Kelola Akun Mahasiswa"
2. Lihat tabel mahasiswa dengan 3 sample data
3. Klik "Tambah Mahasiswa" → Form modal
4. Isi data → Klik "Tambah" → Data bertambah di tabel
5. Klik icon edit → Edit modal dengan data ter-fill
6. Klik icon delete → Confirmation modal → Confirm delete

**Kelola Dosen:**
- Sama seperti Kelola Mahasiswa

### Testing Mahasiswa Features

**Face Recognition:**
1. Di Mahasiswa Dashboard, klik "Scan Wajah Anda"
2. Lihat camera placeholder dengan face guide
3. Klik "Mulai Scan" → Loading 2 detik
4. Muncul hasil (random success/fail)
5. Success → modal "Anda sudah absen" ✔
6. Failed → modal "Wajah tidak valid" ✖ dengan tombol retry

**Absen Manual:**
- Tombol disabled sampai dosen mengaktifkan di dashboard-nya

### Testing Dosen Features

**Aktivasi Absen Manual:**
1. Di Dosen Dashboard, klik "Aktifkan Absen Manual"
2. Button berubah status (active/inactive)
3. Kembali ke Mahasiswa Dashboard
4. Tombol "Absen Manual" sekarang active (bisa diklik)

**Rekap Absensi:**
1. Di Dosen Dashboard, klik salah satu Mata Kuliah
2. Lihat tabel attendance dengan 3 mahasiswa & 16 pertemuan
3. Klik salah satu cell (misalnya ✔) → Modal dropdown
4. Pilih status baru → Cell berubah
5. Lihat legend di bawah untuk penjelasan symbols

---

## 🔄 Langkah Selanjutnya untuk Melengkapi Proyek

### Phase 1: Backend API Integration ⭐ PRIORITAS TINGGI

#### 1.1 Setup Backend Server
**Yang perlu dilakukan:**
- Buat backend project (Node.js/Express, Python/Flask, Java/Spring, atau Go)
- Setup REST API dengan endpoints

**Endpoints yang diperlukan:**

```
Authentication
POST /api/auth/login - Login semua role
POST /api/auth/logout - Logout

Mahasiswa Management (Admin)
GET /api/mahasiswa - List mahasiswa
POST /api/mahasiswa - Create mahasiswa
PUT /api/mahasiswa/:id - Update mahasiswa
DELETE /api/mahasiswa/:id - Delete mahasiswa

Dosen Management (Admin)
GET /api/dosen - List dosen
POST /api/dosen - Create dosen
PUT /api/dosen/:id - Update dosen
DELETE /api/dosen/:id - Delete dosen

Attendance
GET /api/attendance/:mataKuliah_id - Get rekap absensi
PUT /api/attendance/:id - Update attendance status
POST /api/attendance/face-recognition - Process face scan
POST /api/attendance/manual - Manual attendance

Mata Kuliah
GET /api/mataKuliah - List all mata kuliah
```

**File backend rekomendasi:**
- `backend/src/routes/auth.js`
- `backend/src/routes/mahasiswa.js`
- `backend/src/routes/dosen.js`
- `backend/src/routes/attendance.js`
- `backend/src/models/User.js`
- `backend/src/models/Attendance.js`

#### 1.2 Update Frontend untuk API Integration

**Files yang perlu dimodifikasi:**
- `src/App.jsx` - Add API calls replace dummy data
- `src/pages/AdminLoginPage.jsx` - Connect ke POST /api/auth/login
- `src/pages/KelolaMahasiswa.jsx` - Replace dummy data dengan API calls
- `src/pages/KelolaDosen.jsx` - Replace dummy data dengan API calls
- `src/pages/RekapAbsensiPage.jsx` - Fetch dari API

**Contoh modifikasi:**
```jsx
// Before (using dummy data)
const [mahasiswaList, setMahasiswaList] = useState([...])

// After (using API)
const [mahasiswaList, setMahasiswaList] = useState([])

useEffect(() => {
  fetch('/api/mahasiswa')
    .then(res => res.json())
    .then(data => setMahasiswaList(data))
}, [])

const handleAdd = async (data) => {
  const res = await fetch('/api/mahasiswa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const newMahasiswa = await res.json()
  setMahasiswaList([...mahasiswaList, newMahasiswa])
}
```

**File baru yang perlu dibuat:**
- `src/utils/api.js` - Centralized API calls
- `src/hooks/useFetch.js` - Custom hook untuk data fetching
- `src/context/AuthContext.jsx` - Auth state management

---

### Phase 2: Real Face Recognition Integration ⭐ PRIORITAS TINGGI

#### 2.1 Install Face Recognition Libraries

```bash
npm install face-api.js
# atau
npm install @tensorflow-models/facemesh
npm install @tensorflow/tfjs
# atau
npm install facenet
```

#### 2.2 Implementasi Real Camera

**File yang perlu dibuat:**
- `src/utils/faceRecognition.js` - Face detection logic

**Contoh:**
```jsx
import * as faceapi from 'face-api.js'

const loadModels = async () => {
  const MODEL_URL = '/models'
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
}

const detectFace = async (videoRef) => {
  const detections = await faceapi.detectAllFaces(
    videoRef.current,
    new faceapi.TinyFaceDetectorOptions()
  )
  return detections.length > 0
}
```

#### 2.3 Update FaceRecognitionPage.jsx

**Yang berubah:**
- Replace simulasi dengan real camera access
- Real face detection dari video stream
- Real face embedding comparison
- Confidence scoring

**Files yang perlu dimodifikasi:**
- `src/pages/FaceRecognitionPage.jsx` - Add real camera & detection logic
- `src/components/Modal.jsx` - Add loading states

---

### Phase 3: Database Setup ⭐ PRIORITAS TINGGI

#### 3.1 Database Selection

**Recommended:**
- PostgreSQL (best for relational data)
- MongoDB (if prefer NoSQL)
- MySQL (alternative relational)

#### 3.2 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'dosen', 'mahasiswa'),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mahasiswa table
CREATE TABLE mahasiswa (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  nama VARCHAR(255),
  nim VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  status ENUM('Aktif', 'Nonaktif'),
  face_embedding JSON, -- Store face vector
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dosen table
CREATE TABLE dosen (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  nama VARCHAR(255),
  nidn VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  status ENUM('Aktif', 'Nonaktif'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mata Kuliah table
CREATE TABLE mata_kuliah (
  id SERIAL PRIMARY KEY,
  dosen_id INT REFERENCES dosen(id),
  nama VARCHAR(255),
  kode VARCHAR(20),
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INT REFERENCES mahasiswa(id),
  mata_kuliah_id INT REFERENCES mata_kuliah(id),
  pertemuan INT,
  status ENUM('Hadir', 'Tidak Hadir', 'Izin'),
  method ENUM('face_recognition', 'manual'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Face enrollment table (for training data)
CREATE TABLE face_embeddings (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INT REFERENCES mahasiswa(id),
  embedding FLOAT8[], -- PostgreSQL array type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**File database yang perlu dibuat:**
- `backend/database/schema.sql` - DB schema
- `backend/migrations/001_init_tables.js` - Migration file
- `backend/seeders/seedData.js` - Sample data

---

### Phase 4: Authentication & Security ⭐ PRIORITAS TINGGI

#### 4.1 Implementasi Real Authentication

**File yang perlu dibuat:**
- `backend/middleware/auth.js` - JWT middleware

**Improvement needed:**
```jsx
// Update login pages untuk real authentication
const handleLogin = async (e) => {
  e.preventDefault()
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  
  if (res.ok) {
    const { token } = await res.json()
    localStorage.setItem('token', token)
    onNavigate('admin-dashboard')
  } else {
    setError('Login gagal')
  }
}
```

#### 4.2 Context API untuk Auth

**File yang perlu dibuat:**
- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`

```jsx
// AuthContext.jsx
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }

  return (
    <AuthContext.Provider value={{ user, token, login }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

### Phase 5: Advanced Features 🔧 PRIORITAS MEDIUM

#### 5.1 Data Export & Reports

**File yang perlu dibuat:**
- `src/utils/export.js`

```javascript
// Export to CSV
export const exportToCSV = (data, filename) => {
  const csv = data.map(row => Object.values(row).join(','))
  const csvContent = csv.join('\n')
  // ... download logic
}

// Export to PDF
import jsPDF from 'jspdf'
export const exportToPDF = (attendance) => {
  const doc = new jsPDF()
  // ... PDF generation logic
}
```

#### 5.2 Analytics Dashboard

**File yang perlu dibuat:**
- `src/pages/AnalyticsDashboard.jsx`
- `src/components/Charts.jsx`

**Metrics:**
- Attendance rate per mahasiswa
- Attendance rate per mata kuliah
- Most absent students
- Trends over time

#### 5.3 Notifications

**File yang perlu dibuat:**
- `src/utils/notifications.js`

**Features:**
- Email notifications untuk low attendance
- Real-time notifications untuk attendance
- Alert untuk unregistered faces

#### 5.4 Multi-language Support

**File yang perlu dibuat:**
- `src/i18n/locales/id.json`
- `src/i18n/locales/en.json`
- `src/i18n/useTranslation.js`

---

### Phase 6: Testing & QA 🧪 PRIORITAS MEDIUM

#### 6.1 Setup Testing

```bash
npm install -D vitest @testing-library/react jsdom
npm install -D cypress
```

**File yang perlu dibuat:**
- `src/__tests__/pages/LoginPage.test.jsx`
- `src/__tests__/components/Modal.test.jsx`
- `cypress/e2e/admin-workflow.cy.js`

#### 6.2 Test Cases

```javascript
// Example test
describe('Admin CRUD', () => {
  it('should add mahasiswa', () => {
    // Test implementation
  })
  
  it('should edit mahasiswa', () => {
    // Test implementation
  })
  
  it('should delete mahasiswa', () => {
    // Test implementation
  })
})
```

---

### Phase 7: Deployment & DevOps 🚀 PRIORITAS HIGH

#### 7.1 Environment Configuration

**Create `.env.example`:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistem Absensi Wajah STTP
```

#### 7.2 Production Build Optimization

**File yang perlu dibuat:**
- `vite.config.prod.js`
- `.github/workflows/deploy.yml` (CI/CD)

```javascript
// vite.config.js optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom']
        }
      }
    }
  }
})
```

#### 7.3 Deployment Options

**Frontend:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- DigitalOcean

**Backend:**
- Heroku
- AWS (EC2, Lambda)
- DigitalOcean
- Render.com

---

### Phase 8: Documentation 📚 PRIORITAS MEDIUM

**Files yang perlu dibuat:**
- `docs/API.md` - API documentation
- `docs/SETUP.md` - Setup guide
- `docs/ARCHITECTURE.md` - System architecture
- `docs/USER_MANUAL.md` - User guide per role
- `docs/DEVELOPER_GUIDE.md` - Developer setup

---

### Phase 9: UI/UX Improvements 🎨 PRIORITAS LOW

- Toast notifications (react-hot-toast)
- Loading skeletons
- Error boundaries
- Animations improvements
- Dark mode support
- Accessibility improvements (a11y)
- Better error messages

**File yang perlu dibuat:**
- `src/components/Toast.jsx`
- `src/components/LoadingSkeleton.jsx`
- `src/components/ErrorBoundary.jsx`

---

## 📦 Teknologi yang Digunakan

### Frontend Stack
- **React 18.3.1** - UI library
- **Vite 5.0.8** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **JavaScript ES6+** - Language

### Recommended Backend Stack

**Option 1: Node.js/Express (Recommended)**
```bash
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

**Option 2: Python/Flask**
```bash
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended
pip install bcryptjs
```

**Option 3: Go/Gin**
```bash
go get github.com/gin-gonic/gin
go get github.com/golang-jwt/jwt
```

### Database Recommendations
- PostgreSQL (best for relational data)
- MongoDB (if prefer NoSQL)
- MySQL (alternative)

### Face Recognition Libraries
- face-api.js (recommended, TensorFlow based)
- @tensorflow-models/facemesh
- FaceNet.js

---

## 💾 Environment Variables

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistem Absensi Wajah STTP
VITE_DEBUG=false
```

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Admin login dengan credentials apapun
- [ ] Dosen login dengan nama & NIDN apapun
- [ ] Mahasiswa login dengan nama & NIM apapun
- [ ] Logout dari semua role

**Admin Features:**
- [ ] Kelola Mahasiswa: Add, Edit, Delete
- [ ] Kelola Dosen: Add, Edit, Delete
- [ ] Semua CRUD operations bekerja correct
- [ ] Modal buka dan tutup dengan baik

**Mahasiswa Features:**
- [ ] Face Recognition: Start, loading, success/fail
- [ ] Absen Manual: Disabled/enabled sesuai dosen toggle
- [ ] Dashboard info menampilkan data correct

**Dosen Features:**
- [ ] Toggle Absen Manual berfungsi
- [ ] Rekap Absensi tabel terbuka
- [ ] Edit cell attendance berubah status

**Responsive:**
- [ ] Mobile: Portrait orientation
- [ ] Tablet: Landscape orientation
- [ ] Desktop: Full width layout

---

## 🐛 Troubleshooting

### Port 5173 sudah dipakai
```bash
npm run dev -- --port 5174
```

### Dependencies error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
npm run build -- --force
```

### Cache issues
```bash
rm -rf dist
npm run build
```

---

## 📈 Development Timeline (Recommended)

```
Week 1: Backend Setup + API Integration
- Setup backend server
- Create database schema
- Implement basic CRUD APIs
- Connect frontend to APIs

Week 2: Real Face Recognition
- Install face recognition library
- Implement real camera access
- Setup face enrollment system
- Test face detection

Week 3: Authentication & Security
- Implement JWT authentication
- Add password hashing
- Setup session management
- Security hardening

Week 4: Testing & Deployment
- Unit & integration tests
- E2E testing with Cypress
- Performance optimization
- Deploy to production
```

---

## 📞 Support

### Untuk Issues
1. Check console untuk error messages
2. Use React DevTools untuk state debugging
3. Check network tab untuk API calls
4. Create issue di repository

### Debugging Tips
```javascript
// Add debug logs
console.log('[v0] State:', state)
console.log('[v0] API Response:', data)
```

---

## 📄 License

MIT License - Bebas untuk keperluan pendidikan dan commercial

---

## 👥 Credits

Dikembangkan untuk STTP - Sekolah Tinggi Teknologi Pematangsiantar

**Last Updated**: January 2026
**Version**: 1.0.0 Beta
**Status**: Ready for Backend Integration & Enhancement

🚀 **Selamat mengembangkan!**
