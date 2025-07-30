const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  const clients = await prisma.client.findMany({
    include: { cases: true }
  });
  res.json(clients);
});

// Crear cliente
router.post('/', async (req, res) => {
  const data = req.body;
  const newClient = await prisma.client.create({ data });
  res.json(newClient);
});

// Editar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.client.update({
    where: { id: parseInt(id) },
    data
  });
  res.json(updated);
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.client.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Cliente eliminado' });
});

module.exports = router;
