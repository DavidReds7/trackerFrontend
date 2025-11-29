import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScene from '../components/AuthScene';

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const circlePosition = 'left';
  const panelState = 'idle';

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Registrando tus datos...');
    setTimeout(() => {
      setStatus('Cuenta creada. Pronto conectaremos el backend para activarla.');
      setLoading(false);
    }, 950);
  };

  const handleBackToLogin = useCallback(
    (event) => {
      event.preventDefault();
      navigate('/auth/login');
    },
    [navigate]
  );

  return (
    <AuthScene title="Crear cuenta" description="" circlePosition={circlePosition} panelState={panelState}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          <span>
            Nombre
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
        </label>
        <label className="auth-form__field">
          <span>
            Apellido paterno
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="text"
            name="paternalLastName"
            value={form.paternalLastName}
            onChange={handleChange}
            placeholder="Apellido paterno"
            required
          />
        </label>
        <label className="auth-form__field">
          <span>Apellido materno</span>
          <input
            type="text"
            name="maternalLastName"
            value={form.maternalLastName}
            onChange={handleChange}
            placeholder="Apellido materno"
          />
        </label>
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
            placeholder="Contraseña"
            required
            minLength={6}
          />
        </label>
        <label className="auth-form__field">
          <span>
            Confirmar contraseña
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar contraseña"
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {status && <p className="auth-form__status">{status}</p>}
      <div className="auth-panel__links">
        <button type="button" onClick={handleBackToLogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </AuthScene>
  );
};

export default RegisterPage;

