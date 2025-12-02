import React, { useState, useEffect } from "react";
import "@/features/admin/pages/profile.css";
import ClientHeader from "../components/ClientHeader";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/api/adminService";

const ClientProfile = () => {
  const { user, token, mockLogin } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.nombre ?? "",
    apellidoPaterno: user?.apellidoPaterno ?? "",
    apellidoMaterno: user?.apellidoMaterno ?? "",
    email: user?.email ?? "",
  });
  const [toast, setToast] = useState({ type: null, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null);

  useEffect(() => {
    setFormData({
      nombre: user?.nombre ?? "",
      apellidoPaterno: user?.apellidoPaterno ?? "",
      apellidoMaterno: user?.apellidoMaterno ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  useEffect(() => {
    const fetchSatisfaction = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `http://localhost:8080/api/paquetes/satisfaccion/cliente/${user.id}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error("No se pudo obtener la satisfacción");
        const data = await res.json();
        // Expecting either a number (0-100) or { porcentaje: number }
        const value = typeof data === "number" ? data : data.porcentaje ?? 0;
        setSatisfaction(Math.round(value));
      } catch (e) {
        setSatisfaction(0);
      }
    };
    fetchSatisfaction();
  }, [user?.id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const payload = {
        email: formData.email,
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
      };
      await updateUser(user.id, payload, token);
      const mergedUser = {
        ...user,
        email: payload.email,
        nombre: payload.nombre,
        apellidoPaterno: payload.apellidoPaterno,
        apellidoMaterno: payload.apellidoMaterno,
      };
      mockLogin(mergedUser);
      setToast({
        type: "success",
        message: "Perfil actualizado correctamente",
      });
      setTimeout(() => setToast({ type: null, message: "" }), 3000);
      setConfirmOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Error al actualizar perfil",
      });
      setTimeout(() => setToast({ type: null, message: "" }), 3000);
      setConfirmOpen(false);
    }
  };

  const handleConfirmEdit = async () => {
    try {
      const payload = {
        email: formData.email,
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
      };
      await updateUser(user.id, payload, token);
      const mergedUser = {
        ...user,
        email: payload.email,
        nombre: payload.nombre,
        apellidoPaterno: payload.apellidoPaterno,
        apellidoMaterno: payload.apellidoMaterno,
      };
      mockLogin(mergedUser);
      setFormSuccess("Perfil actualizado correctamente");
      setPendingEdit(false);
    } catch (err) {
      setEditError(err.message || "Error al actualizar perfil");
      setPendingEdit(false);
    }
  };

  return (
    <div className="admin-shell">
      <ClientHeader />
      <div className="profile-body">
        <section className="profile-hero">
          <div>
            <h1>Mi cuenta</h1>
            <p>
              Bienvenido de nuevo, {user?.nombre} {user?.apellidoPaterno}{" "}
              {user?.apellidoMaterno}
            </p>
          </div>
          <div className="profile-hero__stats">
            <strong>{satisfaction !== null ? `${satisfaction}%` : '...'}</strong>
            <span>Procentaje de paquetes entregados</span>
          </div>
        </section>

        <section className="profile-card">
          <header>
            <h2>Perfil</h2>
            <p>Actualiza tu correo, nombre o apellidos cuando lo necesites.</p>
          </header>
          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              <span>
                Nombre completo <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>
                Apellido paterno <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="apellidoPaterno"
                placeholder="Apellido paterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Apellido materno</span>
              <input
                type="text"
                name="apellidoMaterno"
                placeholder="Apellido materno (opcional)"
                value={formData.apellidoMaterno}
                onChange={handleChange}
              />
            </label>
            <label>
              <span>
                Correo electrónico <span className="required-star">*</span>
              </span>
              <input
                type="email"
                name="email"
                placeholder="correo@tracker.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <div className="profile-actions">
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  setFormData({
                    nombre: user?.nombre ?? "",
                    apellidoPaterno: user?.apellidoPaterno ?? "",
                    apellidoMaterno: user?.apellidoMaterno ?? "",
                    email: user?.email ?? "",
                  })
                }
              >
                Cancelar
              </button>
              <button type="submit">Actualizar</button>
            </div>
          </form>
        </section>
        {confirmOpen && (
          <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirmación">
            <div className="confirm-modal">
              <button className="success-close" aria-label="Cerrar" onClick={() => setConfirmOpen(false)}>×</button>
              <div className="success-body">
                <h2>¿Deseas actualizar tu perfil?</h2>
                <div className="success-actions">
                  <button className="btn-cancel" type="button" onClick={() => setConfirmOpen(false)}>Regresar</button>
                  <button className="btn-add-user" type="button" onClick={handleConfirmUpdate}>Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
