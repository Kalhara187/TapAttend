import AuthShell from '../../components/auth/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Admin controlled"
      title="Employee accounts are created by admins"
      subtitle="SmartAttend uses admin-managed onboarding for employee access."
      points={[
        'Use the Employee Management page to create usernames, passwords, and QR codes.',
        'Employees can then log in with the credentials provided by admin.',
        'This keeps account creation centralized and secure.',
      ]}
    >
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
        Accounts are provisioned by the admin panel. Please sign in with your assigned username and password.
      </div>
    </AuthShell>
  );
}