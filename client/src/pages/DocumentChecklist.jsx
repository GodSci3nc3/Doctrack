import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  RefreshIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Updated document requirements - ONLY the 10 approved processes
const DOCUMENT_REQUIREMENTS = {
  'Asilo Afirmativo': [
    { tipo: 'Formulario', documento: 'I-589' },
    { tipo: 'Evidencia', documento: 'Declaración personal' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Evidencia persecución' },
    { tipo: 'Evidencia', documento: 'Documentos entrada a EE.UU.' },
    { tipo: 'Evidencia', documento: 'Cartas de apoyo' },
    { tipo: 'Evidencia', documento: 'Informes de país' }
  ],
  'Asilo Defensivo': [
    { tipo: 'Formulario', documento: 'I-589' },
    { tipo: 'Evidencia', documento: 'Declaración personal' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Evidencia persecución' },
    { tipo: 'Evidencia', documento: 'I-94' },
    { tipo: 'Evidencia', documento: 'Informes de país' },
    { tipo: 'Evidencia', documento: 'Cartas de testigos' }
  ],
  'Cambio de Estatus (COS)': [
    { tipo: 'Formulario', documento: 'I-539' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Visa actual' },
    { tipo: 'Evidencia', documento: 'I-94' },
    { tipo: 'Evidencia', documento: 'Carta de motivos personales' },
    { tipo: 'Evidencia', documento: 'Prueba de fondos' },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal' },
    { tipo: 'Evidencia', documento: 'Carta aceptación escuela' }
  ],
  'E-1 Comerciante': [
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado' },
    { tipo: 'Evidencia', documento: 'Documentación comercio' },
    { tipo: 'Evidencia', documento: 'Contratos/facturas/shipping docs' },
    { tipo: 'Evidencia', documento: 'Evidencia operaciones regulares' }
  ],
  'E-2 Inversionista': [
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado' },
    { tipo: 'Evidencia', documento: 'Evidencia inversión' },
    { tipo: 'Evidencia', documento: 'Plan de negocios' },
    { tipo: 'Evidencia', documento: 'Prueba negocio activo' }
  ],
  'EB-2 NIW': [
    { tipo: 'Formulario', documento: 'I-140' },
    { tipo: 'Evidencia', documento: 'Declaración Personal' },
    { tipo: 'Evidencia', documento: 'Títulos académicos' },
    { tipo: 'Evidencia', documento: 'Equivalencia Títulos' },
    { tipo: 'Evidencia', documento: 'Experiencia laboral' },
    { tipo: 'Evidencia', documento: 'Cartas recomendación' },
    { tipo: 'Evidencia', documento: 'Cartas de interés' },
    { tipo: 'Evidencia', documento: 'Plan impacto nacional' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Pruebas estatus legal' }
  ],
  'H1B1 Consular': [
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Evidencia', documento: 'Oferta laboral' },
    { tipo: 'Evidencia', documento: 'Título universitario/equivalencia' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'LCA aprobado' },
    { tipo: 'Evidencia', documento: 'Arraigo' },
    { tipo: 'Evidencia', documento: 'Carta empleador' }
  ],
  'H1B1 Extensión': [
    { tipo: 'Formulario', documento: 'I-129' },
    { tipo: 'Formulario', documento: 'I-539' },
    { tipo: 'Evidencia', documento: 'Carta de empleo vigente' },
    { tipo: 'Evidencia', documento: 'Contratos/nóminas' },
    { tipo: 'Evidencia', documento: 'Título universitario' },
    { tipo: 'Evidencia', documento: 'Pasaporte' },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal' },
    { tipo: 'Evidencia', documento: 'LCA vigente' },
    { tipo: 'Evidencia', documento: 'LCA aprobado' }
  ],
  'L-1 Transferencia': [
    { tipo: 'Formulario', documento: 'I-129 (suplemento L)' },
    { tipo: 'Formulario', documento: 'DS-160' },
    { tipo: 'Evidencia', documento: 'Plan de negocios' },
    { tipo: 'Evidencia', documento: 'Carta transferencia' },
    { tipo: 'Evidencia', documento: 'Organigrama' },
    { tipo: 'Evidencia', documento: 'Evidencia relación empresas' },
    { tipo: 'Evidencia', documento: 'Comprobante empleo extranjero' },
    { tipo: 'Evidencia', documento: 'Pasaporte' }
  ],
  'Peticiones Familiares': [
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
  
  patch: async (endpoint, data = {}) => {
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

const DocumentChecklist = ({ 
  caseData, 
  onBack, 
  showNotification 
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInitializeModal, setShowInitializeModal] = useState(false);
  const [initializing, setInitializing] = useState(false);

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
        fecha_enviado: null // Don't auto-mark as sent
      });
      showNotification('success', 'Documento agregado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      showNotification('error', 'Error al agregar documento: ' + error.message);
    }
  };

  // Function to initialize all required documents for the case
  const handleInitializeDocuments = async () => {
    try {
      setInitializing(true);
      const response = await api.post(`/api/casos/${caseData.caso_id}/documentos/desde-plantilla`);
      showNotification('success', response.data.message);
      setShowInitializeModal(false);
      loadDocuments();
    } catch (error) {
      console.error('Error initializing documents:', error);
      showNotification('error', 'Error al inicializar documentos: ' + error.message);
    } finally {
      setInitializing(false);
    }
  };

  const requiredDocuments = DOCUMENT_REQUIREMENTS[caseData?.tipo_tramite] || [];
  const completedCount = requiredDocuments.filter(doc => {
    const status = getDocumentStatus(doc);
    return status.status === 'completed';
  }).length;

  // Check if process is valid
  const isValidProcess = caseData?.tipo_tramite && DOCUMENT_REQUIREMENTS[caseData.tipo_tramite];

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

  if (!isValidProcess) {
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
                  Back to Cases
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-red-900">Proceso No Válido</h3>
              <p className="mt-1 text-sm text-red-600 max-w-md mx-auto">
                El caso "{caseData.tipo_tramite}" no corresponde a ninguno de los procesos válidos del sistema.
              </p>
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Procesos Válidos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700">
                  {Object.keys(DOCUMENT_REQUIREMENTS).map(proceso => (
                    <div key={proceso} className="text-left">• {proceso}</div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Contacta al administrador para actualizar este caso a un proceso válido.
              </p>
            </div>
          </div>
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
                Back to Cases
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  className="bg-transparent border-none outline-none text-sm placeholder-gray-500 w-40"
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
        {/* Title */}
        <h1 className="text-3xl font-bold text-purple-600 mb-8">
          Immigration Case Documents
        </h1>

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
                  <span className="font-medium">{caseData.tipo_tramite}</span>
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${requiredDocuments.length > 0 ? (completedCount / requiredDocuments.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Checklist Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                Document Checklist - {caseData.tipo_tramite}
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={loadDocuments}
                  className="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>

              </div>
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
              <div className="space-y-4">
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
                          <p className="text-sm text-gray-500">
                            {requiredDoc.tipo}
                          </p>
                          {existingDoc && (
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              {existingDoc.fecha_enviado && (
                                <span>Sent: {new Date(existingDoc.fecha_enviado).toLocaleDateString()}</span>
                              )}
                              {existingDoc.fecha_recibido && (
                                <span>Received: {new Date(existingDoc.fecha_recibido).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
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

        {/* Statistics Card */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Document Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{requiredDocuments.length}</div>
              <div className="text-sm text-gray-500">Total Required</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {documents.filter(doc => doc.fecha_enviado && !doc.fecha_recibido).length}
              </div>
              <div className="text-sm text-gray-500">In Review</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {requiredDocuments.length - documents.length}
              </div>
              <div className="text-sm text-gray-500">Missing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Initialize Documents Modal */}
      {showInitializeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Initialize Documents
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowInitializeModal(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This will create all required documents for the process: <strong>{caseData.tipo_tramite}</strong>
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Documents to be created ({requiredDocuments.length}):
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="text-sm text-blue-700 space-y-1">
                        {requiredDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {doc.documento} ({doc.tipo})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Documents will be created in "pending" status. You can mark them as sent/received individually.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleInitializeDocuments}
                  disabled={initializing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200 disabled:opacity-50"
                >
                  {initializing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Initialize {requiredDocuments.length} Documents
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowInitializeModal(false)} 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;