import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FASTAPI_API_URL } from '../config';

const CHALLENGE_DISPLAY = {
  blink: '👁️ Kedipkan kedua mata Anda',
  nod: '👇 Anggukkan kepala Anda',
  shake: '↔️ Gelengkan kepala Anda',
  turn_left: '👈 Hadapkan wajah ke kiri',
  turn_right: '👉 Hadapkan wajah ke kanan'
};

function buildInstruction(challenge) {
  if (!challenge) return "";

  const type = challenge.type;
  const count = challenge.count || 1;

  switch (type) {
    case "blink":
      return `👁️ Kedipkan kedua mata ${count} kali`;
    case "nod":
      return `👇 Anggukkan kepala ${count} kali`;
    case "shake":
      return `↔️ Gelengkan kepala ${count} kali`;
    case "turn_left":
      return "👈 Hadapkan wajah ke kiri";
    case "turn_right":
      return "👉 Hadapkan wajah ke kanan";
    default:
      return "";
  }
}

const STATUS = {
  IDLE: 'idle',
  CAPTURING: 'capturing',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  FAILED: 'failed'
};

export default function LivenessChallenge({ userId, onSuccess, onCancel }) {
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const statusRef = useRef(STATUS.IDLE);
  const sessionIdRef = useRef(null);
  const countdownInterval = useRef(null);
  const captureInterval = useRef(null);
  const isMounted = useRef(true);
  const creatingSession = useRef(false);

  // State
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(2);
  const [nextChallenge, setNextChallenge] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [timeLeft, setTimeLeft] = useState(12);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Single cleanup function
  const cleanup = useCallback(() => {
    // Bersihkan timer
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    // Matikan kamera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    sessionIdRef.current = null;
  }, []);

  useEffect(() => {
    isMounted.current = true;
    startCamera();
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await waitVideoReady();
      await createSession();
    } catch (err) {
      setError('Tidak dapat mengakses kamera.');
    }
  };

  const waitVideoReady = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) return resolve();
      if (video.readyState >= 2) return resolve();
      video.addEventListener('loadeddata', () => resolve(), { once: true });
    });
  };

  const createSession = async () => {
    if (creatingSession.current) return;
    creatingSession.current = true;
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const res = await fetch(`${FASTAPI_API_URL}/api/liveness/challenge`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Gagal buat session');

      sessionIdRef.current = data.session_id;
      setSessionId(data.session_id);

      setCurrentStep(data.current_step);
      setTotalSteps(data.total_steps);
      setNextChallenge(data.next_challenge);
      setInstruction(buildInstruction(data.next_challenge));

      setTimeLeft(data.timeout_seconds || 12);
      setRemainingAttempts(data.remaining_attempts || 3);

      statusRef.current = STATUS.IDLE;
      setStatus(STATUS.IDLE);
      setError(null);

      startCountdown();
      startCaptureLoop();

    } catch (err) {
      setError(err.message || 'Gagal memulai verifikasi');
    } finally {
      creatingSession.current = false;
    }
  };

  const startCountdown = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setTimeLeft(12);
    countdownInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = async () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (!sessionIdRef.current || isCompleted || statusRef.current === STATUS.FAILED) return;
    try {
      const formData = new FormData();
      formData.append('session_id', sessionIdRef.current);
      await fetch(`${FASTAPI_API_URL}/api/liveness/reset`, {
        method: 'POST',
        body: formData
      });
      if (isMounted.current) {
        setStatus(STATUS.FAILED);
        statusRef.current = STATUS.FAILED;
        setError('Waktu habis! Silakan mulai ulang.');
        // Kamera tetap hidup untuk retry
      }
    } catch (e) {
      console.error('Timeout reset error:', e);
    }
  };

  const startCaptureLoop = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    if (captureInterval.current) clearInterval(captureInterval.current);
    if (!videoRef.current || statusRef.current === STATUS.FAILED) return;
    if (statusRef.current === STATUS.VERIFYING) return;

    statusRef.current = STATUS.CAPTURING;
    setStatus(STATUS.CAPTURING);
    setError(null);

    const frames = [];
    const FRAME_COUNT = 45;
    const INTERVAL_MS = 70;

    captureInterval.current = setInterval(() => {
      if (!videoRef.current || !isMounted.current) {
        clearInterval(captureInterval.current);
        captureInterval.current = null;
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.translate(320, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      canvas.toBlob((blob) => {
        if (blob) frames.push(blob);
        if (frames.length === FRAME_COUNT) {
          clearInterval(captureInterval.current);
          captureInterval.current = null;
          uploadFrames(frames);
        }
      }, 'image/jpeg', 0.85);
    }, INTERVAL_MS);
  };

  const uploadFrames = async (frames) => {
    if (frames.length < 3) {
      setError('Frame tidak cukup. Coba lagi.');
      startCaptureLoop();
      return;
    }

    statusRef.current = STATUS.VERIFYING;
    setStatus(STATUS.VERIFYING);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionIdRef.current);
      frames.forEach((blob, i) => {
        formData.append('files', blob, `frame${i}.jpg`);
      });

      const res = await fetch(`${FASTAPI_API_URL}/api/liveness/verify`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Verifikasi gagal');
      }

      if (data.session_invalid) {
        setError(data.error || 'Session expired, membuat session baru...');
        await createSession();
        return;
      }

      if (data.completed) {
        setIsCompleted(true);
        setStatus(STATUS.SUCCESS);
        statusRef.current = STATUS.SUCCESS;
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
        }
        cleanup(); // Hentikan kamera karena sudah selesai
        return;
      }

      if (data.retry) {
        setRemainingAttempts(data.remaining_attempts);
        setError(data.error || 'Gerakan tidak dikenali. Coba lagi.');
        statusRef.current = STATUS.IDLE;
        setStatus(STATUS.IDLE);
        setTimeout(() => startCaptureLoop(), 1000);
        return;
      }

      if (data.success) {
        setCurrentStep(data.current_step);
        setTotalSteps(data.total_steps);
        setNextChallenge(data.next_challenge);
        setInstruction(buildInstruction(data.next_challenge));
        setTimeLeft(data.timeout_seconds || 12);
        setRemainingAttempts(data.remaining_attempts || 3);
        setError(null);
        statusRef.current = STATUS.IDLE;
        setStatus(STATUS.IDLE);
        startCountdown();
        setTimeout(() => startCaptureLoop(), 500);
        return;
      }

      setError(data.error || 'Terjadi kesalahan. Coba lagi.');
      startCaptureLoop();

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Gagal mengirim frame');
      statusRef.current = STATUS.IDLE;
      setStatus(STATUS.IDLE);
      if (remainingAttempts > 1) {
        setTimeout(() => startCaptureLoop(), 1000);
      } else {
        setStatus(STATUS.FAILED);
        statusRef.current = STATUS.FAILED;
        // Kamera tetap hidup untuk retry
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus(STATUS.IDLE);
    statusRef.current = STATUS.IDLE;
    setIsCompleted(false);
    // Reset session
    const resetAndRestart = async () => {
      try {
        if (sessionIdRef.current) {
          const fd = new FormData();
          fd.append('session_id', sessionIdRef.current);
          await fetch(`${FASTAPI_API_URL}/api/liveness/reset`, { method: 'POST', body: fd });
        }
      } catch (e) {}
      await createSession();
    };
    resetAndRestart();
  };

  const handleCancel = () => {
    cleanup();
    if (sessionIdRef.current) {
      const fd = new FormData();
      fd.append('session_id', sessionIdRef.current);
      fetch(`${FASTAPI_API_URL}/api/liveness/reset`, { method: 'POST', body: fd }).catch(() => {});
    }
    onCancel();
  };

  const progressPercent = isCompleted ? 100 : Math.min(((currentStep - 1) / totalSteps) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={status === STATUS.SUCCESS || status === STATUS.FAILED}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">Verifikasi Keamanan</h2>
        <p className="text-sm text-gray-500 mb-4">Ikuti instruksi untuk verifikasi</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>Challenge {currentStep} dari {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-blue-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Video */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {status === STATUS.CAPTURING && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                📸 Mengambil frame...
              </div>
            </div>
          )}
          {status === STATUS.VERIFYING && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto mb-3" />
                <p className="text-white text-sm font-medium">Memverifikasi...</p>
              </div>
            </div>
          )}
          {status === STATUS.SUCCESS && (
            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">✅</div>
                <p className="text-white font-bold text-lg">Liveness Berhasil!</p>
              </div>
            </div>
          )}
          {status === STATUS.FAILED && (
            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">❌</div>
                <p className="text-white font-bold text-lg">Liveness Gagal!</p>
              </div>
            </div>
          )}
        </div>

        {/* Instruksi */}
        <div className={`rounded-xl p-4 mb-4 border-2 ${
          status === STATUS.SUCCESS ? 'bg-green-50 border-green-200' :
          status === STATUS.FAILED ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                {status === STATUS.CAPTURING ? 'Instruksi' :
                 status === STATUS.VERIFYING ? 'Memverifikasi...' :
                 status === STATUS.SUCCESS ? '✅ Selesai' :
                 status === STATUS.FAILED ? '❌ Gagal' :
                 'Instruksi'}
              </p>
              <p className="text-xl font-bold text-gray-800">
                {instruction || 'Memuat...'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Waktu</p>
              <p className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                {timeLeft}s
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            {status === STATUS.IDLE && (
              <button
                onClick={() => startCaptureLoop()}
                className="mt-2 text-sm text-red-600 font-semibold hover:underline"
              >
                Coba Lagi
              </button>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Percobaan tersisa: {remainingAttempts}</span>
          <span>{status === STATUS.CAPTURING ? '📸 Mengambil frame...' : status === STATUS.VERIFYING ? '⏳ Memverifikasi...' : '⏸️ Siap'}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {status === STATUS.SUCCESS && (
            <button
              onClick={() => onSuccess()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Lanjutkan
            </button>
          )}
          {status === STATUS.FAILED && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Mulai Ulang
            </button>
          )}
          {status !== STATUS.SUCCESS && status !== STATUS.FAILED && (
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}