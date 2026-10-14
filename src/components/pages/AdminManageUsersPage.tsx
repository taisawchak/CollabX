import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Shield,
  GraduationCap,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';

interface AdminManageUsersPageProps {
  navigate: (path: string) => void;
}

export const AdminManageUsersPage: React.FC<AdminManageUsersPageProps> = ({ navigate }) => {
  const {
    currentUser,
    users,
    addUserByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin,
    refreshUsersFromDatabase,
    showToast,
  } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const [tab, setTab] = useState<'all' | 'students' | 'researchers' | 'admins'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshUsersFromDatabase();
      showToast(`Database synced: ${res.count} user records verified.`, 'success');
    } catch {
      showToast('Error syncing database.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('student');
  const [formDepartment, setFormDepartment] = useState('Computer Science & Engineering');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const filteredUsers = users.filter((u) => {
    if (tab === 'students' && u.role !== 'student') return false;
    if (tab === 'researchers' && u.role !== 'researcher' && u.role !== 'supervisor') return false;
    if (tab === 'admins' && u.role !== 'admin') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('student');
    setFormDepartment('Computer Science & Engineering');
    setFormStatus('active');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormStatus(user.status);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserByAdmin(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        department: formDepartment.trim(),
        status: formStatus,
      });
      setEditingUser(null);
    } else {
      addUserByAdmin({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        department: formDepartment.trim(),
        status: formStatus,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Role,Department,Status']
        .concat(users.map((u) => `"${u.name}","${u.email}","${u.role}","${u.department}","${u.status}"`))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'collabx_users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users to CSV', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 20 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Manage Users</h1>
          <p className="text-xs text-[#6B7A90] mt-1">Directory of enrolled students, faculty supervisors, and portal moderators</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white border border-[#E3EAF3] text-xs pl-9 pr-3 py-2 rounded-xl text-[#0B2A55]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Force sync users from database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline font-bold text-xs">Sync DB</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-white border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] rounded-xl transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Page 20: All Users · Students · Researchers · Admins */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 text-xs">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'all'
              ? 'bg-[#0B2A55] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setTab('students')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'students'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Students ({users.filter((u) => u.role === 'student').length})
        </button>
        <button
          onClick={() => setTab('researchers')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'researchers'
              ? 'bg-[#0B6BE6] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Researchers & Supervisors ({users.filter((u) => u.role === 'researcher' || u.role === 'supervisor').length})
        </button>
        <button
          onClick={() => setTab('admins')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'admins'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Admins ({users.filter((u) => u.role === 'admin').length})
        </button>
      </div>

      {/* Table matching Page 20 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#DEEBFB]/50 text-[#0B2A55] uppercase tracking-wider font-extrabold border-b border-[#E3EAF3]">
              <tr>
                <th className="p-4">Name & Academic Email</th>
                <th className="p-4">Role & Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const joinedFormatted = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'N/A';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div>
                          <p className="font-extrabold text-[#0B2A55] flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.universityId && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                #{u.universityId}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                          {u.orcid && (
                            <p className="text-[10px] text-emerald-600 font-medium">ORCID: {u.orcid}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize inline-block ${
                            u.role === 'admin'
                              ? 'bg-rose-100 text-rose-800'
                              : u.role === 'supervisor'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'researcher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.designation && (
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{u.designation}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{u.department}</td>
                    <td className="p-4 text-slate-500 font-medium">{joinedFormatted}</td>
                    <td className="p-4">
                      <button
                        onClick={() =>
                          updateUserByAdmin(u.id, {
                            status: u.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          u.status === 'active'
                            ? 'bg-[#DDF5EA] text-[#0E9F6E]'
                            : 'bg-[#FDE3E3] text-[#E53935]'
                        }`}
                        title="Click to toggle active/inactive status"
                      >
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/u/${u.id}`)}
                        className="p-1.5 hover:bg-blue-100 text-[#0B6BE6] rounded-lg cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUserByAdmin(u.id)}
                        className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">
                {editingUser ? 'Edit User Record' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                  >
                    <option value="student">Student</option>
                    <option value="researcher">Researcher</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Department</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0B6BE6] text-white font-bold rounded-xl shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
