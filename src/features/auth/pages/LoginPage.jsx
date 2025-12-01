import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScene from '../components/AuthScene';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, mockLogin, user } = useAuth();
  const { startPendingLogin } = useAuth();
  const circlePosition = 'right';

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Validando tus datos...');
    try {
      const resp = await login(form);

      // Si backend indica que requiere 2FA -> iniciar flujo 2FA
      if (resp && resp.requiere2FA) {
        setStatus('Se requiere código 2FA. Completa la verificación.');
        // Guardar credentials + userId para TwoFAPage
        startPendingLogin(form, { userId: resp.id });
        navigate('/auth/2fa');
        return;
      }

      // Si recibimos token => inicio de sesión exitoso
      if (resp && resp.token) {
        setStatus('Acceso concedido. Redirigiendo...');
        // Redirigir según rol
        const rol = resp.rol || (user && user.rol) || null;
        const path = rol === 'EMPLEADO' ? '/employee' : '/admin';
        navigate(path);
        return;
      }

      // Si no hay token ni 2FA, tratamos la respuesta como error
      throw new Error((resp && resp.message) || 'Respuesta inesperada del servidor.');
    } catch (error) {
      const msg = (error && error.message) || String(error);
      const isNetworkError = /inaccesible|Failed to fetch|NetworkError/i.test(msg) || error.name === 'TypeError';

      if (isNetworkError) {
        const fallbackUser = {
          username: form.email ? form.email.split('@')[0] : 'administrador',
          email: form.email || 'admin@tracker.local'
        };
        // mock as administrator by default when backend is down
        mockLogin({ ...fallbackUser, rol: 'ADMINISTRADOR' });
        setStatus('Backend inaccesible. Entraste en modo maqueta.');
        navigate('/admin');
      } else {
        // Validation / authentication error from backend (don't mock-login)
        setStatus(msg || 'Credenciales inválidas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = useCallback(
    (event) => {
      event.preventDefault();
      navigate('/auth/crear');
    },
    [navigate]
  );

  const handleRecoveryTransition = useCallback(
    (event) => {
      event.preventDefault();
      navigate('/auth/recuperar');
    },
    [navigate]
  );

  return (
    <AuthScene
      title="Iniciar sesión"
      description=""
      circlePosition={circlePosition}
      panelState
    >
      <div className="auth-panel__intro">
        <span>¿Nuevo usuario?</span>
        <button className="auth-panel__intro-link" type="button" onClick={handleCreateAccount}>
          Crear una cuenta.
        </button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          <span>
            Correo electrónico
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />
        </label>
        <label className="auth-form__field">
          <span>
            Contraseña
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Iniciar sesión'}
        </button>
      </form>
      {status && <p className="auth-form__status">{status}</p>}
      <div className="auth-panel__links">
        <button type="button" onClick={handleRecoveryTransition}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </AuthScene>
  );
};

export default LoginPage;
