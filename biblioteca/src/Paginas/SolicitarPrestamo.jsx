import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import './Desings/SolicitarDesing.css';

export const SolicitarPrestamo = () => {
  const API = 'http://localhost:5000';
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [matricula, setMatricula] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState(1);
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const m = localStorage.getItem('matricula');
    if (!m) {
      alert('Por favor, inicia sesión para solicitar un préstamo.');
      navigate('/LoginAlum');
    } else setMatricula(m);
  }, [navigate]);

  useEffect(() => {
    fetch(`${API}/libros`)
      .then(res => res.json())
      .then(setBooks)
      .catch(err => console.error('Error libros:', err));
  }, []);

  useEffect(() => {
    if (location.state?.libro) {
      setSelectedBook(location.state.libro);
      setSearch(location.state.libro.titulo);
    }
  }, [location]);

  const handleSearchChange = e => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim()) setFilteredBooks(books.filter(b => b.titulo.toLowerCase().startsWith(v.toLowerCase())));
    else { setFilteredBooks([]); setSelectedBook(null); }
  };
  const handleSelectBook = b => { setSelectedBook(b); setFilteredBooks([]); setSearch(b.titulo); };

  const hoy = () => new Date();
  const todayStr = () => hoy().toISOString().split('T')[0];
  const maxTwoMonths = () => { const d = hoy(); d.setMonth(d.getMonth()+2); return d.toISOString().split('T')[0]; };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedBook || !fechaDevolucion) return alert('Completa todos los campos.');
    if (cantidadSolicitada > selectedBook.stock) return alert('La cantidad supera disponibilidad.');

    // Verifica activos
    const r = await fetch(`${API}/prestamos/activo/${matricula}`);
    if (r.ok) {
      const activos = await r.json();
      if (activos.some(p => p.ISBN === selectedBook.ISBN)) {
        alert('Ya tienes este libro en préstamo.');
        return navigate('/');
      }
    }

    if (fechaDevolucion < todayStr() || fechaDevolucion > maxTwoMonths()) {
      return alert('Fecha fuera de rango (este año y <2 meses).');
    }

    const payload = { fechaPrestamo: todayStr(), fechaDevolucion, matricula, ISBN: selectedBook.ISBN, cantidad: cantidadSolicitada };

    const res = await fetch(`${API}/prestamos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) { const err = await res.json().catch(() => null); return alert(err?.error || 'Error al registrar préstamo'); }

    // Actualiza stock enviando todos los campos
    await fetch(`${API}/libros/${selectedBook.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: selectedBook.titulo, autor: selectedBook.autor, stock: selectedBook.stock - cantidadSolicitada, imagen: selectedBook.imagen?.split('/').pop() || null })
    });

    alert('Préstamo registrado exitosamente.');
    navigate('/');
  };

  return (
    <motion.div className="solicitar-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h2>Solicitar Préstamo</h2>
      <form className="solicitar-form" onSubmit={handleSubmit}>
        {/* Matrícula */}
        <div className="form-group">
          <label>Matrícula del alumno:</label>
          <input type="text" value={matricula} disabled />
        </div>
        {/* Buscar libro */}
        <div className="form-group">
          <label>Buscar libro:</label>
          <input value={search} onChange={handleSearchChange} />
          {filteredBooks.map(b => <div key={b.ISBN} onClick={() => handleSelectBook(b)}>{b.titulo}</div>)}
        </div>
        {/* Detalle libro */}
        {selectedBook && (
          <div className="book-detail">
            <h3>{selectedBook.titulo}</h3>
            <p><strong>Autor:</strong> {selectedBook.autor}</p>
            <p><strong>ISBN:</strong> {selectedBook.ISBN}</p>
            <p><strong>Disponibles:</strong> {selectedBook.stock}</p>
            {selectedBook.imagen ? <img src={selectedBook.imagen} alt={`Imagen de ${selectedBook.titulo}`} className="book-image"/> : <p>No hay imagen</p>}
          </div>
        )}
        {/* Cantidad */}
        {selectedBook && (
          <div className="form-group">
            <label>Cantidad a solicitar:</label>
            <input type="number" min="1" max={selectedBook.stock} value={cantidadSolicitada} onChange={e => setCantidadSolicitada(Number(e.target.value))} required />
          </div>
        )}
        {/* Fecha devolución */}
        <div className="form-group">
          <label>Fecha de devolución:</label>
          <input type="date" value={fechaDevolucion} onChange={e => setFechaDevolucion(e.target.value)} required min={todayStr()} max={maxTwoMonths()} />
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>Solicitar Préstamo</motion.button>
      </form>
    </motion.div>
  );
};