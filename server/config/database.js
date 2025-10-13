import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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