import { prisma } from '../config/database.js';

// Obtener lista de clientes
export const getClients = async (req, res) => {
  try {
    console.log('=== GET CLIENTS REQUEST ===');
    console.log('User ID:', req.user.sub);
    console.log('Search query:', req.query.search);

    const userId = req.user.sub;
    const search = req.query.search || '';
    
    let whereClause = { created_by: userId };
    
    // Si hay búsqueda, agregar filtros
    if (search.trim()) {
      whereClause.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tipo_proceso: { contains: search, mode: 'insensitive' } },
        { migratorio_tipo_proceso: { contains: search, mode: 'insensitive' } },
        { pais_origen: { contains: search, mode: 'insensitive' } },
        { pais_nacimiento: { contains: search, mode: 'insensitive' } }
      ];
    }

    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        caso: {
          select: {
            caso_id: true,
            estado: true
          }
        }
      }
    });

    console.log(`Found ${clientes.length} clients for user ${userId}`);
    return res.json(clientes);
    
  } catch (err) {
    console.error('=== ERROR GETTING CLIENTS ===');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ message: 'Error obteniendo clientes' });
  }
};

// Actualizar cliente
export const updateClient = async (req, res) => {
  try {
    console.log('=== UPDATE CLIENT REQUEST ===');
    console.log('User ID:', req.user.sub);
    console.log('Client ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const clientId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (!clientId || isNaN(clientId)) {
      return res.status(400).json({ message: 'ID de cliente inválido' });
    }

    const {
      nombre, apellido, email, telefono, canal_ingreso,
      encargado, tipo_proceso, tipo_documento, numero_documento,
      pais_origen, pais_nacimiento, fecha_nacimiento, estado_civil,
      direccion_actual, estado, zipcode, ciudad,
      migratorio_tipo_proceso, migratorio_ubicacion_actual, migratorio_estatus_actual,
      migratorio_numero_caso, migratorio_fecha_entrada_eeuu, migratorio_via_entrada_eeuu,
      migratorio_fecha_vencimiento_estadia, migratorio_dependientes,
      ocupacion_actual, nivel_estudios, forma_contacto, notas_cliente
    } = req.body;

    // Validar que el cliente existe y pertenece al usuario
    const existingClient = await prisma.cliente.findFirst({
      where: {
        cliente_id: clientId,
        created_by: userId
      }
    });

    if (!existingClient) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Validar campos requeridos
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        message: 'Los campos nombre, apellido y email son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'El formato del email no es válido'
      });
    }

    // Convertir fechas a tipo Date si son string y no vacías
    const fechaNacimientoDate = fecha_nacimiento && typeof fecha_nacimiento === 'string' && fecha_nacimiento.length > 0 ? new Date(fecha_nacimiento) : null;
    const migratorioFechaEntradaDate = migratorio_fecha_entrada_eeuu && typeof migratorio_fecha_entrada_eeuu === 'string' && migratorio_fecha_entrada_eeuu.length > 0 ? new Date(migratorio_fecha_entrada_eeuu) : null;
    const migratorioFechaVencimientoDate = migratorio_fecha_vencimiento_estadia && typeof migratorio_fecha_vencimiento_estadia === 'string' && migratorio_fecha_vencimiento_estadia.length > 0 ? new Date(migratorio_fecha_vencimiento_estadia) : null;

    // Actualizar cliente
    const updatedClient = await prisma.cliente.update({
      where: {
        cliente_id: clientId
      },
      data: {
        nombre: nombre?.trim(),
        apellido: apellido?.trim(),
        email: email?.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        canal_ingreso: canal_ingreso || 'Directo',
        encargado,
        tipo_proceso,
        tipo_documento,
        numero_documento,
        pais_origen,
        pais_nacimiento,
        fecha_nacimiento: fechaNacimientoDate,
        estado_civil,
        direccion_actual,
        estado,
        zipcode,
        ciudad,
        migratorio_tipo_proceso,
        migratorio_ubicacion_actual,
        migratorio_estatus_actual,
        migratorio_numero_caso,
        migratorio_fecha_entrada_eeuu: migratorioFechaEntradaDate,
        migratorio_via_entrada_eeuu,
        migratorio_fecha_vencimiento_estadia: migratorioFechaVencimientoDate,
        migratorio_dependientes,
        ocupacion_actual,
        nivel_estudios,
        forma_contacto,
        notas_cliente
      }
    });

    console.log('Cliente actualizado exitosamente:', updatedClient.cliente_id);
    return res.json(updatedClient);
    
  } catch (err) {
    console.error('=== ERROR UPDATING CLIENT ===');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Ya existe un cliente con ese email' });
    }
    
    return res.status(500).json({ message: 'Error actualizando cliente' });
  }
};

// Eliminar cliente
export const deleteClient = async (req, res) => {
  try {
    console.log('=== DELETE CLIENT REQUEST ===');
    console.log('User ID:', req.user.sub);
    console.log('Client ID:', req.params.id);

    const clientId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (!clientId || isNaN(clientId)) {
      return res.status(400).json({ message: 'ID de cliente inválido' });
    }

    // Validar que el cliente existe y pertenece al usuario
    const existingClient = await prisma.cliente.findFirst({
      where: {
        cliente_id: clientId,
        created_by: userId
      }
    });

    if (!existingClient) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Eliminar cliente (esto también eliminará los casos relacionados por cascade)
    await prisma.cliente.delete({
      where: {
        cliente_id: clientId
      }
    });

    console.log('Cliente eliminado exitosamente:', clientId);
    return res.json({ message: 'Cliente eliminado exitosamente' });
    
  } catch (err) {
    console.error('=== ERROR DELETING CLIENT ===');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    
    return res.status(500).json({ message: 'Error eliminando cliente' });
  }
};
export const createClient = async (req, res) => {
  try {
    console.log('=== CREATE CLIENT REQUEST ===');
    console.log('User ID:', req.user.sub);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const {
      nombre, apellido, email, telefono, canal_ingreso,
      encargado, tipo_proceso, tipo_documento, numero_documento,
      pais_origen, pais_nacimiento, fecha_nacimiento, estado_civil,
      direccion_actual, estado, zipcode, ciudad,
      migratorio_tipo_proceso, migratorio_ubicacion_actual, migratorio_estatus_actual,
      migratorio_numero_caso, migratorio_fecha_entrada_eeuu, migratorio_via_entrada_eeuu,
      migratorio_fecha_vencimiento_estadia, migratorio_dependientes,
      ocupacion_actual, nivel_estudios, forma_contacto, notas_cliente
    } = req.body;
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

    // Los preparadores pueden crear clientes con emails duplicados sin restricciones
    console.log('Allowing duplicate emails - no validation needed');

    // Convertir fechas a tipo Date si son string y no vacías
    const fechaNacimientoDate = fecha_nacimiento && typeof fecha_nacimiento === 'string' && fecha_nacimiento.length > 0 ? new Date(fecha_nacimiento) : null;
    const migratorioFechaEntradaDate = migratorio_fecha_entrada_eeuu && typeof migratorio_fecha_entrada_eeuu === 'string' && migratorio_fecha_entrada_eeuu.length > 0 ? new Date(migratorio_fecha_entrada_eeuu) : null;
    const migratorioFechaVencimientoDate = migratorio_fecha_vencimiento_estadia && typeof migratorio_fecha_vencimiento_estadia === 'string' && migratorio_fecha_vencimiento_estadia.length > 0 ? new Date(migratorio_fecha_vencimiento_estadia) : null;

    const newClient = await prisma.cliente.create({
      data: {
        nombre: nombre?.trim(),
        apellido: apellido?.trim(),
        email: email?.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        canal_ingreso: canal_ingreso || 'Directo',
        encargado,
        tipo_proceso,
        tipo_documento,
        numero_documento,
        pais_origen,
        pais_nacimiento,
        fecha_nacimiento: fechaNacimientoDate,
        estado_civil,
        direccion_actual,
        estado,
        zipcode,
        ciudad,
        migratorio_tipo_proceso,
        migratorio_ubicacion_actual,
        migratorio_estatus_actual,
        migratorio_numero_caso,
        migratorio_fecha_entrada_eeuu: migratorioFechaEntradaDate,
        migratorio_via_entrada_eeuu,
        migratorio_fecha_vencimiento_estadia: migratorioFechaVencimientoDate,
        migratorio_dependientes,
        ocupacion_actual,
        nivel_estudios,
        forma_contacto,
        notas_cliente,
        created_by: userId
      }
    });
    return res.status(201).json(newClient);
  } catch (err) {
    console.error('=== ERROR CREATING CLIENT ===');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ message: 'Error creando cliente' });
  }
}