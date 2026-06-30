import React, { useState } from 'react'
import Footer from '../components/Footer'

export default function DosenLoginPage({ onNavigate,onLogin }) {
  const [namaDosen, setNamaDosen] = useState('')
  const [nidn, setNidn] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      if (onLogin && typeof onLogin === 'function') {
        await onLogin(namaDosen, nidn, 'dosen');
      } else {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: namaDosen, nim_nidn: nidn }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        onNavigate('dosen-dashboard', {
          role: data.user.role,
          userName: data.user.name,
          userId: data.user.nim_nidn,
        });
      }
    } catch (err) {
      setErrors({ umum: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md mx-auto">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-indigo-100 relative">
          
          {/* Back Button */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8">
            <button
              onClick={() => onNavigate('landing')}
              className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline">Kembali</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8 md:mb-10 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Login Dosen
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-3"></div>
            <p className="text-gray-600 text-base">
              Masukkan data dosen Anda
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="namaDosen" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Dosen
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="namaDosen"
                  value={namaDosen}
                  onChange={(e) => {
                    setNamaDosen(e.target.value)
                    if (errors.namaDosen) setErrors({...errors, namaDosen: ''})
                  }}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.namaDosen 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Nama"
                />
              </div>
              {errors.namaDosen && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.namaDosen}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="nidn" className="block text-sm font-medium text-gray-700 mb-2">
                NIDN (Nomor Induk Dosen Nasional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="nidn"
                  value={nidn}
                  onChange={(e) => {
                    setNidn(e.target.value)
                    if (errors.nidn) setErrors({...errors, nidn: ''})
                  }}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.nidn 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="NIDN"
                />
              </div>
              {errors.nidn && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nidn}
                </p>
              )}
            </div>

            {/* Optional Features */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="ingat-saya"
                  name="ingat-saya"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="ingat-saya" className="ml-2 block text-sm text-gray-700">
                  Ingat data saya
                </label>
              </div>
              <button 
                type="button" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                onClick={() => alert('Fitur lupa NIDN akan dikirim ke email terdaftar')}
              >
                Lupa NIDN?
              </button>
            </div> */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <span>Masuk sebagai Dosen</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Info Tambahan */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl">
              <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-indigo-800 mb-1">Informasi Login</p>
                <p className="text-xs text-indigo-600">
                  Masukkan nama lengkap dan NIDN sesuai dengan data yang terdaftar di sistem STTP.
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      {/* <Footer /> */}
    </div>
    <Footer onNavigate={onNavigate}/>
    </>
  )
}