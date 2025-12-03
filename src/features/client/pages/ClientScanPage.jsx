import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ClientHeader from '../components/ClientHeader';
import '@/features/admin/pages/admin-layout.css';
import '@/features/client/pages/client.css';
import './client-scan.css';

export default function ClientScanPage() {
  const { codigoQR } = useParams();
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
  const [pkg, setPkg] = useState(null);
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        // Buscar paquete directamente por código QR
        const respPkg = await fetch(`${BASE_URL}/paquetes/qr/${encodeURIComponent(codigoQR)}`);
        if (!respPkg.ok) throw new Error('No se encontró el paquete por código QR');
        const apiPkg = await respPkg.json();
        const found = apiPkg && apiPkg.data ? apiPkg.data : apiPkg;
        setPkg(found);
        // Movimientos: usar historialMovimientos si viene ya en la respuesta
        const history = found && Array.isArray(found.historialMovimientos) ? found.historialMovimientos : [];
        if (history.length > 0) {
          setMovs(history);
        } else {
          const pkgId = found.id || found._id || found.guia || found.codigoQR;
          const respMovs = await fetch(`${BASE_URL}/movimientos/paquete/${pkgId}`);
          const apiMovs = await respMovs.json();
          const dataMovs = apiMovs && apiMovs.data ? apiMovs.data : apiMovs;
          setMovs(Array.isArray(dataMovs) ? dataMovs : []);
        }
      } catch (e) {
        setError(e.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [codigoQR]);

  const formatTs = (ts) => {
    try {
      if (!ts) return '-';
      if (typeof ts === 'object' && ts.seconds != null) {
        const ms = ts.seconds * 1000 + Math.floor((ts.nanos || 0) / 1_000_000);
        return new Date(ms).toLocaleString();
      }
      const d = new Date(ts);
      return isNaN(d.getTime()) ? '-' : d.toLocaleString();
    } catch { return '-'; }
  };

  const latest = Array.isArray(movs) && movs.length > 0 ? movs[0] : null;
  const currentEstado = latest?.estado || pkg?.estado || '-';

  const getTimeline = (estado) => {
    const solid = 'solid';
    const dashed = 'dashed';
    switch (estado) {
      case 'ENTREGADO':
        return { steps: ['done', 'done', 'done'], lines: [solid, solid] };
      case 'EN_TRANSITO':
        return { steps: ['done', 'current', ''], lines: [solid, dashed] };
      case 'RECOLECTADO':
        return { steps: ['done', '', ''], lines: [dashed, dashed] };
      default:
        return { steps: ['', '', ''], lines: [dashed, dashed] };
    }
  };
  const timeline = getTimeline(currentEstado);

  return (
    <div className="client-scan">
      <div className="scan-hero">
        <div className="scan-hero__title">Estado actual</div>
      </div>
      <div className="scan-content">
        {loading ? (
          <p className="loading-message">Cargando...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : (
          <div className="scan-card">
            <div className="scan-card__header">
              <div className="scan-card__code" style={{ marginBottom: '1rem' }}>#{pkg?.codigoQR}</div>
              <div className="scan-card__meta" style={{ marginBottom: '1rem' }}>
                <span className={`dot ${ currentEstado === 'ENTREGADO' ? 'dot--success' : 'dot--intransit' }`} />
                <span>{currentEstado}</span>
                <span>•</span>
                <span>{formatTs(latest?.fechaHora || pkg?.fechaUltimaActualizacion)}</span>
              </div>
              <div className="scan-steps">
                <span className={`step ${timeline.steps[0] === 'done' ? 'step--done' : timeline.steps[0] === 'current' ? 'step--current' : ''}`} />
                <span className={`step-line ${timeline.lines[0] === 'dashed' ? 'step-line--dashed' : ''}`} />
                <span className={`step ${timeline.steps[1] === 'done' ? 'step--done' : timeline.steps[1] === 'current' ? 'step--current' : ''}`} />
                <span className={`step-line ${timeline.lines[1] === 'dashed' ? 'step-line--dashed' : ''}`} />
                <span className={`step ${timeline.steps[2] === 'done' ? 'step--done' : timeline.steps[2] === 'current' ? 'step--current' : ''}`} />
              </div>
            </div>
            <div className="scan-card__grid">
              <div className="scan-card__col">
                <div className="label">Desde</div>
                <div className="value">{pkg?.direccionOrigen || '-'}</div>
              </div>
              <div className="scan-card__col">
                <div className="label">Hacia</div>
                <div className="value">{pkg?.direccionDestino || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="scan-section">
            <h3>Historial de movimientos</h3>
            <ul className="scan-history">
              {movs.map(m => (
                <li key={m.id} className="scan-history__item">
                  <span className="history-dot" />
                  <span>{m.estado} - {m.ubicacion} • {formatTs(m.fechaHora)}</span>
                </li>
              ))}
              {movs.length === 0 && <li>No hay movimientos.</li>}
            </ul>
          </div>
        )}

        {!loading && !error && latest?.ubicacion && (
          <div className="scan-section">
            <h3>Mapa</h3>
            <iframe
              title="Mapa"
              className="scan-map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(latest.ubicacion)}&output=embed`}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}