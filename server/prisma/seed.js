const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Use upsert to avoid unique constraint violations
  await prisma.user.upsert({
    where: { email: "admin@doctrack.com" },
    update: {},
    create: { email: "admin@doctrack.com", password: "admin123", role: "admin" }
  });

  await prisma.user.upsert({
    where: { email: "prep@doctrack.com" },
    update: {},
    create: { email: "prep@doctrack.com", password: "prep123", role: "preparador" }
  });

  // Check if client already exists before creating
  const existingClient = await prisma.client.findFirst({
    where: { name: "Juan Pérez", document: "Pasaporte" }
  });

  if (!existingClient) {
    await prisma.client.create({
      data: {
        name: "Juan Pérez",
        country: "México",
        document: "Pasaporte",
        address: "123 Calle Principal",
        entryDate: new Date("2022-01-15"),
        cases: {
          create: {
            type: "Asilo",
            status: "en proceso",
            checklist: "Identificación, Pruebas, Formulario I-589"
          }
        }
      }
    });
  }
}

main()
  .then(() => {
    console.log("✅ Seed ejecutado.");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
