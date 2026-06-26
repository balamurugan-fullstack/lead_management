import { type FormEventHandler, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getErrorMessage } from '../utils/error';
import StatusBanner from '../components/StatusBanner';

type FormState = {
  name: string;
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type ResetErrors = {
  email?: string;
  token?: string;
  password?: string;
};

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetErrors, setResetErrors] = useState<ResetErrors>({});
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 3000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (isRegister && form.name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setBanner(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, form);
      login(response.data.token);
      setBanner({ type: 'success', message: isRegister ? 'Account created successfully.' : 'Signed in successfully.' });
      window.setTimeout(() => navigate('/'), 400);
    } catch (error) {
      const message = getErrorMessage(error, 'Authentication failed');
      setBanner({ type: 'error', message: message === 'Validation failed' ? 'Please check the form details and try again.' : message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const nextErrors: ResetErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    setResetErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsResetting(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      setBanner({ type: 'success', message: response.data.message || 'Password reset instructions sent.' });
      setShowForgotPassword(false);
      setResetRequested(true);
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to process password reset');
      setBanner({ type: 'error', message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const nextErrors: ResetErrors = {};

    if (!resetToken.trim()) {
      nextErrors.token = 'Please enter the reset code.';
    }

    if (newPassword.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setResetErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsResetting(true);

    try {
      const response = await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
      setBanner({ type: 'success', message: response.data.message || 'Password updated successfully.' });
      setResetEmail('');
      setResetToken('');
      setNewPassword('');
      setShowForgotPassword(false);
      setResetRequested(false);
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to reset password');
      setBanner({ type: 'error', message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">

      <h1 className="text-3xl font-extrabold text-white mb-6">
        Leads Management System
      </h1>

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold">{showForgotPassword ? 'Reset password' : isRegister ? 'Create account' : 'Sign in'}</h1>
        <p className="mt-2 text-sm text-slate-400">Manage leads with a polished full-stack workflow.</p>
        {banner && <div className="mt-4"><StatusBanner type={banner.type} message={banner.message} onDismiss={() => setBanner(null)} /></div>}
        {showForgotPassword ? (
          <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
            <div>
              <input
                className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${resetErrors.email ? 'border-rose-400' : 'border-slate-700'}`}
                placeholder="Email"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (resetErrors.email) setResetErrors((current) => ({ ...current, email: undefined }));
                }}
              />
              {resetErrors.email && <p className="mt-1 text-sm text-rose-400">{resetErrors.email}</p>}
            </div>
            <button className="w-full cursor-pointer rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isResetting}>
              {isResetting ? 'Please wait...' : 'Send reset code'}
            </button>
            <button className="w-full cursor-pointer text-sm text-cyan-400" type="button" onClick={() => { setShowForgotPassword(false); setResetRequested(false); setResetEmail(''); setResetToken(''); setNewPassword(''); setResetErrors({}); setBanner(null); }}>
              Back to sign in
            </button>
          </form>
        ) : resetRequested ? (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <div>
              <input
                className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${resetErrors.token ? 'border-rose-400' : 'border-slate-700'}`}
                placeholder="Reset code"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  if (resetErrors.token) setResetErrors((current) => ({ ...current, token: undefined }));
                }}
              />
              {resetErrors.token && <p className="mt-1 text-sm text-rose-400">{resetErrors.token}</p>}
            </div>
            <div>
              <input
                className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${resetErrors.password ? 'border-rose-400' : 'border-slate-700'}`}
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (resetErrors.password) setResetErrors((current) => ({ ...current, password: undefined }));
                }}
              />
              {resetErrors.password && <p className="mt-1 text-sm text-rose-400">{resetErrors.password}</p>}
            </div>
            <button className="w-full cursor-pointer rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isResetting}>
              {isResetting ? 'Please wait...' : 'Update password'}
            </button>
            <button className="w-full cursor-pointer text-sm text-cyan-400" type="button" onClick={() => { setResetRequested(false); setResetToken(''); setNewPassword(''); setResetErrors({}); setBanner(null); }}>
              Use a different email
            </button>
          </form>
        ) : (
          <>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <div>
                  <input
                    className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${errors.name ? 'border-rose-400' : 'border-slate-700'}`}
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                    }}
                  />
                  {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name}</p>}
                </div>
              )}
              <div>
                <input
                  className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${errors.email ? 'border-rose-400' : 'border-slate-700'}`}
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
                {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email}</p>}
              </div>
              <div>
                <input
                  className={`w-full rounded-lg border bg-slate-800 px-3 py-2 outline-none ${errors.password ? 'border-rose-400' : 'border-slate-700'}`}
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                  }}
                />
                {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password}</p>}
              </div>
              <button className="w-full cursor-pointer rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
              </button>
            </form>
            {!isRegister && (
              <button
                className="mt-4 cursor-pointer text-sm text-cyan-400"
                onClick={() => {
                  setShowForgotPassword(true);
                  setResetRequested(false);
                  setBanner(null);
                  setResetErrors({});
                }}
              >
                Forgot password?
              </button>
            )}
            <button
              className="mt-2 cursor-pointer text-sm text-cyan-400"
              onClick={() => {
                setIsRegister(!isRegister);
                setShowForgotPassword(false);
                setResetRequested(false);
                setBanner(null);
                setErrors({});
              }}
            >
              {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
