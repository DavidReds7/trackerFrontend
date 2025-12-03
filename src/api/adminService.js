const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const fetchAdminOverview = async () => {
  const response = await fetch(`${BASE_URL}/admin/overview`);
  if (!response.ok) {
    throw new Error('No se pudo recuperar información administrativa.');
  }
  return response.json();
};

export const getUserById = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/usuarios/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('No se pudo cargar la información del usuario');
  }
  return response.json();
};

export const updateUser = async (userId, userData, token) => {
  const response = await fetch(`${BASE_URL}/usuarios/${userId}/datos`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const errResp = await response.json();
    throw new Error(errResp.message || 'Error al actualizar usuario');
  }
  return response.json();
};
