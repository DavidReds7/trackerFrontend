import './client-packages.css';
import React, { useEffect, useState } from "react";
import ClientHeader from "../components/ClientHeader";
import "@/features/admin/pages/admin-layout.css";
import "@/features/client/pages/client.css";
import { useAuth } from "@/context/AuthContext";
import { FiEye } from "react-icons/fi";

export default function ClientPackages() {
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

  useEffect(() => {
    if (token) fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Obtener email del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clienteEmail = user.email;

      if (!clienteEmail) {
        throw new Error('No se encontró el email del cliente');
      }

      const resp = await fetch(`${BASE_URL}/paquetes/cliente/${clienteEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) throw new Error("No se pudieron cargar los paquetes");
      const apiResp = await resp.json();
      const data = apiResp && apiResp.data ? apiResp.data : apiResp;
      const baseList = Array.isArray(data) ? data : [];

      const enriched = await enrichWithMovimientos(baseList);
      setPackages(enriched);
      setFiltered(enriched);
    } catch (err) {
      console.error("Error cargando paquetes:", err);
    } finally {
      setLoading(false);
    }
  };

  const enrichWithMovimientos = async (list) => {
    try {
      const results = await Promise.all(
        list.map(async (p) => {
          const pkgId = p.id || p._id || p.guia || p.codigoQR;
          if (!pkgId) return p;
          try {
            const resp = await fetch(`${BASE_URL}/movimientos/paquete/${pkgId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (!resp.ok) return p;
            const api = await resp.json();
            const movimientos = api && api.data ? api.data : api;
            const first = Array.isArray(movimientos) && movimientos.length > 0 ? movimientos[0] : null;
            if (!first) return p;
            return {
              ...p,
              ubicacion: first.ubicacion || p.ubicacion,
              repartidorNombre: first.empleadoNombre || p.repartidorNombre || p.nombreRepartidor,
              fechaUltimaActualizacion: first.fechaHora || p.fechaUltimaActualizacion,
              estado: first.estado || p.estado,
            };
          } catch {
            return p;
          }
        })
      );
      return results;
    } catch {
      return list;
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(packages);
      setPage(1);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFiltered(
      packages.filter(
        (p) =>
          String(p.codigoQR || "")
            .toLowerCase()
            .includes(term)
      )
    );
    setPage(1);
  }, [searchTerm, packages]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const getPageNumbers = () => {
    const maxChips = 7;
    const pages = [];
    if (totalPages <= maxChips) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (start <= 2) {
      start = 1;
      end = 5;
    } else if (end >= totalPages - 1) {
      start = totalPages - 4;
      end = totalPages;
    }
    pages.push(1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const handleView = async (pkgId) => {
    setSelected(pkgId);
    setDetails(null);
    try {
      const resp = await fetch(`${BASE_URL}/paquetes/${pkgId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) throw new Error("No se pudo cargar el paquete");
      const apiResp = await resp.json();
      setDetails(apiResp.data || apiResp);
    } catch (err) {
      console.error("Error al cargar detalles:", err);
    }
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case "RECOLECTADO":
        return "status-pending"; // Amarillo/Naranja: En espera de iniciar tránsito
      case "EN_TRANSITO":
        return "status-in-progress"; // Azul: Moviéndose
      case "ENTREGADO":
        return "status-success"; // Verde: Finalizado
      case "CANCELADO":
        return "status-danger"; // Rojo: Cancelado
      default:
        return "status-unknown"; // Gris: Estado no reconocido
    }
  };

  const formatTimestamp = (ts) => {
    try {
      if (!ts) return '-';
      if (typeof ts === 'object' && ts.seconds != null) {
        const ms = ts.seconds * 1000 + Math.floor((ts.nanos || 0) / 1_000_000);
        return new Date(ms).toLocaleString();
      }
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch {
      return '-';
    }
  };

  return (
    <div className="admin-shell">
      <ClientHeader />
      <div className="admin-layout">
        <div className="admin-layout__inner">
          <section className="admin-panel--users">
            <div className="admin-panel__header">
              <h1>Mis Paquetes</h1>
              <div className="admin-panel__controls">
                <input
                  type="text"
                  placeholder="Buscador (guía, cliente, estado...)"
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
                    <th>Repartidor</th>
                    <th>Estado</th>
                    <th>Ubicación</th>
                    <th>Última Actualización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.id}>
                      <td>{p.codigoQR}</td>
                      <td>
                        {(p.repartidor && (p.repartidor.nombre || p.repartidor)) ||
                          p.repartidorNombre || p.nombreRepartidor || p.empleadoNombre ||
                          p.repartidorEmail || p.empleadoEmail || "-"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(p.estado)}`}
                        >
                          {p.estado || "-"}
                        </span>
                      </td>
                      <td>{p.ubicacion || p.ultimaUbicacion || ""}</td>
                      <td>{formatTimestamp(p.fechaUltimaActualizacion)}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          aria-label="Ver paquete"
                          onClick={() => handleView(p.id || p._id || p.guia)}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-users-message">No hay paquetes para mostrar</p>
            )}

            {filtered && filtered.length > 0 && (
              <div
                className="pagination"
                aria-label="Paginación"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <span style={{ padding: 0 }}>
                  Página {page} de {totalPages}
                </span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    className="btn-cancel pill-btn pill-btn--neutral"
                    type="button"
                    onClick={() => gotoPage(page - 1)}
                    disabled={!canPrev}
                  >
                    Anterior
                  </button>
                  <div className="page-chips" role="group" aria-label="Seleccionar página" style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {getPageNumbers().map((pnum, idx) => (
                      <button
                        key={`${pnum}-${idx}`}
                        type="button"
                        className={
                          typeof pnum === 'number'
                            ? (pnum === page ? 'btn-next pill-btn pill-btn--primary' : 'btn-cancel pill-btn pill-btn--neutral')
                            : 'btn-cancel pill-btn pill-btn--neutral'
                        }
                        onClick={() => typeof pnum === 'number' && gotoPage(pnum)}
                        disabled={pnum === '…'}
                        aria-current={pnum === page ? 'page' : undefined}
                      >
                        {pnum}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn-next pill-btn pill-btn--neutral"
                    type="button"
                    onClick={() => gotoPage(page + 1)}
                    disabled={!canNext}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {selected && details && (
              <div
                className="details-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Información del paquete"
              >
                <div className="details-modal">
                  <button
                    className="success-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setSelected(null);
                      setDetails(null);
                    }}
                  >
                    ×
                  </button>
                  <div className="details-content">
                    <h2>Detalle Paquete</h2>
                    <div className="info-section">
                      <div className="info-grid">
                        <div className="info-row">
                          <label>Guía</label>
                          <span>
                            {details.guia ||
                              details.guiaTracking ||
                              details.guia_numero}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Estado</label>
                          <span
                            className={`status-badge ${getStatusClass(details.estado)}`}
                          >
                            {details.estado || "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Estado</label>
                          <span
                            className={`status-badge ${details.estado === "ENTREGADO"
                              ? "status-active"
                              : "status-inactive"
                              }`}
                          >
                            {details.estado || "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Última ubicación</label>
                          <span>
                            {details.ubicacion ||
                              details.ultimaUbicacion ||
                              "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Última actualización</label>
                          <span>
                            {details.fechaUltimaActualizacion}
                          </span>
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
