import React, { useEffect, useState } from 'react';
import { FiEye, FiEdit } from 'react-icons/fi';
import '@/features/admin/pages/admin-layout.css';
import '@/features/admin/pages/users.css';
import '@/assets/css/auth.css';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '../components/AdminHeader';

const UsersPage = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios');
      }

      const apiResp = await response.json();
      if (apiResp && apiResp.data) {
        // Filtrar solo EMPLEADO y ADMINISTRADOR
        const filtered = apiResp.data.filter(
          (u) => u.rol === 'EMPLEADO' || u.rol === 'ADMINISTRADOR'
        );
        setUsers(filtered);
        setFilteredUsers(filtered);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.nombre?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term) ||
            u.apellidoPaterno?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        rol: 'EMPLEADO'
      };

      const response = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errResp = await response.json();
        throw new Error(errResp.message || 'Error al crear usuario');
      }

      const apiResp = await response.json();
      setFormSuccess('Usuario creado exitosamente');
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: ''
      });
      setShowForm(false);
      setTimeout(() => fetchUsers(), 500);
    } catch (err) {
      setFormError(err.message || 'Error al crear usuario');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus
        ? `${BASE_URL}/usuarios/${userId}/desactivar`
        : `${BASE_URL}/usuarios/${userId}/activar`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado del usuario');
      }

      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getRolBadgeClass = (rol) => {
    return rol === 'ADMINISTRADOR' ? 'role-badge--admin' : 'role-badge--empleado';
  };

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-layout">
        <div className="admin-layout__inner">
          <section className="admin-panel--users">
            <div className="admin-panel__header">
              <button
                type="button"
                className="btn-add-user"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancelar' : 'Agregar usuario'}
              </button>
              <div className="admin-panel__controls">
                <input
                  type="text"
                  placeholder="Buscador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {showForm && (
              <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Crear usuario">
                <div className="modal">
                  <header className="modal-header">
                    <h3>Agregar empleado</h3>
                    <button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Cerrar modal">
                      ×
                    </button>
                  </header>
                  <div className="modal-body">
                    <form className="auth-form" onSubmit={handleCreateUser}>
                      <div className="form-row">
                        <label className="auth-form__field">
                          <span>Nombre <strong>*</strong></span>
                          <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleFormChange}
                            placeholder="Nombre"
                            required
                          />
                        </label>
                        <label className="auth-form__field">
                          <span>Apellido paterno <strong>*</strong></span>
                          <input
                            type="text"
                            name="apellidoPaterno"
                            value={formData.apellidoPaterno}
                            onChange={handleFormChange}
                            placeholder="Apellido paterno"
                            required
                          />
                        </label>
                      </div>

                      <div className="form-row">
                        <label className="auth-form__field">
                          <span>Apellido materno</span>
                          <input
                            type="text"
                            name="apellidoMaterno"
                            value={formData.apellidoMaterno}
                            onChange={handleFormChange}
                            placeholder="Apellido materno (opcional)"
                          />
                        </label>
                        <label className="auth-form__field">
                          <span>Correo electrónico <strong>*</strong></span>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="Correo electrónico"
                            required
                          />
                        </label>
                      </div>

                      <div className="form-row">
                        <label className="auth-form__field">
                          <span>Contraseña <strong>*</strong></span>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleFormChange}
                            placeholder="Contraseña"
                            required
                            minLength={6}
                          />
                        </label>
                        <div />
                      </div>

                      {formError && <p className="form-error">{formError}</p>}
                      {formSuccess && <p className="form-success">{formSuccess}</p>}

                      <div className="modal-actions">
                        <button type="button" className="btn-add-user btn-cancel" onClick={() => setShowForm(false)}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn-add-user">
                          Crear Usuario
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <p className="loading-message">Cargando usuarios...</p>
            ) : filteredUsers.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.nombre} {u.apellidoPaterno} {u.apellidoMaterno || ''}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${getRolBadgeClass(u.rol)}`}>
                          {u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Empleado'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="Ver"
                          aria-label="Ver usuario"
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--edit"
                          title="Editar"
                          aria-label="Editar usuario"
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          className={`toggle-switch ${u.activo ? 'active' : ''}`}
                          onClick={() => handleToggleActive(u.id, u.activo)}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                          aria-label={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-users-message">No hay usuarios para mostrar</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
