import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';

// Import controllers
import * as authController from '../controllers/authController.js';
import * as clientController from '../controllers/clientController.js';
import * as caseController from '../controllers/caseController.js';
import * as documentController from '../controllers/documentController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as utilityController from '../controllers/utilityController.js';

const router = express.Router();

// === AUTH ROUTES ===
router.post('/auth/login', authController.login);
router.post('/auth/google', authController.googleAuth);
router.post('/auth/google/callback', authController.googleAuthCallback);
router.post('/auth/register', authController.register);
router.post('/auth/logout', authController.logout);
router.get('/api/auth/profile', authRequired, authController.getProfile);

// === DASHBOARD ROUTES ===
router.get('/api/dashboard/stats', authRequired, dashboardController.getDashboardStats);
router.get('/api/dashboard/clientes-resumen', authRequired, dashboardController.getClientsResume);
router.get('/api/dashboard/casos-resumen', authRequired, dashboardController.getCasesResume);
router.get('/api/dashboard/checklist-pendientes', authRequired, dashboardController.getPendingChecklist);

// === CLIENT ROUTES ===
router.get('/api/clientes', authRequired, clientController.getClients);
router.post('/api/clientes', authRequired, clientController.createClient);
router.put('/api/clientes/:id', authRequired, clientController.updateClient);
router.delete('/api/clientes/:id', authRequired, clientController.deleteClient);

// === CASE ROUTES ===
router.get('/api/casos', authRequired, caseController.getCases);
router.get('/api/casos/:id', authRequired, caseController.getCaseById);
router.post('/api/casos', authRequired, caseController.createCase);
router.put('/api/casos/:id', authRequired, caseController.updateCase);
router.delete('/api/casos/:id', authRequired, caseController.deleteCase);

// === DOCUMENT ROUTES ===
router.post('/api/documentos', authRequired, documentController.createDocument);
router.patch('/api/documentos/:id/recibir', authRequired, documentController.markDocumentReceived);
router.get('/api/tramites/:tipo/documentos-requeridos', authRequired, documentController.getRequiredDocuments);
router.post('/api/casos/:casoId/documentos/desde-plantilla', authRequired, documentController.createDocumentsFromTemplate);
router.get('/api/casos/:casoId/documentos/stats', authRequired, documentController.getDocumentStats);
router.get('/api/casos/:casoId/documentos', authRequired, documentController.getCaseDocuments);
router.post('/api/documentos/upload', authRequired, upload.single('file'), documentController.uploadDocument);

// === UTILITY ROUTES ===
router.get('/api/procesos-disponibles', authRequired, utilityController.getAvailableProcesses);
router.get('/api/casos/validar-procesos', authRequired, utilityController.validateCaseProcesses);
router.patch('/api/casos/:casoId/actualizar-proceso', authRequired, utilityController.updateCaseProcess);
router.get('/api/debug/tables', authRequired, utilityController.debugTables);

export default router;