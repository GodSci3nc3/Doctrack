import React, { useState, useEffect } from 'react';
import ClientForm from '../components/ClientForm';
import ClientDetails from '../components/ClientDetails';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
};

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    canal_ingreso: 'Web'
  });
  const [formErrors, setFormErrors] = useState({});

  const canalOptions = ['Web', 'Teléfono', 'Referido', 'Redes Sociales', 'Oficina', 'Otro'];

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      setLoading(true);
  const response = await api.get(`/api/clientes?search=${encodeURIComponent(search)}`);
      
      // Adaptarse a la respuesta del backend
      let clientsData = [];
      if (response.data && Array.isArray(response.data.clientes)) {
        clientsData = response.data.clientes;
      } else if (Array.isArray(response.data)) {
        clientsData = response.data;
      }
      
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showNotification('error', 'Error al cargar los clientes: ' + error.message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (formData.telefono && !/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || null,
        canal_ingreso: formData.canal_ingreso
      };

      let response;
      if (editingClient) {
        response = await api.put(`/api/clientes/${editingClient.cliente_id}`, payload);
        setClients(clients.map(client => 
          client.cliente_id === editingClient.cliente_id ? response.data : client
        ));
        showNotification('success', 'Cliente actualizado exitosamente');
      } else {
        response = await api.post('/api/clientes', payload);
        setClients([response.data, ...clients]);
        showNotification('success', 'Cliente creado exitosamente');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('error', `Error al ${editingClient ? 'actualizar' : 'crear'} el cliente: ${error.message}`);
    }
  };

  const handleEdit = (client) => {
    console.log('Editing client:', client);
    setEditingClient(client);
    setShowModal(true);
  };

  const handleRowClick = (client) => {
    setSelectedClient(client);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Está seguro que desea eliminar este cliente? Esta acción también eliminará todos sus casos asociados.')) {
      try {
        await api.delete(`/api/clientes/${clientId}`);
        setClients(clients.filter(client => client.cliente_id !== clientId));
        showNotification('success', 'Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('error', 'Error al eliminar el cliente: ' + error.message);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      canal_ingreso: 'Web'
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getCasosActivos = (client) => {
    if (client.caso && Array.isArray(client.caso)) {
      return client.caso.filter(caso => caso.estado !== 'COMPLETADO').length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
            : 'bg-red-100 border-l-4 border-red-500 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver al Panel
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600 mt-1">Administra la información de tus clientes</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full max-w-xs"
            placeholder="Buscar por nombre, apellido, correo, tipo de proceso o país..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Tabla de Clientes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Cargando clientes...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de proceso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.cliente_id} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleRowClick(client)}>
                      <td className="px-6 py-4 whitespace-nowrap">{client.nombre || 'Sin nombre'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.apellido || 'Sin apellido'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.tipo_proceso || client.migratorio_tipo_proceso || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.pais_origen || client.pais_nacimiento || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.telefono || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.email || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                            title="Editar cliente"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(client.cliente_id); }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                            title="Eliminar cliente"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {clients.length === 0 && !loading && (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando un nuevo cliente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
          <div className="relative z-10 w-full max-w-3xl mx-auto">
            <ClientForm
              initialData={editingClient || {}}
              mode={editingClient ? 'edit' : 'create'}
              loading={loading}
              error={null}
              onSubmit={async (form) => {
                setLoading(true);
                try {
                  let response;
                  if (editingClient) {
                    response = await api.put(`/api/clientes/${editingClient.cliente_id}`, form);
                    setClients(clients.map(client => client.cliente_id === editingClient.cliente_id ? response.data : client));
                    showNotification('success', 'Cliente actualizado exitosamente');
                  } else {
                    response = await api.post('/api/clientes', form);
                    setClients([response.data, ...clients]);
                    showNotification('success', 'Cliente creado exitosamente');
                  }
                  closeModal();
                } catch (error) {
                  showNotification('error', `Error al ${editingClient ? 'actualizar' : 'crear'} el cliente: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Modal para detalles de cliente */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedClient(null)}></div>
          <div className="relative z-10 w-full max-w-3xl mx-auto">
            <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;