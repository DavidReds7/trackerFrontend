import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScene from '../components/AuthScene';
import { createUser } from '../../../api/userService';

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setStatus("Registrando usuario...");

    try {
      const payload = {
        nombre: form.firstName.trim(),
        apellidos: `${form.paternalLastName.trim()}${form.maternalLastName ? " " + form.maternalLastName.trim() : ""}`,
        email: form.email.trim(),
        password: form.password,
        rol: "CLIENTE"
      };

      await createUser(payload);

      setStatus("Usuario creado correctamente. Redirigiendo al inicio de sesión...");
      
      setTimeout(() => navigate('/auth/login'), 1200);

    } catch (error) {
      setStatus(error.message || "Error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  return (
    <AuthScene title="Crear cuenta" description="" circlePosition={circlePosition} panelState={panelState}>
      <form className="auth-form" onSubmit={handleSubmit}>

        {/* Nombre */}
        <label className="auth-form__field">
          <span>Nombre <strong>*</strong></span>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
        </label>

        {/* Apellido paterno */}
        <label className="auth-form__field">
          <span>Apellido paterno <strong>*</strong></span>
          <input
            type="text"
            name="paternalLastName"
            value={form.paternalLastName}
            onChange={handleChange}
            placeholder="Apellido paterno"
            required
          />
        </label>

        {/* Apellido materno (opcional) */}
        <label className="auth-form__field">
          <span>Apellido materno</span>
          <input
            type="text"
            name="maternalLastName"
            value={form.maternalLastName}
            onChange={handleChange}
            placeholder="Apellido materno (opcional)"
          />
        </label>

        {/* Email */}
        <label className="auth-form__field">
          <span>Correo electrónico <strong>*</strong></span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />
        </label>

        {/* Password */}
        <label className="auth-form__field">
          <span>Contraseña <strong>*</strong></span>
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

        {/* Confirm password */}
        <label className="auth-form__field">
          <span>Confirmar contraseña <strong>*</strong></span>
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
          {loading ? "Registrando..." : "Registrar"}
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