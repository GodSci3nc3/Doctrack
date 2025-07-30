import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const axios = {
  get: async (url) => {
    const response = await fetch(`http://localhost:3001${url}`);
    return { data: await response.json() };
  },
  post: async (url, data) => {
    const response = await fetch(`http://localhost:3001${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { data: await response.json() };
  },
  put: async (url, data) => {
    const response = await fetch(`http://localhost:3001${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { data: await response.json() };
  },
  delete: async (url) => {
    const response = await fetch(`http://localhost:3001${url}`, {
      method: 'DELETE'
    });
    return { data: await response.json() };
  }
};

const Cases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    clientId: '',
    type: '',
    status: '',
    checklist: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const caseTypes = ['Asilo Político', 'Residencia Permanente', 'Visa de Trabajo H-1B', 'Ciudadanía', 'Otro'];
  const caseStates = ['Iniciado', 'En revisión', 'Aprobado', 'Rechazado', 'Pendiente de entrevista'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [casesRes, clientsRes] = await Promise.all([
        axios.get('/api/cases'),
        axios.get('/api/clients')
      ]);
      setCases(casesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      showNotification('error', 'Error al cargar los datos iniciales');
      console.error('Error fetching initial data:', error);
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
    if (!formData.clientId) errors.clientId = 'El cliente es requerido';
    if (!formData.type.trim()) errors.type = 'El tipo de caso es requerido';
    if (!formData.status.trim()) errors.status = 'El estado del caso es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        clientId: parseInt(formData.clientId)
      };

      if (editingCase) {
        const response = await axios.put(`/api/cases/${editingCase.id}`, payload);
        setCases(cases.map(c => c.id === editingCase.id ? response.data : c));
        showNotification('success', 'Caso actualizado exitosamente');
      } else {
        const response = await axios.post('/api/cases', payload);
        setCases([...cases, response.data]);
        showNotification('success', 'Caso creado exitosamente');
      }
      closeModal();
      fetchInitialData(); // Refrescar los datos
    } catch (error) {
      showNotification('error', `Error al ${editingCase ? 'actualizar' : 'crear'} el caso`);
      console.error('Error submitting case:', error);
    }
  };

  const handleEdit = (caseData) => {
    setEditingCase(caseData);
    setFormData({
      clientId: caseData.clientId,
      type: caseData.type,
      status: caseData.status,
      checklist: caseData.checklist || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (caseId) => {
    if (window.confirm('¿Está seguro que desea eliminar este caso?')) {
      try {
        await axios.delete(`/api/cases/${caseId}`);
        setCases(cases.filter(c => c.id !== caseId));
        showNotification('success', 'Caso eliminado exitosamente');
      } catch (error) {
        showNotification('error', 'Error al eliminar el caso');
        console.error('Error deleting case:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCase(null);
    setFormData({ clientId: '', type: '', status: '', checklist: '' });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Casos</h1>
            <p className="text-gray-600 mt-1">Administra los casos de tus clientes</p>
          </div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Caso
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Caso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checklist</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((caseData) => (
                    <tr key={caseData.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                          <div className="ml-4 text-sm font-medium text-gray-900">{caseData.client?.name || 'Cliente no encontrado'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{caseData.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caseData.status === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {caseData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                           <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{caseData.checklist}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleEdit(caseData)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150" title="Editar caso">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(caseData.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150" title="Eliminar caso">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cases.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay casos</h3>
                  <p className="mt-1 text-sm text-gray-500">Comienza agregando un nuevo caso.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{editingCase ? 'Editar Caso' : 'Nuevo Caso'}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                      <select name="clientId" value={formData.clientId} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.clientId ? 'border-red-300' : 'border-gray-300'}`}>
                        <option value="">Seleccione un cliente</option>
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                      </select>
                      {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Caso *</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {caseTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Caso *</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {caseStates.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Checklist de Documentos</label>
                      <textarea name="checklist" value={formData.checklist} onChange={handleInputChange} rows={3} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.checklist ? 'border-red-300' : 'border-gray-300'}`} placeholder="Ej: Pasaporte, Visa, Formulario I-94"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="button" onClick={handleSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200">
                    {editingCase ? 'Actualizar' : 'Crear'} Caso
                  </button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;

