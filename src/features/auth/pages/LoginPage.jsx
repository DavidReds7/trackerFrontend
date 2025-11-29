import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScene from '../components/AuthScene';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, mockLogin } = useAuth();
  const circlePosition = 'right';

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Validando tus datos...');
    try {
      await login(form);
      setStatus('Acceso concedido. Redirigiendo...');
      navigate('/admin');
    } catch (error) {
      const fallbackUser = {
        username: form.email ? form.email.split('@')[0] : 'administrador',
        email: form.email || 'admin@tracker.local'
      };
      mockLogin(fallbackUser);
      setStatus('Backend inaccesible. Entraste en modo maqueta.');
      navigate('/admin');
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
      panelState="idle"
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
