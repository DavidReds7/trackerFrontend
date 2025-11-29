import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScene from '../components/AuthScene';

const RecoveryPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const circlePosition = 'left';
  const panelState = 'idle';

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('Preparando enlace de recuperación...');
    setTimeout(() => {
      setMessage('Enlace enviado. Revisa tu bandeja y recuerda revisar la carpeta de spam.');
      setLoading(false);
    }, 900);
  };

  const handleBackToLogin = useCallback(
    (event) => {
      event.preventDefault();
      navigate('/auth/login');
    },
    [navigate]
  );

  return (
    <AuthScene
      title="Recuperar cuenta"
      description="Ingresa el correo asociado a tu cuenta y te enviaremos un enlace seguro de restablecimiento."
      circlePosition={circlePosition}
      panelState={panelState}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input
            type="email"
            name="recoveryEmail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@empresa.com"
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
      {message && <p className="auth-form__status">{message}</p>}
      <div className="auth-panel__links">
        <button type="button" onClick={handleBackToLogin}>
          Regresar
        </button>
      </div>
    </AuthScene>
  );
};

export default RecoveryPage;

