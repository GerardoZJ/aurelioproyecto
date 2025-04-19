import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import './Desings/SolicitarDesing.css';

export const SolicitarPrestamo = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [matricula, setMatricula] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState(1);
  const [fechaDevolucion, setFechaDevolucion] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Obtener matrícula
  useEffect(() => {
    const storedMatricula = localStorage.getItem('matricula');
    if (!storedMatricula) {
      alert('Por favor, inicia sesión para solicitar un préstamo.');
      navigate('/LoginAlum');
    } else {
      setMatricula(storedMatricula);
    }
  }, [navigate]);

  // Obtener libros
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/libros');
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        } else {
          console.error('Error al obtener los libros:', response.statusText);
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    };
    fetchBooks();
  }, []);

  // Cargar libro si se pasó desde otra página
  useEffect(() => {
    if (location.state?.libro) {
      setSelectedBook(location.state.libro);
      setSearch(location.state.libro.titulo);
    }
  }, [location]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length > 0) {
      const filtered = books.filter(book =>
        book.titulo.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
      setSelectedBook(null);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setFilteredBooks([]);
    setSearch(book.titulo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !matricula || !fechaDevolucion) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (cantidadSolicitada > selectedBook.stock) {
      alert('La cantidad solicitada supera la disponibilidad.');
      return;
    }

    const newLoan = {
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion,
      matricula,
      ISBN: selectedBook.ISBN,
      cantidad: cantidadSolicitada,
    };

    try {
      const response = await fetch('http://localhost:5000/prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLoan),
      });

      if (response.ok) {
        // Actualizar stock del libro después de registrar el préstamo
        const updatedBook = { ...selectedBook, stock: selectedBook.stock - cantidadSolicitada };
        await fetch(`http://localhost:5000/libros/${selectedBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stock: updatedBook.stock }),
        });

        alert('Préstamo registrado exitosamente.');
        
        // Redirige a la página de inicio después de la solicitud
        navigate('/');  // Redirige a Home

        // Resetear el formulario
        setFechaDevolucion('');
        setCantidadSolicitada(1);
        setSelectedBook(null);
        setSearch('');
      } else {
        alert('Error al registrar el préstamo. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  // Función para obtener la fecha actual en formato adecuado para el campo de fecha
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <motion.div
      className="solicitar-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Solicitar Préstamo</h2>
      <form className="solicitar-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Matrícula del alumno:</label>
          <input type="text" value={matricula} disabled />
        </div>

        {selectedBook && (
          <div className="book-detail">
            <div className="book-info">
              <h3>{selectedBook.titulo}</h3>
              <p><strong>Autor:</strong> {selectedBook.autor}</p>
              <p><strong>ISBN:</strong> {selectedBook.ISBN}</p>
              <p><strong>Disponibles:</strong> {selectedBook.stock}</p>
              {selectedBook.imagen ? (
                <img
                  src={
                    selectedBook.imagen.startsWith("http")
                      ? selectedBook.imagen // Si la URL ya es completa, úsala directamente
                      : `http://localhost:5000/uploads/${selectedBook.imagen}` // Construir la URL completa
                  }
                  alt={`Imagen de ${selectedBook.titulo}`}
                  className="book-image"
                />
              ) : (
                <p>No hay imagen disponible</p>
              )}
            </div>
          </div>
        )}

        {selectedBook && (
          <div className="form-group">
            <label>Cantidad a solicitar:</label>
            <input
              type="number"
              min="1"
              max={selectedBook.stock}
              value={cantidadSolicitada}
              onChange={(e) => setCantidadSolicitada(Number(e.target.value))}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Fecha de devolución:</label>
          <input
            type="date"
            value={fechaDevolucion}
            onChange={(e) => setFechaDevolucion(e.target.value)}
            required
            min={getTodayDate()} // Se asegura de que la fecha mínima sea la actual
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Solicitar Préstamo
        </motion.button>
      </form>
    </motion.div>
  );
};