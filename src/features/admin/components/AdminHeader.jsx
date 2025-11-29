import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Reportes', to: '/admin/reportes' },
  { label: 'Usuarios', to: '/admin/usuarios' },
  { label: 'Mi Perfil', to: '/admin/perfil' }
];

const AdminHeader = () => {
  const { logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-brand">
        <span>Tracker</span>
      </div>
      <nav className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `admin-nav__link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="admin-header__logout" onClick={logout}>
        Salir
      </button>
    </header>
  );
};

export default AdminHeader;

