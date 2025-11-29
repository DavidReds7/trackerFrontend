const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const fetchMovimientos = async () => {
  const response = await fetch(`${BASE_URL}/movimientos`);
  if (!response.ok) {
    throw new Error('No se pudieron cargar los movimientos.');
  }
  return response.json();
};
