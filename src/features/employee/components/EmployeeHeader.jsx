import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Navegación principal del empleado
const navItems = [
    { label: "Dashboard", to: "/employee" },
    { label: "Reportes", to: "/admin/reportes" },
    { label: "Paquetes", to: "/employee/paquetes" },
    { label: "Mi Perfil", to: "/admin/perfil" },
];

/**
 * Encabezado principal de la vista de empleado.
 * Muestra enlaces de navegación y permite cerrar sesión con confirmación.
 */
const EmployeeHeader = () => {
    const { logout } = useAuth();

    // Controla la visibilidad del modal de confirmación de cierre de sesión
    const [pendingLogout, setPendingLogout] = useState(false);

    const handleLogoutClick = () => setPendingLogout(true);
    const cancelLogout = () => setPendingLogout(false);

    const confirmLogout = async () => {
        await logout();
        setPendingLogout(false);
    };

    return (
        <header className="admin-header">
            <div className="admin-brand">
                <span>Tracker</span>
            </div>

            <nav className="admin-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) =>
                            `admin-nav__link${isActive ? " active" : ""}`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                className="admin-header__logout"
                onClick={handleLogoutClick}
            >
                Salir
            </button>

            {/* Modal de confirmación */}
            {pendingLogout && (
                <div
                    className="confirm-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-logout-title"
                >
                    <div className="confirm-modal">
                        <button
                            className="success-close"
                            aria-label="Cerrar"
                            onClick={cancelLogout}
                        >
                            ×
                        </button>

                        <div className="success-body">
                            <h2 id="confirm-logout-title">¿Está seguro de querer cerrar sesión?</h2>

                            <div className="success-actions">
                                <button className="btn-cancel" onClick={cancelLogout}>
                                    Cancelar
                                </button>
                                <button className="btn-danger" onClick={confirmLogout}>
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default EmployeeHeader;
