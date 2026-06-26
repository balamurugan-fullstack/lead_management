import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl font-semibold">LeadFlow</h2>
            <p className="text-sm text-slate-500">CRM workspace</p>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-600' : 'text-slate-600'}`}>
              Dashboard
            </NavLink>
            <NavLink to="/leads" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-cyan-600' : 'text-slate-600'}`}>
              Leads
            </NavLink>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm cursor-pointer">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
