import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import DashboardPage from '../features/admin/pages/DashboardPage';
import ReportsPage from '../features/admin/pages/ReportsPage';
import ProfilePage from '../features/admin/pages/ProfilePage';
import UsersPage from '../features/admin/pages/UsersPage';
import EmployeeDashboard from '../features/employee/pages/EmployeeDashboard';
import LoginPage from '../features/auth/pages/LoginPage';
import RecoveryPage from '../features/auth/pages/RecoveryPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import TwoFAPage from '../features/auth/pages/TwoFAPage';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import AdminRouter from './AdminRouter';
import EmployeeRouter from './EmployeeRouter';
import Package from '../features/employee/pages/Package';
import EmployeeProfile from '../features/employee/pages/EmployeeProfile';
import ClientRouter from './ClientRouter';
import ClientPackages from '../features/client/pages/ClientPackages';
import ClientProfile from '../features/client/pages/ClientProfile';

const NotFoundPage = () => (
  <section>
    <h2>Página no encontrada</h2>
    <p>Regresa al inicio o accede al panel si ya estás autenticado.</p>
  </section>
);

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route element={<PublicRouter />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/2fa" element={<TwoFAPage />} />
        <Route path="/auth/recuperar" element={<RecoveryPage />} />
        <Route path="/auth/crear" element={<RegisterPage />} />
      </Route>
      <Route element={<AdminRouter />}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/reportes" element={<ReportsPage />} />
        <Route path="/admin/usuarios" element={<UsersPage />} />
        <Route path="/admin/perfil" element={<ProfilePage />} />
      </Route>
      <Route element={<EmployeeRouter />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/packages" element={<Package />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
      </Route>
      <Route element={<ClientRouter />}>
        <Route path="/client" element={<Navigate to="/client/packages" replace />} />
        <Route path="/client/packages" element={<ClientPackages />} />
        <Route path="/client/profile" element={<ClientProfile />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
