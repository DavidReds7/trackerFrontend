import React, { useEffect, useState } from 'react';
import '@/features/admin/pages/dashboard.css';
import { useAuth } from '@/context/AuthContext';
import '@/features/admin/pages/admin-layout.css';
import EmployeeHeader from '../components/EmployeeHeader';

const activity = [
    'Repartidor1 ha actualizado la entrega PKG-00123',
    'Repartidor2 ha generado un nuevo destino',
    'Repartidor3 ha creado la nota PKG-00124',
    'Repartidor4 ha actualizado el estado a En tránsito',
    'Repartidor1 ha completado la entrega PKG-00120',
    'Repartidor2 ha generado un aviso de retraso',
    'Repartidor3 ha creado la nota de cobro PKG-00122'
];

const EmployeeDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState([]);
    const [chartValues, setChartValues] = useState([]);
    const [recentPackages, setRecentPackages] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);
    const [loading, setLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

    // Estados a consultar con sus configuraciones
    const estadosConfig = [
        { estado: 'RECOLECTADO', label: 'Por entregar', modifier: 'admin-card--sand' },
        { estado: 'EN_TRANSITO', label: 'En Tránsito', modifier: 'admin-card--blue' },
        { estado: 'ENTREGADO', label: 'Entregados', modifier: 'admin-card--green' },
        { estado: 'RETRASADO', label: 'Retrasados', modifier: 'admin-card--amber' },
        { estado: 'CANCELADO', label: 'Sin recibir', modifier: 'admin-card--rose' }
    ];

    // Meses del año para obtener data por mes
    const months = [
        { label: 'Ene', mes: '2024-01' },
        { label: 'Feb', mes: '2024-02' },
        { label: 'Mar', mes: '2024-03' },
        { label: 'Abr', mes: '2024-04' },
        { label: 'May', mes: '2024-05' },
        { label: 'Jun', mes: '2024-06' },
        { label: 'Jul', mes: '2024-07' },
        { label: 'Ago', mes: '2024-08' },
        { label: 'Sep', mes: '2024-09' },
        { label: 'Oct', mes: '2024-10' },
        { label: 'Nov', mes: '2024-11' },
        { label: 'Dic', mes: '2024-12' }
    ];

    const fetchMovements = async () => {
        setLoadingMovements(true);
        try {
            const empleadoId = user?.id;

            const resp = await fetch(
                `${BASE_URL}/movimientos/empleado/${empleadoId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!resp.ok) throw new Error("Error al cargar movimientos");

            const apiResp = await resp.json();
            const rawMovements = apiResp.data || [];

            // 🔥 Solo quedarnos con los primeros 5 movimientos
            const lastFive = rawMovements.slice(0, 5);

            // 🔥 Para cada movimiento obtener el paquete (para sacar el código QR)
            const movementsWithPackage = await Promise.all(
                lastFive.map(async (m) => {
                    try {
                        const pkgResp = await fetch(
                            `${BASE_URL}/paquetes/${m.paqueteId}`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!pkgResp.ok) throw new Error("Error fetching package");

                        const pkgData = await pkgResp.json();
                        const paquete = pkgData.data;

                        return {
                            ...m,
                            codigoQR: paquete?.codigoQR ?? "SIN-CODIGO",
                        };
                    } catch (err) {
                        console.error(`Error obteniendo paquete ${m.paqueteId}`, err);
                        return { ...m, codigoQR: "SIN-CODIGO" };
                    }
                })
            );

            setMovements(movementsWithPackage);

        } catch (err) {
            console.error("Error cargando movimientos:", err);
            setMovements([]);
        } finally {
            setLoadingMovements(false);
        }
    };

    const fetchChartData = async () => {
        setLoadingChart(true);
        try {
            const empleadoId = user?.id;
            if (!empleadoId) return;

            // Primer fetch para obtener totales por mes
            const totalCounts = await Promise.all(
                months.map(async ({ mes }) => {
                    const resp = await fetch(
                        `${BASE_URL}/paquetes/empleado?empleadoId=${empleadoId}&estado=ENTREGADO&mes=${mes}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    const apiResp = await resp.json();
                    const data = apiResp.data || [];
                    return Array.isArray(data) ? data.length : 0;
                })
            );

            // Máximo real del empleado
            const maxPaquetesReferencia = Math.max(...totalCounts, 1);

            const chartData = await Promise.all(
                months.map(async ({ label, mes }, index) => {
                    try {
                        const resp = await fetch(
                            `${BASE_URL}/paquetes/empleado?empleadoId=${empleadoId}&estado=ENTREGADO&mes=${mes}`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!resp.ok) throw new Error();

                        const apiResp = await resp.json();
                        const data = apiResp.data || [];
                        const count = Array.isArray(data) ? data.length : 0;

                        const rawHeight =
                            maxPaquetesReferencia > 0
                                ? (count / maxPaquetesReferencia) * 100
                                : 0;

                        const clampedHeight = Math.min(rawHeight, 95);
                        const finalHeight = count > 0 ? Math.max(clampedHeight, 5) : 0;

                        return {
                            label,
                            height: `${finalHeight}%`,
                            accent: accentColors[index % accentColors.length],
                            count,
                        };
                    } catch (err) {
                        return { label, height: "0%", accent: "#ccc", count: 0 };
                    }
                })
            );

            setChartValues(chartData);
        } catch (err) {
            console.error("Error fetching chart data:", err);
        } finally {
            setLoadingChart(false);
        }
    };

    const fetchRecentPackages = async () => {
        setLoadingRecent(true);
        try {
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            const empleadoId = userObj.id;

            const resp = await fetch(
                `${BASE_URL}/paquetes/recientes?usuarioId=${empleadoId}`,
                {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if (!resp.ok) throw new Error("Error loading recent packages");

            const apiResp = await resp.json();
            setRecentPackages(apiResp.data || []);

        } catch (err) {
            console.error("Error al cargar paquetes recientes:", err);
            setRecentPackages([]);
        } finally {
            setLoadingRecent(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Obtener ID del empleado del localStorage
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            const empleadoId = userObj.id;

            if (!empleadoId) {
                console.error('No se encontró empleadoId en localStorage');
                setLoading(false);
                return;
            }

            // Obtener estadísticas generales del empleado
            const statsData = await Promise.all(
                estadosConfig.map(async ({ estado, label, modifier }) => {
                    try {
                        const resp = await fetch(`${BASE_URL}/paquetes/empleado?usuarioId=${empleadoId}&estado=${estado}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        if (!resp.ok) throw new Error(`Error fetching ${estado}`);
                        const apiResp = await resp.json();
                        const data = apiResp.data ? apiResp.data : apiResp;
                        const count = Array.isArray(data) ? data.length : 0;
                        return {
                            value: String(count),
                            label,
                            modifier,
                        };
                    } catch (err) {
                        console.error(`Error fetching ${estado}:`, err);
                        return { value: '0', label, modifier };
                    }
                })
            );
            setStats(statsData);

            // Obtener paquetes por mes para el gráfico (todos los estados)
            const chartData = await Promise.all(
                months.map(async ({ label, mes }) => {
                    try {
                        const resp = await fetch(`${BASE_URL}/paquetes/empleado?empleadoId=${empleadoId}&mes=${mes}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        if (!resp.ok) throw new Error(`Error fetching ${mes}`);
                        const apiResp = await resp.json();
                        const data = apiResp.data ? apiResp.data : apiResp;
                        const count = Array.isArray(data) ? data.length : 0;

                        // Calcular altura relativa (máximo esperado: 100 paquetes)
                        const maxPaquetes = 100;
                        const height = Math.min((count / maxPaquetes) * 100, 95);

                        // Colores degradados según altura
                        const accentColors = [
                            '#508960', '#66a67d', '#8fbba6', '#a6c6b3',
                            '#b4d1c1', '#c3d5ba', '#73b08b', '#5c986c',
                            '#477e58', '#609d73', '#9ebca8', '#558f66'
                        ];

                        return {
                            label,
                            height: `${Math.max(height, 5)}%`,
                            accent: accentColors[months.indexOf({ label, mes })],
                            count
                        };
                    } catch (err) {
                        console.error(`Error fetching chart data for ${mes}:`, err);
                        return { label, height: '0%', accent: '#ccc', count: 0 };
                    }
                })
            );
            setChartValues(chartData);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            await fetchStats();
            await fetchChartData();
            await fetchRecentPackages();
            await fetchMovements();
        };

        if (token) fetchAll();
    }, [token]);


    return (
        <div className="admin-shell">
            <EmployeeHeader />
            <div className="admin-layout">
                <div className="admin-layout__inner">
                    <div className="admin-stats-grid">
                        {loading ? (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Cargando estadísticas...</p>
                        ) : (
                            stats.map((stat) => (
                                <article key={stat.label} className={`admin-card ${stat.modifier}`}>
                                    <h2>{stat.value}</h2>
                                    <span>{stat.label}</span>
                                </article>
                            ))
                        )}
                    </div>

                    <div className="admin-content-grid">
                        <article className="admin-panel admin-panel--chart">
                            <div className="admin-panel__header">
                                <h3>Entregados por mes de {user?.username ?? 'Juan'}</h3>
                                <div className="admin-panel__controls">
                                    <input placeholder="Buscar empleado" />
                                </div>
                            </div>
                            <div className="chart-bars">
                                {chartValues.map((bar) => (
                                    <div key={bar.label} data-label={bar.label} style={{ position: 'relative' }}>
                                        <span style={{ height: bar.height, background: bar.accent }} title={`${bar.label}: ${bar.count} paquetes`} />
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="admin-panel admin-panel--activity">
                            <h3>Actividad reciente</h3>

                            {loadingMovements ? (
                                <p>Cargando actividad...</p>
                            ) : movements.length === 0 ? (
                                <p>No hay movimientos recientes.</p>
                            ) : (
                                <ul>
                                    {movements.map((m) => (
                                        <li key={m.id}>
                                            <strong>{m.estado}</strong> — {m.ubicacion}
                                            <br />
                                            <small>
                                                Guía: <strong>{m.codigoQR}</strong> ·{" "}
                                                {m.observaciones || "Sin observaciones"} ·{" "}
                                                {new Date(m.fechaHora.seconds * 1000).toLocaleTimeString("es-MX")}
                                            </small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    </div>

                    <div className="admin-table">
                        <section className="admin-panel admin-panel--table">
                            <h3>Últimas 10 actualizaciones de paquetes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Guía</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                        <th>Ubicación</th>
                                        <th>Actualizado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPackages.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.codigoQR}</td>
                                            <td>{row.clienteEmail}</td>
                                            <td><span className="status-chip">{row.estado}</span></td>
                                            <td>{row.ubicacion || row.direccionDestino}</td>
                                            <td>{new Date(row.fechaUltimaActualizacion.seconds * 1000).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
