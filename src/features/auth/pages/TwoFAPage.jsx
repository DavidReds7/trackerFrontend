import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getQRCode } from '@/api/authService';
import AuthScene from '../components/AuthScene';

const TwoFAPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQR, setLoadingQR] = useState(true);
  const { pendingLogin, complete2FA, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch QR code when page mounts
    const fetchQR = async () => {
      try {
        if (!pendingLogin || !pendingLogin.userId) {
          setStatus('Error: ID de usuario no encontrado. Vuelve a iniciar sesión.');
          setLoadingQR(false);
          return;
        }
        const qr = await getQRCode(pendingLogin.userId);
        setQrUrl(qr);
        setLoadingQR(false);
      } catch (err) {
        setStatus(`Error al obtener QR: ${err.message}`);
        setLoadingQR(false);
      }
    };
    fetchQR();
  }, [pendingLogin]);

  const handleChange = (e) => setCode(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Verificando código...');
    try {
      await complete2FA(code);
      setStatus('Código válido. Ingresando...');
      navigate('/admin');
    } catch (err) {
      setStatus(err.message || 'Código inválido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    // Clear any pending and go back to login
    logout();
    navigate('/auth/login');
  };

  return (
    <AuthScene title="Verificación 2FA" description="Escanea el código QR con tu app autenticadora" circlePosition="right" panelState>
      <div className="auth-panel__intro">
        <span>{pendingLogin?.email ? `Usuario: ${pendingLogin.email}` : 'Verificación 2FA'}</span>
      </div>

      {loadingQR && <p className="auth-form__status">Cargando código QR...</p>}

      {qrUrl && !loadingQR && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src={qrUrl}
            alt="Código QR para 2FA"
            style={{ maxWidth: '200px', width: '100%', border: '1px solid #ccc', padding: '0.5rem' }}
          />
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#666' }}>
            Escanea este código con Google Authenticator, Authy u otra app autenticadora
          </p>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          <span>
            Código 2FA
            <strong aria-hidden="true">*</strong>
          </span>
          <input
            type="text"
            name="codigo2FA"
            value={code}
            onChange={handleChange}
            placeholder="000000"
            required
            minLength={4}
            maxLength={8}
          />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
          <button type="button" onClick={handleCancel} className="button--muted">
            Cancelar
          </button>
        </div>
      </form>
      {status && <p className="auth-form__status">{status}</p>}
    </AuthScene>
  );
};

export default TwoFAPage;
