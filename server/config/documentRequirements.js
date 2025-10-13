// Updated document requirements mapping - ONLY the 10 approved processes
export const DOCUMENT_REQUIREMENTS = {
  'Asilo Afirmativo': [
    { tipo: 'Formulario', documento: 'I-589', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia persecución', requerido: true },
    { tipo: 'Evidencia', documento: 'Documentos entrada a EE.UU.', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas de apoyo', requerido: false },
    { tipo: 'Evidencia', documento: 'Informes de país', requerido: false }
  ],
  'Asilo Defensivo': [
    { tipo: 'Formulario', documento: 'I-589', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia persecución', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Informes de país', requerido: false },
    { tipo: 'Evidencia', documento: 'Cartas de testigos', requerido: false }
  ],
  'Cambio de Estatus (COS)': [
    { tipo: 'Formulario', documento: 'I-539', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Visa actual', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta de motivos personales', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de fondos', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta aceptación escuela', requerido: true }
  ],
  'E-1 Comerciante': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado', requerido: true },
    { tipo: 'Evidencia', documento: 'Documentación comercio', requerido: true },
    { tipo: 'Evidencia', documento: 'Contratos/facturas/shipping docs', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia operaciones regulares', requerido: true }
  ],
  'E-2 Inversionista': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia inversión', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan de negocios', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba negocio activo', requerido: true }
  ],
  'EB-2 NIW': [
    { tipo: 'Formulario', documento: 'I-140', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración Personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Títulos académicos', requerido: true },
    { tipo: 'Evidencia', documento: 'Equivalencia Títulos', requerido: true },
    { tipo: 'Evidencia', documento: 'Experiencia laboral', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas recomendación', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas de interés', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan impacto nacional', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Pruebas estatus legal', requerido: true }
  ],
  'H1B1 Consular': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Evidencia', documento: 'Oferta laboral', requerido: true },
    { tipo: 'Evidencia', documento: 'Título universitario/equivalencia', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA aprobado', requerido: true },
    { tipo: 'Evidencia', documento: 'Arraigo', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta empleador', requerido: true }
  ],
  'H1B1 Extensión': [
    { tipo: 'Formulario', documento: 'I-129', requerido: true },
    { tipo: 'Formulario', documento: 'I-539', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta de empleo vigente', requerido: true },
    { tipo: 'Evidencia', documento: 'Contratos/nóminas', requerido: true },
    { tipo: 'Evidencia', documento: 'Título universitario', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA vigente', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA aprobado', requerido: true }
  ],
  'L-1 Transferencia': [
    { tipo: 'Formulario', documento: 'I-129 (suplemento L)', requerido: true },
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan de negocios', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta transferencia', requerido: true },
    { tipo: 'Evidencia', documento: 'Organigrama', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia relación empresas', requerido: true },
    { tipo: 'Evidencia', documento: 'Comprobante empleo extranjero', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true }
  ],
  'Peticiones Familiares': [
    { tipo: 'Formulario', documento: 'I-130', requerido: true },
    { tipo: 'Formulario', documento: 'I-485', requerido: true },
    { tipo: 'Formulario', documento: 'I-864', requerido: true },
    { tipo: 'Formulario', documento: 'I-765', requerido: true },
    { tipo: 'Formulario', documento: 'I-693', requerido: true },
    { tipo: 'Evidencia', documento: 'Certificado matrimonio', requerido: true },
    { tipo: 'Evidencia', documento: 'Certificado nacimiento', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte beneficiario', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte solicitante', requerido: true },
    { tipo: 'Evidencia', documento: 'Visa', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia relación genuina', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaraciones de impuestos', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de ingresos patrocinador', requerido: true }
  ]
};