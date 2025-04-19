import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('matricula'); // Verifica si hay una matrícula en localStorage

  return isAuthenticated ? children : <Navigate to="/LoginAlum" replace />;
};