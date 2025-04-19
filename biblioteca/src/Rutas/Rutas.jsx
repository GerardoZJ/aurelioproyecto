import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../Paginas/Home';
import { SolicitarPrestamo } from '../Paginas/SolicitarPrestamo';
import { Historial } from '../Paginas/Historial';
import { DevolverLibro } from '../Paginas/DevolverLibro';
import { Navbar } from '../NavBar/Navbar';
import { LoginAlum } from '../Paginas/LoginAlum';
import { LoginAdmin } from '../Paginas/LoginAdmin';
import { PrivateRoute } from './RutasPriv'; // Importar PrivateRoute

// Páginas de administración
import { AdminIndex } from '../Paginas/AdminIndex';
import { AgregarLibro } from '../Paginas/AgregarLibro';
import { EditarLibro } from '../Paginas/EditarLibro';
import { GestionarPrestamos } from '../Paginas/GestionPrestamos';

export const Rutas = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/LoginAlum" element={<LoginAlum />} />
        <Route path="/LoginAdmin" element={<LoginAdmin />} />

        {/* Rutas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/Home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/SolicitarPrestamo"
          element={
            <PrivateRoute>
              <SolicitarPrestamo />
            </PrivateRoute>
          }
        />
        <Route
          path="/DevolverLibro"
          element={
            <PrivateRoute>
              <DevolverLibro />
            </PrivateRoute>
          }
        />
        <Route
          path="/Historial"
          element={
            <PrivateRoute>
              <Historial />
            </PrivateRoute>
          }
        />

        {/* Rutas de administración */}
        <Route
          path="/AdminIndex"
          element={
            <PrivateRoute>
              <AdminIndex />
            </PrivateRoute>
          }
        />
        <Route
          path="/AgregarLibro"
          element={
            <PrivateRoute>
              <AgregarLibro />
            </PrivateRoute>
          }
        />
        <Route
          path="/EditarLibro/:id"
          element={
            <PrivateRoute>
              <EditarLibro />
            </PrivateRoute>
          }
        />
        <Route
          path="/GestionarPrestamos"
          element={
            <PrivateRoute>
              <GestionarPrestamos />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};