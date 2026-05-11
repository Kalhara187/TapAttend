import { motion } from 'framer-motion';

export default function AuthShell({ eyebrow, title, subtitle, points, children }) {
  return (
    <div className="page-surface grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden overflow-hidden border-r border-white/20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_30%),linear-gradient(135deg,#0f172a_0%,#0f766e_45%,#14b8a6_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-teal-700">SA</div>
            <div>
              <p className="text-sm font-semibold">SmartAttend</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">QR Attendance Management</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-xl text-5xl font-black leading-[1.02] tracking-tight">
            Attendance operations that feel like a modern HR platform.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
            Secure QR workflows, real-time employee tracking, role-based dashboards, and polished reporting in one responsive system.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/85">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <p>{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28 }}
          className="glass-card w-full max-w-2xl rounded-[2rem] p-5 sm:p-7 lg:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{subtitle}</p>
            </div>
          </div>
          {children}
        </motion.div>
      </section>
    </div>
  );
}