import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Desings/DevolverDesing.css';

export const DevolverLibro = () => {
  const [loans, setLoans] = useState([]);
  const [matricula, setMatricula] = useState('');

  // Recuperar la matrícula del alumno que inició sesión
  useEffect(() => {
    const storedMatricula = localStorage.getItem('matricula');
    if (!storedMatricula) {
      alert('Por favor, inicia sesión para ver tus préstamos.');
      window.location.href = '/login'; // Redirige al login si no hay matrícula
      return;
    }
    setMatricula(storedMatricula);
  }, []);

  // Obtener los préstamos del alumno desde el backend
  const fetchLoans = async () => {
    try {
      const response = await fetch(`http://localhost:5000/prestamos?matricula=${matricula}`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo los préstamos pendientes
        const pendingLoans = data.filter((loan) => loan.returned === 0 || loan.returned === false);
        setLoans(pendingLoans);
      } else {
        console.error('Error al obtener los préstamos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  useEffect(() => {
    if (matricula) {
      fetchLoans();
    }
  }, [matricula]);

  // Marcar un préstamo como devuelto
  const markAsReturned = async (loanId) => {
    try {
      const response = await fetch(`http://localhost:5000/prestamos/${loanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returned: true }), // Aseguramos que estamos pasando correctamente el campo 'returned'
      });

      if (response.ok) {
        alert('Préstamo marcado como devuelto.');

        // Actualizamos el estado eliminando el préstamo devuelto de la lista
        setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== loanId));
      } else {
        alert('Error al marcar el préstamo como devuelto.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  return (
    <motion.div
      className="devolver-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Devolver Libro</h2>
      {loans.length === 0 ? (
        <p>No hay libros pendientes de devolución.</p>
      ) : (
        <div className="devolver-list">
          {loans.map((loan) => (
            <div key={loan.id} className="devolver-item">
              <div className="info-left">
                {loan.imagen ? (
                  <img src={loan.imagen} alt={loan.titulo} className="devolver-img" />
                ) : (
                  <p>No hay imagen</p>
                )}
              </div>
              <div className="info-right">
                <p><strong>ID préstamo:</strong> {loan.id}</p>
                <p><strong>Matrícula:</strong> {loan.matricula}</p>
                <p><strong>ISBN:</strong> {loan.ISBN}</p>
                <p><strong>Título:</strong> {loan.titulo}</p>
                <p><strong>Fecha de préstamo:</strong> {loan.fechaPrestamo}</p>
                <p><strong>Fecha de devolución:</strong> {loan.fechaDevolucion}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => markAsReturned(loan.id)}
                >
                  Marcar como devuelto
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};