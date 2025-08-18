import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentIcon,
  BriefcaseIcon,
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Componente de ícono personalizado para IA
const RobotIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

// Configuración del menú (movida fuera del componente para mejor performance)
const menuConfig = [
  {
    category: '🏠 Inicio',
    items: [
      { id: 'dashboard', label: 'Escritorio', icon: HomeIcon, route: '/dashboard' },
      { id: 'agenda', label: 'Agenda (en desarrollo)', icon: CalendarIcon, route: '/agenda' }
    ]
  },
  {
    category: '📁 Casos Migratorios',
    items: [
      { id: 'casos-lista', label: 'Lista de casos', icon: BriefcaseIcon, route: '/casos' },
      { id: 'casos-nuevo', label: 'Nuevo Caso', icon: PlusIcon, route: '/casos/nuevo' },
      { id: 'casos-tracking', label: 'Case tracking (en desarrollo)', icon: EyeIcon, route: '/casos/tracking' },
      { id: 'casos-ia', label: 'Revision IA (en desarrollo)', icon: RobotIcon, route: '/casos/ia' }
    ]
  },
  {
    category: '👤 Clientes',
    items: [
      { id: 'clientes-lista', label: 'Lista de clientes', icon: UserGroupIcon, route: '/clientes' },
      { id: 'clientes-nuevo', label: 'Nuevo Cliente', icon: PlusIcon, route: '/clientes/nuevo' },
      { id: 'contratos', label: 'Contratos (en desarrollo)', icon: DocumentDuplicateIcon, route: '/contratos' }
    ]
  },
  {
    category: '📄 Documentos',
    items: [
      { id: 'documentos-lista', label: 'Listado de documentos', icon: DocumentIcon, route: '/documentos' },
      { id: 'plantillas', label: 'Plantillas y modelos (en desarrollo)', icon: ClipboardDocumentListIcon, route: '/plantillas' }
    ]
  },
  {
    category: '💰 Pagos & Reportes',
    items: [
      { id: 'pagos-resumen', label: 'Resumen de pagos (en desarrollo)', icon: CurrencyDollarIcon, route: '/pagos' },
      { id: 'detalle-caso', label: 'Detalle caso/cliente (en desarrollo)', icon: ChartBarIcon, route: '/detalle' },
      { id: 'reportes', label: 'Generacion de reportes (en desarrollo)', icon: DocumentTextIcon, route: '/reportes' },
      { id: 'negocios', label: 'Negocios realizados (en desarrollo)', icon: BuildingOfficeIcon, route: '/negocios' },
      { id: 'correos', label: 'Correos enviados (en desarrollo)', icon: EnvelopeIcon, route: '/correos' }
    ]
  },
  {
    category: '👥 Usuarios',
    items: [
      { id: 'usuarios-lista', label: 'Lista de usuarios (en desarrollo)', icon: UsersIcon, route: '/usuarios' },
      { id: 'usuarios-agregar', label: 'Agregar usuario (en desarrollo)', icon: PlusIcon, route: '/usuarios/nuevo' }
    ]
  },
  {
    category: '🌐 Sitio Web',
    items: [
      { id: 'servicios', label: 'Servicios (en desarrollo)', icon: GlobeAltIcon, route: '/servicios' },
      { id: 'contenidos', label: 'Contenidos (en desarrollo)', icon: DocumentTextIcon, route: '/contenidos' },
      { id: 'empresa', label: 'Nuestra empresa (en desarrollo)', icon: BuildingOfficeIcon, route: '/empresa' },
      { id: 'privacidad', label: 'Politicas de privacidad (en desarrollo)', icon: LockClosedIcon, route: '/privacidad' }
    ]
  },
  {
    category: '🛠️ Configuración',
    items: [
      { id: 'info-empresa', label: 'Informacion empresa (en desarrollo)', icon: BuildingOfficeIcon, route: '/config/empresa' },
      { id: 'dominio', label: 'Dominio y pagina web (en desarrollo)', icon: GlobeAltIcon, route: '/config/dominio' },
      { id: 'plantillas-web', label: 'Plantillas pagina web (en desarrollo)', icon: DocumentIcon, route: '/config/plantillas-web' },
      { id: 'tipos-cliente', label: 'Tipos de cliente (en desarrollo)', icon: UserGroupIcon, route: '/config/tipos-cliente' },
      { id: 'integraciones', label: 'Integraciones (en desarrollo)', icon: Cog6ToothIcon, route: '/config/integraciones' },
      { id: 'ajustes', label: 'Ajustes generales (en desarrollo)', icon: Cog6ToothIcon, route: '/config/ajustes' },
      { id: 'permisos', label: 'Permisos (en desarrollo)', icon: LockClosedIcon, route: '/config/permisos' },
      { id: 'notificaciones', label: 'Notificaciones (en desarrollo)', icon: BellIcon, route: '/config/notificaciones' }
    ]
  },
  {
    category: '🧑 Mi cuenta',
    items: [
      { id: 'perfil', label: 'Modificar mi perfil (en desarrollo)', icon: UserIcon, route: '/cuenta/perfil' },
      { id: 'password', label: 'Cambiar contraseña (en desarrollo)', icon: LockClosedIcon, route: '/cuenta/password' },
      { id: 'facturacion', label: 'Facturacion (en desarrollo)', icon: CreditCardIcon, route: '/cuenta/facturacion' },
      { id: 'plan', label: 'Mi plan (en desarrollo)', icon: StarIcon, route: '/cuenta/plan' }
    ]
  },
  {
    category: '🚀 Próximamente',
    items: [
      { id: 'academia', label: 'Academia Doctrack (futuro)', icon: AcademicCapIcon, route: '/academia' },
      { id: 'comunidad', label: 'Comunidad Doctrack (futuro)', icon: ChatBubbleLeftRightIcon, route: '/comunidad' },
      { id: 'marketplace', label: 'Marketplace (futuro)', icon: ShoppingBagIcon, route: '/marketplace' },
      { id: 'soporte', label: 'Soporte', icon: QuestionMarkCircleIcon, route: '/soporte' }
    ]
  }
];

// Componente para el contenido principal del Dashboard
const MainDashboardContent = ({ dashboardData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      icon: UserGroupIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      value: dashboardData?.clientes || '0',
      label: 'Clientes'
    },
    {
      icon: BriefcaseIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      value: dashboardData?.casosActivos || '0',
      label: 'Casos Activos'
    },
    {
      icon: () => (
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      ),
      iconBg: 'bg-green-100',
      iconColor: '',
      value: dashboardData?.casosCompletados || '0',
      label: 'Casos Completados'
    },
    {
      icon: DocumentIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      value: dashboardData?.documentosPendientes || '0',
      label: 'Documentos Pendientes'
    }
  ];

  const defaultClientes = [
    { nombre_completo: 'María González', dias_registro: 1 },
    { nombre_completo: 'Carlos Rivera', dias_registro: 2 },
    { nombre_completo: 'Ana Martínez', dias_registro: 3 },
    { nombre_completo: 'José López', dias_registro: 4 }
  ];

  const defaultCases = [
    { cliente: 'María González', estado: 'En proceso', fecha: '15/01/2025' },
    { cliente: 'Carlos Rivera', estado: 'Documentos', fecha: '14/01/2025' },
    { cliente: 'Ana Martínez', estado: 'Revisión', fecha: '13/01/2025' },
    { cliente: 'José López', estado: 'Aprobado', fecha: '12/01/2025' }
  ];

  const defaultChecklist = [
    { tarea: 'Revisar documentos de identidad', cliente: 'María González', fecha_limite: '20/01/2025', prioridad: 'alta' },
    { tarea: 'Completar formulario I-485', cliente: 'Carlos Rivera', fecha_limite: '18/01/2025', prioridad: 'media' },
    { tarea: 'Agendar entrevista', cliente: 'Ana Martínez', fecha_limite: '25/01/2025', prioridad: 'baja' }
  ];

  const getStatusColor = (estado) => {
    const colors = {
      'Aprobado': 'bg-green-100 text-green-800',
      'En proceso': 'bg-blue-100 text-blue-800',
      'Documentos': 'bg-yellow-100 text-yellow-800',
      'Revisión': 'bg-yellow-100 text-yellow-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (prioridad) => {
    const colors = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baja': 'bg-gray-100 text-gray-800'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="border-0 focus:ring-0 focus:outline-none text-sm bg-transparent"
            />
          </div>
          <button className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium">
            <PlusIcon className="w-4 h-4" />
            <span>New Client</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium">
            <PlusIcon className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Secciones inferiores - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Clientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Clientes</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos los clientes
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Vista general de la base de clientes, incluyendo nuevos registros y actividad reciente.
          </p>
          <div className="space-y-4">
            {(dashboardData?.clientesRecientes?.slice(0, 4) || defaultClientes).map((cliente, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 font-medium">{cliente.nombre_completo}</span>
                <span className="text-xs text-gray-500">
                  Hace {cliente.dias_registro} día{cliente.dias_registro !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Casos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Casos</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos los casos
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Estado actual de los casos migratorios, próximos plazos y casos recientes.
          </p>
          <div className="space-y-4">
            {(dashboardData?.casosRecientes || defaultCases).map((caso, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 font-medium">{caso.cliente}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caso.estado)}`}>
                    {caso.estado}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{caso.fecha}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Pendientes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Checklist Pendientes</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Gestionar checklists
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Tareas y documentos pendientes para completar casos.
        </p>
        <div className="space-y-3">
          {(dashboardData?.checklistPendientes || defaultChecklist).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.tarea}</span>
                  <div className="text-xs text-gray-500">{item.cliente}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.prioridad)}`}>
                {item.fecha_limite}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para los elementos de menú
const MenuItem = ({ item, isActive, onNavigate }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onNavigate(item.route)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
      <span className="truncate">{item.label}</span>
    </button>
  );
};

// Hook personalizado para la gestión de datos del dashboard
const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://doctrack-0jp0.onrender.com';

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, clientesRes, casosRes, checklistRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/clientes-resumen`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/casos-resumen`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/checklist-pendientes`, { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        const clientes = clientesRes.ok ? await clientesRes.json() : [];
        const casos = casosRes.ok ? await casosRes.json() : [];
        const checklist = checklistRes.ok ? await checklistRes.json() : [];

        setDashboardData({
          ...stats,
          clientesRecientes: clientes,
          casosRecientes: casos,
          checklistPendientes: checklist
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { dashboardData, isLoading, loadDashboardData };
};

// Componente principal del Dashboard
const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dashboardData, isLoading, loadDashboardData } = useDashboardData();

  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://doctrack-0jp0.onrender.com';

  // Función de logout mejorada
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Navegación interna
  const handleNavigation = (route) => {
    setCurrentRoute(route);
    setSidebarOpen(false);
  };

  // Verificar autenticación y cargar datos
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
        loadDashboardData();
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  }, []);

  // Renderizar contenido según ruta
  const renderContent = () => {
    if (currentRoute === '/dashboard') {
      return <MainDashboardContent dashboardData={dashboardData} isLoading={isLoading} />;
    }
    
    const currentItem = menuConfig
      .flatMap(category => category.items)
      .find(item => item.route === currentRoute);
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {currentItem?.label || 'Página'}
        </h2>
        <p className="text-gray-600">
          {currentItem?.label?.includes('(en desarrollo)') || currentItem?.label?.includes('(futuro)') 
            ? 'Esta funcionalidad está en desarrollo y estará disponible próximamente.'
            : 'Contenido de la página en desarrollo...'}
        </p>
      </div>
    );
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      
      {/* Sidebar con scroll mejorado */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        
        {/* Logo/Header */}
        <div className="flex items-center h-16 px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Doctrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 ml-auto"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User info header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {currentUser?.nombre?.charAt(0)}{currentUser?.apellido?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.nombre} {currentUser?.apellido}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">{currentUser?.rol}</p>
            </div>
          </div>
        </div>

        {/* Navigation con scroll optimizado */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-6">
            {menuConfig.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                  {category.category}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      isActive={currentRoute === item.route}
                      onNavigate={handleNavigation}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Logout - Fixed at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header - solo el botón hamburguesa para mobile */}
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            {renderContent()}
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

export default Dashboard;