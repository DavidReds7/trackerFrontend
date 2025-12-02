import React from 'react';
import '@/features/admin/pages/profile.css';
import { useAuth } from '@/context/AuthContext';
import EmployeeHeader from '../components/EmployeeHeader';

const EmployeeProfile = () => {
  const { user } = useAuth();

  return (
    <div className="admin-shell">
      <EmployeeHeader />
      <div className="profile-body">
        <section className="profile-hero">
          <div className="profile-hero__badge">Tracker</div>
          <h1>Mi cuenta</h1>
          <p>
            Bienvenido de nuevo, {user?.username ?? 'administrador'}. EMPLEADO.
          </p>
          <div className="profile-hero__stats">
            <div>
              <strong>4</strong>
              <span>Paquetes supervisados</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>Índice de cumplimiento</span>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <header>
            <h2>Perfil</h2>
            <p>Actualiza tu correo, nombre o contraseña cuando lo necesites.</p>
          </header>
          <div className="profile-form">
            <label>
              Nombre completo
              <input type="text" placeholder="Nombre" defaultValue={user?.username ?? ''} />
            </label>
            <label>
              Apellido paterno
              <input type="text" placeholder="Apellido paterno" />
            </label>
            <label>
              Apellido materno
              <input type="text" placeholder="Apellido materno" />
            </label>
            <label>
              Correo electrónico
              <input type="email" placeholder="correo@tracker.com" defaultValue={user?.email ?? ''} />
            </label>
            <label>
              Contraseña actual
              <input type="password" placeholder="********" />
            </label>
            <label>
              Nueva contraseña
              <input type="password" placeholder="Nueva contraseña" />
            </label>
          </div>
          <div className="profile-actions">
            <button type="button" className="ghost">Cancelar</button>
            <button type="button">Actualizar</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeProfile;