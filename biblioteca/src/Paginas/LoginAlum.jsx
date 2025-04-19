import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../Paginas/Desings/Login.css";
import fondo from "../Assets/FondoLogin2.png";
import logo from "../Assets/bibliotecalogo.png";

export const LoginAlum = () => {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!matricula || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login-alumno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matricula, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("matricula", data.matricula); // Guardar matrícula
        localStorage.setItem("userType", "alumno"); // Guardar tipo de usuario
        alert("Inicio de sesión exitoso");
        navigate("/"); // Redirigir a la página principal
      } else {
        alert("Credenciales inválidas. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(); // Llamar a la función de inicio de sesión
    }
  };

  return (
    <div
      className="login-page-wrapper"
      style={{ backgroundImage: `url(${fondo})`, backgroundSize: "cover" }}
    >
      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="login-background-box">
          <div className="login-box">
            <img src={logo} alt="Biblioteca Logo" className="login-logo" />
            <h2 className="login-title">Iniciar sesión</h2>
            <motion.div
              className="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
              <input
                type="text"
                placeholder="Matrícula"
                className="login-input"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                onKeyDown={handleKeyDown} // Detectar Enter
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} // Detectar Enter
              />
              <motion.button
                className="login-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Ingresar"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};