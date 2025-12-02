import React, { useEffect, useState } from "react";
import ClientHeader from "../components/ClientHeader";
import "@/features/admin/pages/admin-layout.css";
import "@/features/admin/pages/users.css";
import { useAuth } from "@/context/AuthContext";
import { createPackage } from "@/api/packageService";
import { FiEye } from "react-icons/fi";

export default function ClientPackages() {
  const { token } = useAuth();
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: "",
    clienteEmail: "",
    direccionOrigen: "",
    direccionDestino: "",
  });
  const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      await createPackage(formData, token);
      setFormSuccess("Paquete registrado correctamente");
      setFormData({
        descripcion: "",
        clienteEmail: "",
        direccionOrigen: "",
        direccionDestino: "",
      });
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      setFormError(err.message || "Error al crear el paquete");
    }
  };

  useEffect(() => {
    if (token) fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/paquetes`, {
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
          String(p.guia || p.guiaTracking || p.guia_numero || "")
            .toLowerCase()
            .includes(term) ||
          String(p.cliente?.nombre || p.cliente || p.nombreCliente || "")
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

  return (
    <div className="admin-shell">
      <ClientHeader />
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
                      <td>{p.guia || p.guiaTracking || p.guia_numero}</td>
                      <td>
                        {(p.cliente && (p.cliente.nombre || p.cliente)) ||
                          p.nombreCliente ||
                          "-"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            p.estado === "ENTREGADO"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {p.estado || "-"}
                        </span>
                      </td>
                      <td>{p.ubicacion || p.ultimaUbicacion || "-"}</td>
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

            {showForm && (
              <div
                className="modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Agregar paquete"
              >
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
                          <span>
                            Descripción <strong>*</strong>
                          </span>
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
                          <span>
                            Email del Cliente <strong>*</strong>
                          </span>
                          <input
                            type="email"
                            name="clienteEmail"
                            value={formData.clienteEmail}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            required
                          />
                        </label>
                      </div>

                      <div className="form-row">
                        <label className="auth-form__field">
                          <span>
                            Dirección Origen <strong>*</strong>
                          </span>
                          <input
                            type="text"
                            name="direccionOrigen"
                            value={formData.direccionOrigen}
                            onChange={handleChange}
                            placeholder="Dirección de origen"
                            required
                          />
                        </label>
                        <label className="auth-form__field">
                          <span>
                            Dirección Destino <strong>*</strong>
                          </span>
                          <input
                            type="text"
                            name="direccionDestino"
                            value={formData.direccionDestino}
                            onChange={handleChange}
                            placeholder="Dirección de destino"
                            required
                          />
                        </label>
                      </div>

                      {formError && <p className="form-error">{formError}</p>}
                      {formSuccess && (
                        <p className="form-success">{formSuccess}</p>
                      )}

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
                          <label>Cliente</label>
                          <span>
                            {(details.cliente &&
                              (details.cliente.nombre || details.cliente)) ||
                              details.nombreCliente ||
                              "-"}
                          </span>
                        </div>
                        <div className="info-row">
                          <label>Estado</label>
                          <span
                            className={`status-badge ${
                              details.estado === "ENTREGADO"
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
