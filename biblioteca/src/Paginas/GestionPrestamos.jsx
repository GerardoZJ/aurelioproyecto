import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Desings/GestionPrestamosDesing.css';

export const GestionarPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);

  const fetchPrestamos = async () => {
    try {
      const response = await fetch('http://localhost:5000/prestamos');
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
      const data = await response.json();
      setPrestamos(data);
    } catch (error) {
      console.error('Error al obtener los préstamos:', error);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  return (
    <motion.div
      className="gestion-prestamos-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <h1 className="gestion-prestamos-title">Reporte de Libros Prestados y Disponibles</h1>
      <div className="gestion-prestamos-table-container">
        {prestamos.length === 0 ? (
          <p className="no-prestamos-message">No hay registros de préstamos</p>
        ) : (
          <table className="gestion-prestamos-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Matrícula del Estudiante</th>
                <th>ISBN del Libro</th>
                <th>Título del Libro</th>
                <th>Imagen</th>
                <th>Fecha de Préstamo</th>
                <th>Fecha de Devolución</th>
                <th>Cantidad Solicitada</th>
                <th>Stock del Libro</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.map((prestamo) => (
                <tr key={prestamo.id}>
                  <td>{prestamo.id}</td>
                  <td>{prestamo.matricula}</td>
                  <td>{prestamo.ISBN}</td>
                  <td>{prestamo.titulo}</td>
                  <td>
                    {prestamo.imagen ? (
                      <img
                        src={prestamo.imagen}
                        alt={prestamo.titulo}
                        className="book-image"
                      />
                    ) : (
                      <span>No hay imagen</span>
                    )}
                  </td>
                  <td>{prestamo.fechaPrestamo}</td>
                  <td>{prestamo.fechaDevolucion}</td>
                  <td>{prestamo.cantidadSolicitada}</td>
                  <td>{prestamo.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};