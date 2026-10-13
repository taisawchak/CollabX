import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  Sparkles,
  Award,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { validateEmail } from '../../services/authService';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

const DEPARTMENTS = [
  { value: 'CSE', label: 'CSE' },
  { value: 'EEE', label: 'EEE' },
  { value: 'IT', label: 'IT' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data Science & AI', label: 'Data Science & AI' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Business Administration', label: 'Business Administration' },
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register, showToast } = useApp();

  // Role selection state (defaults to 'student')
  const [role, setRole] = useState<Role>('student');

  // Common form fields preserved across role switching
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-specific fields
  // Student Scholar:
  const [studentId, setStudentId] = useState('');

  // Academic Researcher:
  const [researcherId, setResearcherId] = useState('');
  const [orcid, setOrcid] = useState('');

  // Faculty Supervisor:
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('');

  // Form handling & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper for dynamic role label
  const getRoleLabel = (r: Role): string => {
    switch (r) {
      case 'student':
        return 'Student Scholar';
      case 'researcher':
        return 'Academic Researcher';
      case 'supervisor':
        return 'Faculty Supervisor';
      default:
        return 'Student Scholar';
    }
  };

  // Helper for dynamic department display label
  const getDepartmentDisplay = (dept: string): string => {
    if (!dept) return '';
    const d = dept.trim();
    if (d === 'Computer Science & Engineering' || d === 'CSE') return 'CSE';
    if (d === 'Electrical & Electronic Engineering' || d === 'EEE') return 'EEE';
    if (d === 'Information Technology' || d === 'IT') return 'IT';
    if (d === 'Software Engineering' || d === 'Software Eng.') return 'Software Engineering';
    if (d === 'Data Science & Artificial Intelligence' || d === 'Data Science & AI') return 'Data Science & AI';
    if (d === 'Civil Engineering' || d === 'Civil Eng.') return 'Civil Engineering';
    if (d === 'Business Administration' || d === 'BBA') return 'Business Administration';
    return d;
  };

  // Compute dynamic label (e.g. "Student Scholar • CSE" or "Faculty Supervisor")
  const roleLabel = getRoleLabel(role);
  const deptLabel = getDepartmentDisplay(department);
  const dynamicLabel = deptLabel ? `${roleLabel} • ${deptLabel}` : roleLabel;

  // Handle role switching: preserves common fields, clears errors
  const handleRoleChange = (newRole: Role) => {
    if (newRole !== role) {
      setRole(newRole);
      setErrorMessage(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Full Name
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    // 2. Validate Academic Email
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    // 3. Validate Department
    if (!department.trim()) {
      setErrorMessage('Please select your department.');
      return;
    }

    // Role-specific validation
    let resolvedUniversityId: string | undefined;
    let resolvedDesignation: string | undefined;
    let resolvedOrcid: string | undefined;

    if (role === 'student') {
      // Field 4: Student ID (Required)
      if (!studentId.trim()) {
        setErrorMessage('Please enter your Student ID.');
        return;
      }
      resolvedUniversityId = studentId.trim();
    } else if (role === 'researcher') {
      // Field 4: Researcher/Institutional ID (Optional)
      // Field 5: ORCID (Optional)
      resolvedUniversityId = researcherId.trim() || undefined;

      if (orcid.trim()) {
        const cleanOrcid = orcid.trim();
        // Standard ORCID 16-digit format with hyphens (e.g. 0000-0002-1825-0097 or with https://orcid.org/)
        const orcidRegex = /^(https?:\/\/orcid\.org\/)?\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;
        if (!orcidRegex.test(cleanOrcid)) {
          setErrorMessage('Please enter a valid ORCID format (e.g. 0000-0002-1825-0097).');
          return;
        }
        resolvedOrcid = cleanOrcid.replace(/^https?:\/\/orcid\.org\//i, '');
      }
    } else if (role === 'supervisor') {
      // Field 4: Faculty/Employee ID (Required)
      if (!facultyId.trim()) {
        setErrorMessage('Please enter your Faculty/Employee ID.');
        return;
      }
      // Field 5: Designation (Required)
      if (!designation.trim()) {
        setErrorMessage('Please enter your academic designation.');
        return;
      }
      resolvedUniversityId = facultyId.trim();
      resolvedDesignation = designation.trim();
    }

    // Validate Password requirements
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    // Validate Password Confirmation
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
        universityId: resolvedUniversityId,
        department: deptLabel || department.trim(),
        designation: resolvedDesignation,
        orcid: resolvedOrcid,
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
          <div className="w-full max-w-[440px] space-y-4 py-4">
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

            {/* Heading & Subtitle with Dynamic Role & Department Label */}
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl sm:text-[28px] font-black text-[#0B2A55] tracking-tight">
                Create an Account
              </h1>

              {/* Dynamic Role and Department Label badge */}
              <div className="flex items-center justify-center pt-0.5 pb-0.5">
                <span
                  data-testid="dynamic-role-department-label"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#C7D9FE] text-[#0B2A55] text-xs sm:text-sm font-semibold tracking-tight shadow-2xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0B6BE6]" />
                  <span>{dynamicLabel}</span>
                </span>
              </div>

              <p className="text-sm text-slate-600 font-normal">
                Join the research community as <span className="font-semibold text-[#0B2A55]">{dynamicLabel}</span>
              </p>
            </div>

            {/* Error Message Alert Box in CollabX Design */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium animate-in fade-in"
              >
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} noValidate className="space-y-3.5 pt-1">
              {/* Role Selection Group */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Academic Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      role === 'student'
                        ? 'border-[#0B6BE6] bg-[#EEF4FF] text-[#0B2A55] font-semibold ring-1 ring-[#0B6BE6] shadow-2xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => handleRoleChange('student')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm leading-tight">Student Scholar</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      role === 'researcher'
                        ? 'border-[#0B6BE6] bg-[#EEF4FF] text-[#0B2A55] font-semibold ring-1 ring-[#0B6BE6] shadow-2xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="researcher"
                      checked={role === 'researcher'}
                      onChange={() => handleRoleChange('researcher')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm leading-tight">Academic Researcher</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      role === 'supervisor'
                        ? 'border-[#0B6BE6] bg-[#EEF4FF] text-[#0B2A55] font-semibold ring-1 ring-[#0B6BE6] shadow-2xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="supervisor"
                      checked={role === 'supervisor'}
                      onChange={() => handleRoleChange('supervisor')}
                      className="w-4 h-4 text-[#0B6BE6] border-slate-300 focus:ring-[#0B6BE6] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm leading-tight">Faculty Supervisor</span>
                  </label>
                </div>
              </div>

              {/* FIELD 1: Full Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Full Name <span className="text-red-500">*</span>
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

              {/* FIELD 2: Academic Email */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Academic Email <span className="text-red-500">*</span>
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

              {/* FIELD 3: Department */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <select
                    value={department}
                    required
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-white border border-slate-300 text-xs sm:text-sm font-normal text-[#0B2A55] pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROLE-SPECIFIC FIELDS */}
              {/* ROLE: Student Scholar -> Field 4: Student ID */}
              {role === 'student' && (
                <div className="space-y-1 text-left animate-in fade-in duration-200">
                  <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => {
                        setStudentId(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. 2022-CSE-045"
                      className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* ROLE: Academic Researcher -> Field 4: Researcher ID (Optional) & Field 5: ORCID (Optional) */}
              {role === 'researcher' && (
                <>
                  {/* Field 4: Researcher/Institutional ID (Optional) */}
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                      Researcher/Institutional ID{' '}
                      <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="text"
                        value={researcherId}
                        onChange={(e) => {
                          setResearcherId(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="e.g. RES-2024-889 (Optional)"
                        className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Field 5: ORCID (Optional) */}
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                      ORCID <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="text"
                        value={orcid}
                        onChange={(e) => {
                          setOrcid(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="e.g. 0000-0002-1825-0097 (Optional)"
                        className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ROLE: Faculty Supervisor -> Field 4: Faculty/Employee ID & Field 5: Designation */}
              {role === 'supervisor' && (
                <>
                  {/* Field 4: Faculty/Employee ID */}
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                      Faculty/Employee ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={facultyId}
                        onChange={(e) => {
                          setFacultyId(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="e.g. FAC-CSE-102"
                        className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Field 5: Designation */}
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Award className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => {
                          setDesignation(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="e.g. Associate Professor, Assistant Professor, Lecturer"
                        className="w-full bg-white border border-slate-300 text-sm font-normal text-[#0B2A55] placeholder-slate-400 pl-10 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#0B6BE6] focus:ring-1 focus:ring-[#0B6BE6] transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div className="space-y-1 text-left">
                <label className="text-xs sm:text-sm font-semibold text-[#0B2A55] block">
                  Password <span className="text-red-500">*</span>
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
                  Confirm Password <span className="text-red-500">*</span>
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
