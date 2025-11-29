import React from 'react';
import '@/features/admin/pages/reports.css';
import '@/features/admin/pages/admin-layout.css';
import AdminHeader from '../components/AdminHeader';

const sections = [
  {
    title: 'Distribución de paquetes',
    subtitle: 'Por estado',
    legend: ['Por entregar', 'En tránsito', 'Entregados', 'Retrasados', 'Sin recibir'],
    variant: 'pie'
  },
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

const ReportsPage = () => (
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
              <label>
                Fecha de inicio
                <input type="date" />
              </label>
              <label>
                Fecha de fin
                <input type="date" />
              </label>
              <button type="button">Exportar PDF</button>
            </div>
          </header>

          <section className="reports-grid">
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

export default ReportsPage;

