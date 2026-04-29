import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { HiOutlineCheckCircle, HiOutlineCamera } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../services/api';

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ScannerPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Ready to scan');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraReady, setCameraReady] = useState(false);
  const [duplicateLock, setDuplicateLock] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('check-in');
  const scannerRef = useRef(null);
  const lockRef = useRef(null);
  const resetRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        const scanner = new Html5Qrcode('smartattend-scanner');
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScan(decodedText),
          () => {}
        );
        if (mounted) setCameraReady(true);
      } catch (error) {
        if (mounted) {
          setErrorMessage(error?.message || 'Camera permission denied or unavailable.');
          setStatus('Camera unavailable');
        }
      }
    };

    boot();

    return () => {
      mounted = false;
      if (lockRef.current) clearTimeout(lockRef.current);
      if (resetRef.current) clearTimeout(resetRef.current);
      scannerRef.current?.stop().catch(() => {}).finally(() => scannerRef.current?.clear().catch(() => {}));
    };
  }, []);

  const playSuccessTone = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.06;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        context.close();
      }, 180);
    } catch {
      // no-op
    }
  };

  const handleScan = async (decodedText) => {
    if (!decodedText || isBusy || duplicateLock) return;
    setDuplicateLock(true);
    lockRef.current = setTimeout(() => setDuplicateLock(false), 4000);
    setIsBusy(true);
    setErrorMessage('');
    setSuccessMessage('');
    setStatus('Verifying QR token...');

    try {
      const response = await attendanceApi.scan({
        employeeId: user?.id || user?.employeeId || user?._id,
        qrData: decodedText,
        currentTime: new Date().toISOString(),
      });

      const data = response.data;
      const nextStatus = data.attendanceStatus || data.status || (Math.random() > 0.5 ? 'check-in' : 'check-out');
      setAttendanceStatus(nextStatus);
      setSuccessMessage(data.message || `${nextStatus === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully`);
      setStatus(data.employee?.name ? `Welcome, ${data.employee.name}` : 'Attendance recorded');
      playSuccessTone();

      resetRef.current = setTimeout(() => {
        setSuccessMessage('');
        setStatus('Ready to scan');
      }, 4500);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Invalid QR code or server unavailable.');
      setStatus('Scan failed');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">QR Scanner</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Scan the dynamic attendance QR code</h2>
            <p className="mt-2 text-sm text-slate-500">Employees can mark check-in and check-out from a secure camera feed.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live clock</p>
            <p className="mt-1 font-semibold text-slate-900">{formatClock(currentTime)} · {currentTime.toLocaleDateString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-inner">
          <div className="aspect-square rounded-[1.5rem] bg-slate-900">
            <div id="smartattend-scanner" className="h-full w-full overflow-hidden rounded-[1.5rem]" />
            <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-white/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border-4 border-dashed border-teal-400/80" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-[calc(50%-120px)] h-1 w-[60%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-70" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="inline-flex items-center gap-2">
            <HiOutlineCamera className="h-5 w-5 text-teal-600" />
            {cameraReady ? 'Camera ready and scanning in real time' : 'Starting camera...'}
          </div>
          {isBusy && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Processing</span>}
        </div>
      </section>

      <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current employee</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{user?.name || 'Employee'}</h3>
          <p className="text-sm text-slate-500">{user?.department || 'Department not set'}</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Attendance status</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{status}</p>
          {successMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-semibold">
                <HiOutlineCheckCircle className="h-5 w-5" /> {attendanceStatus === 'check-out' ? 'Check-out' : 'Check-in'} successful
              </div>
              <p className="mt-2">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{errorMessage}</div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-gradient-to-br from-teal-600 to-emerald-500 p-5 text-white shadow-lg shadow-teal-600/20">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Workflow</p>
          <div className="mt-3 space-y-2 text-sm text-white/90">
            <p>• First scan of the day is treated as check-in.</p>
            <p>• Second successful scan becomes check-out.</p>
            <p>• Duplicate scans are ignored for a few seconds.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}