import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../lib/firebase';
import {
  findUserByEmail,
  verifyPassword,
  setSessionUser,
  getRememberedEmail,
  setRememberedEmail,
  syncGoogleUser
} from '../../services/storage';
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

      if (!verifyPassword(password, user.passwordHash || '')) {
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

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      setAuthError('');
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        const user = await syncGoogleUser(
          result.user.uid,
          result.user.email,
          result.user.displayName || undefined
        );
        if (user) {
          onSignInSuccess(user);
        } else {
          setAuthError('Failed to synchronize user profile with PostgreSQL database.');
        }
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Google Sign In failed.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TaskFlow Daily</span>
        </div>
        <h2 className="mt-4 sm:mt-5 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Powered by Cloud SQL PostgreSQL & Firebase Auth
        </p>
      </div>

      <div className="mt-6 sm:mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 sm:py-8 px-4 sm:px-10 shadow-sm border border-slate-200/80 dark:border-slate-800 rounded-2xl transition-colors">
          {authError && (
            <div
              id="signin-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full min-h-[44px] flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
          >
            {isGoogleSigningIn ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label htmlFor="signin-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => setShowForgotModal(true)}
                  className="min-h-[36px] flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="mt-1 relative">
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
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                <button
                  type="button"
                  id="toggle-signin-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="w-10 h-10 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="min-h-[40px] relative flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Remember Me</span>
              </label>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="signin-button"
                disabled={isSubmitting}
                className="w-full min-h-[44px] flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition cursor-pointer"
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

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                id="link-to-signup"
                onClick={onNavigateToSignUp}
                className="min-h-[36px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1 cursor-pointer"
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
