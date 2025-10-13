import { prisma } from '../config/database.js';
import { DOCUMENT_REQUIREMENTS } from '../config/documentRequirements.js';

export const getAvailableProcesses = async (req, res) => {
  try {
    const procesos = Object.keys(DOCUMENT_REQUIREMENTS).map(proceso => ({
      nombre: proceso,
      documentosRequeridos: DOCUMENT_REQUIREMENTS[proceso].length,
      documentosObligatorios: DOCUMENT_REQUIREMENTS[proceso].filter(doc => doc.requerido).length,
      documentosOpcionales: DOCUMENT_REQUIREMENTS[proceso].filter(doc => !doc.requerido).length
    }));

    return res.json({
      procesos,
      total: procesos.length
    });
  } catch (err) {
    console.error('Error getting available processes:', err);
    return res.status(500).json({ message: 'Error obteniendo procesos disponibles' });
  }
};

export const validateCaseProcesses = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const casos = await prisma.caso.findMany({
      where: {
        cliente: {
          created_by: userId
        }
      },
      select: {
        caso_id: true,
        tipo_tramite: true,
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    const processosValidos = Object.keys(DOCUMENT_REQUIREMENTS);
    const casosValidos = [];
    const casosInvalidos = [];

    casos.forEach(caso => {
      if (processosValidos.includes(caso.tipo_tramite)) {
        casosValidos.push(caso);
      } else {
        casosInvalidos.push(caso);
      }
    });

    return res.json({
      totalCasos: casos.length,
      casosValidos: casosValidos.length,
      casosInvalidos: casosInvalidos.length,
      processosValidos,
      casosConProcesosInvalidos: casosInvalidos,
      mensaje: casosInvalidos.length > 0 
        ? `${casosInvalidos.length} casos tienen procesos inválidos y necesitan ser actualizados`
        : 'Todos los casos tienen procesos válidos'
    });
    
  } catch (err) {
    console.error('Error validating case processes:', err);
    return res.status(500).json({ message: 'Error validando procesos de casos' });
  }
};

export const updateCaseProcess = async (req, res) => {
  try {
    const casoId = parseInt(req.params.casoId);
    const { nuevo_proceso } = req.body;
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    if (!nuevo_proceso || !DOCUMENT_REQUIREMENTS[nuevo_proceso]) {
      return res.status(400).json({ 
        message: 'Proceso inválido. Procesos disponibles: ' + Object.keys(DOCUMENT_REQUIREMENTS).join(', ')
      });
    }

    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      }
    });

    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para modificarlo'
      });
    }

    const procesoAnterior = caso.tipo_tramite;

    const casoActualizado = await prisma.caso.update({
      where: { caso_id: casoId },
      data: { 
        tipo_tramite: nuevo_proceso,
        updated_at: new Date()
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    if (procesoAnterior !== nuevo_proceso) {
      await prisma.documento.deleteMany({
        where: { caso_id: casoId }
      });

      const requiredDocuments = DOCUMENT_REQUIREMENTS[nuevo_proceso];
      const newDocuments = [];

      for (const docTemplate of requiredDocuments) {
        const newDoc = await prisma.documento.create({
          data: {
            caso_id: casoId,
            tipo: docTemplate.documento,
            fecha_enviado: null,
            fecha_recibido: null,
            firma_digital: false
          }
        });
        newDocuments.push(newDoc);
      }

      console.log(`User ${userId} updated case ${casoId} process from "${procesoAnterior}" to "${nuevo_proceso}" and created ${newDocuments.length} new documents`);

      return res.json({
        caso: casoActualizado,
        procesoAnterior,
        procesoNuevo: nuevo_proceso,
        documentosCreados: newDocuments.length,
        mensaje: `Caso actualizado exitosamente de "${procesoAnterior}" a "${nuevo_proceso}". Se crearon ${newDocuments.length} nuevos documentos.`
      });
    }

    return res.json({
      caso: casoActualizado,
      mensaje: 'El caso ya tenía el proceso correcto'
    });
    
  } catch (err) {
    console.error('Error updating case process:', err);
    return res.status(500).json({
      message: 'Error actualizando proceso del caso',
      error: err.message
    });
  }
};

export const debugTables = async (req, res) => {
  try {
    const tableInfo = {};
    
    try {
      const sampleUsuario = await prisma.usuariointerno.findFirst();
      tableInfo.usuariointerno = sampleUsuario ? Object.keys(sampleUsuario) : 'No data';
    } catch (err) {
      tableInfo.usuariointerno = `Error: ${err.message}`;
    }

    try {
      const sampleCliente = await prisma.cliente.findFirst();
      tableInfo.cliente = sampleCliente ? Object.keys(sampleCliente) : 'No data';
    } catch (err) {
      tableInfo.cliente = `Error: ${err.message}`;
    }

    try {
      const sampleCaso = await prisma.caso.findFirst();
      tableInfo.caso = sampleCaso ? Object.keys(sampleCaso) : 'No data';
    } catch (err) {
      tableInfo.caso = `Error: ${err.message}`;
    }

    return res.json({ 
      message: 'Table structure info',
      tables: tableInfo,
      counts: {
        usuarios: await prisma.usuariointerno.count().catch(() => 0),
        clientes: await prisma.cliente.count().catch(() => 0),
        casos: await prisma.caso.count().catch(() => 0),
        documentos: await prisma.documento.count().catch(() => 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error checking table structure:', err);
    return res.status(500).json({ message: 'Error verificando estructura de tablas' });
  }
};