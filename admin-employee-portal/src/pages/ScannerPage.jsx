import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function parseQrPayload(decodedText) {
  try {
    return JSON.parse(decodedText);
  } catch {
    return null;
  }
}

export default function ScannerPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [now, setNow] = useState(new Date());
  const cooldownRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ value: '', at: 0 });
  const resetTimerRef = useRef(null);
  const scannerRegionId = 'smartattend-qr-region';

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        setCameraError('');
        const scanner = new Html5Qrcode(scannerRegionId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            if (!mounted) return;
            handleScan(decodedText);
          },
          () => {}
        );

        if (mounted) setCameraReady(true);
      } catch (err) {
        const errMsg =
          err?.message || 'Unable to access camera. Please allow camera permission and refresh.';
        if (mounted) {
          setCameraReady(false);
          setCameraError(errMsg);
          setStatus('error');
          setMessage(errMsg);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear().catch(() => {});
          });
      }
    };
  }, []);

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 220);
    } catch (e) {
      // ignore audio errors
    }
  };

  const handleScan = async (result) => {
    if (!result) return;
    const data = typeof result === 'string' ? result : result?.text || null;
    if (!data) return;
    const parsedQr = parseQrPayload(data);
    const scannedEmployeeId = parsedQr?.employeeId || user?.employeeId || user?.id || '';

    if (cooldown) return; // prevent duplicate rapid scans

    const nowTs = Date.now();
    if (lastScanRef.current.value === data && nowTs - lastScanRef.current.at < 4000) {
      return;
    }
    lastScanRef.current = { value: data, at: nowTs };

    setCooldown(true);
    cooldownRef.current = setTimeout(() => setCooldown(false), 4000);

    setLoading(true);
    setScannedData(data);
    setMessage(null);
    setStatus(null);
    setAttendanceStatus(null);

    try {
      const payload = {
        employeeId: scannedEmployeeId,
        qrData: data,
        timestamp: new Date().toISOString(),
      };

      const res = await api.post('/attendance/scan', payload);

      const resp = res.data;

      setStatus(resp.status || 'success');
      setAttendanceStatus(
        resp.attendanceStatus || resp.status || (resp.isCheckOut ? 'check-out' : 'check-in')
      );
      setMessage(resp.message || 'Attendance recorded');

      playSuccessSound();
    } catch (err) {
      setStatus('error');
      setMessage(
        err?.response?.data?.message || 'Failed to record attendance. Please try again.'
      );
    } finally {
      setLoading(false);
      // auto reset card after 4s
      resetTimerRef.current = setTimeout(() => {
        setScannedData(null);
        setMessage(null);
        setStatus(null);
        setAttendanceStatus(null);
      }, 4500);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.06),transparent_40%),radial-gradient(circle_at_10%_20%,rgba(15,118,110,0.06),transparent_36%),#f7faf9]">
      <header className="fixed top-4 left-1/2 z-40 w-full max-w-6xl -translate-x-1/2 rounded-2xl bg-white/80 py-3 px-4 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">SA</div>
            <div>
              <div className="text-sm font-semibold">SmartAttend</div>
              <div className="text-xs text-slate-500">Employee QR Scanner</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium">{user?.name || user?.fullName || user?.email}</div>
              <div className="text-xs text-slate-500">{formatTime(now)} · {now.toLocaleDateString()}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium shadow-sm hover:scale-[1.02]"
            >
              <FiUser />
              <span className="hidden md:inline">Profile</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <FiLogOut />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-4 pt-28 pb-12">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="order-2 md:order-1">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-2 text-lg font-semibold text-slate-800">Scan QR to mark attendance</h2>
                <p className="mb-4 text-sm text-slate-500">Point your camera at the dynamic QR code provided at the entrance.</p>

                <div className="relative mx-auto max-w-md">
                  <div className="rounded-xl border border-slate-200 bg-black/5 p-2 shadow-inner">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-950">
                      <div id={scannerRegionId} className="h-full w-full" />
                      <div className="pointer-events-none absolute inset-0 m-auto h-full w-full">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 w-3/4 rounded-lg border-4 border-dashed border-white/60" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <div>{cameraReady ? 'Live camera • Scanning in real-time' : 'Starting camera...'}</div>
                    <div className="flex items-center gap-2">
                      {loading && <div className="h-3 w-3 animate-pulse rounded-full bg-teal-600" />}
                      {cooldown && <div className="text-xs text-slate-400">Cooldown</div>}
                    </div>
                  </div>
                  {cameraError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      {cameraError}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="order-1 md:order-2">
              <div className="sticky top-36 rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">Status</h3>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{status === 'error' ? 'Attention' : status ? status : 'Waiting'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{now.toLocaleDateString()}</div>
                    <div className="mt-1 text-sm font-medium text-slate-600">{formatTime(now)}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Employee</div>
                    <div className="mt-1 font-medium text-slate-800">{user?.name || user?.fullName || '—'}</div>
                    <div className="text-xs text-slate-400">ID: {user?.id || user?.employeeId || user?._id || '—'}</div>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                        <div className="text-sm text-slate-600">Processing scan...</div>
                      </div>
                    ) : message ? (
                      <div>
                        <div className={`mb-2 text-sm font-medium ${status === 'error' ? 'text-red-600' : 'text-teal-700'}`}>
                          {status === 'error' ? 'Error' : 'Success'}
                        </div>
                        {attendanceStatus && (
                          <div className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {attendanceStatus}
                          </div>
                        )}
                        <div className="text-sm text-slate-700">{message}</div>
                        {scannedData && (
                          <div className="mt-2 text-xs text-slate-400 break-all">{scannedData}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">No scans yet. Ready to scan.</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
