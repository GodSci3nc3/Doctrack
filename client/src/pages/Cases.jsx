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
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Document requirements by process type
const DOCUMENT_REQUIREMENTS = {
  'Asilo Político': [
    { tipo: 'Formulario', documento: 'I-589' },
    { tipo: 'Evidencia', documento: 'Declaración personal' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Evidencia persecución' },
    { tipo: 'Evidencia', documento: 'Documentos entrada a EE.UU.' },
    { tipo: 'Evidencia', documento: 'Cartas de apoyo' },
    { tipo: 'Evidencia', documento: 'Informes de país' }
  ],
  'Residencia Permanente': [
    { tipo: 'Formulario', documento: 'I-485' },
    { tipo: 'Formulario', documento: 'I-130' },
    { tipo: 'Formulario', documento: 'I-864' },
    { tipo: 'Evidencia', documento: 'Certificado matrimonio' },
    { tipo: 'Evidencia', documento: 'Certificado nacimiento' },
    { tipo: 'Evidencia', documento: 'Pasaporte beneficiario' },
    { tipo: 'Evidencia', documento: 'Pasaporte solicitante' },
    { tipo: 'Evidencia', documento: 'Evidencia relación genuina' },
    { tipo: 'Evidencia', documento: 'Declaraciones de impuestos' },
    { tipo: 'Evidencia', documento: 'Prueba de ingresos patrocinador' }
  ],
  'Visa de Trabajo H-1B': [
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Evidencia', documento: 'Oferta laboral' },
    { tipo: 'Evidencia', documento: 'Título universitario/equivalencia' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'LCA aprobado' },
    { tipo: 'Evidencia', documento: 'Arraigo' },
    { tipo: 'Evidencia', documento: 'Carta empleador' }
  ],
  'Visa de Trabajo L-1': [
    { tipo: 'Formulario', documento: 'I-129 (suplemento L)' },
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Evidencia', documento: 'Plan de negocios' },
    { tipo: 'Evidencia', documento: 'Carta transferencia' },
    { tipo: 'Evidencia', documento: 'Organigrama' },
    { tipo: 'Evidencia', documento: 'Evidencia relación empresas' },
    { tipo: 'Evidencia', documento: 'Comprobante empleo extranjero' },
    { tipo: 'Evidencia', documento: 'Pasaporte' }
  ],
  'Ciudadanía': [
    { tipo: 'Formulario', documento: 'N-400' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Green Card' },
    { tipo: 'Evidencia', documento: 'Declaraciones de impuestos' },
    { tipo: 'Evidencia', documento: 'Evidencia residencia física' },
    { tipo: 'Evidencia', documento: 'Certificados penales' }
  ],
  'Reunificación Familiar': [
    { tipo: 'Formulario', documento: 'I-130' },
    { tipo: 'Formulario', documento: 'I-485' },
    { tipo: 'Formulario', documento: 'I-864' },
    { tipo: 'Formulario', documento: 'I-765' },
    { tipo: 'Formulario', documento: 'I-693' },
    { tipo: 'Evidencia', documento: 'Certificado matrimonio' },
    { tipo: 'Evidencia', documento: 'Certificado nacimiento' },
    { tipo: 'Evidencia', documento: 'Pasaporte beneficiario' },
    { tipo: 'Evidencia', documento: 'Pasaporte solicitante' },
    { tipo: 'Evidencia', documento: 'Visa' },
    { tipo: 'Evidencia', documento: 'I-94' },
    { tipo: 'Evidencia', documento: 'Evidencia relación genuina' },
    { tipo: 'Evidencia', documento: 'Declaraciones de impuestos' },
    { tipo: 'Evidencia', documento: 'Prueba de ingresos patrocinador' }
  ],
  'Visa de Estudiante F-1': [
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Evidencia', documento: 'I-20' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Prueba de fondos' },
    { tipo: 'Evidencia', documento: 'Carta aceptación escuela' },
    { tipo: 'Evidencia', documento: 'Títulos académicos' }
  ],
  'Visa de Inversionista EB-5': [
    { tipo: 'Formulario', documento: 'I-526' },
    { tipo: 'Evidencia', documento: 'Plan de negocios' },
    { tipo: 'Evidencia', documento: 'Evidencia inversión' },
    { tipo: 'Evidencia', documento: 'Fuente legal de fondos' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Certificados penales' }
  ],
  'Deportación - Defensa': [
    { tipo: 'Formulario', documento: 'EOIR-42A' },
    { tipo: 'Evidencia', documento: 'Evidencia arraigo familiar' },
    { tipo: 'Evidencia', documento: 'Evidencia arraigo comunitario' },
    { tipo: 'Evidencia', documento: 'Certificados penales' },
    { tipo: 'Evidencia', documento: 'Cartas de apoyo' },
    { tipo: 'Evidencia', documento: 'Evidencia rehabilitación' }
  ],
  'TPS (Estatus de Protección Temporal)': [
    { tipo: 'Formulario', documento: 'I-821' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Evidencia nacionalidad' },
    { tipo: 'Evidencia', documento: 'Evidencia presencia continua' },
    { tipo: 'Evidencia', documento: 'Certificados penales' }
  ],
  'DACA': [
    { tipo: 'Formulario', documento: 'I-821D' },
    { tipo: 'Evidencia', documento: 'Evidencia llegada antes 16 años' },
    { tipo: 'Evidencia', documento: 'Evidencia residencia continua' },
    { tipo: 'Evidencia', documento: 'Records académicos' },
    { tipo: 'Evidencia', documento: 'Certificados penales' }
  ]
};

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
  },
  
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
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
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }
};

// Document Checklist Component
const DocumentChecklist = ({ 
  caseData, 
  onBack, 
  showNotification 
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseData) {
      loadDocuments();
    }
  }, [caseData]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/casos/${caseData.caso_id}/documentos`);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      showNotification('error', 'Error al cargar documentos: ' + error.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = (requiredDoc) => {
    const existingDoc = documents.find(doc => 
      doc.tipo === requiredDoc.documento
    );
    
    if (!existingDoc) {
      return { status: 'pending', text: 'Pending', color: 'text-red-600', bgColor: 'bg-red-50', icon: ClockIcon };
    }
    
    if (existingDoc.fecha_recibido) {
      return { status: 'completed', text: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircleIcon };
    }
    
    return { status: 'in-review', text: 'In Review', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: ExclamationTriangleIcon };
  };

  const handleMarkAsReceived = async (documentId) => {
    try {
      await api.patch(`/api/documentos/${documentId}/recibir`);
      showNotification('success', 'Documento marcado como recibido');
      loadDocuments();
    } catch (error) {
      console.error('Error marking document as received:', error);
      showNotification('error', 'Error al marcar documento como recibido: ' + error.message);
    }
  };

  const handleAddDocument = async (requiredDoc) => {
    try {
      await api.post('/api/documentos', {
        caso_id: caseData.caso_id,
        tipo: requiredDoc.documento,
        fecha_enviado: new Date().toISOString().split('T')[0]
      });
      showNotification('success', 'Documento agregado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      showNotification('error', 'Error al agregar documento: ' + error.message);
    }
  };

  const requiredDocuments = DOCUMENT_REQUIREMENTS[caseData?.tipo_tramite] || [];
  const completedCount = requiredDocuments.filter(doc => {
    const status = getDocumentStatus(doc);
    return status.status === 'completed';
  }).length;

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay caso seleccionado</h3>
          <p className="mt-1 text-sm text-gray-500">Por favor selecciona un caso para ver sus documentos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
              </button>
              <h1 className="text-2xl font-bold text-purple-600 ml-4">
                Immigration Case Documents
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm placeholder-gray-500 w-32"
                />
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Case #{caseData.caso_id} - {caseData.cliente?.nombre} {caseData.cliente?.apellido}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 mr-1" />
                  <span>{caseData.tipo_tramite}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>Created: {new Date(caseData.fecha_creacion).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {completedCount}/{requiredDocuments.length}
              </div>
              <div className="text-sm text-gray-500">Documents Complete</div>
            </div>
          </div>
        </div>

        {/* Document Checklist Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                Document Checklist
              </h2>
              <button
                onClick={() => {
                  // Optional: Add a bulk add documents functionality
                  showNotification('info', 'Use individual "Add Document" buttons to add specific documents');
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Document
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading documents...</span>
              </div>
            ) : requiredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No document requirements</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No specific documents are required for this process type.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requiredDocuments.map((requiredDoc, index) => {
                  const status = getDocumentStatus(requiredDoc);
                  const existingDoc = documents.find(doc => doc.tipo === requiredDoc.documento);
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {requiredDoc.documento}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                          <status.icon className="w-4 h-4 mr-1" />
                          {status.text}
                        </div>

                        <div className="flex items-center space-x-2">
                          {existingDoc && !existingDoc.fecha_recibido && (
                            <button
                              onClick={() => handleMarkAsReceived(existingDoc.documento_id)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Mark Received
                            </button>
                          )}
                          
                          {!existingDoc && (
                            <button
                              onClick={() => handleAddDocument(requiredDoc)}
                              className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-md hover:bg-purple-100 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 mr-1" />
                              Add Document
                            </button>
                          )}

                          <button className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                            <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                            Upload
                          </button>

                          <button className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                            <FolderIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Cases Component
const Cases = () => {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo_tramite: '',
    estado: 'PENDIENTE'
  });
  const [formErrors, setFormErrors] = useState({});

  // Limited process types - only the 10 available ones
  const tramiteTypes = [
    'Asilo Político', 
    'Residencia Permanente', 
    'Visa de Trabajo H-1B', 
    'Visa de Trabajo L-1',
    'Ciudadanía', 
    'Reunificación Familiar',
    'Visa de Estudiante F-1',
    'Visa de Inversionista EB-5',
    'Deportación - Defensa',
    'TPS (Estatus de Protección Temporal)',
    'DACA'
  ];
  
  const estadoOptions = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [casesRes, clientsRes] = await Promise.allSettled([
        api.get('/api/casos'),
        api.get('/api/clientes')
      ]);
      
      if (casesRes.status === 'fulfilled') {
        let casesData = [];
        if (casesRes.value.data && Array.isArray(casesRes.value.data.casos)) {
          casesData = casesRes.value.data.casos;
        } else if (Array.isArray(casesRes.value.data)) {
          casesData = casesRes.value.data;
        }
        setCases(casesData);
      } else {
        console.error('Error fetching cases:', casesRes.reason);
        setCases([]);
        showNotification('error', 'Error al cargar los casos: ' + casesRes.reason.message);
      }
      
      if (clientsRes.status === 'fulfilled') {
        let clientsData = [];
        if (clientsRes.value.data && Array.isArray(clientsRes.value.data.clientes)) {
          clientsData = clientsRes.value.data.clientes;
        } else if (Array.isArray(clientsRes.value.data)) {
          clientsData = clientsRes.value.data;
        }
        setClients(clientsData);
      } else {
        console.error('Error fetching clients:', clientsRes.reason);
        setClients([]);
        showNotification('error', 'Error al cargar los clientes: ' + clientsRes.reason.message);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('error', 'Error al cargar los datos iniciales: ' + error.message);
      setCases([]);
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
    if (!formData.cliente_id) errors.cliente_id = 'El cliente es requerido';
    if (!formData.tipo_tramite.trim()) errors.tipo_tramite = 'El tipo de trámite es requerido';
    if (!formData.estado.trim()) errors.estado = 'El estado del caso es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        cliente_id: parseInt(formData.cliente_id),
        tipo_tramite: formData.tipo_tramite.trim(),
        estado: formData.estado
      };

      let response;
      if (editingCase) {
        response = await api.put(`/api/casos/${editingCase.caso_id}`, payload);
        setCases(cases.map(c => c.caso_id === editingCase.caso_id ? response.data : c));
        showNotification('success', 'Caso actualizado exitosamente');
      } else {
        response = await api.post('/api/casos', payload);
        setCases([response.data, ...cases]);
        showNotification('success', 'Caso creado exitosamente');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error submitting case:', error);
      showNotification('error', `Error al ${editingCase ? 'actualizar' : 'crear'} el caso: ${error.message}`);
    }
  };

  const handleEdit = (caseData) => {
    setEditingCase(caseData);
    setFormData({
      cliente_id: caseData.cliente_id || '',
      tipo_tramite: caseData.tipo_tramite || '',
      estado: caseData.estado || 'PENDIENTE'
    });
    setShowModal(true);
  };

  const handleDelete = async (caseId) => {
    if (window.confirm('¿Está seguro que desea eliminar este caso? Esta acción también eliminará todos los documentos asociados.')) {
      try {
        await api.delete(`/api/casos/${caseId}`);
        setCases(cases.filter(c => c.caso_id !== caseId));
        showNotification('success', 'Caso eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting case:', error);
        showNotification('error', 'Error al eliminar el caso: ' + error.message);
      }
    }
  };

  const handleViewDocuments = async (caseData) => {
    try {
      // Load full case data with client information
      const response = await api.get(`/api/casos/${caseData.caso_id}`);
      setSelectedCase(response.data);
      setShowDocuments(true);
    } catch (error) {
      console.error('Error loading case details:', error);
      showNotification('error', 'Error al cargar detalles del caso: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCase(null);
    setFormData({ cliente_id: '', tipo_tramite: '', estado: 'PENDIENTE' });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getClientName = (clienteId) => {
    const client = clients.find(c => c.cliente_id === clienteId);
    return client ? `${client.nombre} ${client.apellido}` : 'Cliente no encontrado';
  };

  const getStatusColor = (estado) => {
    const colors = {
      'COMPLETADO': 'bg-green-100 text-green-800',
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'EN_PROCESO': 'bg-blue-100 text-blue-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (estado) => {
    const statusMap = {
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En Proceso',
      'COMPLETADO': 'Completado',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[estado] || estado;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getDocumentosCount = (caseData) => {
    if (caseData.documento && Array.isArray(caseData.documento)) {
      return caseData.documento.length;
    }
    return 0;
  };

  // If showing documents, render DocumentChecklist
  if (showDocuments && selectedCase) {
    return (
      <DocumentChecklist
        caseData={selectedCase}
        onBack={() => {
          setShowDocuments(false);
          setSelectedCase(null);
        }}
        showNotification={showNotification}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
            : 'bg-red-100 border-l-4 border-red-500 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Casos</h1>
              <p className="text-gray-600 mt-1">Administra los casos de tus clientes</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Caso
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Cargando datos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Trámite</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((caseData) => (
                    <tr 
                      key={caseData.caso_id} 
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleViewDocuments(caseData)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getClientName(caseData.cliente_id)}
                            </div>
                            <div className="text-sm text-gray-500">Caso ID: {caseData.caso_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{caseData.tipo_tramite || 'No especificado'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseData.estado)}`}>
                          {getStatusText(caseData.estado || 'PENDIENTE')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{getDocumentosCount(caseData)} docs</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-xs text-gray-500">Creado:</span>
                            <span className="ml-1">{caseData.fecha_creacion ? formatDate(caseData.fecha_creacion) : 'N/A'}</span>
                          </div>
                          {caseData.fecha_aprobacion && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="text-xs text-gray-500 ml-6">Aprobado:</span>
                              <span className="ml-1">{formatDate(caseData.fecha_aprobacion)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(caseData);
                            }} 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150" 
                            title="Editar caso"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(caseData.caso_id);
                            }} 
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150" 
                            title="Eliminar caso"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cases.length === 0 && !loading && (
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
              <div>
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
                      <select 
                        name="cliente_id" 
                        value={formData.cliente_id} 
                        onChange={handleInputChange} 
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.cliente_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione un cliente</option>
                        {clients.map(client => 
                          <option key={client.cliente_id} value={client.cliente_id}>
                            {`${client.nombre} ${client.apellido}`} - {client.email}
                          </option>
                        )}
                      </select>
                      {formErrors.cliente_id && <p className="mt-1 text-sm text-red-600">{formErrors.cliente_id}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trámite *</label>
                      <select 
                        name="tipo_tramite" 
                        value={formData.tipo_tramite} 
                        onChange={handleInputChange} 
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.tipo_tramite ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione un tipo</option>
                        {tramiteTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                      {formErrors.tipo_tramite && <p className="mt-1 text-sm text-red-600">{formErrors.tipo_tramite}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Caso *</label>
                      <select 
                        name="estado" 
                        value={formData.estado} 
                        onChange={handleInputChange} 
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.estado ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {estadoOptions.map(state => 
                          <option key={state} value={state}>{getStatusText(state)}</option>
                        )}
                      </select>
                      {formErrors.estado && <p className="mt-1 text-sm text-red-600">{formErrors.estado}</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    {editingCase ? 'Actualizar' : 'Crear'} Caso
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
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