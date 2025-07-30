import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import { useLocation, useNavigate } from 'react-router-dom';

// Componente de contenido para Clientes
const ClientesContent = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Gestión de Clientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total Clientes</p>
              <p className="text-2xl font-bold text-blue-600">247</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-900">Activos</p>
              <p className="text-2xl font-bold text-green-600">189</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-900">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">58</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-3">Clientes Recientes</h3>
        <div className="space-y-2">
          {['María González', 'Carlos Rivera', 'Ana Martínez', 'José López'].map((name, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
              <span className="text-sm text-slate-700">{name}</span>
              <span className="text-xs text-slate-500">Hace {idx + 1} día{idx !== 0 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Componente de contenido para Casos
const CasosContent = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Casos Migratorios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-900">Total Casos</p>
          <p className="text-2xl font-bold text-blue-600">156</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="h-8 w-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <p className="text-sm font-medium text-yellow-900">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-600">89</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="h-8 w-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <p className="text-sm font-medium text-green-900">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">52</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="h-8 w-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-sm font-medium text-red-900">Urgentes</p>
          <p className="text-2xl font-bold text-red-600">15</p>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-3">Casos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-700">Cliente</th>
                <th className="text-left py-2 text-slate-700">Tipo</th>
                <th className="text-left py-2 text-slate-700">Estado</th>
                <th className="text-left py-2 text-slate-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cliente: 'María González', tipo: 'Residencia', estado: 'En proceso', fecha: '15/01/2025' },
                { cliente: 'Carlos Rivera', tipo: 'Ciudadanía', estado: 'Documentos', fecha: '14/01/2025' },
                { cliente: 'Ana Martínez', tipo: 'Visa trabajo', estado: 'Revisión', fecha: '13/01/2025' },
                { cliente: 'José López', tipo: 'Reunificación', estado: 'Aprobado', fecha: '12/01/2025' }
              ].map((caso, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{caso.cliente}</td>
                  <td className="py-2 text-slate-600">{caso.tipo}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      caso.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      caso.estado === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {caso.estado}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500">{caso.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('/clients');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Logout function (defined before useEffect)
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Trigger auth state change to notify App component
    window.dispatchEvent(new Event('authChange'));
    
    // Redirect to login
    navigate('/login');
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      handleLogout();
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  }, [navigate]);

  // Navegación interna
  const handleNavigation = (route) => {
    setCurrentRoute(route);
    setSidebarOpen(false);
    navigate(route);
  };
  
  // Set initial route based on location
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  // Configuración de menú
  const menuItems = [
    {
      id: 'clients',
      label: 'Clientes',
      icon: UserGroupIcon,
      route: '/clients',
      active: currentRoute === '/clients'
    },
    {
      id: 'cases',
      label: 'Casos Migratorios',
      icon: DocumentTextIcon,
      route: '/cases',
      active: currentRoute === '/cases'
    }
  ];

  // Renderizar contenido según ruta
  const renderContent = () => {
    switch (currentRoute) {
      case '/clients':
        return <ClientesContent />;
      case '/cases':
        return <CasosContent />;
      case '/dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Panel de Control</h2>
              <p className="text-slate-600">Bienvenido al sistema de gestión de casos migratorios.</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={() => handleNavigation('/clients')} className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Gestionar Clientes</p>
                </button>
                <button onClick={() => handleNavigation('/cases')} className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Gestionar Casos</p>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Panel de Control</h2>
              <p className="text-slate-600">Bienvenido al sistema de gestión de casos migratorios.</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={() => handleNavigation('/clients')} className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Gestionar Clientes</p>
                </button>
                <button onClick={() => handleNavigation('/cases')} className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Gestionar Casos</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-slate-900">Doctrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-900">{currentUser?.name || 'Usuario'}</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {currentRoute === '/clients' ? 'Gestión de Clientes' : 'Casos Migratorios'}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {currentRoute === '/clients' 
                    ? 'Administra y supervisa información de clientes' 
                    : 'Seguimiento y gestión de casos migratorios'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{currentUser?.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;