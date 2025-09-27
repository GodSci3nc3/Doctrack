import { prisma } from '../config/database.js';

// Obtener lista de clientes
export const getClients = async (req, res) => {
  try {
    const userId = req.user.sub;
    const clientes = await prisma.cliente.findMany({
      where: { created_by: userId },
      orderBy: { created_at: 'desc' }
    });
    return res.json(clientes);
  } catch (err) {
    console.error('Error getting clients:', err);
    return res.status(500).json({ message: 'Error obteniendo clientes' });
  }
};

// Actualizar cliente
export const updateClient = async (req, res) => {
  try {
    // Ejemplo mínimo: devolver éxito
    return res.json({ message: 'Cliente actualizado (mock)' });
  } catch (err) {
    console.error('Error updating client:', err);
    return res.status(500).json({ message: 'Error actualizando cliente' });
  }
};

// Eliminar cliente
export const deleteClient = async (req, res) => {
  try {
    // Ejemplo mínimo: devolver éxito
    return res.json({ message: 'Cliente eliminado (mock)' });
  } catch (err) {
    console.error('Error deleting client:', err);
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

    console.log('Checking for existing client with email:', email.toLowerCase().trim());
    const existingClient = await prisma.cliente.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
      }
    });
    console.log('Existing client found:', existingClient ? 'YES' : 'NO');
    if (existingClient) {
      console.log('Returning 409 - Client already exists');
      return res.status(409).json({ message: 'Ya existe un cliente con ese email.' });
    }

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