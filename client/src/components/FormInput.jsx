import { useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-10' : 'pr-4'} ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 focus:border-teal-500'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <HiEyeSlash className="h-5 w-5" />
            ) : (
              <HiEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

