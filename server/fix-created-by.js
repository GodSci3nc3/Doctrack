// fix-created-by.js - Ejecuta con: node fix-created-by.js
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function fixCreatedByField() {
  console.log('🔧 REPARANDO CAMPO CREATED_BY');
  console.log('==============================\n');

  try {
    await prisma.$connect();
    console.log('✅ Conexión a BD establecida\n');

    // 1. Verificar usuarios disponibles
    console.log('👥 USUARIOS DISPONIBLES:');
    const users = await prisma.usuariointerno.findMany({
      select: {
        usuario_id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios disponibles. Creando usuario por defecto...');
      // Crear usuario por defecto si no existe
      const defaultUser = await prisma.usuariointerno.create({
        data: {
          nombre: 'Admin',
          apellido: 'System',
          email: 'admin@doctrack.com',
          rol: 'ADMIN',
          contrase_a: 'default123' // Cambiar después
        }
      });
      console.log(`✅ Usuario por defecto creado con ID: ${defaultUser.usuario_id}`);
      users.push(defaultUser);
    }

    users.forEach(user => {
      console.log(`  ID: ${user.usuario_id} - ${user.nombre} ${user.apellido} (${user.rol})`);
    });

    // 2. Buscar clientes con created_by NULL usando raw query
    console.log('\n🔍 BUSCANDO CLIENTES SIN OWNER...');
    const clientsWithoutOwner = await prisma.$queryRaw`
      SELECT cliente_id, nombre, apellido, email 
      FROM cliente 
      WHERE created_by IS NULL
    `;

    if (clientsWithoutOwner.length === 0) {
      console.log('✅ Todos los clientes ya tienen un owner asignado');
      
      // Mostrar estado actual
      console.log('\n📊 ESTADO ACTUAL DE CLIENTES:');
      const allClients = await prisma.cliente.findMany({
        select: {
          cliente_id: true,
          nombre: true,
          apellido: true,
          created_by: true,
          usuario: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        }
      });

      allClients.forEach(client => {
        console.log(`  ID: ${client.cliente_id} - ${client.nombre} ${client.apellido} - Owner: ${client.created_by} (${client.usuario.nombre} ${client.usuario.apellido})`);
      });

    } else {
      console.log(`⚠️  Encontrados ${clientsWithoutOwner.length} clientes sin owner`);
      
      // Asignar owner por defecto (usuario con ID 1 o 2)
      const defaultOwnerId = users.find(u => u.usuario_id === 1)?.usuario_id || 
                            users.find(u => u.usuario_id === 2)?.usuario_id || 
                            users[0].usuario_id;

      console.log(`\n🔄 Asignando owner por defecto (ID: ${defaultOwnerId})...`);

      // Actualizar usando raw query para evitar errores de Prisma
      const updateResult = await prisma.$executeRaw`
        UPDATE cliente 
        SET created_by = ${defaultOwnerId}, updated_at = CURRENT_TIMESTAMP
        WHERE created_by IS NULL
      `;

      console.log(`✅ ${updateResult} clientes actualizados con owner ID: ${defaultOwnerId}`);

      // Verificar resultado
      const updatedClients = await prisma.cliente.findMany({
        where: { created_by: defaultOwnerId },
        select: {
          cliente_id: true,
          nombre: true,
          apellido: true,
          created_by: true
        }
      });

      console.log('\n📋 CLIENTES ACTUALIZADOS:');
      updatedClients.forEach(client => {
        console.log(`  ID: ${client.cliente_id} - ${client.nombre} ${client.apellido} - Owner: ${client.created_by}`);
      });
    }

    // 3. Opción para reasignar todos los clientes a un usuario específico
    console.log('\n🔄 OPCIÓN DE REASIGNACIÓN MASIVA:');
    console.log('Para reasignar todos los clientes a un usuario específico, ejecuta:');
    console.log('node fix-created-by.js --reassign-all --user-id=1');
    console.log('node fix-created-by.js --reassign-all --user-id=2');

    // Verificar si se pasaron argumentos para reasignación masiva
    const args = process.argv.slice(2);
    const reassignAll = args.includes('--reassign-all');
    const userIdArg = args.find(arg => arg.startsWith('--user-id='));
    
    if (reassignAll && userIdArg) {
      const targetUserId = parseInt(userIdArg.split('=')[1]);
      const targetUser = users.find(u => u.usuario_id === targetUserId);
      
      if (!targetUser) {
        console.log(`❌ Usuario con ID ${targetUserId} no encontrado`);
      } else {
        console.log(`\n🔄 REASIGNANDO TODOS LOS CLIENTES AL USUARIO: ${targetUser.nombre} ${targetUser.apellido} (ID: ${targetUserId})`);
        
        const reassignResult = await prisma.$executeRaw`
          UPDATE cliente 
          SET created_by = ${targetUserId}, updated_at = CURRENT_TIMESTAMP
          WHERE created_by != ${targetUserId}
        `;
        
        console.log(`✅ ${reassignResult} clientes reasignados al usuario ID: ${targetUserId}`);
      }
    }

    // 4. Estadísticas finales
    console.log('\n📊 ESTADÍSTICAS FINALES:');
    const finalStats = await prisma.$queryRaw`
      SELECT 
        created_by,
        COUNT(*) as client_count,
        u.nombre,
        u.apellido
      FROM cliente c
      LEFT JOIN usuariointerno u ON c.created_by = u.usuario_id
      GROUP BY created_by, u.nombre, u.apellido
      ORDER BY created_by
    `;

    finalStats.forEach(stat => {
      console.log(`  Usuario ID ${stat.created_by}: ${stat.client_count} clientes - ${stat.nombre} ${stat.apellido}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatedByField();
