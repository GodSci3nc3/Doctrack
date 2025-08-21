import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Hook personalizado para manejar la autenticación
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://doctrack-0jp0.onrender.com';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (!token) {
          setIsLoading(false);
          return;
        }

        if (userData) {
          try {
            const user = JSON.parse(userData);
            setCurrentUser(user);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }

        // Verificar el token con el servidor
        try {
          const response = await fetch(`${API_URL}/api/auth/profile`, {
            credentials: 'include'
          });

          if (response.ok) {
            const { user } = await response.json();
            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            // Token inválido
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Escuchar cambios en la autenticación
    const handleAuthChange = () => {
      loadUserData();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        loadUserData();
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('authChange'));
  };

  return { currentUser, isLoading, logout };
};

// Componente de Ruta Protegida
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderizar el contenido protegido
  return children;
};

// Exportar también el hook para uso en otros componentes
export { useAuth };
export default ProtectedRoute;