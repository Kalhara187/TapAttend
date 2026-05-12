import { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_CHANNEL_NAME = 'smartattend-auth';

export default function QRScanner() {
  const [scanner, setScanner] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [token, setToken] = useState(() => {
    // Try to get token from scanner-specific storage first
    let savedToken = sessionStorage.getItem('smartattend_scanner_token') || localStorage.getItem('smartattend_scanner_token');
    if (savedToken) return savedToken;
    
    // Try role-specific employee token
    const employeeToken = sessionStorage.getItem('smartattend_employee_token') || localStorage.getItem('smartattend_employee_token');
    if (employeeToken) return employeeToken;
    
    // Try role-specific admin token (for testing)
    const adminToken = sessionStorage.getItem('smartattend_admin_token') || localStorage.getItem('smartattend_admin_token');
    if (adminToken) return adminToken;
    
    // Fall back to main app token (legacy support)
    const mainAppToken = sessionStorage.getItem('smartattend_token') || localStorage.getItem('smartattend_token');
    if (mainAppToken) return mainAppToken;
    
    return '';
  });
  const [cameraStarted, setCameraStarted] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastScan, setLastScan] = useState('No scans yet.');
  const [loading, setLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [fileInput, setFileInput] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [user, setUser] = useState(null);

  const applyAuthState = (role, authToken, authUser) => {
    if (role !== 'employee' || !authToken || !authUser) return false;

    setToken(authToken);
    setUser(authUser);
    sessionStorage.setItem('smartattend_scanner_token', authToken);
    sessionStorage.setItem('smartattend_employee_token', authToken);
    sessionStorage.setItem('smartattend_employee_user', JSON.stringify(authUser));
    verifyToken(authToken);
    return true;
  };

  const requestAuthState = () => {
    const directEmployeeToken = sessionStorage.getItem('smartattend_employee_token') || localStorage.getItem('smartattend_employee_token');
    const directEmployeeUserJson = sessionStorage.getItem('smartattend_employee_user') || localStorage.getItem('smartattend_employee_user');

    if (directEmployeeToken && directEmployeeUserJson) {
      try {
        const directEmployeeUser = JSON.parse(directEmployeeUserJson);
        applyAuthState('employee', directEmployeeToken, directEmployeeUser);
        return;
      } catch {
        // fall through to request current session from an open tab
      }
    }

    if (window.opener && !window.opener.closed) {
      // Allow cross-origin opener windows (different ports/origins)
      window.opener.postMessage({ type: 'request-auth-state', role: 'employee' }, '*');
    }

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage({ type: 'request-auth-state', role: 'employee' });
      channel.close();
    }
  };

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

    handleScan(decodedText);
  };

  const onScanFailure = () => {
    // Ignore transient failures
  };

  const handleScan = async (qrData) => {
    if (loading) return;
    
    if (!token.trim()) {
      showAlert('❌ Token required. Please log in to the employee portal first, or paste your JWT token.', 'error');
      updateLastScan(`ERROR - ${new Date().toLocaleTimeString()}\nMissing or invalid JWT token`);
      return;
    }

    if (!user) {
      showAlert('❌ Token validation failed. Click "Verify Token" or log in again.', 'error');
      updateLastScan(`ERROR - ${new Date().toLocaleTimeString()}\nToken validation failed`);
      return;
    }
    
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

      const msg = response.data?.message || 'Attendance recorded successfully';
      showAlert(`✓ ${msg}`, 'success');
      setScanCount(prev => prev + 1);
      
      // Update last scan with response details
      updateLastScan(`SUCCESS - ${new Date().toLocaleTimeString()}\n${msg}\nType: ${response.data?.type || 'unknown'}`);
    } catch (error) {
      let msg = 'Scan failed';
      
      if (error.response?.status === 401) {
        msg = 'Unauthorized: Token expired or invalid';
        // Clear stored tokens and request fresh auth from portal
        setToken('');
        setUser(null);
        sessionStorage.removeItem('smartattend_scanner_token');
        sessionStorage.removeItem('smartattend_employee_token');
        localStorage.removeItem('smartattend_scanner_token');
        localStorage.removeItem('smartattend_employee_token');
        requestAuthState();
      } else if (error.response?.status === 403) {
        msg = 'Access denied: Only employees can scan attendance';
      } else if (error.response?.status === 400) {
        msg = error.response.data?.message || 'Invalid QR code or code expired';
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else {
        msg = error.message || 'Scan failed';
      }
      
      showAlert(`✗ ${msg}`, 'error');
      updateLastScan(`ERROR - ${new Date().toLocaleTimeString()}\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('Please upload a PNG, JPG, or JPEG image.', 'error');
      setSelectedImagePreview('');
      setSelectedImageName('');
      if (fileInput) {
        fileInput.value = '';
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return previewUrl;
    });
    setSelectedImageName(file.name);

    if (!token.trim()) {
      showAlert('❌ Token required. Please log in to the employee portal first, or paste your JWT token.', 'error');
      if (fileInput) {
        fileInput.value = '';
      }
      return;
    }

    if (!user) {
      showAlert('❌ Token validation failed. Click "Verify Token" or log in again.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Use Html5Qrcode to read the image file
      const decodedText = await Html5Qrcode.scanFile(file, true);
      
      // Process the decoded QR code
      try {
        const parsed = JSON.parse(decodedText);
        updateLastScan(JSON.stringify(parsed, null, 2));
      } catch {
        updateLastScan(decodedText);
      }

      // Send to backend
      await handleScan(decodedText);
    } catch (error) {
      const rawMessage = error?.message || 'Failed to read QR code from image';
      const msg = /not found|decode|qr code/i.test(rawMessage)
        ? 'No QR code could be detected in the uploaded image.'
        : rawMessage;
      showAlert(`✗ ${msg}`, 'error');
      updateLastScan(`ERROR - ${new Date().toLocaleTimeString()}\nFailed to read image: ${msg}`);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const clearSelectedImage = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImagePreview('');
    setSelectedImageName('');
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
      sessionStorage.setItem('smartattend_scanner_token', token);
      // Verify token is valid by fetching user info
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(AUTH_CHANNEL_NAME) : null;

    const handleAuthMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== 'auth-state') return;
      applyAuthState(data.role, data.token, data.user);
    };

    window.addEventListener('message', handleAuthMessage);
    if (channel) {
      channel.addEventListener('message', handleAuthMessage);
    }

    requestAuthState();

    return () => {
      window.removeEventListener('message', handleAuthMessage);
      if (channel) {
        channel.removeEventListener('message', handleAuthMessage);
        channel.close();
      }
    };
  }, []);

  const verifyToken = async () => {
    if (!token.trim()) {
      setUser(null);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.user) {
        setUser(response.data.user);
        showAlert(`✓ Logged in as ${response.data.user.name}`, 'success');
      }
    } catch (error) {
      setUser(null);
      const status = error.response?.status;
      if (status === 401) {
        showAlert('Token expired. Please log in again.', 'error');
        // Clear stored tokens to avoid repeat failures and prompt portal to provide a fresh token
        setToken('');
        sessionStorage.removeItem('smartattend_scanner_token');
        sessionStorage.removeItem('smartattend_employee_token');
        localStorage.removeItem('smartattend_scanner_token');
        localStorage.removeItem('smartattend_employee_token');
        setUser(null);
        // Ask any open portal tab to send a fresh auth-state
        requestAuthState();
      } else if (status === 403) {
        showAlert('Access denied. Only employees can use the scanner.', 'error');
      } else {
        console.error('Token verification error:', error.message);
      }
    }
  };

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
            {user && (
              <p className="mt-2 text-sm text-emerald-400">✓ Logged in as {user.name} ({user.role})</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-mono text-slate-300" id="liveClock">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="mt-1 text-sm text-slate-400">Scans: {scanCount}</div>
            {user && <div className="mt-1 text-sm text-emerald-400">Employee ID: {user.employeeId || user.employee_id || '-'}</div>}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Camera Section */}
          <div className="lg:col-span-3">
            <div
              id="reader"
              className="mb-4 h-96 rounded-2xl border-2 border-slate-600 bg-black shadow-lg flex items-center justify-center"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <p className="text-slate-400">Camera will appear here</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={startCamera}
                disabled={loading}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Camera
              </button>
              <button
                onClick={stopCamera}
                disabled={loading}
                className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop
              </button>
              <button
                onClick={toggleTorch}
                disabled={loading || !cameraStarted}
                className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {torchOn ? '🔦 Torch On' : '🔦 Torch Off'}
              </button>
            </div>

            {/* Image Upload Section */}
            <div className="mb-4 rounded-lg border border-slate-600 bg-slate-900/50 p-4">
              <h3 className="mb-3 font-semibold text-white">Or upload a QR image</h3>
              <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/30 px-4 py-6 transition-colors hover:border-cyan-500 hover:bg-slate-900/50">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300">📷 Click to upload QR image (PNG/JPG/JPEG)</p>
                  <p className="mt-1 text-xs text-slate-500">or drag and drop</p>
                </div>
                <input
                  ref={(el) => setFileInput(el)}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="hidden"
                />
              </label>
              {selectedImagePreview && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                  <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
                    <span>{selectedImageName || 'Selected image'}</span>
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      Clear preview
                    </button>
                  </div>
                  <img
                    src={selectedImagePreview}
                    alt="Uploaded QR preview"
                    className="max-h-64 w-full bg-black object-contain"
                  />
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="mt-4 space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold border ${
                    alert.type === 'success'
                      ? 'border-emerald-600 bg-emerald-900/30 text-emerald-200'
                      : 'border-red-600 bg-red-900/30 text-red-200'
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

              {user ? (
                <div className="mb-3 rounded-lg border border-emerald-600 bg-emerald-900/30 p-3">
                  <p className="text-xs text-emerald-400">✓ Authenticated</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">{user.name}</p>
                  <p className="text-xs text-emerald-400">{user.email}</p>
                </div>
              ) : (
                <div className="mb-3 rounded-lg border border-red-600 bg-red-900/30 p-3">
                  <p className="text-xs text-red-400">✗ Not Authenticated</p>
                  <p className="mt-1 text-xs text-red-300">Please verify your token</p>
                </div>
              )}

              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token auto-loaded from login (or paste JWT token here)"
                className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                rows={3}
              />

              <div className="grid gap-2">
                <button
                  onClick={verifyToken}
                  disabled={!token.trim()}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Verify Token
                </button>
                <button
                  onClick={() => {
                    setToken('');
                    setUser(null);
                    sessionStorage.removeItem('smartattend_scanner_token');
                    localStorage.removeItem('smartattend_scanner_token');
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-transparent px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Clear Token
                </button>
              </div>

              {/* Last Scan */}
              <hr className="my-4 border-slate-700" />

              <h3 className="mb-3 font-bold text-white">Last Scan</h3>
              <pre
                className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-cyan-300"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
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
