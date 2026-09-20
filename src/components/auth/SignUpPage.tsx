import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../lib/firebase';
import { registerUser, syncGoogleUser } from '../../services/storage';

interface SignUpPageProps {
  onNavigateToSignIn: () => void;
  onSignUpSuccess: (email: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToSignIn, onSignUpSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleSigningIn(true);
      setServerError('');
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        const user = await syncGoogleUser(
          result.user.uid,
          result.user.email,
          result.user.displayName || undefined
        );
        if (user) {
          onSignUpSuccess(user.email);
        } else {
          setServerError('Failed to save user account to PostgreSQL.');
        }
      }
    } catch (err: any) {
      console.error('Google Sign Up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setServerError(err.message || 'Google Sign Up failed.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation: allows optional +, digits, spaces, hyphens, min 7 digits
    const cleanDigits = mobile.replace(/[^0-9]/g, '');
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (cleanDigits.length < 8) {
      newErrors.mobile = 'Please enter a valid mobile number (at least 8 digits)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        fullName,
        email,
        mobile,
        password,
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          onSignUpSuccess(email);
        }, 1200);
      } else {
        setServerError(result.message);
      }
    } catch {
      setIsSubmitting(false);
      setServerError('An unexpected error occurred. Please try again.');
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
          Create your account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Start organizing your daily schedule, priorities, and habits
        </p>
      </div>

      <div className="mt-6 sm:mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 sm:py-8 px-4 sm:px-10 shadow-sm border border-slate-200/80 dark:border-slate-800 rounded-2xl transition-colors">
          {serverError && (
            <div
              id="signup-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div
              id="signup-success-alert"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            id="google-signup-btn"
            onClick={handleGoogleSignUp}
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
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="signup-fullname" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="signup-fullname"
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.fullName ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="signup-email"
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
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

            {/* Mobile Number */}
            <div>
              <label htmlFor="signup-mobile" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="signup-mobile"
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                  }}
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.mobile ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                {errors.mobile && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>{errors.mobile}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                <button
                  type="button"
                  id="toggle-signup-password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`block w-full min-h-[44px] rounded-xl px-3.5 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 border ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition`}
                />
                <button
                  type="button"
                  id="toggle-signup-confirm-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="w-10 h-10 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="create-account-button"
                disabled={isSubmitting}
                className="w-full min-h-[44px] flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                id="link-to-signin"
                onClick={onNavigateToSignIn}
                className="min-h-[36px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>User-isolated data security & privacy protected</span>
        </div>
      </div>
    </div>
  );
};
