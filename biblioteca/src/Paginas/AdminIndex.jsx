import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Desings/AdminIndexDesing.css';
import { useNavigate } from 'react-router-dom';

export const AdminIndex = () => {
  const [libros, setLibros] = useState([]);
  const navigate = useNavigate();

  const fetchLibros = async () => {
    try {
      const response = await fetch('http://localhost:5000/libros');
      const data = await response.json();
      setLibros(data);
    } catch (error) {
      console.error('Error al obtener los libros:', error);
    }
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  const handleEdit = (id) => {
    navigate(`/EditarLibro/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el libro con ID: ${id}?`);
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:5000/libros/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Libro eliminado correctamente');
          fetchLibros();
        } else {
          alert('Error al eliminar el libro');
        }
      } catch (error) {
        console.error('Error al eliminar el libro:', error);
      }
    }
  };

  return (
    <motion.div
      className="admin-index-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <h1 className="admin-welcome">Bienvenido Administrador</h1>
      <div className="admin-table-container">
        <h2>Gestionar Libros</h2>
        {libros.length === 0 ? (
          <p className="no-books-message">No hay libros registrados</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ISBN</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Stock</th>
                <th>Imagen</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {libros.map((libro) => (
                <tr key={libro.id}>
                  <td>{libro.id}</td>
                  <td>{libro.ISBN}</td>
                  <td>{libro.titulo}</td>
                  <td>{libro.autor}</td>
                  <td>{libro.stock}</td>
                  <td>
                    {libro.imagen ? (
                      <img
                        src={libro.imagen} // Usar la URL completa de la imagen
                        alt={libro.titulo}
                        className="book-image"
                      />
                    ) : (
                      <span>No hay imagen</span>
                    )}
                  </td>
                  <td><button onClick={() => handleEdit(libro.id)}>Editar</button></td>
                  <td><button onClick={() => handleDelete(libro.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};