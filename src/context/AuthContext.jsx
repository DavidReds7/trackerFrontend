import { createContext, useContext, useMemo, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
import { login as loginService, getAuthToken } from '../api/authService';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => getAuthToken());
  const [pendingLogin, setPendingLogin] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pendingLogin');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (credentials) => {
    const loginResp = await loginService(credentials);

    // loginResp expected shape: { token, tipoToken, id, email, nombre, apellidoPaterno, apellidoMaterno, rol, requiere2FA }
    if (loginResp && loginResp.token) {
      const userData = {
        id: loginResp.id,
        email: loginResp.email,
        nombre: loginResp.nombre,
        apellidoPaterno: loginResp.apellidoPaterno ?? null,
        apellidoMaterno: loginResp.apellidoMaterno ?? null,
        rol: loginResp.rol,
        requiere2FA: loginResp.requiere2FA
      };
      try {
        localStorage.setItem('token', loginResp.token);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {}
      setToken(loginResp.token);
      setUser(userData);

      try {
        const resp = await fetch(`${BASE_URL}/usuarios/${userData.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${loginResp.token}`,
          },
        });
        if (resp.ok) {
          const apiResp = await resp.json();
          const full = apiResp?.data ?? apiResp;
          const merged = {
            ...userData,
            nombre: full?.nombre ?? userData.nombre,
            email: full?.email ?? userData.email,
            apellidoPaterno: full?.apellidoPaterno ?? null,
            apellidoMaterno: full?.apellidoMaterno ?? null,
            ubicacion: full?.ubicacion ?? null,
          };
          try {
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (e) {}
          setUser(merged);
        }
      } catch (e) {}
    } else if (loginResp && loginResp.requiere2FA) {
    }
    return loginResp;
  };

  const startPendingLogin = (credentials, extra = {}) => {
    const pending = { ...credentials, ...extra };
    try {
      sessionStorage.setItem('pendingLogin', JSON.stringify(pending));
    } catch (e) {}
    setPendingLogin(pending);
  };

  const clearPendingLogin = () => {
    try {
      sessionStorage.removeItem('pendingLogin');
    } catch (e) {}
    setPendingLogin(null);
  };

  const complete2FA = async (codigo2FA) => {
    if (!pendingLogin) throw new Error('No hay un inicio de sesión pendiente.');
    const payload = { ...pendingLogin, codigo2FA };
    const loginResp = await loginService(payload);
    if (loginResp && loginResp.token) {
      const userData = {
        id: loginResp.id,
        email: loginResp.email,
        nombre: loginResp.nombre,
        apellidoPaterno: loginResp.apellidoPaterno ?? null,
        apellidoMaterno: loginResp.apellidoMaterno ?? null,
        rol: loginResp.rol,
        requiere2FA: false
      };
      try {
        localStorage.setItem('token', loginResp.token);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {}
      setToken(loginResp.token);
      setUser(userData);
      // Always hydrate full user profile after 2FA
      try {
        const resp = await fetch(`${BASE_URL}/usuarios/${userData.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${loginResp.token}`,
          },
        });
        if (resp.ok) {
          const apiResp = await resp.json();
          const full = apiResp?.data ?? apiResp;
          const merged = {
            ...userData,
            nombre: full?.nombre ?? userData.nombre,
            email: full?.email ?? userData.email,
            apellidoPaterno: full?.apellidoPaterno ?? null,
            apellidoMaterno: full?.apellidoMaterno ?? null,
            ubicacion: full?.ubicacion ?? null,
          };
          try {
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (e) {}
          setUser(merged);
        }
      } catch (e) {}
      clearPendingLogin();
    }
    return loginResp;
  };

  const mockLogin = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {}
    setUser(userData);
    return userData;
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      pendingLogin,
      login,
      startPendingLogin,
      complete2FA,
      mockLogin,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, token, pendingLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
