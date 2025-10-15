import { PrismaClient } from '@prisma/client';

// Configuración optimizada para producción con pool de conexiones
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configuración del pool de conexiones para mejor rendimiento
  connectionPool: {
    maxOpenConnections: 10,
    maxIdleTime: 30000, // 30 segundos
  },
  // Optimizaciones adicionales
  transactionOptions: {
    timeout: 10000, // 10 segundos timeout
  },
});

// Test database connection
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const userCount = await prisma.usuariointerno.count();
    console.log(`✅ Found ${userCount} users in usuariointerno table`);
    
    const clientCount = await prisma.cliente.count();
    console.log(`✅ Found ${clientCount} clients in cliente table`);
    
    const caseCount = await prisma.caso.count().catch(() => 0);
    console.log(`✅ Found ${caseCount} cases in caso table`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

export { prisma };