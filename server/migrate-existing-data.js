// migrate-existing-data.js
// Ejecutar este script DESPUÉS de crear la migración pero ANTES de usar la app

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingData() {
  try {
    console.log('🔄 Iniciando migración de datos existentes...');
    
    // Obtener el primer usuario (o crear uno de prueba si no existe)
    let defaultUser = await prisma.usuariointerno.findFirst();
    
    if (!defaultUser) {
      console.log('❌ No se encontraron usuarios. Creando usuario por defecto...');
      
      // Crear un usuario por defecto si no existe ninguno
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      defaultUser = await prisma.usuariointerno.create({
        data: {
          nombre: 'Admin',
          apellido: 'Sistema',
          email: 'admin@doctrack.com',
          rol: 'preparador',
          contrase_a: hashedPassword
        }
      });
      
      console.log('✅ Usuario por defecto creado:', defaultUser.email);
    }
    
    // Contar todos los clientes (ya que el campo created_by es requerido)
    const totalClientes = await prisma.cliente.count();
    console.log(`📊 Encontrados ${totalClientes} clientes en la base de datos`);
    
    // Verificar si hay clientes que necesitan ser reasignados al usuario por defecto
    // (esto solo sería necesario si hubo problemas en la migración anterior)
    const clientesDelUsuario = await prisma.cliente.count({
      where: {
        created_by: defaultUser.usuario_id
      }
    });
    
    console.log(`📊 ${clientesDelUsuario} clientes ya asignados al usuario ${defaultUser.email}`);
    
    if (clientesDelUsuario < totalClientes) {
      // Hay algunos clientes asignados a otros usuarios, esto es normal
      console.log(`ℹ️  ${totalClientes - clientesDelUsuario} clientes asignados a otros usuarios`);
    }
    
    // Verificar resultados finales
    const clientesAsignados = await prisma.cliente.count({
      where: {
        created_by: { gte: 1 } // Todos los clientes deben tener un created_by válido
      }
    });
    
    console.log(`📊 Resumen final:`);
    console.log(`   Total clientes: ${totalClientes}`);
    console.log(`   Clientes asignados: ${clientesAsignados}`);
    console.log(`   Usuario por defecto ID: ${defaultUser.usuario_id}`);
    
    if (totalClientes === clientesAsignados) {
      console.log('🎉 Migración completada exitosamente!');
    } else {
      console.log('⚠️  Algunos clientes pueden no tener usuario asignado');
    }
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingData();