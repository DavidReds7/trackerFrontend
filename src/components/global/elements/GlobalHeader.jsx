import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/svg/logo.svg';
import { useAuth } from '@/context/AuthContext';

export const GlobalHeader = () => {
  const { logout } = useAuth();
  
  return (
    <header className="global-header">
      <div className="brand">
        <img src={logo} alt="Tracker QR" width={36} height={36} />
        <strong>Tracker QR</strong>
      </div>
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/admin">Panel</Link>
      <Link to="/auth/login">Acceder</Link>
      <button type="button" className="admin-header__logout" onClick={logout}>
        Salir
      </button>
    </nav>
  </header>
  );
}
