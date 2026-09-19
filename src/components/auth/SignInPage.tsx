import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, ArrowRight, Check, Sparkles } from 'lucide-react';
import { findUserByEmail, verifyPassword, setSessionUser, getRememberedEmail, setRememberedEmail } from '../../services/storage';
import { User } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface SignInPageProps {
  onNavigateToSignUp: () => void;
  onSignInSuccess: (user: User) => void;
  initialEmail?: string;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onNavigateToSignUp,
  onSignInSuccess,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    } else {
      const savedEmail = getRememberedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [initialEmail]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const user = findUserByEmail(email);

      if (!user) {
        setIsSubmitting(false);
        setAuthError('No account found with this email. Please check your spelling or sign up.');
        return;
      }

      if (!verifyPassword(password, user.passwordHash)) {
        setIsSubmitting(false);
        setAuthError('Incorrect password. Please verify your credentials or reset your password.');
        return;
      }

      // Save remember me preference
      setRememberedEmail(email, rememberMe);

      // Set active session
      setSessionUser(user.id);
      setIsSubmitting(false);
      onSignInSuccess(user);
    }, 350);
  };

  const handleFillDemo = () => {
    setEmail('demo@example.com');
    setPassword('Password123!');
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow Daily</span>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Access your daily task dashboard and track your productivity
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm ring-1 ring-slate-200/80 rounded-2xl sm:px-10">
          {authError && (
            <div
              id="signin-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label htmlFor="signin-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="demo@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (authError) setAuthError('');
                  }}
                  className={`block w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 border ${
                    errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="mt-1.5 relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    if (authError) setAuthError('');
                  }}
                  className={`block w-full rounded-xl px-3.5 py-2.5 pr-11 text-sm text-slate-900 border ${
                    errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                <button
                  type="button"
                  id="toggle-signin-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="relative flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">Remember Me</span>
              </label>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="signin-button"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials for Fast Review */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="fill-demo-credentials-button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fill Demo Credentials (demo@example.com)</span>
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                id="link-to-signup"
                onClick={onNavigateToSignUp}
                className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
        onSuccessReset={() => {
          setShowForgotModal(false);
          setAuthError('');
        }}
      />
    </div>
  );
};
