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
    location: ''
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
    setLoading(true);
    setStatus('Registrando tus datos...');

    const payload = {
      email: form.email,
      password: form.password,
      nombre: form.firstName,
      apellidoPaterno: form.paternalLastName,
      apellidoMaterno: form.maternalLastName,
      ubicacion: form.location
    };

    try {
      // import dynamic to avoid top-level changes; require authService
      const { register } = await import('../../../api/authService');
      const user = await register(payload);
      setStatus('Cuenta creada correctamente. Puedes iniciar sesión.');
      setLoading(false);
      setTimeout(() => navigate('/auth/login'), 900);
    } catch (err) {
      setStatus(err.message || 'Error al crear la cuenta.');
      setLoading(false);
    }
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
            Municipio (Morelos)
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Selecciona tu municipio"
            list="municipios-morelos"
            required
          />
          <datalist id="municipios-morelos">
            <option value="Amacuzac" />
            <option value="Atlatlahucan" />
            <option value="Ayala" />
            <option value="Axochiapan" />
            <option value="Coatlán del Río" />
            <option value="Cuautla" />
            <option value="Cuernavaca" />
            <option value="Emiliano Zapata" />
            <option value="Huitzilac" />
            <option value="Jantetelco" />
            <option value="Jiutepec" />
            <option value="Jonacatepec" />
            <option value="Jojutla" />
            <option value="Mazatepec" />
            <option value="Miacatlán" />
            <option value="Ocuituco" />
            <option value="Puente de Ixtla" />
            <option value="Temixco" />
            <option value="Tepalcingo" />
            <option value="Tepoztlán" />
            <option value="Tetecala" />
            <option value="Tetela del Volcán" />
            <option value="Tlaquiltenango" />
            <option value="Tlayacapan" />
            <option value="Tlaltizapán" />
            <option value="Xochitepec" />
            <option value="Yautepec" />
            <option value="Zacatepec" />
            <option value="Temoac" />
          </datalist>
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

