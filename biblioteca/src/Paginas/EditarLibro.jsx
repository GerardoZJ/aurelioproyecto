import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../NavBar/Navbar'; // Importa el navbar
import './Desings/AgregarLibroDesing.css';

export const EditarLibro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [imagen, setImagen] = useState(null); // Estado para la nueva imagen
  const [imagenActual, setImagenActual] = useState(''); // URL de la imagen actual

  const fetchLibro = async () => {
    try {
      const response = await fetch(`http://localhost:5000/libros/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTitulo(data.titulo);
        setAutor(data.autor);
        setCantidad(data.stock);
        setImagenActual(data.imagen); // Guarda la URL de la imagen actual
      } else {
        alert('Error al obtener los datos del libro');
      }
    } catch (error) {
      console.error('Error al obtener los datos del libro:', error);
    }
  };

  useEffect(() => {
    fetchLibro();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica que el archivo sea una imagen válida
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      // Libera la URL temporal anterior si existe
      if (imagenActual && imagenActual.startsWith('blob:')) {
        URL.revokeObjectURL(imagenActual);
      }

      setImagen(file); // Actualiza el estado de la nueva imagen
      setImagenActual(URL.createObjectURL(file)); // Genera una URL temporal para mostrar la nueva imagen
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !autor.trim() || cantidad < 1) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('autor', autor);
    formData.append('stock', cantidad);

    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      const response = await fetch(`http://localhost:5000/libros/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Libro editado exitosamente');
        navigate('/AdminIndex');
      } else {
        alert('Error al editar el libro');
      }
    } catch (error) {
      console.error('Error al editar el libro:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <>
      <Navbar /> {/* Agrega el navbar aquí */}
      <motion.div
        className="agregar-libro-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Editar Libro</h2>
        <form className="agregar-libro-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID:</label>
            <input type="text" value={id} disabled />
          </div>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              placeholder="Cambiar el título del libro"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Autor:</label>
            <input
              type="text"
              placeholder="Cambiar el autor del libro"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              placeholder="Cambiar la cantidad disponible"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagen Actual:</label>
            {imagenActual ? (
              <img
                src={
                  imagenActual.startsWith('http') || imagenActual.startsWith('blob:')
                    ? imagenActual
                    : `http://localhost:5000/uploads/${imagenActual}`
                }
                alt="Imagen actual"
                className="book-image"
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}
          </div>
          <div className="form-group">
            <label>Nueva Imagen:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange} // Maneja el cambio de imagen
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Editar Libro
          </motion.button>
        </form>
      </motion.div>
    </>
  );
};