import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Desings/AgregarLibroDesing.css';

export const AgregarLibro = () => {
  const [isbn, setIsbn] = useState('');
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null); // Variable para la vista previa
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isbn.trim() || !titulo.trim() || !autor.trim() || cantidad < 1) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formData = new FormData();
    formData.append('ISBN', isbn);
    formData.append('titulo', titulo);
    formData.append('autor', autor);
    formData.append('stock', cantidad);
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      const response = await fetch('http://localhost:5000/libros', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Libro agregado exitosamente');
        setIsbn('');
        setTitulo('');
        setAutor('');
        setCantidad(1);
        setImagen(null);
        setImagenPreview(null); // Resetear la vista previa
        navigate('/AdminIndex');
      } else {
        alert('Error al agregar el libro');
      }
    } catch (error) {
      console.error('Error al agregar el libro:', error);
      alert('No se pudo conectar con el servidor. Por favor, intenta nuevamente.');
    }
  };

  // Función para manejar el cambio de imagen y mostrar la vista previa
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    if (file) {
      setImagenPreview(URL.createObjectURL(file)); // Crear una URL para la vista previa
    }
  };

  return (
    <motion.div
      className="agregar-libro-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Agregar Libro</h2>
      <form className="agregar-libro-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ISBN:</label>
          <input
            type="text"
            placeholder="Ingrese el ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            placeholder="Ingrese el título del libro"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Autor:</label>
          <input
            type="text"
            placeholder="Ingrese el autor del libro"
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
            placeholder="Ingrese la cantidad disponible"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label>Imagen:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
          />
          {imagenPreview && <img src={imagenPreview} alt="Vista previa" style={{ width: '100px', marginTop: '10px' }} />}
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Agregar Libro
        </motion.button>
      </form>
    </motion.div>
  );
};
