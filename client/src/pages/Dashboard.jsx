import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  DocumentIcon,
  BriefcaseIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Hook personalizado para la gestión de datos del dashboard
const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://doctrack-0jp0.onrender.com';

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      console.log('Loading dashboard data...');
      
      // Volver al método original temporalmente para evitar errores
      const [statsRes, clientesRes, casosRes, checklistRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/clientes-resumen`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/casos-resumen`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/checklist-pendientes`, { credentials: 'include' })
      ]);

      console.log('API responses:', {
        stats: statsRes.status,
        clientes: clientesRes.status,
        casos: casosRes.status,
        checklist: checklistRes.status
      });

      if (statsRes.ok) {
        const stats = await statsRes.json();
        const clientes = clientesRes.ok ? await clientesRes.json() : [];
        const casos = casosRes.ok ? await casosRes.json() : [];
        const checklist = checklistRes.ok ? await checklistRes.json() : [];

        const combinedData = {
          ...stats,
          clientesRecientes: clientes,
          casosRecientes: casos,
          checklistPendientes: checklist
        };

        console.log('Dashboard data loaded:', combinedData);
        setDashboardData(combinedData);
      } else {
        console.error('Stats API failed:', statsRes.status, statsRes.statusText);
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
  const navigate = useNavigate();

  if (!clientes || clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Clientes</h3>
          <button 
            onClick={() => navigate('/clients')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos los clientes
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Vista general de la base de clientes, incluyendo nuevos registros y actividad reciente.
        </p>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No hay clientes registrados aún</p>
          <button 
            onClick={() => navigate('/clients')}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Crear primer cliente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Clientes</h3>
        <button 
          onClick={() => navigate('/clients')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Ver todos los clientes
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Vista general de la base de clientes, incluyendo nuevos registros y actividad reciente.
      </p>
      <div className="space-y-4">
        {clientes.slice(0, 4).map((cliente, idx) => (
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
  const navigate = useNavigate();

  if (!casos || casos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Casos</h3>
          <button 
            onClick={() => navigate('/cases')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos los casos
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No hay casos registrados aún</p>
          <button 
            onClick={() => navigate('/cases')}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Crear primer caso
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (estado) => {
    const colors = {
      'APROBADO': 'bg-green-100 text-green-800',
      'EN_PROCESO': 'bg-blue-100 text-blue-800',
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'RECHAZADO': 'bg-red-100 text-red-800',
      'CERRADO': 'bg-gray-100 text-gray-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Casos</h3>
        <button 
          onClick={() => navigate('/cases')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Ver todos los casos
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Vista general de casos en progreso y su estado actual.
      </p>
      <div className="space-y-4">
        {casos.slice(0, 4).map((caso, idx) => (
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
  if (!checklist || checklist.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Checklist Pendientes</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Tareas y documentos pendientes para completar casos.
        </p>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No hay tareas pendientes</p>
        </div>
      </div>
    );
  }

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
        {checklist.map((item, idx) => (
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

// Componente principal del Dashboard (sin MainLayout, ya que se maneja por el router)
const Dashboard = () => {
  const { dashboardData, isLoading, loadDashboardData } = useDashboardData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtrar datos cuando cambie el término de búsqueda
  useEffect(() => {
    if (!dashboardData || !searchTerm.trim()) {
      setFilteredData(dashboardData);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = {
      ...dashboardData,
      clientesRecientes: dashboardData.clientesRecientes?.filter(cliente => 
        cliente.nombre_completo?.toLowerCase().includes(term)
      ) || [],
      casosRecientes: dashboardData.casosRecientes?.filter(caso => 
        caso.cliente?.toLowerCase().includes(term) || 
        caso.tipo?.toLowerCase().includes(term)
      ) || []
    };
    setFilteredData(filtered);
  }, [dashboardData, searchTerm]);

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

  // Protección adicional para evitar pantalla blanca
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-gray-600">No se pudieron cargar los datos del dashboard</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Header con buscador y botones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Buscar clientes o casos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus:ring-0 focus:outline-none text-sm bg-transparent w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/clients')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
          <button 
            onClick={() => navigate('/cases')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Caso</span>
          </button>
        </div>
      </div>

      {/* Cards principales */}
      <StatsCards dashboardData={filteredData || dashboardData} />

      {/* Secciones inferiores - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientesSummary clientes={(filteredData || dashboardData)?.clientesRecientes} />
        <CasosSummary casos={(filteredData || dashboardData)?.casosRecientes} />
      </div>

      {/* Checklist Pendientes */}
      <ChecklistPendientes checklist={(filteredData || dashboardData)?.checklistPendientes} />
    </div>
  );
};

export default Dashboard;