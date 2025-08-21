import React, { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar'; // Ajusta la ruta según tu estructura

// Hook personalizado para manejar la autenticación
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
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

        // Opcionalmente, verificar el token con el servidor
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

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('authChange'));
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return { currentUser, isLoading, logout };
};

// Componente de Layout Principal
const MainLayout = ({ 
  children, 
  title = "Dashboard",
  currentRoute = "/dashboard",
  onNavigate,
  showMobileHeader = true,
  className = ""
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isLoading, logout } = useAuth();

  // Función de navegación por defecto
  const handleNavigation = (route) => {
    setSidebarOpen(false);
    
    if (onNavigate) {
      onNavigate(route);
    } else {
      // Navegación por defecto usando window.location
      if (typeof window !== 'undefined') {
        window.location.href = route;
      }
    }
  };

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir si no hay usuario autenticado
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentRoute={currentRoute}
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        {showMobileHeader && (
          <header className="bg-white border-b border-gray-100 px-6 py-4 lg:hidden flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              {/* User info in mobile header */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">
                    {currentUser?.nombre?.charAt(0)}{currentUser?.apellido?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {currentUser?.nombre}
                </span>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto p-6 ${className}`}>
          <div className="max-w-7xl mx-auto">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;