const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const createUser = async (userData) => {
    const response = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('No se pudo crear el usuario. Verifica los datos o el servicio.');
    }

    const data = await response.json();
    return data;
};
