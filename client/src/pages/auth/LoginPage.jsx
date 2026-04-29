import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import AuthForm from '../../components/auth/AuthForm';

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to SmartAttend"
      subtitle="Access the HR-style attendance workspace with secure JWT authentication."
      points={[
        'Admins get dashboards, employee management, QR generation, reports, and leave approvals.',
        'Employees can scan QR codes, view their attendance history, and apply for leave.',
        'Responsive glassmorphism UI with a clean SaaS layout optimized for desktop and mobile.',
      ]}
    >
      <AuthForm mode="login" />
      <p className="mt-5 text-center text-sm text-slate-500">
        New to SmartAttend?{' '}
        <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-600">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}