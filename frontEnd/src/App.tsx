import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LeadFormPage from './pages/LeadFormPage';
import LeadsPage from './pages/LeadsPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
