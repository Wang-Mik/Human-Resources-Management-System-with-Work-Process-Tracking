import React, { useState } from 'react';
import { Mail, Lock, LogIn, LifeBuoy } from 'lucide-react';
import api from '../../services/api';

interface LoginProps {
  onLogin: (role: 'manager' | 'employee', user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('khoa@hospital.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const role = data.user.Role.toLowerCase().includes('manager') ? 'manager' : 'employee';
      onLogin(role, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] rounded-full bg-indigo-100/50 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-emerald-50/50 blur-3xl"></div>

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white relative z-10 flex flex-col gap-8 mx-4">
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-700 to-sky-400 rounded-2xl shadow-lg flex items-center justify-center mb-2">
            <span className="text-white text-3xl font-bold">+</span>
          </div>
          <h1 className="text-sky-900 text-3xl font-bold tracking-tight">HMS Portal</h1>
          <p className="text-slate-500 text-sm font-medium">City General Hospital</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow shadow-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow shadow-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && <div className="text-rose-600 text-sm font-semibold">{error}</div>}

          <button 
            type="submit"
            className="w-full mt-2 py-3 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            <span>Sign In</span>
            <LogIn size={18} />
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-200">
          <button className="text-sky-700 hover:text-sky-800 text-sm font-semibold transition-colors">
            Forgot Password?
          </button>
          <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors">
            <LifeBuoy size={14} />
            <span className="text-xs font-medium">Contact Support</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
