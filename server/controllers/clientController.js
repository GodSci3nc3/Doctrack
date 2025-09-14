import { prisma } from '../config/database.js';

// Helper function to verify client ownership
async function verifyClientOwnership(clienteId, userId) {
  try {
    console.log(`Verifying client ownership: Client ${clienteId} for User ${userId}`);
    
    const cliente = await prisma.cliente.findFirst({
      where: {
        cliente_id: clienteId,
        created_by: userId
      }
    });
    
    console.log(`Client ownership result:`, cliente ? 'ALLOWED' : 'DENIED');
    return cliente;
  } catch (err) {
    console.error('Error verifying client ownership:', err);
    return null;
  }
}

export const getClients = async (req, res) => {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const skip = (page - 1) * limit;
    
    const where = {
      created_by: userId,
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          caso: {
            select: {
              caso_id: true,
              estado: true,
              tipo_tramite: true
            }
          }
        }
      }),
      prisma.cliente.count({ where })
    ]);

    return res.json({
      clientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getting clients list:', err);
    return res.status(500).json({ message: 'Error obteniendo lista de clientes' });
  }
};

export const createClient = async (req, res) => {
  try {
    console.log('Creating new client for user:', req.user.sub);
    const { nombre, apellido, email, telefono, canal_ingreso } = req.body;
    const userId = req.user.sub;
    
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        message: 'Los campos nombre, apellido y email son requeridos'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'El formato del email no es válido'
      });
    }
    
    const existingClient = await prisma.cliente.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        created_by: userId
      }
    });
    
    if (existingClient) {
      return res.status(400).json({
        message: 'Ya tienes un cliente con ese email'
      });
    }
    
    const newClient = await prisma.cliente.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        canal_ingreso: canal_ingreso || 'Directo',
        created_by: userId
      }
    });
    
    console.log('Client created successfully for user:', userId, 'Client ID:', newClient.cliente_id);
    
    return res.status(201).json(newClient);
    
  } catch (err) {
    console.error('Error creating client:', err);
    return res.status(500).json({
      message: 'Error al crear el cliente',
      error: err.message
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    console.log('Updating client...');
    const clienteId = parseInt(req.params.id);
    const userId = req.user.sub;
    const { nombre, apellido, email, telefono, canal_ingreso } = req.body;
    
    if (isNaN(clienteId)) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      });
    }
    
    const existingClient = await verifyClientOwnership(clienteId, userId);
    
    if (!existingClient) {
      return res.status(404).json({
        message: 'Cliente no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (apellido !== undefined) updateData.apellido = apellido.trim();
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'El formato del email no es válido'
        });
      }
      
      const emailInUse = await prisma.cliente.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          cliente_id: { not: clienteId },
          created_by: userId
        }
      });
      
      if (emailInUse) {
        return res.status(400).json({
          message: 'Ya tienes otro cliente con ese email'
        });
      }
      
      updateData.email = email.toLowerCase().trim();
    }
    if (telefono !== undefined) updateData.telefono = telefono?.trim() || null;
    if (canal_ingreso !== undefined) updateData.canal_ingreso = canal_ingreso;
    
    const updatedClient = await prisma.cliente.update({
      where: { cliente_id: clienteId },
      data: updateData
    });
    
    console.log('Client updated successfully:', updatedClient.cliente_id);
    
    return res.json(updatedClient);
    
  } catch (err) {
    console.error('Error updating client:', err);
    return res.status(500).json({
      message: 'Error al actualizar el cliente',
      error: err.message
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(clienteId)) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      });
    }
    
    const existingClient = await verifyClientOwnership(clienteId, userId);
    
    if (!existingClient) {
      return res.status(404).json({
        message: 'Cliente no encontrado o no tienes permisos para eliminarlo'
      });
    }
    
    await prisma.cliente.delete({
      where: { cliente_id: clienteId }
    });
    
    return res.json({ 
      message: 'Cliente eliminado exitosamente',
      cliente_id: clienteId 
    });
    
  } catch (err) {
    console.error('Error deleting client:', err);
    return res.status(500).json({
      message: 'Error al eliminar el cliente',
      error: err.message
    });
  }
};