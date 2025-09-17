import React, { useState, useEffect, useRef } from 'react';
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

// Document requirements by process type - UPDATED WITH CORRECT PROCESSES
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
  },
    upload: async (endpoint, formData) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData // No establecer Content-Type para FormData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error(`UPLOAD ${endpoint} failed:`, error);
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
  const handleDeleteDocument = async (documentoId) => {
    if (window.confirm('¿Seguro que deseas eliminar este documento?')) {
      try {
        await api.delete(`/api/documentos/${documentoId}`);
        showNotification('success', 'Documento eliminado');
        loadDocuments();
      } catch (error) {
        showNotification('error', 'Error al eliminar documento: ' + error.message);
      }
    }
  };
  const [showCustomDocModal, setShowCustomDocModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [newDoc, setNewDoc] = useState({ nombre: '', tipo: '', archivo: null });
  const [loading, setLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState(new Set());
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (caseData) {
      loadDocuments();
      // Si el trámite no está en la lista, inicia vacía
      if (!DOCUMENT_REQUIREMENTS[caseData.tipo_tramite]) {
        setDocuments([]);
      }
    }
  }, [caseData]);

  // Añadir documento manual
  const handleAddManualDocument = async () => {
    if (!newDoc.nombre.trim() || !newDoc.tipo.trim()) {
      showNotification('error', 'Completa todos los campos obligatorios');
      return;
    }
    try {
      await api.post('/api/documentos', {
        caso_id: caseData.caso_id,
        tipo: newDoc.tipo,
        nombre_personalizado: newDoc.nombre
      });
      showNotification('success', 'Documento manual agregado');
      setNewDoc({ nombre: '', tipo: '', archivo: null });
      setShowCustomDocModal(false);
      loadDocuments();
    } catch (error) {
      showNotification('error', 'Error al agregar documento: ' + error.message);
    }
  };

  // Render para añadir documento manual (scope principal)
  function renderManualDocumentForm() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-200">
          <h4 className="font-semibold mb-4 text-gray-800">Añadir documento personalizado</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={newDoc.nombre} onChange={e => setNewDoc(d => ({ ...d, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={newDoc.tipo} onChange={e => setNewDoc(d => ({ ...d, tipo: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={() => setShowCustomDocModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancelar</button>
            <button onClick={handleAddManualDocument} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Agregar</button>
          </div>
        </div>
      </div>
    );
  }

  const loadDocuments = async () => {
    try {
      setLoading(true);
  const response = await api.get(`/api/casos/${caseData.caso_id}/documentos`);
  // Defensive: always assign an array
  const docs = Array.isArray(response.data.documentos) ? response.data.documentos : (Array.isArray(response.data) ? response.data : []);
  setDocuments(docs);
  console.log('[CASES] setDocuments:', docs, 'typeof:', typeof docs, 'isArray:', Array.isArray(docs));
    } catch (error) {
      console.error('Error loading documents:', error);
      showNotification('error', 'Error al cargar documentos: ' + error.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = (requiredDoc) => {
    // Defensive log
    console.log('[CASES] getDocumentStatus documents:', documents, 'typeof:', typeof documents, 'isArray:', Array.isArray(documents));
    const safeDocs = Array.isArray(documents) ? documents : [];
    const existingDoc = safeDocs.find(doc => 
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
        fecha_enviado: null
      });
      showNotification('success', 'Documento agregado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      showNotification('error', 'Error al agregar documento: ' + error.message);
    }
  };

  // NEW: File upload functionality
  const handleFileUpload = async (requiredDoc, file) => {
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification('error', 'El archivo es muy grande. Máximo 10MB permitido.');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Tipo de archivo no permitido. Use PDF, JPG, PNG o DOC.');
      return;
    }

    const docKey = requiredDoc.documento;
    setUploadingDocs(prev => new Set(prev).add(docKey));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caso_id', caseData.caso_id.toString());
      formData.append('tipo', requiredDoc.documento);
      formData.append('cliente_nombre', `${caseData.cliente?.nombre} ${caseData.cliente?.apellido}`.trim());

      // NEW: Upload API call
      const response = await api.upload('/api/documentos/upload', formData);
      
      showNotification('success', 'Documento subido exitosamente');
      loadDocuments();
      
      // Reset file input
      if (fileInputRefs.current[docKey]) {
        fileInputRefs.current[docKey].value = '';
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification('error', 'Error al subir documento: ' + error.message);
    } finally {
      setUploadingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docKey);
        return newSet;
      });
    }
  };

  const triggerFileInput = (docKey) => {
    if (fileInputRefs.current[docKey]) {
      fileInputRefs.current[docKey].click();
    }
  };

  // Function to initialize all required documents for the case
  const handleInitializeDocuments = async () => {
    try {
      const requiredDocuments = DOCUMENT_REQUIREMENTS[caseData?.tipo_tramite] || [];
      const existingTypes = new Set(documents.map(doc => doc.tipo));
      
      const documentsToCreate = requiredDocuments.filter(doc => !existingTypes.has(doc.documento));
      
      for (const requiredDoc of documentsToCreate) {
        await api.post('/api/documentos', {
          caso_id: caseData.caso_id,
          tipo: requiredDoc.documento,
          fecha_enviado: null,
          fecha_recibido: null
        });
      }
      
      showNotification('success', `${documentsToCreate.length} documentos inicializados`);
      loadDocuments();
    } catch (error) {
      console.error('Error initializing documents:', error);
      showNotification('error', 'Error al inicializar documentos: ' + error.message);
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
      {showCustomDocModal && renderManualDocumentForm()}
      {/* El checklist será el único lugar donde se muestran todos los documentos, incluidos los personalizados */}
      {(!documents || documents.length === 0) && (
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos en este caso</h3>
          <p className="mt-1 text-sm text-gray-500">Agrega documentos usando el botón en el checklist.</p>
        </div>
      )}
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
              <h1 className="text-2xl font-bold text-purple-600 ml-4">
                Immigration Case Documents
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                Document Checklist
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCustomDocModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Añadir documento personalizado
                </button>
                {documents.length === 0 && requiredDocuments.length > 0 && (
                  <button
                    onClick={handleInitializeDocuments}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Inicializar documentos requeridos
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div 
                    key={doc.documento_id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {doc.nombre_personalizado || doc.tipo}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {doc.tipo}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          {doc.fecha_enviado && (
                            <span>Enviado: {new Date(doc.fecha_enviado).toLocaleDateString()}</span>
                          )}
                          {doc.fecha_recibido && (
                            <span>Recibido: {new Date(doc.fecha_recibido).toLocaleDateString()}</span>
                          )}
                          {doc.url_documento && (
                            <a 
                              href={doc.url_documento} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Ver documento
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doc.fecha_recibido ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {doc.fecha_recibido ? <CheckCircleIcon className="w-4 h-4 mr-1" /> : <ClockIcon className="w-4 h-4 mr-1" />}
                        {doc.fecha_recibido ? 'Completado' : 'Pendiente'}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!doc.fecha_recibido && (
                          <button
                            onClick={() => handleMarkAsReceived(doc.documento_id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Marcar recibido
                          </button>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            ref={el => fileInputRefs.current[doc.documento_id] = el}
                            onChange={(e) => handleFileUpload(doc, e.target.files[0])}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                          />
                          <button
                            onClick={() => triggerFileInput(doc.documento_id)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                            Subir archivo
                          </button>
                        </div>
                        {/* Botón eliminar documento */}
                        <button
                          onClick={() => handleDeleteDocument(doc.documento_id)}
                          className="inline-flex items-center px-2 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 transition-colors"
                          title="Eliminar documento"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

  // UPDATED: Only the 10 correct process types from your document
  const tramiteTypes = [
    'Asilo Afirmativo',
    'Asilo Defensivo', 
    'Cambio de Estatus (COS)',
    'E-1 Comerciante',
    'E-2 Inversionista',
    'EB-2 NIW',
    'H1B1 Consular',
    'H1B1 Extensión',
    'L-1 Transferencia',
    'Peticiones Familiares'
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
        if (Array.isArray(clientsRes.value.data)) {
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