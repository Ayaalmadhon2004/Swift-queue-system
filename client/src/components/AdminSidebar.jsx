import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/reports', label: 'Analytics', icon: '📊' },
    { path: '/display', label: 'Public Display', icon: '📺' },
    { path: '/ticket', label: 'Ticket Center', icon: '🎫' },
    { path: '/my-orders', label: 'Order History', icon: '📦' },
  ];

  return (
    <aside className="w-72 bg-[#0A0A0A] border-r border-white/5 h-screen sticky top-0 flex flex-col shadow-2xl z-50">
      {/* Brand Branding */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></div>
          <h2 className="text-white font-black text-2xl tracking-tighter">GAZA<span className="text-blue-500">PULSE</span></h2>
        </div>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold opacity-70">Management Console</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
              location.pathname === link.path 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg' 
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 ${location.pathname === link.path ? 'opacity-100' : 'opacity-60'}`}>
              {link.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Session Info */}
      <div className="p-6 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-white/10">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate w-32">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">System Root</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full py-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em]"
        >
          Logout Session
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;