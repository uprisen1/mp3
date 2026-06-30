import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Player from './pages/Player';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLogin={() => setIsAuthenticated(true)} />} 
        />
        <Route
          path="/player"
          element={
            <PrivateRoute>
              <Player />
            </PrivateRoute>
          }
        />
        <Route path="/" element={isAuthenticated ? <Navigate to="/player" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
