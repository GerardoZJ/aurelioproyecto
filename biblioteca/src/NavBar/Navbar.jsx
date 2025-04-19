import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Nav.css";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import logo from "../Assets/bibliotecalogo.png";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const commonLinks = [
    { path: "/", label: "Inicio" },
    { path: "/DevolverLibro", label: "Devolver libro" },
    { path: "/Historial", label: "Historial" },
  ];

  const adminLinks = [
    { path: "/AdminIndex", label: "Libros" },
    { path: "/AgregarLibro", label: "Agregar Libro" },
    { path: "/GestionarPrestamos", label: "Gestionar Préstamos" },
  ];

  const isAdminRoute =
    location.pathname.startsWith("/AdminIndex") ||
    location.pathname.startsWith("/AgregarLibro") ||
    location.pathname.startsWith("/GestionarPrestamos") ||
    location.pathname.startsWith("/EditarLibro");

  const handleLogout = () => {
    const userType = localStorage.getItem("userType"); // Obtener el tipo de usuario
    localStorage.removeItem("matricula"); // Eliminar matrícula
    localStorage.removeItem("userType"); // Eliminar tipo de usuario

    // Redirigir al login correspondiente
    if (userType === "admin") {
      navigate("/LoginAdmin"); // Redirigir al login de administrador
    } else {
      navigate("/LoginAlum"); // Redirigir al login de alumno
    }
  };

  return (
    <header className={`navbar ${menuOpen ? "open" : ""}`}>
      <div className="container">
        <Link to={isAdminRoute ? "/AdminIndex" : "/"} className="logo">
          <img src={logo} alt="Logo Biblioteca" />
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <nav>
          <ul
            className={`nav-links ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {isAdminRoute &&
              adminLinks.map((item) => (
                <li
                  key={item.path}
                  className={`${
                    location.pathname === item.path ? "active" : ""
                  } ${item.disabled ? "disabled" : ""}`}
                >
                  <Link to={item.disabled ? "#" : item.path}>
                    {item.label}
                  </Link>
                </li>
              ))}
            {!isAdminRoute &&
              commonLinks.map((item) => (
                <li
                  key={item.path}
                  className={
                    location.pathname === item.path ? "active" : ""
                  }
                >
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            <li className="logout-icon" onClick={handleLogout}>
              <FaSignOutAlt title="Cerrar sesión" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};