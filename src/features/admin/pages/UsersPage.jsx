import React, { useEffect, useState } from 'react';
import { FiEye, FiEdit } from 'react-icons/fi';
import '@/features/admin/pages/admin-layout.css';
import '@/features/admin/pages/users.css';
import '@/assets/css/auth.css';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '../components/AdminHeader';
import { getUserById, updateUser } from '@/api/adminService';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });
  const [editError, setEditError] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [toast, setToast] = useState({ type: null, message: '' });

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
        const filtered = apiResp.data.filter(
          (u) => u.rol === 'EMPLEADO'
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
      setShowSuccess(true);
      fetchUsers();
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
      const msg = currentStatus ? 'Usuario desactivado' : 'Usuario activado';
      setToast({ type: 'success', message: msg });
      setTimeout(() => setToast({ type: null, message: '' }), 3000);
    } catch (err) {
      console.error('Error:', err);
      setToast({ type: 'error', message: err.message || 'Error al actualizar estado' });
      setTimeout(() => setToast({ type: null, message: '' }), 3000);
    }
  };

  const handleViewUser = async (userId) => {
    setLoadingDetails(true);
    try {
      const apiResp = await getUserById(userId, token);
      if (apiResp && apiResp.data) {
        setUserDetails(apiResp.data);
        setSelectedUser(userId);
      }
    } catch (err) {
      console.error('Error al obtener detalles del usuario:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      email: user.email,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno || ''
    });
    setEditError(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmEdit = async () => {
    try {
      const payload = {
        email: editFormData.email,
        nombre: editFormData.nombre,
        apellidoPaterno: editFormData.apellidoPaterno,
        apellidoMaterno: editFormData.apellidoMaterno
      };

      await updateUser(editingUser, payload, token);
      setEditingUser(null);
      setPendingEdit(null);
      setEditFormData({
        email: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: ''
      });
      fetchUsers();
      setToast({ type: 'success', message: 'Empleado actualizado correctamente' });
      setTimeout(() => setToast({ type: null, message: '' }), 3000);
    } catch (err) {
      setEditError(err.message || 'Error al actualizar usuario');
      setToast({ type: 'error', message: err.message || 'Error al actualizar usuario' });
      setTimeout(() => setToast({ type: null, message: '' }), 3000);
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
          {toast.type && (
            <div className="toast-container" aria-live="polite" aria-atomic="true">
              <div className={`toast ${toast.type === 'success' ? 'toast--success' : 'toast--error'}`}>
                {toast.message}
              </div>
            </div>
          )}
          <section className="admin-panel--users">
            <div className="admin-panel__header">
              <button
                type="button"
                className="btn-add-user"
                onClick={() => setShowForm(!showForm)}
              >
                Agregar usuario
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
                          Agregar usuario
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

                {showSuccess && (
                  <div className="success-overlay" role="dialog" aria-modal="true" aria-label="Usuario creado">
                    <div className="success-modal">
                      <button className="success-close" aria-label="Cerrar" onClick={() => setShowSuccess(false)}>×</button>
                      <div className="success-body">
                        <h2>¡Usuario creado exitosamente!</h2>
                        <p className="sr-only">Creación de usuario completada</p>
                        <div className="success-actions">
                          <button className="btn-add-user" onClick={() => setShowSuccess(false)}>Aceptar</button>
                        </div>
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
                          aria-label="Ver usuario"
                          onClick={() => handleViewUser(u.id)}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--edit"
                          aria-label="Editar usuario"
                          onClick={() => handleEditUser(u)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          className={`toggle-switch ${u.activo ? 'active' : ''}`}
                          onClick={() => setPendingToggle({ id: u.id, name: `${u.nombre} ${u.apellidoPaterno}`, currentStatus: u.activo })}
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

            {pendingToggle && (
              <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirmación">
                <div className="confirm-modal">
                  <button className="success-close" aria-label="Cerrar" onClick={() => setPendingToggle(null)}>×</button>
                  <div className="success-body">
                    <h2>¿Está seguro de {pendingToggle.currentStatus ? 'desactivar' : 'activar'} a {pendingToggle.name}?</h2>
                    <div className="success-actions">
                      <button className="btn-cancel" onClick={() => setPendingToggle(null)}>Regresar</button>
                      {pendingToggle.currentStatus ? (
                        <button className="btn-danger" onClick={async () => { await handleToggleActive(pendingToggle.id, pendingToggle.currentStatus); setPendingToggle(null); }}>Desactivar</button>
                      ) : (
                        <button className="btn-add-user" onClick={async () => { await handleToggleActive(pendingToggle.id, pendingToggle.currentStatus); setPendingToggle(null); }}>Activar</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedUser && userDetails && (
              <div className="details-overlay" role="dialog" aria-modal="true" aria-label="Información del empleado">
                <div className="details-modal">
                  <button className="success-close" aria-label="Cerrar" onClick={() => { setSelectedUser(null); setUserDetails(null); }}>×</button>
                  <div className="details-content">
                    <h2>Info empleados</h2>
                    <div className="info-section">
                      <h3>Información del empleado:</h3>
                      <div className="info-grid">
                        <div className="info-row">
                          <label>Nombre(s)</label>
                          <span>{userDetails.nombre}</span>
                        </div>
                        <div className="info-row">
                          <label>Apellido materno</label>
                          <span>{userDetails.apellidoMaterno || '-'}</span>
                        </div>
                        <div className="info-row">
                          <label>Apellido paterno</label>
                          <span>{userDetails.apellidoPaterno}</span>
                        </div>
                        <div className="info-row">
                          <label>Correo electrónico</label>
                          <span>{userDetails.email}</span>
                        </div>
                        <div className="info-row">
                          <label>Rol asignado</label>
                          <span className={`role-badge ${userDetails.rol === 'ADMINISTRADOR' ? 'role-badge--admin' : 'role-badge--empleado'}`}>
                            {userDetails.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Empleado'}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Estado</label>
                          <span className={`status-badge ${userDetails.activo ? 'status-active' : 'status-inactive'}`}>
                            {userDetails.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Editar usuario">
                <div className="modal">
                  <header className="modal-header">
                    <h3>Editar empleado</h3>
                    <button type="button" className="modal-close" onClick={() => { setEditingUser(null); setPendingEdit(null); setEditError(null); }} aria-label="Cerrar modal">
                      ×
                    </button>
                  </header>
                  <div className="modal-body">
                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setPendingEdit(editingUser); }}>
                      <div className="form-row">
                        <label className="auth-form__field">
                          <span>Nombre <strong>*</strong></span>
                          <input
                            type="text"
                            name="nombre"
                            value={editFormData.nombre}
                            onChange={handleEditFormChange}
                            placeholder="Nombre"
                            required
                          />
                        </label>
                        <label className="auth-form__field">
                          <span>Apellido paterno <strong>*</strong></span>
                          <input
                            type="text"
                            name="apellidoPaterno"
                            value={editFormData.apellidoPaterno}
                            onChange={handleEditFormChange}
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
                            value={editFormData.apellidoMaterno}
                            onChange={handleEditFormChange}
                            placeholder="Apellido materno (opcional)"
                          />
                        </label>
                        <label className="auth-form__field">
                          <span>Correo electrónico <strong>*</strong></span>
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleEditFormChange}
                            placeholder="Correo electrónico"
                            required
                          />
                        </label>
                      </div>

                      {editError && <p className="form-error">{editError}</p>}

                      <div className="modal-actions">
                        <button type="button" className="btn-add-user btn-cancel" onClick={() => { setEditingUser(null); setPendingEdit(null); setEditError(null); }}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn-add-user">
                          Guardar cambios
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {pendingEdit && (
              <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirmación">
                <div className="confirm-modal">
                  <button className="success-close" aria-label="Cerrar" onClick={() => setPendingEdit(null)}>×</button>
                  <div className="success-body">
                    <h2>¿Está seguro de que desea actualizar los datos del empleado?</h2>
                    <div className="success-actions">
                      <button className="btn-cancel" onClick={() => setPendingEdit(null)}>Regresar</button>
                      <button className="btn-add-user" onClick={handleConfirmEdit}>Confirmar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
