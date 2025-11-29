import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/svg/logo.svg';

export const GlobalHeader = () => (
  <header className="global-header">
    <div className="brand">
      <img src={logo} alt="Tracker QR" width={36} height={36} />
      <strong>Tracker QR</strong>
    </div>
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/admin">Panel</Link>
      <Link to="/auth/login">Acceder</Link>
    </nav>
  </header>
);
