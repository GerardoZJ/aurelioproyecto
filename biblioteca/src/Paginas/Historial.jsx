import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Desings/HistorialDesing.css';

export const Historial = () => {
  const [loans, setLoans] = useState([]);

  // Obtener la matrícula del usuario
  const matricula = localStorage.getItem('matricula');

  // Obtener los préstamos desde el backend
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(`http://localhost:5000/prestamos?matricula=${matricula}`);
        if (response.ok) {
          const data = await response.json();
          setLoans(data);
        } else {
          console.error('Error al obtener los préstamos');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    };

    if (matricula) {
      fetchLoans();
    } else {
      console.error('Matrícula no encontrada');
    }
  }, [matricula]);

  return (
    <motion.div
      className="historial-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Historial de Préstamos</h2>
      <div className="historial-list">
        {loans.length === 0 ? (
          <p>No hay préstamos registrados</p>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="historial-item">
              <div className="info-left">
                {loan.imagen ? (
                  <img src={loan.imagen} alt={loan.titulo} className="historial-img" />
                ) : (
                  <img src="/default-image.jpg" alt="Sin imagen" className="historial-img" />
                )}
              </div>
              <div className="info-right">
                <p><strong>ID préstamo:</strong> {loan.id}</p>
                <p><strong>Matrícula:</strong> {loan.matricula}</p>
                <p><strong>ISBN:</strong> {loan.ISBN}</p>
                <p><strong>Título:</strong> {loan.titulo}</p>
                <p><strong>Fecha de préstamo:</strong> {loan.fechaPrestamo}</p>
                <p><strong>Fecha de devolución:</strong> {loan.fechaDevolucion}</p>
                <p>
                  <strong>Estado:</strong> {loan.returned ? 
                    <span className="devuelto">Devuelto</span> : 
                    <span className="pendiente">Pendiente</span>}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};