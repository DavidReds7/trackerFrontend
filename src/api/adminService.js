const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const fetchAdminOverview = async () => {
  const response = await fetch(`${BASE_URL}/admin/overview`);
  if (!response.ok) {
    throw new Error('No se pudo recuperar información administrativa.');
  }
  return response.json();
};
