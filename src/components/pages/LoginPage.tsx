import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        // Read redirect parameter to preserve intended destination if supported
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect');

        let targetDestination = '';
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
          // Check role permissions on redirect target
          if (redirectParam.startsWith('/admin') && result.user.role !== 'admin') {
            showToast('Access to Administrator Portal is restricted to admins.', 'warning');
            targetDestination = result.user.role === 'supervisor' || result.user.role === 'researcher' ? '/researcher' : '/dashboard';
          } else if (redirectParam.startsWith('/researcher') && result.user.role === 'student') {
            showToast('Access to Researcher Portal is restricted to faculty.', 'warning');
            targetDestination = '/dashboard';
          } else {
            targetDestination = redirectParam;
          }
        } else {
          // Default role-based dashboard
          if (result.user.role === 'admin') {
            targetDestination = '/admin';
          } else if (result.user.role === 'supervisor' || result.user.role === 'researcher') {
            targetDestination = '/researcher';
          } else {
            targetDestination = '/dashboard';
          }
        }

        navigate(targetDestination);
      } else {
        const errorText = result.error || 'Invalid email or password.';
        setErrorMessage(errorText);
        showToast(errorText, 'error');
      }
    } catch {
      const fallbackErr = 'An unexpected error occurred during authentication. Please try again.';
      setErrorMessage(fallbackErr);
      showToast(fallbackErr, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'GitHub') => {
    showToast(
      `Third-party login via ${provider} is not linked. Please sign in with your institutional credentials.`,
      'warning'
    );
  };

  const handleForgotPassword = () => {
    showToast('Password reset is managed by University IT Administration. Please contact cse-admin@portcity.edu.bd', 'info');
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* Main 50/50 Split Body matching CollabX Design System */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        {/* Left Side: Centered Clean White Form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
          <div className="w-full max-w-[390px] space-y-5">
            {/* Prominent CollabX Brand Logo above the form */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2.5 cursor-pointer group select-none"
              title="Return to CollabX Home"
            >
              {/* Pokéball / Research Sphere Icon */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-[2.5px] border-[#0B2A55] shadow-xs flex flex-col transition-transform group-hover:scale-105">
                <div className="h-1/2 bg-[#E53935]" />
                <div className="h-1/2 bg-white" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#0B2A55]" />
                <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-white border-[2px] border-[#0B2A55] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>

              {/* Wordmark */}
              <span className="font-black text-2xl tracking-tight text-[#0B2A55]">
                Collab<span className="text-[#FFC83D]">X</span>
              </span>
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center space-y-1 pt-1">
              <h1 className="text-2xl sm:text-[28px] font-black text-[#0B2A55] tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-slate-600 font-normal">
                Login to your account
              </p>
            </div>

            {/* Error Message Alert Box */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-[#0B2A55] block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your email"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-[#0B2A55] block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Right-aligned Forgot Password link */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs sm:text-sm font-medium text-[#0B6BE6] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Green Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#0E9F6E] hover:bg-[#0c885e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'Verifying...' : 'Login'}
              </button>
            </form>

            {/* "or continue with" text divider */}
            <div className="text-center pt-1">
              <span className="text-xs sm:text-sm text-slate-500 font-normal">
                or continue with
              </span>
            </div>

            {/* Google and GitHub Social Buttons */}
            <div className="grid grid-cols-2 gap-3.5 pt-0.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs bg-white"
                title="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs text-[#24292F] bg-white"
                title="Continue with GitHub"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Bottom Register Prompt */}
            <div className="text-center pt-2">
              <span className="text-xs sm:text-sm text-slate-700">
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-xs sm:text-sm font-semibold text-[#0B6BE6] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Artwork */}
        <div className="hidden lg:block relative overflow-hidden bg-slate-100 min-h-[560px]">
          <img
            src="/login-bg.jpg"
            alt="CollabX Adventure Scene"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
};
