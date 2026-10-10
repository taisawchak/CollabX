import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [role, setRole] = useState<Role>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        universityId: universityId.trim() || undefined,
        department: department.trim() || undefined,
      });

      if (result.success) {
        showToast('Registration successful! Please log in with your credentials.', 'success');
        navigate('/login');
      } else {
        const errorText = result.error || 'Registration failed. Please check your details.';
        setErrorMessage(errorText);
        showToast(errorText, 'error');
      }
    } catch {
      const fallbackErr = 'An unexpected error occurred during registration. Please try again.';
      setErrorMessage(fallbackErr);
      showToast(fallbackErr, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* Main 50/50 Split Body matching CollabX Design System */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        {/* Left Side: Centered Clean White Form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
          <div className="w-full max-w-[420px] space-y-4 py-4">
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
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-[28px] font-black text-[#0B2A55] tracking-tight">
                Create an Account
              </h1>
              <p className="text-sm text-slate-600 font-normal">
                Join the research community
              </p>
            </div>

            {/* Error Message Alert Box */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5 pt-1">
              {/* Full Name Field */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                  />
                </div>
              </div>

              {/* Academic Email Field */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Academic Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your academic email"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                  />
                </div>
              </div>

              {/* Grid: University / Student ID & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* University / Student ID Field */}
                <div className="space-y-1 text-left">
                  <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                    University / Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      value={universityId}
                      onChange={(e) => {
                        setUniversityId(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. 2022-CSE-045"
                      className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                    />
                  </div>
                </div>

                {/* Department Selection */}
                <div className="space-y-1 text-left">
                  <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs sm:text-sm font-normal text-[#0B2A55] pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors appearance-none"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Electrical & Electronic Engineering">EEE</option>
                      <option value="Information Technology">IT</option>
                      <option value="Software Engineering">Software Eng.</option>
                      <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                      <option value="Civil Engineering">Civil Eng.</option>
                      <option value="Business Administration">BBA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Select Role Radio Buttons */}
              <div className="space-y-1 text-left pt-0.5">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Academic Role
                </label>
                <div className="flex items-center gap-5 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-sm text-[#0B2A55] font-normal">Student</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="role"
                      value="researcher"
                      checked={role === 'researcher'}
                      onChange={() => setRole('researcher')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-sm text-[#0B2A55] font-normal">Researcher</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="role"
                      value="supervisor"
                      checked={role === 'supervisor'}
                      onChange={() => setRole('supervisor')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-sm text-[#0B2A55] font-normal">Supervisor</span>
                  </label>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
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
                    placeholder="Min 8 characters"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-10 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
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
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Repeat password"
                    className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-10 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Green Register Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-[#0E9F6E] hover:bg-[#0c885e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            {/* Bottom Login Link */}
            <div className="text-center pt-1">
              <span className="text-xs sm:text-sm text-slate-700">
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs sm:text-sm font-semibold text-[#0B6BE6] hover:underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Artwork */}
        <div className="hidden lg:block relative overflow-hidden bg-slate-100 min-h-[560px]">
          <img
            src="/register-bg.jpg"
            alt="CollabX Research Adventure Scene"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle soft gradient blend on the left edge */}
          <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-white via-white/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
