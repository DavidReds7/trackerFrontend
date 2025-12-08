import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import '@/features/admin/pages/reports.css';
import '@/features/admin/pages/admin-layout.css';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '@/context/AuthContext';
// 💡 IMPORTAR EL NUEVO COMPONENTE DE TABLAS
import ReportsPDFTables from './ReportsPDFTables';

const ReportsPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [employeeDeliveries, setEmployeeDeliveries] = useState([]);
  const [employeeSatisfaction, setEmployeeSatisfaction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingSatisfaction, setLoadingSatisfaction] = useState(true);

  const pdfRef = useRef();
  const exportButtonRef = useRef();

  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

  const estadosConfig = [
    { estado: 'RECOLECTADO', label: 'Por entregar', color: '#93c5fd' },
    { estado: 'EN_TRANSITO', label: 'En tránsito', color: '#fcd34d' },
    { estado: 'ENTREGADO', label: 'Entregados', color: '#86efac' },
    { estado: 'RETRASADO', label: 'Retrasados', color: '#fed7aa' },
    { estado: 'CANCELADO', label: 'Sin recibir', color: '#fca5a5' }
  ];

  /* ============================
     ... Lógica de FETCH (sin cambios)
  ============================ */
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsData = await Promise.all(
          estadosConfig.map(async ({ estado, label, color }) => {
            try {
              const resp = await fetch(`${BASE_URL}/paquetes/estado/${estado}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const json = await resp.json();
              return { name: label, value: json.data ?? 0, color };
            } catch {
              return { name: label, value: 0, color };
            }
          })
        );
        setStats(statsData);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchSatisfaction = async () => {
      setLoadingSatisfaction(true);
      try {
        const empResp = await fetch(`${BASE_URL}/usuarios/rol/EMPLEADO`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const employees = (await empResp.json()).data ?? [];

        const satData = await Promise.all(
          employees.map(async (emp) => {
            try {
              const resp = await fetch(
                `${BASE_URL}/paquetes/satisfaccion/repartidor/${emp.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const json = await resp.json();
              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                satisfaction: json.data?.indiceCumplimiento ?? 0,
                total: json.data?.totalPaquetes ?? 0,
                entregados: json.data?.paquetesEntregados ?? 0
              };
            } catch {
              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                satisfaction: 0,
                total: 0,
                entregados: 0
              };
            }
          })
        );

        setEmployeeSatisfaction(satData);
      } finally {
        setLoadingSatisfaction(false);
      }
    };

    fetchSatisfaction();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchDeliveries = async () => {
      setLoadingEmployees(true);
      try {
        const empResp = await fetch(`${BASE_URL}/usuarios/rol/EMPLEADO`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const employees = (await empResp.json()).data ?? [];

        const deliveries = await Promise.all(
          employees.map(async (emp) => {
            try {
              const resp = await fetch(
                `${BASE_URL}/paquetes/empleado?usuarioId=${emp.id}&rol=EMPLEADO`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const json = await resp.json();

              const notDelivered = (json.data ?? []).filter(
                (p) => p.estado !== 'ENTREGADO'
              );

              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                'Paquetes a entregar': notDelivered.length,
                empleadoId: emp.id
              };
            } catch {
              return {
                name: `${emp.nombre} ${emp.apellidoPaterno}`,
                'Paquetes a entregar': 0,
                empleadoId: emp.id
              };
            }
          })
        );

        setEmployeeDeliveries(deliveries);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchDeliveries();
  }, [token]);


  /* ============================
     EXPORTAR PDF SOLO TABLAS (Lógica sin cambios)
  ============================ */
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // ============================
    // Tabla: Estados
    // ============================
    const total = stats.reduce((sum, s) => sum + s.value, 0);

    autoTable(doc, {
      head: [["Estado", "Cantidad", "Porcentaje"]],
      body: stats.map(s => [
        s.name,
        s.value,
        total ? ((s.value / total) * 100).toFixed(1) + "%" : "0%"
      ]),
      startY: 10,
      theme: "grid",
    });

    // ============================
    // Tabla: Paquetes por entregar
    // ============================
    autoTable(doc, {
      head: [["Empleado", "Paquetes pendientes"]],
      body: employeeDeliveries.map(e => [
        e.name,
        e["Paquetes a entregar"]
      ]),
      startY: doc.lastAutoTable.finalY + 10,
      theme: "grid",
    });

    // ============================
    // Tabla: Satisfacción
    // ============================
    autoTable(doc, {
      head: [["Empleado", "%", "Total", "Entregados"]],
      body: employeeSatisfaction.map(e => [
        e.name,
        `${e.satisfaction}%`,
        e.total,
        e.entregados,
      ]),
      startY: doc.lastAutoTable.finalY + 10,
      theme: "grid",
    });

    doc.save(`reporte-${Date.now()}.pdf`);
  };


  return (
    <div className="admin-shell">
      <AdminHeader />

      <div className="admin-layout">
        <div className="admin-layout__inner">
          <div className="reports-shell">

            {/* HEADER */}
            <header className="reports-header">
              <h1>Tablero de reportes</h1>
              <div className='reports-actions'>
                <button ref={exportButtonRef} onClick={handleExportPDF}>
                  Exportar PDF
                </button>
              </div>
            </header>

            {/* ============================================
                ✨ SECCIÓN VISIBLE EN PANTALLA (GRÁFICAS)
            ============================================ */}
            <div className="screen-only">

              <section className="reports-grid">

                {/* PIE CHART */}
                <article className="reports-card reports-card--featured">
                  <h2>Distribución de paquetes por estado</h2>

                  <div className="reports-visual-wrapper">
                    {loading ? (
                      <p>Cargando…</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="value"
                            label
                          >
                            {stats.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                {/* BARRAS PENDIENTES */}
                <article className="reports-card">
                  <h2>Paquetes por entregar</h2>

                  <div className="reports-visual-wrapper">
                    {loadingEmployees ? (
                      <p>Cargando…</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={employeeDeliveries}
                          margin={{ bottom: 100 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="Paquetes a entregar" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                {/* SATISFACCION */}
                <article className="reports-card">
                  <h2>Índice de satisfacción</h2>

                  <div className="reports-visual-wrapper">
                    {loadingSatisfaction ? (
                      <p>Cargando…</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={employeeSatisfaction}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="satisfaction" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

              </section>

            </div>

            <ReportsPDFTables
              ref={pdfRef}
              className="pdf-hidden"
              stats={stats}
              employeeDeliveries={employeeDeliveries}
              employeeSatisfaction={employeeSatisfaction}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;