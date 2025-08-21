import React from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon,
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

// Configuración del menú (exportada para uso en otros componentes)
export const menuConfig = [
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

// Componente principal del Sidebar
const Sidebar = ({ 
  isOpen, 
  onClose, 
  currentRoute, 
  onNavigate, 
  currentUser, 
  onLogout 
}) => {
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://doctrack-0jp0.onrender.com';

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
    
    if (onLogout) {
      onLogout();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
      
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Doctrack</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-600 ml-auto"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* User info header */}
      {currentUser && (
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
      )}

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
                    onNavigate={onNavigate}
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
  );
};

export default Sidebar;