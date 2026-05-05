import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import QRCodeReact from 'react-qr-code';
import {
  HiArrowPath,
  HiArrowDownTray,
  HiClock,
  HiClipboardDocumentList,
  HiDocumentDuplicate,
  HiEnvelope,
  HiMapPin,
  HiOutlinePrinter,
  HiQrCode,
  HiShieldCheck,
  HiUser,
  HiUsers,
  HiBuildingOffice2,
  HiIdentification,
} from 'react-icons/hi2';
import { qrApi } from '../../services/api';

const ATTENDANCE_TYPES = ['Check-In', 'Check-Out'];
const DEFAULT_FORM = {
  employeeId: 'EMP001',
  fullName: 'Nimal Perera',
  email: 'nimal@gmail.com',
  department: 'IT',
  location: 'Colombo Office',
  role: 'Employee',
  expirationMinutes: 5,
  attendanceType: 'Check-In',
};

const inputBase =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function Field({ id, label, icon: Icon, error, children, ...props }) {
  return (
    <label className="space-y-1.5" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /> : null}
        {children ?? (
          <input id={id} className={`${inputBase} ${Icon ? 'pl-12' : ''}`} {...props} />
        )}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  );
}

function statusClass(status) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'revoked':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  }
}

export default function QrGeneratorPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [qrData, setQrData] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copyLabel, setCopyLabel] = useState('Copy QR data');
  const generatingRef = useRef(false);
  const latestFormRef = useRef(formData);

  useEffect(() => {
    latestFormRef.current = formData;
  }, [formData]);

  const countdownLabel = useMemo(() => {
    if (!activeQr) return '00:00';
    return formatCountdown(countdown);
  }, [activeQr, countdown]);

  const validate = () => {
    const nextErrors = {};

    if (!formData.employeeId.trim()) nextErrors.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email';
    if (!formData.department.trim()) nextErrors.department = 'Department is required';
    if (!formData.location.trim()) nextErrors.location = 'Location is required';
    if (!formData.role.trim()) nextErrors.role = 'Role is required';
    if (!Number.isFinite(Number(formData.expirationMinutes)) || Number(formData.expirationMinutes) < 1) {
      nextErrors.expirationMinutes = 'Use at least 1 minute';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await qrApi.history();
      if (response.data?.success) {
        setHistory(response.data.history || []);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    if (!activeQr?.expiresAt) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(activeQr.expiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        setActiveQr((current) => (current ? { ...current, status: 'expired' } : current));
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [activeQr?.expiresAt]);

  useEffect(() => {
    if (!autoRefresh || !activeQr || countdown > 0 || generatingRef.current) return undefined;

    const timeout = window.setTimeout(() => {
      void handleGenerate(true);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [autoRefresh, activeQr, countdown]);

  const buildPayload = (overrides = {}) => ({
    employeeId: formData.employeeId.trim(),
    fullName: formData.fullName.trim(),
    email: formData.email.trim(),
    department: formData.department.trim(),
    location: formData.location.trim(),
    role: formData.role.trim(),
    attendanceType: formData.attendanceType,
    expirationMinutes: Number(formData.expirationMinutes),
    ...overrides,
  });

  const renderQr = async (value) => {
    const dataUrl = await QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 420,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    setQrImage(dataUrl);
  };

  const handleGenerate = async (isAutoRefresh = false) => {
    if (!isAutoRefresh && !validate()) return;

    generatingRef.current = true;
    setSubmitting(true);

    try {
      const payload = buildPayload();
      const response = await qrApi.generate(payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to generate QR code');
      }

      const nextQr = response.data.qr;
      const nextQrData = response.data.qrData || JSON.stringify(nextQr);

      setActiveQr(nextQr);
      setQrData(nextQrData);
      await renderQr(nextQrData);
      await loadHistory();
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Unable to generate QR code';
      setErrors((current) => ({ ...current, submit: message }));
    } finally {
      setSubmitting(false);
      generatingRef.current = false;
    }
  };

  const copyQrData = async () => {
    if (!qrData) return;
    await navigator.clipboard.writeText(qrData);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy QR data'), 1500);
  };

  const downloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `smartattend-${activeQr?.employeeId || 'qr'}.png`;
    link.click();
  };

  const printQr = () => {
    if (!qrImage || !activeQr) return;

    const win = window.open('', '_blank', 'width=900,height=900');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>SmartAttend QR</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            .card { max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 24px; }
            img { width: 100%; max-width: 360px; display: block; margin: 24px auto; }
            .muted { color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>SmartAttend Attendance QR</h1>
            <p class="muted">Employee: ${activeQr.employeeName || activeQr.name}</p>
            <img src="${qrImage}" alt="SmartAttend QR" />
            <pre>${qrData.replace(/</g, '&lt;')}</pre>
          </div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const previewPayload = activeQr
    ? qrData
    : JSON.stringify(
        buildPayload({
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + Number(formData.expirationMinutes) * 60000).toISOString(),
          token: 'preview-token',
        }),
        null,
        2
      );

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal-700">SmartAttend QR Generator</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Generate a secure, time-bound attendance QR for a specific employee.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Create a signed QR payload with employee details, expiry, and a one-time token. The current QR auto-refreshes when it expires, while the backend keeps a complete generation history.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px] lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-900 px-4 py-3 text-white shadow-lg shadow-slate-900/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Status</p>
              <p className="mt-1 text-sm font-semibold">{activeQr ? activeQr.status : 'Ready to generate'}</p>
            </div>
            <div className="rounded-3xl bg-teal-50 px-4 py-3 text-teal-900 ring-1 ring-teal-200/80">
              <p className="text-[11px] uppercase tracking-[0.2em] text-teal-700">Expires in</p>
              <p className="mt-1 text-sm font-bold">{countdownLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <HiArrowPath className="h-5 w-5 animate-spin" /> : <HiQrCode className="h-5 w-5" />}
              {submitting ? 'Generating...' : 'Generate QR'}
            </button>
          </div>
        </div>
      </motion.section>

      {errors.submit ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errors.submit}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Employee QR Details</h3>
              <p className="text-sm text-slate-500">Populate the employee and attendance details used in the QR payload.</p>
            </div>
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600"
              />
              Auto refresh
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="employeeId"
              label="Employee ID"
              icon={HiIdentification}
              value={formData.employeeId}
              onChange={(event) => setFormData((prev) => ({ ...prev, employeeId: event.target.value }))}
              error={errors.employeeId}
              placeholder="EMP001"
            />
            <Field
              id="fullName"
              label="Full Name"
              icon={HiUser}
              value={formData.fullName}
              onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
              error={errors.fullName}
              placeholder="Nimal Perera"
            />
            <Field
              id="email"
              label="Email"
              icon={HiEnvelope}
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              error={errors.email}
              placeholder="nimal@gmail.com"
            />
            <Field
              id="department"
              label="Department"
              icon={HiUsers}
              value={formData.department}
              onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
              error={errors.department}
              placeholder="IT"
            />
            <Field
              id="location"
              label="Office Address / Location"
              icon={HiMapPin}
              value={formData.location}
              onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
              error={errors.location}
              placeholder="Colombo Office"
            />
            <Field
              id="role"
              label="Role"
              icon={HiShieldCheck}
              value={formData.role}
              onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
              error={errors.role}
            >
              <select
                id="role"
                value={formData.role}
                onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                className={inputBase}
              >
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </Field>
            <Field
              id="expirationMinutes"
              label="QR Expiration Time (minutes)"
              icon={HiClock}
              type="number"
              min="1"
              max="60"
              value={formData.expirationMinutes}
              onChange={(event) => setFormData((prev) => ({ ...prev, expirationMinutes: event.target.value }))}
              error={errors.expirationMinutes}
              placeholder="5"
            />
            <Field
              id="attendanceType"
              label="Attendance Type"
              icon={HiClipboardDocumentList}
              error={errors.attendanceType}
            >
              <select
                id="attendanceType"
                value={formData.attendanceType}
                onChange={(event) => setFormData((prev) => ({ ...prev, attendanceType: event.target.value }))}
                className={inputBase}
              >
                {ATTENDANCE_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <HiQrCode className="h-5 w-5" />
              Generate QR
            </button>
            <button
              type="button"
              onClick={() => void handleGenerate(false)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            >
              <HiArrowPath className="h-5 w-5" />
              Refresh Now
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Live QR Preview</h3>
              <p className="text-sm text-slate-500">This QR contains the encrypted attendance payload returned from the API.</p>
            </div>
            <div className={`rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${statusClass(activeQr?.status || 'idle')}`}>
              {activeQr?.status || 'Idle'}
            </div>
          </div>

          <div className="mt-6 flex min-h-[360px] items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/80 p-6">
            {qrImage ? (
              <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5">
                <div className="flex justify-center rounded-[1.5rem] bg-white p-3">
                  <QRCodeReact
                    value={qrData || previewPayload}
                    size={256}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    className="h-auto w-full max-w-[260px]"
                  />
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Token</p>
                    <p className="mt-1 break-all font-medium text-slate-900">{activeQr?.token || 'Waiting for generation'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires</p>
                    <p className="mt-1 font-medium text-slate-900">{formatDateTime(activeQr?.expiresAt)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <HiQrCode className="mx-auto h-20 w-20 text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-slate-700">Generate a QR to preview it here.</p>
                <p className="mt-1 text-sm text-slate-500">The payload will include employee details, timestamps, and a secure token.</p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={downloadQr}
              disabled={!qrImage}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiArrowDownTray className="h-5 w-5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={printQr}
              disabled={!qrImage}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              Print QR
            </button>
            <button
              type="button"
              onClick={() => void copyQrData()}
              disabled={!qrData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiDocumentDuplicate className="h-5 w-5" />
              {copyLabel}
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-4 text-sm text-slate-100">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">QR Payload</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">JSON</p>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950/70 p-4 text-xs leading-6 text-slate-200">
{previewPayload}
            </pre>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">QR Generation History</h3>
            <p className="text-sm text-slate-500">Latest 50 QR records stored by the backend.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadHistory()}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
          >
            <HiArrowPath className="h-4 w-4" />
            Reload history
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-4">Employee Name</th>
                  <th className="px-4 py-4">Employee ID</th>
                  <th className="px-4 py-4">Generated Time</th>
                  <th className="px-4 py-4">Expiration Time</th>
                  <th className="px-4 py-4">Attendance Type</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {historyLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Loading QR history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      No QR history yet. Generate the first QR to see records here.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-4 text-slate-600">{item.employeeId}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(item.generatedAt)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(item.expiresAt)}</td>
                      <td className="px-4 py-4 text-slate-600">{item.attendanceType}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </div>
  );
}