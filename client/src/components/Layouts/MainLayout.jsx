import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { useAuth } from '../ProtectedRoute';

// Componente de Layout Principal con React Router
const MainLayout = ({ children, showMobileHeader = true, className = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
            {/* Si se pasan children directamente, los renderizamos */}
            {children}
            {/* Si no hay children, renderizamos el Outlet para las rutas */}
            {!children && <Outlet />}
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