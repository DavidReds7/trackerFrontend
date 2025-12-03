import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '@/features/admin/pages/reports.css';
import '@/features/admin/pages/admin-layout.css';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '@/context/AuthContext';

const ReportsPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [employeeDeliveries, setEmployeeDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

  const estadosConfig = [
    { estado: 'RECOLECTADO', label: 'Por entregar', color: '#93c5fd' },
    { estado: 'EN_TRANSITO', label: 'En tránsito', color: '#fcd34d' },
    { estado: 'ENTREGADO', label: 'Entregados', color: '#86efac' },
    { estado: 'RETRASADO', label: 'Retrasados', color: '#fed7aa' },
    { estado: 'CANCELADO', label: 'Sin recibir', color: '#fca5a5' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsData = await Promise.all(
          estadosConfig.map(async ({ estado, label, color }) => {
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
              const value = apiResp.data || 0;
              return {
                name: label,
                value: parseInt(value, 10),
                color,
              };
            } catch (err) {
              console.error(`Error fetching ${estado}:`, err);
              return { name: label, value: 0, color };
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

  useEffect(() => {
    const fetchEmployeeDeliveries = async () => {
      setLoadingEmployees(true);
      try {
        // Obtener lista de empleados
        const employeesResp = await fetch(`${BASE_URL}/usuarios/rol/EMPLEADO`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!employeesResp.ok) throw new Error('Error fetching empleados');
        const employeesData = await employeesResp.json();
        const employees = employeesData.data || [];

        // Obtener paquetes por entregar para cada empleado
        const deliveriesData = await Promise.all(
          employees.map(async (emp) => {
            try {
              const resp = await fetch(`${BASE_URL}/paquetes/empleado?empleadoId=${emp.id}&estado=RECOLECTADO`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!resp.ok) throw new Error(`Error fetching for ${emp.id}`);
              const apiResp = await resp.json();
              const data = apiResp.data || [];
              const count = Array.isArray(data) ? data.length : 0;
              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                'Paquetes a entregar': count,
                empleadoId: emp.id,
              };
            } catch (err) {
              console.error(`Error fetching deliveries for ${emp.id}:`, err);
              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                'Paquetes a entregar': 0,
                empleadoId: emp.id,
              };
            }
          })
        );

        // Calcular promedio
        const totalDeliveries = deliveriesData.reduce((sum, emp) => sum + emp['Paquetes a entregar'], 0);
        const averageDeliveries = deliveriesData.length > 0 ? Math.round(totalDeliveries / deliveriesData.length) : 0;

        setEmployeeDeliveries([
          ...deliveriesData,
          {
            name: 'Promedio mensual',
            'Paquetes a entregar': averageDeliveries,
            isAverage: true,
          },
        ]);
      } catch (err) {
        console.error('Error fetching employee deliveries:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (token) {
      fetchEmployeeDeliveries();
    }
  }, [token]);
  const sections = [
    {
      title: 'Paquetes por entregar',
      subtitle: 'Comparativa por empleados',
      legend: ['Hoja actual', 'Promedio mensual'],
      variant: 'line'
    },
    {
      title: 'Paquetes en tránsito',
      subtitle: 'Velocidad de entrega por zona',
      legend: ['Zona norte', 'Zona centro', 'Zona sur'],
      variant: 'area'
    },
    {
      title: 'Cumplimiento de rutas',
      subtitle: 'Semanas recientes',
      legend: ['Ruta 01', 'Ruta 02', 'Ruta 03'],
      variant: 'bars'
    },
    {
      title: 'Tickets resueltos',
      subtitle: 'Atención a clientes',
      legend: ['Abiertos', 'Cerrados', 'En espera'],
      variant: 'line'
    }
  ];

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-layout">
        <div className="admin-layout__inner">
          <div className="reports-shell">
            <header className="reports-header">
              <div>
                <h1>Tablero de reportes</h1>
              </div>
              <div className="reports-actions">
                <button type="button">Exportar PDF</button>
              </div>
            </header>

            <section className="reports-grid">
              {/* Gráfica de pastel - Distribución por estado */}
              <article className="reports-card reports-card--featured">
                <header className="reports-card__header">
                  <div>
                    <p className="reports-card__subtitle">Análisis general</p>
                    <h2>Distribución de paquetes por estado</h2>
                  </div>
                </header>
                <div className="reports-visual-wrapper">
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <p>Cargando datos...</p>
                    </div>
                  ) : stats.length > 0 ? (
                    <div className="reports-chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                            outerRadius={120}
                            innerRadius={0}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} paquetes`, 'Cantidad']}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value, entry) => `${entry.payload.name}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <p>Sin datos disponibles</p>
                    </div>
                  )}
                </div>
                <div className="reports-stats-summary">
                  {stats.map((stat) => (
                    <div key={stat.name} className="stats-item">
                      <span className="stats-color" style={{ backgroundColor: stat.color }} />
                      <div className="stats-info">
                        <p className="stats-label">{stat.name}</p>
                        <p className="stats-value">{stat.value} paquetes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Gráfica de barras - Paquetes por entregar por empleados */}
              <article className="reports-card reports-card--featured">
                <header className="reports-card__header">
                  <div>
                    <p className="reports-card__subtitle">Comparativa por empleados</p>
                    <h2>Paquetes por entregar</h2>
                  </div>
                </header>
                <div className="reports-visual-wrapper">
                  {loadingEmployees ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <p>Cargando datos...</p>
                    </div>
                  ) : employeeDeliveries.length > 0 ? (
                    <div className="reports-chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={employeeDeliveries} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={120}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} paquetes`, 'Cantidad']}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Bar 
                            dataKey="Paquetes a entregar" 
                            fill="#3b82f6"
                            radius={[8, 8, 0, 0]}
                            shape={({ x, y, width, height, fill }) => {
                              const isAverage = employeeDeliveries[x / (width || 1)]?.isAverage;
                              return (
                                <rect
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={height}
                                  fill={isAverage ? '#10b981' : fill}
                                  radius={[8, 8, 0, 0]}
                                />
                              );
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <p>Sin datos disponibles</p>
                    </div>
                  )}
                </div>
                <div className="reports-stats-summary">
                  {employeeDeliveries.map((emp) => (
                    <div key={emp.empleadoId || emp.name} className="stats-item">
                      <span 
                        className="stats-color" 
                        style={{ backgroundColor: emp.isAverage ? '#10b981' : '#3b82f6' }} 
                      />
                      <div className="stats-info">
                        <p className="stats-label">{emp.name}</p>
                        <p className="stats-value">{emp['Paquetes a entregar']} paquetes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Demás reportes como placeholders */}
              {sections.map((section) => (
                <article key={section.title} className="reports-card">
                  <header className="reports-card__header">
                    <div>
                      <p className="reports-card__subtitle">{section.subtitle}</p>
                      <h2>{section.title}</h2>
                    </div>
                    <div className={`reports-chart reports-chart--${section.variant}`}>
                      {section.variant === 'pie' && <span className="reports-chart__pie" />}
                      {section.variant === 'bars' && (
                        <div className="reports-chart__bars">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </div>
                  </header>
                  <div className={`reports-visual reports-visual--${section.variant}`} />
                  <ul className="reports-legend">
                    {section.legend.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

