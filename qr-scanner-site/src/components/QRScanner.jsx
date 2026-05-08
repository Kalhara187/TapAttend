import { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function QRScanner() {
  const [scanner, setScanner] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartattend_scanner_token') || '');
  const [cameraStarted, setCameraStarted] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastScan, setLastScan] = useState('No scans yet.');
  const [loading, setLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const showAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 6000);
  };

  const updateLastScan = (text) => {
    setLastScan(text);
  };

  const startCamera = async () => {
    if (cameraStarted) return;
    try {
      const html5Scanner = new Html5Qrcode('reader');
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        showAlert('No camera found', 'error');
        return;
      }

      await html5Scanner.start(
        devices[0].id,
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        onScanFailure
      );

      setScanner(html5Scanner);
      setCameraStarted(true);
      showAlert('Camera started', 'success');
    } catch (error) {
      showAlert('Camera start error: ' + error.message, 'error');
    }
  };

  const stopCamera = async () => {
    if (!scanner) return;
    try {
      await scanner.stop();
      await scanner.clear();
      setScanner(null);
      setCameraStarted(false);
      setTorchOn(false);
      showAlert('Camera stopped', 'success');
    } catch (error) {
      showAlert('Stop error: ' + error.message, 'error');
    }
  };

  const onScanSuccess = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      updateLastScan(JSON.stringify(parsed, null, 2));
    } catch {
      updateLastScan(decodedText);
    }

    if (!token.trim()) {
      showAlert('Missing JWT token. Paste it in the Authorization box.', 'error');
      return;
    }

    handleScan(decodedText);
  };

  const onScanFailure = () => {
    // Ignore transient failures
  };

  const handleScan = async (qrData) => {
    setLoading(true);
    try {
      const payload = { qrData };

      // Try to extract employeeId if available
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.employeeId) {
          payload.employeeId = parsed.employeeId;
        }
      } catch {}

      const response = await axios.post(`${API_BASE_URL}/attendance/scan`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert(response.data?.message || 'Attendance recorded', 'success');
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Scan failed';
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTorch = async () => {
    if (!scanner || !cameraStarted) {
      showAlert('Camera not started', 'error');
      return;
    }

    try {
      const track = scanner._oStreamingMediaTrack;
      if (!track) {
        showAlert('Torch not available', 'error');
        return;
      }

      const imageCapture = new ImageCapture(track);
      const capabilities = await imageCapture.getPhotoCapabilities();
      if (!capabilities.torch) {
        showAlert('Torch not supported', 'error');
        return;
      }

      const newTorchState = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: newTorchState }] });
      setTorchOn(newTorchState);
      showAlert('Torch ' + (newTorchState ? 'on' : 'off'), 'success');
    } catch (error) {
      showAlert('Torch toggle failed', 'error');
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('smartattend_scanner_token', token);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (scanner && cameraStarted) {
        scanner.stop();
      }
    };
  }, [scanner, cameraStarted]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">QR Attendance Scan</h1>
            <p className="mt-1 text-sm text-slate-400">Fast, mobile-friendly scanner for employees</p>
          </div>
          <div className="text-lg font-mono text-slate-300" id="liveClock">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Camera Section */}
          <div className="lg:col-span-3">
            <div
              id="reader"
              className="mb-4 h-96 rounded-2xl border-2 border-slate-600 bg-black shadow-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <p className="text-slate-400">Camera will appear here</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={startCamera}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
              >
                Start Camera
              </button>
              <button
                onClick={stopCamera}
                className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
              >
                Stop
              </button>
              <button
                onClick={toggleTorch}
                className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
              >
                Toggle Torch
              </button>
            </div>

            {/* Alerts */}
            <div className="mt-4 space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    alert.type === 'success'
                      ? 'border border-emerald-600 bg-emerald-900/30 text-emerald-200'
                      : 'border border-red-600 bg-red-900/30 text-red-200'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Authorization */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
              <h3 className="mb-3 font-bold text-white">Authorization</h3>

              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste JWT token here (required)"
                className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                rows={4}
              />

              <button
                onClick={() => {
                  setToken('');
                  localStorage.removeItem('smartattend_scanner_token');
                }}
                className="w-full rounded-lg border border-slate-600 bg-transparent px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                Clear Token
              </button>

              {/* Last Scan */}
              <hr className="my-4 border-slate-700" />

              <h3 className="mb-3 font-bold text-white">Last Scan</h3>
              <pre
                className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-cyan-300"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {lastScan}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
