import { prisma } from '../config/database.js';

// Helper function to verify case ownership
async function verifyCaseOwnership(casoId, userId) {
  try {
    console.log(`Verifying case ownership: Case ${casoId} for User ${userId}`);
    
    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    console.log(`Case ownership result:`, caso ? 'ALLOWED' : 'DENIED');
    return caso;
  } catch (err) {
    console.error('Error verifying case ownership:', err);
    return null;
  }
}

export const getCases = async (req, res) => {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado || '';
    
    const skip = (page - 1) * limit;
    
    const where = {
      cliente: {
        created_by: userId
      },
      ...(estado && { estado })
    };
    
    const [casos, total] = await Promise.all([
      prisma.caso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          },
          documento: {
            select: {
              documento_id: true,
              tipo: true,
              fecha_recibido: true
            }
          }
        }
      }),
      prisma.caso.count({ where })
    ]);

    return res.json({
      casos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getting cases list:', err);
    return res.status(500).json({ message: 'Error obteniendo lista de casos' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
          }
        },
        documento: {
          orderBy: [
            { fecha_recibido: 'asc' },
            { created_at: 'desc' }
          ]
        }
      }
    });

    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para verlo'
      });
    }

    console.log(`User ${userId} retrieved case details for case ${casoId}`);
    return res.json(caso);
    
  } catch (err) {
    console.error('Error getting case details:', err);
    return res.status(500).json({ 
      message: 'Error obteniendo detalles del caso',
      error: err.message 
    });
  }
};

export const createCase = async (req, res) => {
  try {
    console.log('Creating new case for user:', req.user.sub);
    const { cliente_id, tipo_tramite, estado } = req.body;
    const userId = req.user.sub;
    
    if (!cliente_id || !tipo_tramite) {
      return res.status(400).json({
        message: 'Los campos cliente_id y tipo_tramite son requeridos'
      });
    }
    
    const clienteExiste = await prisma.cliente.findFirst({
      where: { 
        cliente_id: parseInt(cliente_id),
        created_by: userId
      }
    });
    
    if (!clienteExiste) {
      return res.status(404).json({
        message: 'El cliente especificado no existe o no tienes permisos para crear casos para él'
      });
    }
    
    const newCase = await prisma.caso.create({
      data: {
        cliente_id: parseInt(cliente_id),
        tipo_tramite: tipo_tramite,
        estado: estado || 'PENDIENTE'
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    // Sincronizar tipo_proceso en el cliente
    await prisma.cliente.update({
      where: { cliente_id: parseInt(cliente_id) },
      data: { tipo_proceso: tipo_tramite }
    });

    console.log('Case created successfully:', newCase.caso_id);
    return res.status(201).json(newCase);
    
  } catch (err) {
    console.error('Error creating case:', err);
    return res.status(500).json({
      message: 'Error al crear el caso',
      error: err.message
    });
  }
};

export const updateCase = async (req, res) => {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    const { tipo_tramite, estado, fecha_aprobacion } = req.body;
    
    if (isNaN(casoId)) {
      return res.status(400).json({
        message: 'ID de caso inválido'
      });
    }
    
    const existingCase = await prisma.caso.findFirst({
      where: { 
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      },
      include: {
        cliente: true
      }
    });
    
    if (!existingCase) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    const updateData = {};
    
    if (tipo_tramite !== undefined) updateData.tipo_tramite = tipo_tramite;
    if (estado !== undefined) {
      const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'APROBADO', 'RECHAZADO', 'CERRADO'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          message: 'Estado inválido',
          estadosValidos: estadosValidos
        });
      }
      updateData.estado = estado;
      
      if (estado === 'APROBADO' && !existingCase.fecha_aprobacion) {
        updateData.fecha_aprobacion = new Date();
      }
    }
    
    if (fecha_aprobacion !== undefined) {
      updateData.fecha_aprobacion = fecha_aprobacion ? new Date(fecha_aprobacion) : null;
    }
    
    const updatedCase = await prisma.caso.update({
      where: { caso_id: casoId },
      data: updateData,
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });
    
    return res.json(updatedCase);
    
  } catch (err) {
    console.error('Error updating case:', err);
    return res.status(500).json({
      message: 'Error al actualizar el caso',
      error: err.message
    });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({
        message: 'ID de caso inválido'
      });
    }
    
    const existingCase = await prisma.caso.findFirst({
      where: { 
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      }
    });
    
    if (!existingCase) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para eliminarlo'
      });
    }
    
    await prisma.caso.delete({
      where: { caso_id: casoId }
    });
    
    return res.json({ 
      message: 'Caso eliminado exitosamente',
      caso_id: casoId 
    });
    
  } catch (err) {
    console.error('Error deleting case:', err);
    return res.status(500).json({
      message: 'Error al eliminar el caso',
      error: err.message
    });
  }
};

export { verifyCaseOwnership };