import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import configurations and middleware
import { testDatabaseConnection } from './config/database.js';
import { authRequired } from './middleware/auth.js';
import { upload } from './services/uploadService.js';

// Import controllers
import * as authController from './controllers/authController.js';
import * as clientController from './controllers/clientController.js';
import * as caseController from './controllers/caseController.js';
import * as documentController from './controllers/documentController.js';
import * as dashboardController from './controllers/dashboardController.js';
import * as utilityController from './controllers/utilityController.js';

const app = express();

// === GENERAL CONFIG ===
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: [
    'https://doctrack-phnt.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Set-Cookie',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Additional CORS middleware
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  if (origin === 'https://doctrack-phnt.vercel.app' || origin === 'http://localhost:5173') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie,Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Debug middleware
app.use(function(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// === ROUTES ===

// Health check
app.get('/health', function(_req, res) {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// === AUTH ROUTES ===
app.post('/auth/login', authController.login);
app.post('/auth/google', authController.googleAuth);
app.post('/auth/google/callback', authController.googleAuthCallback);
app.post('/auth/register', authController.register);
app.post('/auth/logout', authController.logout);
app.get('/api/auth/profile', authRequired, authController.getProfile);

// === DASHBOARD ROUTES ===
app.get('/api/dashboard/stats', authRequired, dashboardController.getDashboardStats);
app.get('/api/dashboard/clientes-resumen', authRequired, dashboardController.getClientsResume);
app.get('/api/dashboard/casos-resumen', authRequired, dashboardController.getCasesResume);
app.get('/api/dashboard/checklist-pendientes', authRequired, dashboardController.getPendingChecklist);

// === CLIENT ROUTES ===
app.get('/api/clientes', authRequired, clientController.getClients);
app.post('/api/clientes', authRequired, clientController.createClient);
app.put('/api/clientes/:id', authRequired, clientController.updateClient);
app.delete('/api/clientes/:id', authRequired, clientController.deleteClient);

// === CASE ROUTES ===
app.get('/api/casos', authRequired, caseController.getCases);
app.get('/api/casos/:id', authRequired, caseController.getCaseById);
app.post('/api/casos', authRequired, caseController.createCase);
app.put('/api/casos/:id', authRequired, caseController.updateCase);
app.delete('/api/casos/:id', authRequired, caseController.deleteCase);

// === DOCUMENT ROUTES ===
app.post('/api/documentos', authRequired, documentController.createDocument);
app.patch('/api/documentos/:id/recibir', authRequired, documentController.markDocumentReceived);
app.get('/api/tramites/:tipo/documentos-requeridos', authRequired, documentController.getRequiredDocuments);
app.post('/api/casos/:casoId/documentos/desde-plantilla', authRequired, documentController.createDocumentsFromTemplate);
app.get('/api/casos/:casoId/documentos/stats', authRequired, documentController.getDocumentStats);
app.get('/api/casos/:casoId/documentos', authRequired, documentController.getCaseDocuments);
app.post('/api/documentos/upload', authRequired, upload.single('file'), documentController.uploadDocument);

// === UTILITY ROUTES ===
app.get('/api/procesos-disponibles', authRequired, utilityController.getAvailableProcesses);
app.get('/api/casos/validar-procesos', authRequired, utilityController.validateCaseProcesses);
app.patch('/api/casos/:casoId/actualizar-proceso', authRequired, utilityController.updateCaseProcess);
app.get('/api/debug/tables', authRequired, utilityController.debugTables);

// Catch-all route for unmatched requests
app.all('*', function(req, res) {
  console.log(`Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    url: req.url,
    available_routes: [
      '/health', 
      '/auth/login', 
      '/auth/register', 
      '/auth/logout',
      '/api/auth/profile',
      '/api/dashboard/stats',
      '/api/dashboard/clientes-resumen',
      '/api/dashboard/casos-resumen',
      '/api/dashboard/checklist-pendientes',
      '/api/clientes',
      '/api/casos',
      '/api/documentos'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(function(err, req, res, next) {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Environment validation on startup
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '[SET]' : '[NOT SET]');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '[SET]' : '[NOT SET]');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '[SET]' : '[NOT SET]');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('================================');

// Test database connection on startup
testDatabaseConnection();

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`🚀 Doctrack API escuchando en puerto ${PORT}`);
  console.log(`🌐 Server available at: https://doctrack-0jp0.onrender.com`);
});
    