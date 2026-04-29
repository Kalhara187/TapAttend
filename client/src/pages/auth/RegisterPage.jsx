import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import AuthForm from '../../components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create a SmartAttend account"
      subtitle="Register employees or administrators with role-based onboarding."
      points={[
        'Assign department, role, and secure credentials in one workflow.',
        'Validation, matching passwords, and production-ready form states are included.',
        'Built to feel like a real SaaS HR admin panel instead of a simple demo form.',
      ]}
    >
      <AuthForm mode="register" />
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have access?{' '}
        <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-600">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}