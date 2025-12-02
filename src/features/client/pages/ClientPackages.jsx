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
      setPackages(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Error cargando paquetes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(packages);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFiltered(
      packages.filter(
        (p) =>
          String(p.codigoQR || "")
            .toLowerCase()
            .includes(term) ||
          String(p.clienteEmail || "")
            .toLowerCase()
            .includes(term) ||
          String(p.estado || "")
            .toLowerCase()
            .includes(term) ||
          String(p.ubicacion || p.ultimaUbicacion || "")
            .toLowerCase()
            .includes(term)
      )
    );
  }, [searchTerm, packages]);

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

  return (
    <div className="admin-shell">
      <ClientHeader />
      <div className="admin-layout">
        <div className="admin-layout__inner">
          <section className="admin-panel--users">
            <div className="admin-panel__header">
              <h2>Mis Paquetes</h2>
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
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Ubicación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id || p._id || p.guia || Math.random()}>
                      <td>{p.codigoQR}</td>
                      <td>
                        {p.clienteEmail || "-"}
                        {p.clienteEmail && p.clienteEmail.includes("@") && " "}
                        {(p.cliente &&
                          (p.cliente.nombre || p.cliente)) ||
                          p.nombreCliente ||
                          ""}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(p.estado)}`}
                        >
                          {p.estado || "-"}
                        </span>
                      </td>
                      <td>{p.ubicacion || p.ultimaUbicacion || ""}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="Ver"
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

            {/* Details modal */}
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
                            {details.updatedAt ||
                              details.actualizado ||
                              details.fecha ||
                              "-"}
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
