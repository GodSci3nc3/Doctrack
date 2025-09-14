import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database.js';
import { DOCUMENT_REQUIREMENTS } from '../config/documentRequirements.js';
import { uploadToGoogleDrive, generateFileName } from '../services/uploadService.js';
import { verifyCaseOwnership } from './caseController.js';

// Helper function to verify document ownership
async function verifyDocumentOwnership(documentoId, userId) {
  try {
    console.log(`Verifying document ownership: Document ${documentoId} for User ${userId}`);
    
    const documento = await prisma.documento.findFirst({
      where: {
        documento_id: documentoId,
        caso: {
          cliente: {
            created_by: userId
          }
        }
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                cliente_id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Document ownership result:`, documento ? 'ALLOWED' : 'DENIED');
    return documento;
  } catch (err) {
    console.error('Error verifying document ownership:', err);
    return null;
  }
}

export const createDocument = async (req, res) => {
  try {
    const { caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital, url_documento } = req.body;
    const userId = req.user.sub;
    
    if (!caso_id || !tipo) {
      return res.status(400).json({
        message: 'Los campos caso_id y tipo son requeridos'
      });
    }
    
    const caso = await verifyCaseOwnership(parseInt(caso_id), userId);
    if (!caso) {
      return res.status(404).json({
        message: 'El caso especificado no existe o no tienes permisos para crear documentos en él'
      });
    }
    
    const requiredDocs = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    const validDocTypes = requiredDocs.map(doc => doc.documento);
    
    if (!validDocTypes.includes(tipo)) {
      return res.status(400).json({
        message: `El documento "${tipo}" no es válido para el proceso "${caso.tipo_tramite}". Documentos válidos: ${validDocTypes.join(', ')}`
      });
    }
    
    const existingDoc = await prisma.documento.findFirst({
      where: {
        caso_id: parseInt(caso_id),
        tipo: tipo
      }
    });
    
    if (existingDoc) {
      return res.status(400).json({
        message: 'Ya existe un documento de este tipo para este caso'
      });
    }
    
    const newDocument = await prisma.documento.create({
      data: {
        caso_id: parseInt(caso_id),
        tipo: tipo,
        fecha_enviado: fecha_enviado ? new Date(fecha_enviado) : null,
        fecha_recibido: fecha_recibido ? new Date(fecha_recibido) : null,
        firma_digital: firma_digital || false,
        url_documento: url_documento || null
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`User ${userId} created document ${newDocument.documento_id} (${tipo}) for case ${caso_id}`);
    return res.status(201).json(newDocument);
    
  } catch (err) {
    console.error('Error creating document:', err);
    return res.status(500).json({
      message: 'Error al crear el documento',
      error: err.message
    });
  }
};

export const markDocumentReceived = async (req, res) => {
  try {
    const documentoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(documentoId)) {
      return res.status(400).json({ message: 'ID de documento inválido' });
    }
    
    const existingDocument = await verifyDocumentOwnership(documentoId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        message: 'Documento no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    if (existingDocument.fecha_recibido) {
      return res.status(400).json({
        message: 'Este documento ya fue marcado como recibido'
      });
    }
    
    const updatedDocument = await prisma.documento.update({
      where: { documento_id: documentoId },
      data: { 
        fecha_recibido: new Date(),
        fecha_enviado: existingDocument.fecha_enviado || new Date(),
        updated_at: new Date()
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`User ${userId} marked document ${documentoId} (${existingDocument.tipo}) as received`);
    return res.json(updatedDocument);
    
  } catch (err) {
    console.error('Error marking document as received:', err);
    return res.status(500).json({
      message: 'Error al marcar documento como recibido',
      error: err.message
    });
  }
};

export const getRequiredDocuments = async (req, res) => {
  try {
    const tipoTramite = decodeURIComponent(req.params.tipo);
    
    const documentosRequeridos = DOCUMENT_REQUIREMENTS[tipoTramite] || [];
    
    if (documentosRequeridos.length === 0) {
      return res.status(404).json({
        message: `No se encontraron documentos requeridos para el tipo de trámite: ${tipoTramite}`,
        tiposDisponibles: Object.keys(DOCUMENT_REQUIREMENTS)
      });
    }
    
    return res.json({
      tipoTramite,
      documentos: documentosRequeridos,
      total: documentosRequeridos.length,
      requeridos: documentosRequeridos.filter(doc => doc.requerido).length,
      opcionales: documentosRequeridos.filter(doc => !doc.requerido).length
    });
    
  } catch (err) {
    console.error('Error getting required documents:', err);
    return res.status(500).json({ message: 'Error obteniendo documentos requeridos' });
  }
};

export const createDocumentsFromTemplate = async (req, res) => {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para crear documentos en él'
      });
    }

    const requiredDocuments = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    
    if (requiredDocuments.length === 0) {
      return res.status(400).json({
        message: `No hay documentos definidos para el proceso: ${caso.tipo_tramite}`
      });
    }
  } catch (err) {
    console.error('Error creating documents from template:', err);
    return res.status(500).json({
      message: 'Error al crear documentos desde plantilla',
      error: err.message
    });
  }

  
}


export const getDocumentStats = async (req, res) => {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // Verificar ownership del caso
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para ver sus documentos'
      });
    }

    // Obtener estadísticas de documentos del caso
    const documentos = await prisma.documento.findMany({
      where: { caso_id: casoId },
      select: {
        documento_id: true,
        tipo: true,
        fecha_enviado: true,
        fecha_recibido: true,
        firma_digital: true,
        url_documento: true
      }
    });

    // Obtener documentos requeridos para este tipo de proceso
    const requiredDocuments = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    
    const stats = {
      caso_id: casoId,
      tipo_tramite: caso.tipo_tramite,
      total_requeridos: requiredDocuments.length,
      total_creados: documentos.length,
      enviados: documentos.filter(doc => doc.fecha_enviado).length,
      recibidos: documentos.filter(doc => doc.fecha_recibido).length,
      pendientes: requiredDocuments.length - documentos.length,
      con_firma_digital: documentos.filter(doc => doc.firma_digital).length,
      con_archivo: documentos.filter(doc => doc.url_documento).length,
      documentos_faltantes: requiredDocuments
        .filter(reqDoc => !documentos.find(doc => doc.tipo === reqDoc.documento))
        .map(doc => doc.documento)
    };

    console.log(`User ${userId} retrieved document stats for case ${casoId}`);
    return res.json(stats);
    
  } catch (err) {
    console.error('Error getting document stats:', err);
    return res.status(500).json({
      message: 'Error al obtener estadísticas de documentos',
      error: err.message
    });
  }
};

export const getCaseDocuments = async (req, res) => {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // Verificar ownership del caso
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para ver sus documentos'
      });
    }

    // Obtener documentos del caso
    const documentos = await prisma.documento.findMany({
      where: { caso_id: casoId },
      include: {
        caso: {
          select: {
            tipo_tramite: true,
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Obtener documentos requeridos para comparación
    const requiredDocuments = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];

    const response = {
      caso_id: casoId,
      tipo_tramite: caso.tipo_tramite,
      cliente: `${caso.cliente.nombre} ${caso.cliente.apellido}`,
      documentos: documentos,
      documentos_requeridos: requiredDocuments,
      resumen: {
        total_documentos: documentos.length,
        documentos_enviados: documentos.filter(doc => doc.fecha_enviado).length,
        documentos_recibidos: documentos.filter(doc => doc.fecha_recibido).length,
        documentos_pendientes: requiredDocuments.length - documentos.length
      }
    };

    console.log(`User ${userId} retrieved ${documentos.length} documents for case ${casoId}`);
    return res.json(response);
    
  } catch (err) {
    console.error('Error getting case documents:', err);
    return res.status(500).json({
      message: 'Error al obtener documentos del caso',
      error: err.message
    });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { caso_id, tipo, descripcion } = req.body;
    const userId = req.user.sub;
    
    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    if (!caso_id || !tipo) {
      return res.status(400).json({
        message: 'Los campos caso_id y tipo son requeridos'
      });
    }

    // Verificar ownership del caso
    const caso = await verifyCaseOwnership(parseInt(caso_id), userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para subir documentos'
      });
    }

    // Verificar si ya existe un documento de este tipo
    const existingDoc = await prisma.documento.findFirst({
      where: {
        caso_id: parseInt(caso_id),
        tipo: tipo
      }
    });

    if (existingDoc) {
      return res.status(400).json({
        message: 'Ya existe un documento de este tipo para este caso'
      });
    }

    // Generar nombre único para el archivo
    const fileName = generateFileName(req.file.originalname, tipo, caso.cliente.nombre, caso.cliente.apellido);
    
    // Subir archivo a Google Drive (o tu servicio de storage)
    let fileUrl = null;
    try {
      fileUrl = await uploadToGoogleDrive(req.file.buffer, fileName, req.file.mimetype);
    } catch (uploadError) {
      console.error('Error uploading to Google Drive:', uploadError);
      return res.status(500).json({
        message: 'Error al subir el archivo al almacenamiento',
        error: uploadError.message
      });
    }

    // Crear registro en la base de datos
    const newDocument = await prisma.documento.create({
      data: {
        caso_id: parseInt(caso_id),
        tipo: tipo,
        fecha_enviado: new Date(),
        fecha_recibido: null,
        firma_digital: false,
        url_documento: fileUrl,
        descripcion: descripcion || null
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });

    console.log(`User ${userId} uploaded document ${newDocument.documento_id} (${tipo}) for case ${caso_id}`);
    
    return res.status(201).json({
      message: 'Documento subido exitosamente',
      documento: newDocument,
      archivo_url: fileUrl
    });
    
  } catch (err) {
    console.error('Error uploading document:', err);
    return res.status(500).json({
      message: 'Error al subir el documento',
      error: err.message
    });
  }
};