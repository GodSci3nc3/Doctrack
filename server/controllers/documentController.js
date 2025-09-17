import { prisma } from '../config/database.js';
import { DOCUMENT_REQUIREMENTS } from '../config/documentRequirements.js';
import { supabaseStorage } from '../services/supabaseStorage.js';
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
    const { caso_id, tipo, nombre_personalizado } = req.body;
    const userId = req.user.sub;
    if (!caso_id || !tipo || !nombre_personalizado) {
      return res.status(400).json({
        message: 'Los campos caso_id, tipo y nombre_personalizado son requeridos'
      });
    }
    const caso = await verifyCaseOwnership(parseInt(caso_id), userId);
    if (!caso) {
      return res.status(404).json({
        message: 'El caso especificado no existe o no tienes permisos para crear documentos en él'
      });
    }
    // Permitir cualquier tipo y nombre, y duplicados
    const newDocument = await prisma.documento.create({
      data: {
        caso_id: parseInt(caso_id),
        tipo: tipo,
        nombre_personalizado: nombre_personalizado,
        fecha_enviado: null,
        fecha_recibido: null,
        firma_digital: false,
        url_documento: null
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

export const updateDocument = async (req, res) => {
  try {
    const documentoId = parseInt(req.params.id);
    const { nombre_personalizado } = req.body;
    const userId = req.user.sub;
    
    if (isNaN(documentoId)) {
      return res.status(400).json({ message: 'ID de documento inválido' });
    }

    if (!nombre_personalizado || nombre_personalizado.trim() === '') {
      return res.status(400).json({ message: 'El nombre personalizado es requerido' });
    }
    
    const existingDocument = await verifyDocumentOwnership(documentoId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        message: 'Documento no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    const updatedDocument = await prisma.documento.update({
      where: { documento_id: documentoId },
      data: { 
        nombre_personalizado: nombre_personalizado.trim(),
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
    
    console.log(`User ${userId} updated document ${documentoId} name to "${nombre_personalizado}"`);
    return res.json(updatedDocument);
    
  } catch (err) {
    console.error('Error updating document:', err);
    return res.status(500).json({
      message: 'Error al actualizar el documento',
      error: err.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const documentoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(documentoId)) {
      return res.status(400).json({ message: 'ID de documento inválido' });
    }
    
    const existingDocument = await verifyDocumentOwnership(documentoId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        message: 'Documento no encontrado o no tienes permisos para eliminarlo'
      });
    }
    
    // Eliminar archivo de Supabase si existe
    if (existingDocument.ruta_storage) {
      try {
        await supabaseStorage.deleteFile(existingDocument.ruta_storage);
        console.log(`File deleted from Supabase: ${existingDocument.ruta_storage}`);
      } catch (storageError) {
        console.error('Error deleting from Supabase (continuing anyway):', storageError);
        // No falla la operación si no se puede eliminar el archivo
      }
    }
    
    // Eliminar registro de la base de datos
    await prisma.documento.delete({
      where: { documento_id: documentoId }
    });
    
    console.log(`User ${userId} deleted document ${documentoId} (${existingDocument.tipo})`);
    return res.json({
      message: 'Documento eliminado exitosamente',
      documento_eliminado: {
        documento_id: documentoId,
        tipo: existingDocument.tipo,
        nombre_personalizado: existingDocument.nombre_personalizado
      }
    });
    
  } catch (err) {
    console.error('Error deleting document:', err);
    return res.status(500).json({
      message: 'Error al eliminar el documento',
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

export const uploadDocument = async (req, res) => {
  // Log para depuración del archivo recibido
  console.log('DEBUG req.file:', req.file);
  try {
    const { caso_id, tipo, nombre_personalizado, cliente_nombre } = req.body;
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

    // Generar nombre único para el archivo en Supabase
    const fileName = supabaseStorage.generateFileName(
      req.file.originalname,
      tipo,
      caso.cliente.nombre,
      caso.cliente.apellido,
      caso_id
    );
    
    // Subir archivo a Supabase Storage
    let storagePath = null;
    try {
      storagePath = await supabaseStorage.uploadFile(
        req.file.buffer, 
        fileName, 
        req.file.mimetype,
        {
          caso_id: caso_id,
          tipo: tipo,
          uploaded_by: userId,
          cliente: `${caso.cliente.nombre} ${caso.cliente.apellido}`
        }
      );
    } catch (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      return res.status(500).json({
        message: 'Error al subir el archivo al almacenamiento',
        error: uploadError.message
      });
    }

    // Obtener URL firmada para acceso inmediato
    const signedUrl = await supabaseStorage.getSignedUrl(storagePath, 86400); // 24 horas

    // Buscar el metadato (slot) del documento
    let documento = await prisma.documento.findFirst({
      where: {
        caso_id: parseInt(caso_id),
        tipo: tipo
      }
    });

    if (documento) {
      // Si ya existe el metadato, elimina el archivo anterior si existe
      if (documento.ruta_storage) {
        try {
          await supabaseStorage.deleteFile(documento.ruta_storage);
        } catch (deleteError) {
          console.error('Error deleting previous file:', deleteError);
        }
      }
      // Actualiza los campos de archivo y metadatos
      documento = await prisma.documento.update({
        where: { documento_id: documento.documento_id },
        data: {
          nombre_personalizado: nombre_personalizado || tipo,
          nombre_archivo_original: req.file.originalname,
          ruta_storage: storagePath,
          url_documento: signedUrl,
          tamaño_bytes: req.file.size,
          tipo_archivo: req.file.mimetype,
          fecha_enviado: new Date(),
          fecha_recibido: null, // Reset received date
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
    } else {
      // Si no existe el metadato, créalo y asocia el archivo
      documento = await prisma.documento.create({
        data: {
          caso_id: parseInt(caso_id),
          tipo: tipo,
          nombre_personalizado: nombre_personalizado || tipo,
          nombre_archivo_original: req.file.originalname,
          ruta_storage: storagePath,
          url_documento: signedUrl,
          tamaño_bytes: req.file.size,
          tipo_archivo: req.file.mimetype,
          fecha_enviado: new Date(),
          fecha_recibido: null,
          firma_digital: false
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
    }

    console.log(`User ${userId} uploaded document ${documento.documento_id} (${tipo}) for case ${caso_id}`);
    
    return res.status(201).json({
      message: 'Documento subido exitosamente',
      documento: documento,
      archivo_url: signedUrl
    });
    
  } catch (err) {
    console.error('Error uploading document:', err);
    return res.status(500).json({
      message: 'Error al subir el documento',
      error: err.message
    });
  }
};

export const getDocumentFile = async (req, res) => {
  try {
    const documentoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(documentoId)) {
      return res.status(400).json({ message: 'ID de documento inválido' });
    }
    
    const documento = await verifyDocumentOwnership(documentoId, userId);
    if (!documento) {
      return res.status(404).json({
        message: 'Documento no encontrado o no tienes permisos para acceder a él'
      });
    }

    if (!documento.ruta_storage) {
      return res.status(404).json({
        message: 'Este documento no tiene archivo asociado'
      });
    }

    // Generar URL firmada para acceso temporal (1 hora)
    const signedUrl = await supabaseStorage.getSignedUrl(documento.ruta_storage, 3600);
    
    return res.json({
      url: signedUrl,
      nombre_archivo: documento.nombre_archivo_original || documento.tipo,
      tipo_archivo: documento.tipo_archivo,
      tamaño_bytes: documento.tamaño_bytes
    });
    
  } catch (err) {
    console.error('Error getting document file:', err);
    return res.status(500).json({
      message: 'Error al obtener el archivo del documento',
      error: err.message
    });
  }
};

// Las demás funciones permanecen igual...
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
        nombre_personalizado: true,
        fecha_enviado: true,
        fecha_recibido: true,
        firma_digital: true,
        url_documento: true,
        ruta_storage: true
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
      con_archivo: documentos.filter(doc => doc.ruta_storage).length,
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