import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  DocumentIcon,
  BriefcaseIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import MainLayout from '../components/Layouts/MainLayout';

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

// Componente para las estadísticas principales
const StatsCards = ({ dashboardData }) => {
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

  return (
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
  );
};

// Componente para el resumen de clientes
const ClientesSummary = ({ clientes }) => {
  const defaultClientes = [
    { nombre_completo: 'María González', dias_registro: 1 },
    { nombre_completo: 'Carlos Rivera', dias_registro: 2 },
    { nombre_completo: 'Ana Martínez', dias_registro: 3 },
    { nombre_completo: 'José López', dias_registro: 4 }
  ];

  return (
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
        {(clientes?.slice(0, 4) || defaultClientes).map((cliente, idx) => (
          <div key={idx} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700 font-medium">{cliente.nombre_completo}</span>
            <span className="text-xs text-gray-500">
              Hace {cliente.dias_registro} día{cliente.dias_registro !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para el resumen de casos
const CasosSummary = ({ casos }) => {
  const defaultCases = [
    { cliente: 'María González', estado: 'En proceso', fecha: '15/01/2025' },
    { cliente: 'Carlos Rivera', estado: 'Documentos', fecha: '14/01/2025' },
    { cliente: 'Ana Martínez', estado: 'Revisión', fecha: '13/01/2025' },
    { cliente: 'José López', estado: 'Aprobado', fecha: '12/01/2025' }
  ];

  const getStatusColor = (estado) => {
    const colors = {
      'Aprobado': 'bg-green-100 text-green-800',
      'COMPLETADO': 'bg-green-100 text-green-800',
      'En proceso': 'bg-blue-100 text-blue-800',
      'EN_PROCESO': 'bg-blue-100 text-blue-800',
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'Documentos': 'bg-yellow-100 text-yellow-800',
      'Revisión': 'bg-yellow-100 text-yellow-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
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
        {(casos || defaultCases).map((caso, idx) => (
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
  );
};

// Componente para checklist pendientes
const ChecklistPendientes = ({ checklist }) => {
  const defaultChecklist = [
    { tarea: 'Revisar documentos de identidad', cliente: 'María González', fecha_limite: '2025-01-20', prioridad: 'alta' },
    { tarea: 'Completar formulario I-485', cliente: 'Carlos Rivera', fecha_limite: '2025-01-18', prioridad: 'media' },
    { tarea: 'Agendar entrevista', cliente: 'Ana Martínez', fecha_limite: '2025-01-25', prioridad: 'baja' }
  ];

  const getPriorityColor = (prioridad) => {
    const colors = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baja': 'bg-gray-100 text-gray-800'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  return (
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
        {(checklist || defaultChecklist).map((item, idx) => (
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
  );
};

// Componente principal del contenido del Dashboard
const DashboardContent = ({ dashboardData, isLoading }) => {
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
      <StatsCards dashboardData={dashboardData} />

      {/* Secciones inferiores - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientesSummary clientes={dashboardData?.clientesRecientes} />
        <CasosSummary casos={dashboardData?.casosRecientes} />
      </div>

      {/* Checklist Pendientes */}
      <ChecklistPendientes checklist={dashboardData?.checklistPendientes} />
    </div>
  );
};

// Componente principal del Dashboard
const Dashboard = () => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const { dashboardData, isLoading, loadDashboardData } = useDashboardData();

  // Función de navegación
  const handleNavigation = (route) => {
    setCurrentRoute(route);
    // Aquí puedes agregar lógica adicional de navegación si usas React Router
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Renderizar contenido según ruta
  const renderContent = () => {
    if (currentRoute === '/dashboard') {
      return <DashboardContent dashboardData={dashboardData} isLoading={isLoading} />;
    }
    
    // Para otras rutas, mostrar contenido genérico
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {currentRoute.replace('/', '').replace('-', ' ').toUpperCase()}
        </h2>
        <p className="text-gray-600">
          Esta funcionalidad está en desarrollo y estará disponible próximamente.
        </p>
      </div>
    );
  };

  return (
    <MainLayout
      title="Dashboard"
      currentRoute={currentRoute}
      onNavigate={handleNavigation}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default Dashboard;