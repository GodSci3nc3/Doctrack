import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  RefreshIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon
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
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
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
  },

  upload: async (endpoint, formData) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
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

const DocumentChecklist = ({ 
  caseData, 
  onBack, 
  showNotification 
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState(new Set());
  const [editingDoc, setEditingDoc] = useState(null);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (caseData) {
      loadDocuments();
    }
  }, [caseData]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/documentos/casos/${caseData.caso_id}`);
      setDocuments(Array.isArray(response.data.documentos) ? response.data.documentos : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      showNotification('error', 'Error al cargar documentos: ' + error.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = (requiredDoc) => {
    // Defensive: ensure documents is always an array
    console.log('[CHECKLIST] getDocumentStatus documents:', documents, 'typeof:', typeof documents, 'isArray:', Array.isArray(documents));
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

  const handleCreateDocument = async () => {
    if (!selectedDocType || !newDocumentName.trim()) {
      showNotification('error', 'Por favor selecciona un tipo de documento y proporciona un nombre');
      return;
    }

    try {
      await api.post('/api/documentos', {
        caso_id: caseData.caso_id,
        tipo: selectedDocType,
        nombre_personalizado: newDocumentName.trim()
      });
      showNotification('success', 'Documento creado exitosamente');
      setShowAddModal(false);
      setSelectedDocType('');
      setNewDocumentName('');
      loadDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      showNotification('error', 'Error al crear documento: ' + error.message);
    }
  };

  const handleUpdateDocumentName = async (documentId) => {
    if (!newDocumentName.trim()) {
      showNotification('error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      await api.put(`/api/documentos/${documentId}`, {
        nombre_personalizado: newDocumentName.trim()
      });
      showNotification('success', 'Nombre actualizado exitosamente');
      setEditingDoc(null);
      setNewDocumentName('');
      loadDocuments();
    } catch (error) {
      console.error('Error updating document name:', error);
      showNotification('error', 'Error al actualizar nombre: ' + error.message);
    }
  };

  const handleDeleteDocument = async (documentId, documentName) => {
    if (!confirm(`¿Estás seguro de eliminar el documento "${documentName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/api/documentos/${documentId}`);
      showNotification('success', 'Documento eliminado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('error', 'Error al eliminar documento: ' + error.message);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      const response = await api.get(`/api/documentos/${documentId}/file`);
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      showNotification('error', 'Error al abrir documento: ' + error.message);
    }
  };

  const handleFileUpload = async (requiredDoc, file, existingDoc = null) => {
    if (!file) {
      showNotification('error', 'No se seleccionó ningún archivo.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification('error', 'El archivo es muy grande. Máximo 10MB permitido.');
      if (fileInputRefs.current[requiredDoc.documento]) fileInputRefs.current[requiredDoc.documento].value = '';
      return;
    }

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
      if (fileInputRefs.current[requiredDoc.documento]) fileInputRefs.current[requiredDoc.documento].value = '';
      return;
    }

    const docKey = requiredDoc.documento;
    setUploadingDocs(prev => new Set(prev).add(docKey));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caso_id', caseData.caso_id.toString());
      formData.append('tipo', requiredDoc.documento);
      formData.append('nombre_personalizado', existingDoc?.nombre_personalizado || requiredDoc.documento);
      formData.append('cliente_nombre', `${caseData.cliente?.nombre} ${caseData.cliente?.apellido}`.trim());

      const response = await api.upload('/api/documentos/upload', formData);
      showNotification('success', 'Documento subido exitosamente');
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification('error', 'Error al subir documento: ' + (error?.message || 'Error desconocido'));
    } finally {
      if (fileInputRefs.current[docKey]) fileInputRefs.current[docKey].value = '';
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

  const startEditing = (doc) => {
    setEditingDoc(doc.documento_id);
    setNewDocumentName(doc.nombre_personalizado || doc.tipo);
  };

  const cancelEditing = () => {
    setEditingDoc(null);
    setNewDocumentName('');
  };

  const requiredDocuments = DOCUMENT_REQUIREMENTS[caseData?.tipo_tramite] || [];
  // Defensive: ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : [];
  console.log('[CHECKLIST] safeDocuments:', safeDocuments, 'typeof:', typeof safeDocuments, 'isArray:', Array.isArray(safeDocuments));
  const completedCount = requiredDocuments.filter(doc => {
    const status = getDocumentStatus(doc);
    return status.status === 'completed';
  }).length;

  const isValidProcess = caseData?.tipo_tramite && DOCUMENT_REQUIREMENTS[caseData.tipo_tramite];
  const availableDocTypes = requiredDocuments.filter(reqDoc => 
    !safeDocuments.find(doc => doc.tipo === reqDoc.documento)
  );

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
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex items-center space-x-3">
                {availableDocTypes.length > 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Document
                  </button>
                )}
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
                  const existingDoc = safeDocuments.find(doc => doc.tipo === requiredDoc.documento);
                  const isUploading = uploadingDocs.has(requiredDoc.documento);
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          {editingDoc === existingDoc?.documento_id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Nombre del documento"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateDocumentName(existingDoc.documento_id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleUpdateDocumentName(existingDoc.documento_id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium text-gray-900">
                                {existingDoc?.nombre_personalizado || requiredDoc.documento}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {requiredDoc.tipo} {existingDoc?.nombre_personalizado !== requiredDoc.documento && `(${requiredDoc.documento})`}
                              </p>
                            </>
                          )}
                          {existingDoc && editingDoc !== existingDoc.documento_id && (
                            <div className="flex flex-col space-y-1 mt-2 text-xs text-gray-500">
                              {existingDoc.fecha_enviado && (
                                <span>
                                  <strong>Fecha de carga:</strong> {new Date(existingDoc.fecha_enviado).toLocaleString()}
                                </span>
                              )}
                              {existingDoc.tipo_archivo && (
                                <span>
                                  <strong>Tipo:</strong> {existingDoc.tipo_archivo}
                                </span>
                              )}
                              {existingDoc.tamaño_bytes && (
                                <span>
                                  <strong>Tamaño:</strong> {(existingDoc.tamaño_bytes / 1024).toFixed(2)} KB
                                </span>
                              )}
                              {existingDoc.url_documento && (
                                <a
                                  href={existingDoc.url_documento}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                >
                                  <EyeIcon className="w-4 h-4 mr-1" />
                                  Ver documento
                                </a>
                              )}
                              {existingDoc.fecha_recibido && (
                                <span>Received: {new Date(existingDoc.fecha_recibido).toLocaleDateString()}</span>
                              )}
                              {existingDoc.nombre_archivo_original && (
                                <span>File: {existingDoc.nombre_archivo_original}</span>
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
                          {/* Edit Name Button */}
                          {existingDoc && editingDoc !== existingDoc.documento_id && (
                            <button
                              onClick={() => startEditing(existingDoc)}
                              className="inline-flex items-center px-2 py-1 text-gray-600 hover:text-purple-600 transition-colors"
                              title="Edit name"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Document Button */}
                          {existingDoc && existingDoc.ruta_storage && (
                            <button
                              onClick={() => handleViewDocument(existingDoc.documento_id)}
                              className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="View document"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mark as Received Button */}
                          {existingDoc && !existingDoc.fecha_recibido && (
                            <button
                              onClick={() => handleMarkAsReceived(existingDoc.documento_id)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Mark Received
                            </button>
                          )}

                          {/* Upload Button */}
                          <div className="relative">
                            <input
                              type="file"
                              ref={el => fileInputRefs.current[requiredDoc.documento] = el}
                              onChange={(e) => handleFileUpload(requiredDoc, e.target.files[0], existingDoc)}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              className="hidden"
                            />
                            <button
                              onClick={() => triggerFileInput(requiredDoc.documento)}
                              disabled={isUploading}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                              title={existingDoc?.ruta_storage ? "Replace file" : "Upload file"}
                            >
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-1"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                                  {existingDoc?.ruta_storage ? 'Replace' : 'Upload'}
                                </>
                              )}
                            </button>
                          </div>

                          {/* Delete Document Button */}
                          {existingDoc && (
                            <button
                              onClick={() => handleDeleteDocument(existingDoc.documento_id, existingDoc.nombre_personalizado || existingDoc.tipo)}
                              className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete document"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
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
                {safeDocuments.filter(doc => doc.fecha_enviado && !doc.fecha_recibido).length}
              </div>
              <div className="text-sm text-gray-500">In Review</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {requiredDocuments.length - safeDocuments.length}
              </div>
              <div className="text-sm text-gray-500">Missing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Document</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select document type...</option>
                  {availableDocTypes.map((docType, index) => (
                    <option key={index} value={docType.documento}>
                      {docType.documento} ({docType.tipo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Name
                </label>
                <input
                  type="text"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  placeholder="Enter custom name for this document"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!selectedDocType || !newDocumentName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;