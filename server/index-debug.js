import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import configurations and middleware
import { testDatabaseConnection } from './config/database.js';
import { authRequired } from './middleware/auth.js';
import { upload } from './services/uploadService.js';

// Import controllers with detailed debugging
console.log('=== IMPORTING CONTROLLERS ===');

console.log('Importing authController...');
import * as authController from './controllers/authController.js';
console.log('authController methods:', Object.keys(authController));

console.log('Importing clientController...');
import * as clientController from './controllers/clientController.js';
console.log('clientController methods:', Object.keys(clientController));

console.log('Importing caseController...');
import * as caseController from './controllers/caseController.js';
console.log('caseController methods:', Object.keys(caseController));

console.log('Importing documentController...');
import * as documentController from './controllers/documentController.js';
console.log('documentController methods:', Object.keys(documentController));

console.log('Importing dashboardController...');
import * as dashboardController from './controllers/dashboardController.js';
console.log('dashboardController methods:', Object.keys(dashboardController));

console.log('Importing utilityController...');
import * as utilityController from './controllers/utilityController.js';
console.log('utilityController methods:', Object.keys(utilityController));

console.log('=== CONTROLLERS IMPORTED ===');

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

// === ROUTES WITH VALIDATION ===

// Health check
app.get('/health', function(_req, res) {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// Helper function to validate and register routes
function registerRoute(app, method, path, ...handlers) {
  console.log(`\n--- Registering ${method.toUpperCase()} ${path} ---`);
  
  // Validate all handlers
  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i];
    console.log(`Handler ${i + 1}:`, typeof handler, handler?.name || 'anonymous');
    
    if (typeof handler !== 'function') {
      console.error(`❌ ERROR: Handler ${i + 1} is not a function:`, handler);
      console.error(`This will cause the "requires a callback function" error`);
      process.exit(1);
    }
  }
  
  // Register the route
  app[method](path, ...handlers);
  console.log(`✅ Route registered successfully`);
}

console.log('\n=== REGISTERING AUTH ROUTES ===');
registerRoute(app, 'post', '/auth/login', authController.login);
registerRoute(app, 'post', '/auth/google', authController.googleAuth);
registerRoute(app, 'post', '/auth/google/callback', authController.googleAuthCallback);
registerRoute(app, 'post', '/auth/register', authController.register);
registerRoute(app, 'post', '/auth/logout', authController.logout);
registerRoute(app, 'get', '/api/auth/profile', authRequired, authController.getProfile);

console.log('\n=== REGISTERING DASHBOARD ROUTES ===');
registerRoute(app, 'get', '/api/dashboard/stats', authRequired, dashboardController.getDashboardStats);
registerRoute(app, 'get', '/api/dashboard/clientes-resumen', authRequired, dashboardController.getClientsResume);
registerRoute(app, 'get', '/api/dashboard/casos-resumen', authRequired, dashboardController.getCasesResume);
registerRoute(app, 'get', '/api/dashboard/checklist-pendientes', authRequired, dashboardController.getPendingChecklist);

console.log('\n=== REGISTERING CLIENT ROUTES ===');
registerRoute(app, 'get', '/api/clientes', authRequired, clientController.getClients);
registerRoute(app, 'post', '/api/clientes', authRequired, clientController.createClient);
registerRoute(app, 'put', '/api/clientes/:id', authRequired, clientController.updateClient);
registerRoute(app, 'delete', '/api/clientes/:id', authRequired, clientController.deleteClient);

console.log('\n=== REGISTERING CASE ROUTES ===');
registerRoute(app, 'get', '/api/casos', authRequired, caseController.getCases);
registerRoute(app, 'get', '/api/casos/:id', authRequired, caseController.getCaseById);
registerRoute(app, 'post', '/api/casos', authRequired, caseController.createCase);
registerRoute(app, 'put', '/api/casos/:id', authRequired, caseController.updateCase);
registerRoute(app, 'delete', '/api/casos/:id', authRequired, caseController.deleteCase);

console.log('\n=== REGISTERING DOCUMENT ROUTES ===');
registerRoute(app, 'post', '/api/documentos', authRequired, documentController.createDocument);
registerRoute(app, 'patch', '/api/documentos/:id/recibir', authRequired, documentController.markDocumentReceived);
registerRoute(app, 'get', '/api/tramites/:tipo/documentos-requeridos', authRequired, documentController.getRequiredDocuments);
registerRoute(app, 'post', '/api/casos/:casoId/documentos/desde-plantilla', authRequired, documentController.createDocumentsFromTemplate);
registerRoute(app, 'get', '/api/casos/:casoId/documentos/stats', authRequired, documentController.getDocumentStats);
registerRoute(app, 'get', '/api/casos/:casoId/documentos', authRequired, documentController.getCaseDocuments);
registerRoute(app, 'post', '/api/documentos/upload', authRequired, upload.single('file'), documentController.uploadDocument);

console.log('\n=== REGISTERING UTILITY ROUTES ===');
registerRoute(app, 'get', '/api/procesos-disponibles', authRequired, utilityController.getAvailableProcesses);
registerRoute(app, 'get', '/api/casos/validar-procesos', authRequired, utilityController.validateCaseProcesses);
registerRoute(app, 'patch', '/api/casos/:casoId/actualizar-proceso', authRequired, utilityController.updateCaseProcess);
registerRoute(app, 'get', '/api/debug/tables', authRequired, utilityController.debugTables);

console.log('\n=== ALL ROUTES REGISTERED SUCCESSFULLY ===');

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
console.log('\n=== ENVIRONMENT VARIABLES ===');
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