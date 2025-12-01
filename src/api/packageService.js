const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const createPackage = async (packageData, token) => {
    const response = await fetch(`${BASE_URL}/paquetes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(packageData)
    });

    if (!response.ok) {
        throw new Error('No se pudo crear el paquete. Verifica los datos o el servicio.');
    }

    const data = await response.json();
    return data;
}