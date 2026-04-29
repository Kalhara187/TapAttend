import { useEffect, useMemo, useState } from 'react';
import { HiArrowDownTray, HiQrCode } from 'react-icons/hi2';
import QRCode from 'qrcode';

function generateToken() {
  const random = crypto.getRandomValues(new Uint32Array(2)).join('-');
  return `SMARTATTEND-${Date.now()}-${random}`;
}

export default function QrGeneratorPage() {
  const [token, setToken] = useState(generateToken());
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [qrUrl, setQrUrl] = useState('');

  const payload = useMemo(() => JSON.stringify({ token, validForSeconds: 180, scope: 'attendance' }), [token]);

  useEffect(() => {
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then(setQrUrl);
  }, [payload]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setToken(generateToken());
          return 180;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const downloadQr = async () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'smartattend-qr.png';
    link.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="glass-card rounded-[2rem] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">QR Generator</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Generate a secure, time-bound QR code for attendance.</h2>
        <p className="mt-2 text-sm text-slate-500">A fresh token is created automatically and expires every 3 minutes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="mx-auto flex aspect-square max-w-md items-center justify-center rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            {qrUrl ? <img src={qrUrl} alt="SmartAttend QR" className="h-full w-full max-w-sm object-contain" /> : <HiQrCode className="h-24 w-24 text-slate-300" />}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires in</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</p>
            </div>
            <button onClick={downloadQr} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
              <HiArrowDownTray className="h-5 w-5" /> Download
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Token</p>
            <p className="mt-2 break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{token}</p>
          </div>
          <div className="rounded-2xl bg-teal-50 px-4 py-4 text-sm text-teal-800">
            The QR token can be sent to the backend from `POST /api/qr/generate` and validated on scan.
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Auto refresh, token expiry, and download support are included so this page fits a real attendance kiosk workflow.
          </div>
        </div>
      </div>
    </div>
  );
}