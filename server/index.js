import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';

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

// === MULTER CONFIG FOR SUPABASE ===
const supabaseUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// === GENERAL CONFIG ===
app.use(cookieParser());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Configuración CORS unificada
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction
  ? [
      'https://doctrack-0jp0.onrender.com',
      'https://doctrack-frontend-fehq.onrender.com',
      'https://doctrack.vercel.app'
    ]
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' })); // Aumentar límite para archivos
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Eliminar configuraciones redundantes y cabeceras manuales para evitar conflictos

// Debug middleware
app.use(function(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  console.log('Cabeceras:', req.headers);
  next();
});

// === ROUTES ===

// Health check
app.get('/health', function(_req, res) {
  res.json({ 
    ok: true, 
    service: 'Doctrack API', 
    env: process.env.NODE_ENV || 'development',
    supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  });
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

// === DOCUMENT ROUTES (UPDATED WITH SUPABASE STORAGE) ===
// CRUD de documentos
app.post('/api/documentos', authRequired, documentController.createDocument);
app.put('/api/documentos/:id', authRequired, documentController.updateDocument);
app.delete('/api/documentos/:id', authRequired, documentController.deleteDocument);
app.patch('/api/documentos/:id/recibir', authRequired, documentController.markDocumentReceived);

// Subida y descarga de archivos con Supabase
app.post('/api/documentos/upload', authRequired, supabaseUpload.single('file'), documentController.uploadDocument);
app.get('/api/documentos/:id/file', authRequired, documentController.getDocumentFile);

// Consultas de documentos
app.get('/api/documentos/casos/:casoId', authRequired, documentController.getCaseDocuments);
app.get('/api/documentos/casos/:casoId/stats', authRequired, documentController.getDocumentStats);
app.get('/api/documentos/requeridos/:tipo', authRequired, documentController.getRequiredDocuments);

// RUTAS LEGACY (mantenidas por compatibilidad)
app.get('/api/tramites/:tipo/documentos-requeridos', authRequired, documentController.getRequiredDocuments);
//app.post('/api/casos/:casoId/documentos/desde-plantilla', authRequired, documentController.createDocumentsFromTemplate);
app.get('/api/casos/:casoId/documentos/stats', authRequired, documentController.getDocumentStats);
app.get('/api/casos/:casoId/documentos', authRequired, documentController.getCaseDocuments);

// === UTILITY ROUTES ===
app.get('/api/procesos-disponibles', authRequired, utilityController.getAvailableProcesses);
app.get('/api/casos/validar-procesos', authRequired, utilityController.validateCaseProcesses);
app.patch('/api/casos/:casoId/actualizar-proceso', authRequired, utilityController.updateCaseProcess);
app.get('/api/debug/tables', authRequired, utilityController.debugTables);

// === MULTER ERROR HANDLING ===
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'El archivo es muy grande. Tamaño máximo: 10MB'
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({
      message: 'Tipo de archivo no permitido. Use PDF, JPG, PNG o DOC.'
    });
  }
  
  next(error);
});

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
      '/api/documentos',
      '/api/documentos/upload',
      '/api/documentos/casos/:casoId'
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

// === CONFIGURACIÓN DE VARIABLES DE ENTORNO ===
const requiredEnvVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`⚠️ La variable de entorno ${envVar} no está configurada. La aplicación podría no funcionar correctamente.`);
  }
});

// Environment validation on startup
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '[SET]' : '[NOT SET]');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '[SET]' : '[NOT SET]');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '[SET]' : '[NOT SET]');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('================================');

// Test database connection on startup
testDatabaseConnection();

// === START SERVER ===
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Doctrack API escuchando en puerto ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ El puerto ${PORT} está en uso. Intentando con otro puerto...`);
    const newPort = parseInt(PORT) + 1;
    server.listen(newPort, () => {
      console.log(`🚀 Doctrack API ahora escuchando en puerto ${newPort}`);
    });
  } else {
    console.error('Error inesperado en el servidor:', err);
  }
});