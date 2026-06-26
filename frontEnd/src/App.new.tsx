import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LeadFormPage from './pages/LeadFormPage';
import LeadsPage from './pages/LeadsPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/leads" element={<Layout><LeadsPage /></Layout>} />
          <Route path="/leads/new" element={<Layout><LeadFormPage /></Layout>} />
          <Route path="/leads/:id/edit" element={<Layout><LeadFormPage /></Layout>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl font-semibold">LeadFlow</h2>
            <p className="text-sm text-slate-500">CRM workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-medium text-slate-600">Dashboard</a>
            <a href="/leads" className="text-sm font-medium text-slate-600">Leads</a>
            <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Logout</button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default App;
