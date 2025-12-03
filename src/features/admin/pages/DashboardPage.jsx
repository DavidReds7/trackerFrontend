import React, { useEffect, useState } from 'react';
import '@/features/admin/pages/dashboard.css';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '../components/AdminHeader';
import '@/features/admin/pages/admin-layout.css';

const chartValues = [
  { label: 'Ene', height: '92%', accent: '#66a67d' },
  { label: 'Feb', height: '52%', accent: '#8fbba6' },
  { label: 'Mar', height: '32%', accent: '#c3d5ba' },
  { label: 'Abr', height: '22%', accent: '#e9f1e6' }
];

const activity = [
  'Repartidor1 ha actualizado la entrega PKG-00123',
  'Repartidor2 ha generado un nuevo destino',
  'Repartidor3 ha creado la nota PKG-00124',
  'Repartidor4 ha actualizado el estado a En tránsito',
  'Repartidor1 ha completado la entrega PKG-00120',
  'Repartidor2 ha generado un aviso de retraso',
  'Repartidor3 ha creado la nota de cobro PKG-00122'
];

const timeline = [
  { guide: 'PKG-00123', client: 'Karla Lopez', status: 'En tránsito', location: 'CDMX', updated: '10:22' },
  { guide: 'PKG-00124', client: 'Juan Perez', status: 'Entregado', location: 'Puebla', updated: '09:58' },
  { guide: 'PKG-00125', client: 'Ana Martínez', status: 'Por entregar', location: 'Toluca', updated: '09:30' },
  { guide: 'PKG-00126', client: 'Diego Ríos', status: 'Retrasado', location: 'Cuernavaca', updated: '09:18' }
];

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState([]);
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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsData = await Promise.all(
          estadosConfig.map(async ({ estado, label, modifier }) => {
            try {
              const resp = await fetch(`${BASE_URL}/paquetes/estado/${estado}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!resp.ok) throw new Error(`Error fetching ${estado}`);
              const apiResp = await resp.json();
              return {
                value: String(apiResp.data || 0),
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
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <div className="admin-shell">
      <AdminHeader />
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
                    <div key={bar.label} data-label={bar.label}>
                      <span style={{ height: bar.height, background: bar.accent }} />
                    </div>
                  ))}
                </div>
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
                  {timeline.map((row) => (
                    <tr key={row.guide}>
                      <td>{row.guide}</td>
                      <td>{row.client}</td>
                      <td>
                        <span className="status-chip">{row.status}</span>
                      </td>
                      <td>{row.location}</td>
                      <td>{row.updated}</td>
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

export default DashboardPage;
