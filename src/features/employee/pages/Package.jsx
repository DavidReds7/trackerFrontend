import React, { useEffect, useState } from 'react';
import EmployeeHeader from '../components/EmployeeHeader';
import '@/features/admin/pages/admin-layout.css';
import '@/features/admin/pages/users.css';
import { useAuth } from '@/context/AuthContext';
import { createPackage } from '@/api/packageService';
import { FiRefreshCw } from 'react-icons/fi';

export default function Package() {
    const { token } = useAuth();
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [packages, setPackages] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [details, setDetails] = useState(null);
    const [formData, setFormData] = useState({
        descripcion: '',
        clienteEmail: '',
        direccionDestino: '',
    });
    const [clients, setClients] = useState([]);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [showMovement, setShowMovement] = useState(false);
    const [movementData, setMovementData] = useState({
        paqueteId: '',
        estado: '',
        ubicacion: '',
        observaciones: '',
    });
    const [movementError, setMovementError] = useState(null);
    const [movementSuccess, setMovementSuccess] = useState(null);
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        try {
            // Obtener empleadoId desde localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const empleadoId = user.id;

            if (!empleadoId) {
                throw new Error('No se encontró el ID del empleado en localStorage');
            }

            // Construir payload según nuevo esquema: ubicacion = direccionDestino
            const payload = {
                descripcion: formData.descripcion,
                clienteEmail: formData.clienteEmail,
                direccionDestino: formData.direccionDestino,
                empleadoId,
                ubicacion: formData.direccionDestino,
            };

            await createPackage(payload, token);
            setFormSuccess("Paquete registrado correctamente");

            setTimeout(() => {
                setFormData({ descripcion: "", clienteEmail: "", direccionDestino: "" });
                setShowForm(false);
                setFormSuccess(null);
                fetchPackages();
            }, 2000);

        } catch (err) {
            setFormError(err.message || 'Error al crear el paquete');
        }
    };


    useEffect(() => {
        if (token) fetchPackages();
    }, [token]);

    // Cargar lista de clientes (solo emails) para el select
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const resp = await fetch(`${BASE_URL}/usuarios/rol/CLIENTE`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!resp.ok) throw new Error('No se pudieron cargar los clientes');
                const apiResp = await resp.json();
                const data = apiResp && apiResp.data ? apiResp.data : apiResp;
                const emails = Array.isArray(data) ? data.map((u) => u.email).filter(Boolean) : [];
                setClients(emails);
            } catch (err) {
                console.error('Error cargando clients:', err);
                setClients([]);
            }
        };

        if (token) fetchClients();
    }, [token]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            // Obtener ID del empleado del localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const empleadoId = user.id;

            if (!empleadoId) {
                throw new Error('No se encontró el ID del empleado');
            }

            // 🌟 CAMBIO CLAVE AQUÍ: Usar el parámetro de consulta ?empleadoId=
            const url = `${BASE_URL}/paquetes/empleado?empleadoId=${empleadoId}`;

            const resp = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resp.ok) throw new Error('No se pudieron cargar los paquetes');
            const apiResp = await resp.json();
            const data = apiResp && apiResp.data ? apiResp.data : apiResp;
            setPackages(data || []);
            setFiltered(data || []);
        } catch (err) {
            console.error('Error cargando paquetes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        setFiltered(
            packages.filter((p) => {
                if (estadoFilter && String(p.estado || '').toUpperCase() !== String(estadoFilter).toUpperCase()) {
                    return false;
                }

                if (!term) return true;

                return (
                    String(p.codigoQR || p.guiaTracking || p.guia_numero || '').toLowerCase().includes(term)
                );
            })
        );
    }, [searchTerm, packages, estadoFilter]);

    const handleView = async (pkgId) => {
        setSelected(pkgId);
        setDetails(null);
        try {
            const resp = await fetch(`${BASE_URL}/paquetes/${pkgId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            if (!resp.ok) throw new Error('No se pudo cargar el paquete');
            const apiResp = await resp.json();
            setDetails(apiResp.data || apiResp);
        } catch (err) {
            console.error('Error al cargar detalles:', err);
        }
    };

    const handleOpenMovement = (pkgId, currentEstado) => {
        setMovementData({
            paqueteId: pkgId,
            estado: currentEstado,
            ubicacion: '',
            observaciones: '',
        });
        setShowMovement(true);
        setMovementError(null);
        setMovementSuccess(null);
    };

    const handleMovementChange = (e) => {
        const { name, value } = e.target;
        setMovementData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateMovement = async (e) => {
        e.preventDefault();
        setMovementError(null);
        setMovementSuccess(null);

        try {
            const resp = await fetch(`${BASE_URL}/movimientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paqueteId: movementData.paqueteId,
                    estado: movementData.estado,
                    ubicacion: movementData.ubicacion,
                    observaciones: movementData.observaciones,
                }),
            });

            if (!resp.ok) throw new Error('No se pudo registrar el movimiento');
            const apiResp = await resp.json();
            setMovementSuccess('Movimiento registrado correctamente');

            setTimeout(() => {
                setMovementData({
                    paqueteId: '',
                    estado: '',
                    ubicacion: '',
                    observaciones: '',
                });
                setShowMovement(false);
                setMovementSuccess(null);
                fetchPackages();
            }, 2000);
        } catch (err) {
            setMovementError(err.message || 'Error al registrar movimiento');
        }
    };

    return (
        <div className="admin-shell">
            <EmployeeHeader />
            <div className="admin-layout">
                <div className="admin-layout__inner">
                    <section className="admin-panel--users">
                        <div className="admin-panel__header">
                            <button
                                type="button"
                                className="btn-add-user"
                                onClick={() => setShowForm(!showForm)}
                            >
                                Agregar Paquete
                            </button>
                            <div className="admin-panel__controls" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <select
                                    name="estadoFilter"
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                    className="search-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="RECOLECTADO">RECOLECTADO</option>
                                    <option value="EN_TRANSITO">EN_TRANSITO</option>
                                    <option value="ENTREGADO">ENTREGADO</option>
                                    <option value="CANCELADO">CANCELADO</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Buscador por guía"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <p className="loading-message">Cargando paquetes...</p>
                        ) : filtered && filtered.length > 0 ? (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Guía</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                        <th>Ubicación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id || p._id || p.guia || Math.random()}>
                                            <td>{p.codigoQR || p.guiaTracking || p.guia_numero}</td>
                                            <td>{(p.clienteEmail || p.cliente || p.nombreCliente) || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${p.estado === 'ENTREGADO' ? 'status-active' : 'status-inactive'}`}>
                                                    {p.estado || '-'}
                                                </span>
                                            </td>
                                            <td>{p.ubicacion || p.ultimaUbicacion || '-'}</td>
                                            <td className="actions-cell">
                                                <button
                                                    type="button"
                                                    className="action-btn action-btn--view"
                                                    title="Registrar Movimiento"
                                                    aria-label="Registrar movimiento"
                                                    onClick={() => handleOpenMovement(p.id || p._id || p.paqueteId, p.estado)}
                                                >
                                                    <FiRefreshCw />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-users-message">No hay paquetes para mostrar</p>
                        )}

                        {showForm && (
                            <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Agregar paquete">
                                <div className="modal">
                                    <header className="modal-header">
                                        <h3>Agregar paquete</h3>
                                        <button
                                            type="button"
                                            className="modal-close"
                                            onClick={() => setShowForm(false)}
                                            aria-label="Cerrar modal"
                                        >
                                            ×
                                        </button>
                                    </header>

                                    <div className="modal-body">
                                        <form className="auth-form" onSubmit={handleCreatePackage}>
                                            <div className="form-row">
                                                <label className="auth-form__field">
                                                    <span>Descripción <strong>*</strong></span>
                                                    <input
                                                        type="text"
                                                        name="descripcion"
                                                        value={formData.descripcion}
                                                        onChange={handleChange}
                                                        placeholder="Descripción del paquete"
                                                        required
                                                    />
                                                </label>
                                                <label className="auth-form__field">
                                                    <span>Email del Cliente <strong>*</strong></span>
                                                    <select
                                                        name="clienteEmail"
                                                        value={formData.clienteEmail}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Selecciona un cliente</option>
                                                        {clients.length === 0 ? (
                                                            <option value="" disabled>No hay clientes</option>
                                                        ) : (
                                                            clients.map((email) => (
                                                                <option key={email} value={email}>{email}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                </label>
                                            </div>

                                            <div className="form-row">
                                                <label className="auth-form__field" style={{ width: '100%' }}>
                                                    <span>Dirección Destino <strong>*</strong></span>
                                                    <select
                                                        name="direccionDestino"
                                                        value={formData.direccionDestino}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Selecciona un estado</option>
                                                        <option value="Aguascalientes">Aguascalientes</option>
                                                        <option value="Baja California">Baja California</option>
                                                        <option value="Baja California Sur">Baja California Sur</option>
                                                        <option value="Campeche">Campeche</option>
                                                        <option value="Chiapas">Chiapas</option>
                                                        <option value="Chihuahua">Chihuahua</option>
                                                        <option value="Ciudad de México">Ciudad de México</option>
                                                        <option value="Coahuila">Coahuila</option>
                                                        <option value="Colima">Colima</option>
                                                        <option value="Durango">Durango</option>
                                                        <option value="Guanajuato">Guanajuato</option>
                                                        <option value="Guerrero">Guerrero</option>
                                                        <option value="Hidalgo">Hidalgo</option>
                                                        <option value="Jalisco">Jalisco</option>
                                                        <option value="México">México</option>
                                                        <option value="Michoacán">Michoacán</option>
                                                        <option value="Morelos">Morelos</option>
                                                        <option value="Nayarit">Nayarit</option>
                                                        <option value="Nuevo León">Nuevo León</option>
                                                        <option value="Oaxaca">Oaxaca</option>
                                                        <option value="Puebla">Puebla</option>
                                                        <option value="Querétaro">Querétaro</option>
                                                        <option value="Quintana Roo">Quintana Roo</option>
                                                        <option value="San Luis Potosí">San Luis Potosí</option>
                                                        <option value="Sinaloa">Sinaloa</option>
                                                        <option value="Sonora">Sonora</option>
                                                        <option value="Tabasco">Tabasco</option>
                                                        <option value="Tamaulipas">Tamaulipas</option>
                                                        <option value="Tlaxcala">Tlaxcala</option>
                                                        <option value="Veracruz">Veracruz</option>
                                                        <option value="Yucatán">Yucatán</option>
                                                        <option value="Zacatecas">Zacatecas</option>
                                                    </select>
                                                </label>
                                            </div>

                                            {formError && <p className="form-error">{formError}</p>}
                                            {formSuccess && <p className="form-success">{formSuccess}</p>}

                                            <div className="modal-actions">
                                                <button
                                                    type="button"
                                                    className="btn-add-user btn-cancel"
                                                    onClick={() => setShowForm(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button type="submit" className="btn-add-user">
                                                    Guardar paquete
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Movement modal */}
                        {showMovement && (
                            <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Registrar movimiento">
                                <div className="modal">
                                    <header className="modal-header">
                                        <h3>Registrar Movimiento</h3>
                                        <button
                                            type="button"
                                            className="modal-close"
                                            onClick={() => setShowMovement(false)}
                                            aria-label="Cerrar modal"
                                        >
                                            ×
                                        </button>
                                    </header>

                                    <div className="modal-body">
                                        <form className="auth-form" onSubmit={handleCreateMovement}>
                                            <div className="form-row">
                                                <label className="auth-form__field" style={{ width: '100%' }}>
                                                    <span>Estado <strong>*</strong></span>
                                                    <select
                                                        name="estado"
                                                        value={movementData.estado}
                                                        onChange={handleMovementChange}
                                                        required
                                                    >
                                                        <option value="" disabled>Selecciona un estado</option>
                                                        <option value="RECOLECTADO">RECOLECTADO</option>
                                                        <option value="EN_TRANSITO">EN_TRANSITO</option>
                                                        <option value="ENTREGADO">ENTREGADO</option>
                                                        <option value="CANCELADO">CANCELADO</option>
                                                    </select>
                                                </label>
                                                <label className="auth-form__field" style={{ width: '100%' }}>
                                                    <span>Ubicación <strong>*</strong></span>
                                                    <input
                                                        type="text"
                                                        name="ubicacion"
                                                        value={movementData.ubicacion}
                                                        onChange={handleMovementChange}
                                                        placeholder="Ingresa la ubicación actual"
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            

                                            <div >
                                                <label className="auth-form__field" style={{ width: '100%' }}>
                                                    <span>Observaciones</span>
                                                    <textarea
                                                        className='info-grid'
                                                        name="observaciones"
                                                        value={movementData.observaciones}
                                                        onChange={handleMovementChange}
                                                        placeholder="Notas adicionales (opcional)"
                                                        rows="4"
                                                        
                                                    />
                                                </label>
                                            </div>

                                            {movementError && <p className="form-error">{movementError}</p>}
                                            {movementSuccess && <p className="form-success">{movementSuccess}</p>}

                                            <div className="modal-actions">
                                                <button
                                                    type="button"
                                                    className="btn-add-user btn-cancel"
                                                    onClick={() => setShowMovement(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button type="submit" className="btn-add-user">
                                                    Registrar Movimiento
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Details modal */}
                        {selected && details && (
                            <div className="details-overlay" role="dialog" aria-modal="true" aria-label="Información del paquete">
                                <div className="details-modal">
                                    <button className="success-close" aria-label="Cerrar" onClick={() => { setSelected(null); setDetails(null); }}>×</button>
                                    <div className="details-content">
                                        <h2>Detalle Paquete</h2>
                                        <div className="info-section">
                                            <div className="info-grid">
                                                <div className="info-row">
                                                    <label>Guía</label>
                                                    <span>{details.guia || details.guiaTracking || details.guia_numero}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Cliente</label>
                                                    <span>{(details.cliente && (details.cliente.nombre || details.cliente)) || details.nombreCliente || '-'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Estado</label>
                                                    <span className={`status-badge ${details.estado === 'ENTREGADO' ? 'status-active' : 'status-inactive'}`}>
                                                        {details.estado || '-'}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Última ubicación</label>
                                                    <span>{details.ubicacion || details.ultimaUbicacion || '-'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Última actualización</label>
                                                    <span>{details.updatedAt || details.actualizado || details.fecha || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
