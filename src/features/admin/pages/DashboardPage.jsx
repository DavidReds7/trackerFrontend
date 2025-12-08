import React, { useEffect, useState } from 'react';
import '@/features/admin/pages/dashboard.css';
import '@/features/admin/pages/admin-layout.css';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '../components/AdminHeader';

const activity = [
  'Repartidor1 ha actualizado la entrega PKG-00123',
  'Repartidor2 ha generado un nuevo destino',
  'Repartidor3 ha creado la nota PKG-00124',
  'Repartidor4 ha actualizado el estado a En tránsito',
  'Repartidor1 ha completado la entrega PKG-00120',
  'Repartidor2 ha generado un aviso de retraso',
  'Repartidor3 ha creado la nota de cobro PKG-00122'
];

const DashboardPage = () => {
  const { user, token } = useAuth();

  const [stats, setStats] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [recentPackages, setRecentPackages] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

  // Estados a consultar con sus configuraciones (mismas cards que EmployeeDashboard)
  const estadosConfig = [
    { estado: 'RECOLECTADO', label: 'Por entregar', modifier: 'admin-card--sand' },
    { estado: 'EN_TRANSITO', label: 'En Tránsito', modifier: 'admin-card--blue' },
    { estado: 'ENTREGADO', label: 'Entregados', modifier: 'admin-card--green' },
    { estado: 'RETRASADO', label: 'Retrasados', modifier: 'admin-card--amber' },
    { estado: 'CANCELADO', label: 'Sin recibir', modifier: 'admin-card--rose' }
  ];

  // Meses del año para obtener data por mes (año actual)
  const currentYear = new Date().getFullYear();
  const months = [
    { label: 'Ene', mes: `${currentYear}-01` },
    { label: 'Feb', mes: `${currentYear}-02` },
    { label: 'Mar', mes: `${currentYear}-03` },
    { label: 'Abr', mes: `${currentYear}-04` },
    { label: 'May', mes: `${currentYear}-05` },
    { label: 'Jun', mes: `${currentYear}-06` },
    { label: 'Jul', mes: `${currentYear}-07` },
    { label: 'Ago', mes: `${currentYear}-08` },
    { label: 'Sep', mes: `${currentYear}-09` },
    { label: 'Oct', mes: `${currentYear}-10` },
    { label: 'Nov', mes: `${currentYear}-11` },
    { label: 'Dic', mes: `${currentYear}-12` }
  ];

  const accentColors = [
    '#508960', '#66a67d', '#8fbba6', '#a6c6b3',
    '#b4d1c1', '#c3d5ba', '#73b08b', '#5c986c',
    '#477e58', '#609d73', '#9ebca8', '#558f66'
  ];

  // Helper para formatear timestamp Firestore-like a HH:mm
  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp.seconds === undefined) return '-';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Fetch de estadísticas globales (usa /paquetes/empleado por estado) ---
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const statsData = await Promise.all(
        estadosConfig.map(async ({ estado, label, modifier }) => {
          try {
            // A nivel admin: todos los paquetes con ese estado (sin empleadoId)
            const resp = await fetch(
              `${BASE_URL}/paquetes/empleado?estado=${estado}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!resp.ok) throw new Error(`Error fetching estado ${estado}`);

            const apiResp = await resp.json();
            const data = apiResp.data ? apiResp.data : apiResp;
            const count = Array.isArray(data) ? data.length : 0;

            return {
              value: String(count),
              label,
              modifier,
            };
          } catch (err) {
            console.error(`Error fetching estado ${estado}:`, err);
            return { value: '0', label, modifier };
          }
        })
      );

      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // --- Fetch de entregados por mes (usa /paquetes/empleado?estado=ENTREGADO&mes=YYYY-MM) ---
  const fetchChartData = async () => {
    setLoadingChart(true);
    try {
      const maxPaquetesReferencia = 100; // para escalar barras (puedes ajustar)

      const chartData = await Promise.all(
        months.map(async ({ label, mes }, index) => {
          try {
            const resp = await fetch(
              `${BASE_URL}/paquetes/empleado?estado=ENTREGADO&mes=${mes}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!resp.ok) throw new Error(`Error fetching entregados para mes ${mes}`);

            const apiResp = await resp.json();
            const data = apiResp.data ? apiResp.data : apiResp;
            const count = Array.isArray(data) ? data.length : 0;

            // Altura relativa (0–95%)
            const rawHeight = maxPaquetesReferencia > 0
              ? (count / maxPaquetesReferencia) * 100
              : 0;

            const clampedHeight = Math.min(rawHeight, 95);
            const finalHeight = count > 0 ? Math.max(clampedHeight, 5) : 0; // mínimo 5% si hay algo

            return {
              label,
              height: `${finalHeight}%`,
              accent: accentColors[index % accentColors.length],
              count,
            };
          } catch (err) {
            console.error(`Error fetching chart data for ${mes}:`, err);
            return { label, height: '0%', accent: '#ccc', count: 0 };
          }
        })
      );

      setChartValues(chartData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  // --- Fetch de últimas actualizaciones (tabla) ---
  const fetchRecentPackages = async () => {
    setLoadingRecent(true);
    try {
      const resp = await fetch(`${BASE_URL}/paquetes/recientes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) throw new Error('Error al obtener paquetes recientes');

      const apiResp = await resp.json();
      setRecentPackages(apiResp.data || []);
    } catch (err) {
      console.error('Error al cargar paquetes recientes:', err);
      setRecentPackages([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchStats();
    fetchChartData();
    fetchRecentPackages();
  }, [token]);

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-layout">
        <div className="admin-layout__inner">
          {/* GRID DE TARJETAS (igual estilo que EmployeeDashboard) */}
          <div className="admin-stats-grid">
            {loadingStats ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                Cargando estadísticas...
              </p>
            ) : (
              stats.map((stat) => (
                <article key={stat.label} className={`admin-card ${stat.modifier}`}>
                  <h2>{stat.value}</h2>
                  <span>{stat.label}</span>
                </article>
              ))
            )}
          </div>

          {/* GRID PRINCIPAL: GRÁFICO + ACTIVIDAD (mismo layout que EmployeeDashboard) */}
          <div className="admin-content-grid">
            <article className="admin-panel admin-panel--chart">
              <div className="admin-panel__header">
                <h3>Entregados por mes (global)</h3>
                <div className="admin-panel__controls">
                  {/* En admin, este input es decorativo por ahora (igual que EmployeeDashboard) */}
                  <input placeholder="Buscar empleado" />
                </div>
              </div>

              {loadingChart ? (
                <p style={{ textAlign: 'center' }}>Cargando entregas por mes...</p>
              ) : (
                <div className="chart-bars">
                  {chartValues.map((bar) => (
                    <div
                      key={bar.label}
                      data-label={bar.label}
                      style={{ position: 'relative' }}
                    >
                      <span
                        style={{
                          height: bar.height,
                          background: bar.accent,
                        }}
                        title={`${bar.label}: ${bar.count} paquetes entregados`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-panel admin-panel--activity">
              <h3>Actividad reciente</h3>
              <ul>
                {activity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          {/* TABLA DE ÚLTIMAS ACTUALIZACIONES (mismo diseño de EmployeeDashboard) */}
          <div className="admin-table">
            <section className="admin-panel admin-panel--table">
              <h3>Últimas 10 actualizaciones de paquetes</h3>

              {loadingRecent ? (
                <p style={{ textAlign: 'center' }}>Cargando paquetes recientes...</p>
              ) : recentPackages.length === 0 ? (
                <p style={{ textAlign: 'center' }}>
                  No hay paquetes recientes para mostrar.
                </p>
              ) : (
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
                        <td>
                          <span className="status-chip">{row.estado}</span>
                        </td>
                        <td>{row.ubicacion || row.direccionDestino}</td>
                        <td>{formatTimestamp(row.fechaUltimaActualizacion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
