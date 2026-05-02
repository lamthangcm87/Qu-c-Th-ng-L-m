import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  ClipboardList,
  Trash2
} from 'lucide-react';

interface User {
  user_id: number;
  full_name: string;
  role_type: string;
}

interface Task {
  task_id: number;
  task_name: string;
  budget: number;
  manager_id: number;
  assignee_id: number;
  supervisor_id: number;
  status: string;
  deadline: string;
  manager_name: string;
  assignee_name: string;
  supervisor_name: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State Tasks
  const [formData, setFormData] = useState({
    task_name: '',
    budget: '',
    manager_id: '',
    assignee_id: '',
    supervisor_id: '',
    deadline: ''
  });

  // Form State Users
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    role_type: 'Quản lý'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/tasks')
      ]);
      const usersData = await usersRes.json();
      const tasksData = await tasksRes.json();
      setUsers(usersData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          manager_id: parseInt(formData.manager_id),
          assignee_id: parseInt(formData.assignee_id),
          supervisor_id: parseInt(formData.supervisor_id)
        })
      });
      if (res.ok) {
        setFormData({
          task_name: '',
          budget: '',
          manager_id: '',
          assignee_id: '',
          supervisor_id: '',
          deadline: ''
        });
        await fetchData();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      });
      if (res.ok) {
        setUserFormData({ full_name: '', role_type: 'Quản lý' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error submitting user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá nhân sự này? Điều này có thể làm trống thông tin trong các công việc họ đảm nhiệm.')) return;
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hệ thống Quản lý Công việc</h1>
          </div>
          
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cài đặt nhân sự
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              <ClipboardList className="w-4 h-4" />
              <span>{tasks.length} Công việc</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Người Quản lý</p>
                    <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role_type === 'Quản lý').length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Người Thực thi</p>
                    <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role_type === 'Thực thi').length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Người Giám sát</p>
                    <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role_type === 'Giám sát').length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Create Task */}
                <div className="lg:col-span-4 sticky top-24">
                  <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-white" />
                      <h2 className="text-white font-semibold">Tạo Công việc mới</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      {/* Task Info */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tên công việc</label>
                        <input
                          required
                          name="task_name"
                          value={formData.task_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="VD: Thiết kế giao diện Dashboard"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Dự toán (VNĐ)</label>
                          <input
                            required
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="5000000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Hạn</label>
                          <input
                            required
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Roles Selection */}
                      <div className="space-y-3 pt-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phân vai trò</label>
                        <div className="space-y-3">
                          <RoleSelect 
                            icon={<Briefcase className="w-4 h-4 text-blue-600" />}
                            label="Quản lý"
                            name="manager_id"
                            value={formData.manager_id}
                            onChange={handleInputChange}
                            options={users.filter(u => u.role_type === 'Quản lý')}
                            bgColor="bg-blue-100"
                          />
                          <RoleSelect 
                            icon={<Users className="w-4 h-4 text-green-600" />}
                            label="Thực thi"
                            name="assignee_id"
                            value={formData.assignee_id}
                            onChange={handleInputChange}
                            options={users.filter(u => u.role_type === 'Thực thi')}
                            bgColor="bg-green-100"
                          />
                          <RoleSelect 
                            icon={<ShieldCheck className="w-4 h-4 text-purple-600" />}
                            label="Giám sát"
                            name="supervisor_id"
                            value={formData.supervisor_id}
                            onChange={handleInputChange}
                            options={users.filter(u => u.role_type === 'Giám sát')}
                            bgColor="bg-purple-100"
                          />
                        </div>
                      </div>

                      <button
                        disabled={submitting}
                        className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>Tạo công việc <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Task List */}
                <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <ClipboardList className="w-6 h-6 text-slate-400" />
                      Danh sách công việc
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {tasks.length === 0 ? (
                        <EmptyState message="Chưa có công việc nào được tạo." />
                      ) : (
                        tasks.map((task) => <TaskCard key={task.task_id} task={task} />)
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* User Form */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-600 p-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-white" />
                    <h2 className="text-white font-semibold">Thêm Nhân sự mới</h2>
                  </div>
                  <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
                      <input
                        required
                        name="full_name"
                        value={userFormData.full_name}
                        onChange={handleUserInputChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò chính</label>
                      <select
                        required
                        name="role_type"
                        value={userFormData.role_type}
                        onChange={handleUserInputChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Quản lý">Quản lý</option>
                        <option value="Thực thi">Thực thi</option>
                        <option value="Giám sát">Giám sát</option>
                      </select>
                    </div>
                    <button
                      disabled={submitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      {submitting ? 'Đang lưu...' : 'Thêm nhân sự'}
                    </button>
                  </form>
                </div>
              </div>

              {/* User List */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và tên</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Thống kê</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(user => (
                        <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{user.full_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              user.role_type === 'Quản lý' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              user.role_type === 'Thực thi' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {user.role_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {tasks.filter(t => t.manager_id === user.user_id || t.assignee_id === user.user_id || t.supervisor_id === user.user_id).length} công việc
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Xoá nhân sự"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="p-12 text-center text-slate-400">Chưa có nhân sự nào trong hệ thống.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components for cleaner App.tsx
function RoleSelect({ icon, label, name, value, onChange, options, bgColor }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <select
        required
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
      >
        <option value="">Chọn {label}</option>
        {options.map((u: User) => (
          <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
        ))}
      </select>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-100 transition-all group"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(task.status)} uppercase tracking-wider`}>
              {task.status}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{task.task_name}</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">{(task.budget || 0).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Hạn: <span className="font-medium text-slate-900 uppercase">{new Date(task.deadline).toLocaleDateString('vi-VN')}</span></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <RoleBadge icon={<Briefcase className="w-3.5 h-3.5 text-blue-500" />} label="QL" name={task.manager_name} />
            <RoleBadge icon={<Users className="w-3.5 h-3.5 text-green-500" />} label="TT" name={task.assignee_name} />
            <RoleBadge icon={<ShieldCheck className="w-3.5 h-3.5 text-purple-500" />} label="GS" name={task.supervisor_name} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RoleBadge({ icon, label, name }: any) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
      {icon}
      <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{label}: {name}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}


