import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Paginas/Desings/HomeDesing.css';

export const Home = () => {
  const [libros, setLibros] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener la lista de libros al cargar la página
    axios.get("http://localhost:5000/libros")
      .then(res => {
        console.log(res.data); // Verifica los datos recibidos
        setLibros(res.data);
      })
      .catch(err => console.error("Error al obtener libros:", err));
  }, []);

  // Función para redirigir a la página de solicitud
  const redirigirSolicitud = (libro) => {
    if (libro.stock > 0) {
      // Redirigir a la página de solicitud con el libro
      navigate('/SolicitarPrestamo', { state: { libro } });
    } else {
      alert("No hay stock disponible para este libro.");
    }
  };

  return (
    <div className="productos-mas-vistos">
      <h2>Libros Disponibles</h2>
      <div className="productos-grid">
        {libros.map((libro) => (
          <div className="tarjeta-libro" key={libro.id}>
            <img
              src={libro.imagen || '/default.jpg'}
              alt={libro.titulo}
              className="imagen-libro"
            />
            <div className="detalles-libro">
              <h3>{libro.titulo}</h3>
              <p><strong>Autor:</strong> {libro.autor}</p>
              <p><strong>ISBN:</strong> {libro.ISBN}</p>
              <p><strong>Stock:</strong> {libro.stock}</p>
              <button
                className="btn-solicitar"
                onClick={() => redirigirSolicitud(libro)}
              >
                Solicitar Libro
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
