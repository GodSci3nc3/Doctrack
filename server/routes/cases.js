const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los casos
router.get('/', async (req, res) => {
  const cases = await prisma.case.findMany({
    include: { client: true }
  });
  res.json(cases);
});

// Crear nuevo caso
router.post('/', async (req, res) => {
  const data = req.body;
  const newCase = await prisma.case.create({ data });
  res.json(newCase);
});

// Editar caso
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.case.update({
    where: { id: parseInt(id) },
    data
  });
  res.json(updated);
});

// Eliminar caso
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.case.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Caso eliminado' });
});

module.exports = router;
