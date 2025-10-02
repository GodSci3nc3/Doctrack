import { prisma } from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    console.log('Getting dashboard stats for user:', req.user.sub);
    
    const userId = req.user.sub;
    
    try {
      const [totalClientes, totalCasos, casosActivos, documentosTotales] = await Promise.all([
        prisma.cliente.count({ where: { created_by: userId } }),
        prisma.caso.count({
          where: {
            cliente: {
              created_by: userId
            }
          }
        }),
        prisma.caso.count({ 
          where: { 
            estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
            cliente: {
              created_by: userId
            }
          } 
        }),
        prisma.documento.count({
          where: {
            caso: {
              cliente: {
                created_by: userId
              }
            }
          }
        })
      ]);

      const casosCompletados = await prisma.caso.count({ 
        where: { 
          estado: 'APROBADO',
          cliente: {
            created_by: userId
          }
        } 
      });

      const documentosPendientes = await prisma.documento.count({
        where: { 
          fecha_recibido: null,
          caso: {
            cliente: {
              created_by: userId
            }
          }
        }
      });

      const stats = {
        clientes: totalClientes,
        casosActivos: casosActivos,
        casosCompletados: casosCompletados,
        documentosPendientes: documentosPendientes
      };

      console.log('User-filtered stats retrieved:', stats);
      return res.json(stats);
      
    } catch (dbError) {
      console.error('Database error in stats:', dbError);
      return res.status(500).json({ 
        message: 'Error obteniendo estadísticas',
        error: dbError.message 
      });
    }

  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
};

export const getClientsResume = async (req, res) => {
  try {
    console.log('Getting clients summary for user:', req.user.sub);
    const userId = req.user.sub;
    
    try {
      const clientes = await prisma.cliente.findMany({
        where: {
          created_by: userId
        },
        take: 10,
        orderBy: {
          created_at: 'desc'
        },
        select: {
          cliente_id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          created_at: true,
          canal_ingreso: true
        }
      });

      console.log('Real clients found:', clientes.length);

      const clientesFormateados = clientes.map(cliente => {
        const fechaRegistro = cliente.created_at ? new Date(cliente.created_at) : new Date();
        const diasRegistro = Math.floor((new Date() - fechaRegistro) / (1000 * 60 * 60 * 24));
        
        return {
          cliente_id: cliente.cliente_id,
          nombre_completo: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Sin nombre',
          email: cliente.email || 'Sin email',
          telefono: cliente.telefono || 'Sin teléfono',
          dias_registro: diasRegistro || 0,
          canal_ingreso: cliente.canal_ingreso || 'Directo'
        };
      });

      return res.json(clientesFormateados);
      
    } catch (dbError) {
      console.error('Database error getting clients:', dbError);
      return res.status(500).json({ 
        message: 'Error obteniendo resumen de clientes',
        error: dbError.message 
      });
    }

  } catch (err) {
    console.error('Error getting clients summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de clientes' });
  }
};

export const getCasesResume = async (req, res) => {
  try {
    console.log('Getting cases summary for user:', req.user.sub);
    const userId = req.user.sub;
    
    try {
      const casos = await prisma.caso.findMany({
        where: {
          cliente: {
            created_by: userId
          }
        },
        take: 10,
        orderBy: {
          created_at: 'desc'
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

      console.log('Real cases found:', casos.length);

      const casosFormateados = casos.map(caso => ({
        id: caso.caso_id,
        cliente: `${caso.cliente.nombre} ${caso.cliente.apellido}`,
        tipo: caso.tipo_tramite,
        estado: caso.estado,
        fecha: caso.fecha_creacion ? new Date(caso.fecha_creacion).toLocaleDateString('es-ES') : 'Sin fecha',
        fecha_aprobacion: caso.fecha_aprobacion ? new Date(caso.fecha_aprobacion).toLocaleDateString('es-ES') : null
      }));

      return res.json(casosFormateados);
      
    } catch (dbError) {
      console.error('Database error getting cases:', dbError);
      return res.status(500).json({ 
        message: 'Error obteniendo resumen de casos',
        error: dbError.message 
      });
    }

  } catch (err) {
    console.error('Error getting cases summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de casos' });
  }
};

export const getPendingChecklist = async (req, res) => {
  try {
    console.log('Getting pending checklist for user:', req.user.sub);
    const userId = req.user.sub;
    
    try {
      const documentosPendientes = await prisma.documento.findMany({
        where: {
          fecha_recibido: null,
          caso: {
            cliente: {
              created_by: userId
            }
          }
        },
        take: 10,
        orderBy: {
          created_at: 'desc'
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

      console.log('Pending documents found:', documentosPendientes.length);

      const checklistFormateado = documentosPendientes.map(doc => ({
        id: doc.documento_id,
        cliente: `${doc.caso.cliente.nombre} ${doc.caso.cliente.apellido}`,
        tarea: `Recibir ${doc.tipo}`,
        fecha_limite: doc.fecha_enviado ? 
          new Date(new Date(doc.fecha_enviado).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
          new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        prioridad: doc.fecha_enviado ? 
          (new Date() - new Date(doc.fecha_enviado)) > (5 * 24 * 60 * 60 * 1000) ? 'alta' : 'media' : 
          'baja',
        tipo_documento: doc.tipo,
        caso_id: doc.caso_id
      }));

      return res.json(checklistFormateado);
      
    } catch (dbError) {
      console.error('Database error getting checklist:', dbError);
      return res.status(500).json({ 
        message: 'Error obteniendo checklist pendientes',
        error: dbError.message 
      });
    }

  } catch (err) {
    console.error('Error getting pending checklist:', err);
    return res.status(500).json({ message: 'Error obteniendo checklist pendientes' });
  }
};