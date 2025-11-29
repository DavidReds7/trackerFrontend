const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    throw new Error('Credenciales inválidas o servicio inaccesible.');
  }

  const data = await response.json();
  return data;
};
