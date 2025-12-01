const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    // Try to extract backend message when available
    let errMsg = 'Credenciales inválidas o servicio inaccesible.';
    try {
      const err = await response.json();
      if (err && err.message) errMsg = err.message;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const apiResp = await response.json();

  // El backend envuelve la respuesta en { success, message, data }
  if (!apiResp || apiResp.success === false) {
    const msg = (apiResp && apiResp.message) || 'Error en autenticación.';
    throw new Error(msg);
  }

  // data contiene el LoginResponse: token, email, id, requiere2FA, etc.
  return apiResp.data;
};

export const register = async (payload) => {
  const response = await fetch(`${BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errMsg = 'No se pudo registrar. Intenta más tarde.';
    try {
      const err = await response.json();
      if (err && err.message) errMsg = err.message;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const apiResp = await response.json();
  if (!apiResp || apiResp.success === false) {
    const msg = (apiResp && apiResp.message) || 'Error en registro.';
    throw new Error(msg);
  }

  return apiResp.data; // Usuario creado
};

export const getQRCode = async (userId) => {
  const response = await fetch(`${BASE_URL}/auth/2fa/qrcode/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    let errMsg = 'No se pudo obtener el código QR.';
    try {
      const err = await response.json();
      if (err && err.message) errMsg = err.message;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const apiResp = await response.json();
  if (!apiResp || apiResp.success === false) {
    const msg = (apiResp && apiResp.message) || 'Error al obtener QR.';
    throw new Error(msg);
  }

  return apiResp.data; // QR URL en base64 o URI
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    return null;
  }
};
