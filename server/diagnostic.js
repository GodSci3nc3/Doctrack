// diagnostic-fixed.js - Versión corregida
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function runDiagnostics() {
  console.log('🔍 DIAGNÓSTICO CORREGIDO DE BASE DE DATOS');
  console.log('==========================================\n');

  try {
    await prisma.$connect();
    console.log('✅ Conexión a BD establecida');

    // 1. Verificar estructura de tabla cliente
    console.log('\n📊 VERIFICANDO TABLA CLIENTE:');
    const sampleClient = await prisma.cliente.findFirst();
    if (sampleClient) {
      console.log('✅ Tabla cliente accesible');
      console.log('📋 Campos disponibles:', Object.keys(sampleClient));
      console.log('🔍 Campo created_by existe:', 'created_by' in sampleClient ? 'SÍ' : 'NO');
      console.log('📝 Valor de created_by:', sampleClient.created_by);
    }

    // 2. Conteo de registros
    console.log('\n📊 CONTEO DE REGISTROS:');
    const [userCount, clientCount, caseCount] = await Promise.all([
      prisma.usuariointerno.count(),
      prisma.cliente.count(),
      prisma.caso.count()
    ]);

    console.log(`👥 Usuarios: ${userCount}`);
    console.log(`🏢 Clientes: ${clientCount}`);
    console.log(`📋 Casos: ${caseCount}`);

    // 3. Verificar distribution de clientes por usuario
    console.log('\n📊 DISTRIBUCIÓN DE CLIENTES POR USUARIO:');
    const clientDistribution = await prisma.cliente.groupBy({
      by: ['created_by'],
      _count: {
        cliente_id: true
      }
    });
    
    clientDistribution.forEach(dist => {
      console.log(`  Usuario ${dist.created_by}: ${dist._count.cliente_id} clientes`);
    });

    // 4. Mostrar usuarios disponibles
    console.log('\n👥 USUARIOS DISPONIBLES:');
    const users = await prisma.usuariointerno.findMany({
      select: {
        usuario_id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true
      },
      take: 5
    });
    users.forEach(user => {
      console.log(`  ID: ${user.usuario_id} - ${user.nombre} ${user.apellido} (${user.email})`);
    });

    // 5. Mostrar clientes y su ownership
    console.log('\n🏢 CLIENTES Y OWNERSHIP:');
    const clients = await prisma.cliente.findMany({
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true,
        email: true,
        created_by: true
      },
      take: 10
    });
    
    clients.forEach(client => {
      console.log(`  ID: ${client.cliente_id} - ${client.nombre} ${client.apellido} - Owner: ${client.created_by}`);
    });

    // 6. Test de consulta con filtro de usuario
    console.log('\n🔍 PRUEBA DE FILTRO POR USUARIO (User ID 1):');
    const user1Clients = await prisma.cliente.findMany({
      where: { created_by: 1 },
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true
      }
    });
    console.log(`Clientes del usuario 1: ${user1Clients.length}`);
    user1Clients.forEach(client => {
      console.log(`  - ${client.nombre} ${client.apellido}`);
    });

    // 7. Probar casos de usuario 1
    console.log('\n📋 CASOS DEL USUARIO 1:');
    const user1Cases = await prisma.caso.findMany({
      where: {
        cliente: {
          created_by: 1
        }
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
    
    console.log(`Casos del usuario 1: ${user1Cases.length}`);
    user1Cases.forEach(caso => {
      console.log(`  Caso ${caso.caso_id}: ${caso.cliente.nombre} ${caso.cliente.apellido} - ${caso.tipo_tramite} (${caso.estado})`);
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

runDiagnostics();