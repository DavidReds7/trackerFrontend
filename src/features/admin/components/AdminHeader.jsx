import React, { useState } from 'react';
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
  const [pendingLogout, setPendingLogout] = useState(false);

  const startLogout = () => {
    setPendingLogout(true);
  };

  const cancelLogout = () => {
    setPendingLogout(false);
  };

  const confirmLogout = () => {
    logout();
    setPendingLogout(false);
  };

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
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `admin-nav__link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="admin-header__logout" onClick={startLogout}>
        Salir
      </button>

      {pendingLogout && (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-logout-title"
        >
          <div className="confirm-modal">
            <button
              className="success-close"
              aria-label="Cerrar"
              onClick={cancelLogout}
            >
              ×
            </button>

            <div className="success-body">
              <h2 id="confirm-logout-title">¿Está seguro de querer cerrar sesión?</h2>

              <div className="success-actions">
                <button className="btn-cancel" onClick={cancelLogout}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={confirmLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;