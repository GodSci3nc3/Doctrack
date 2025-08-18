import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// === CONFIG GENERAL ===
app.use(express.json());
app.use(cookieParser());

// CORS configuration - CORREGIDO
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

// MIDDLEWARE ADICIONAL PARA CORS
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

// Helpers para JWT y cookies
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.TOKEN_EXPIRES_IN || '15m';
const REFRESH_TTL = process.env.REFRESH_EXPIRES_IN || '7d';

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
function setAuthCookies(res, { accessToken, refreshToken }) {
  const common = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  };
  res.cookie('doctrack_access', accessToken, { ...common, maxAge: 1000 * 60 * 60 });
  res.cookie('doctrack_refresh', refreshToken, { ...common, maxAge: 1000 * 60 * 60 * 24 * 7 });
}
function clearAuthCookies(res) {
  res.clearCookie('doctrack_access', { path: '/', sameSite: 'none', secure: true });
  res.clearCookie('doctrack_refresh', { path: '/', sameSite: 'none', secure: true });
}

function authRequired(req, res, next) {
  const token = req.cookies?.doctrack_access;
  if (!token) return res.status(401).json({ message: 'No autenticado' });
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Debug middleware
app.use(function(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// === ENDPOINTS ===

// Health - CAMBIADO: sin /api
app.get('/health', function(_req, res) {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// LOGIN - CAMBIADO: sin /api
app.post('/auth/login', async function(req, res) {
  console.log('--- LOGIN REQUEST START ---');
  try {
    console.log('Step 1: Parsing request body');
    const { email, password } = req.body || {};
    console.log('Step 2: Email provided:', email ? 'YES' : 'NO');
    console.log('Step 3: Password provided:', password ? 'YES' : 'NO');
    
    if (!email || !password) {
      console.log('Step 4: Validation failed - missing credentials');
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    console.log('Step 5: Checking environment variables');
    if (!ACCESS_SECRET) {
      console.error('CRITICAL: JWT_ACCESS_SECRET not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 6: Querying database for user with email:', email);
    const user = await prisma.usuariointerno.findUnique({ where: { email } });
    console.log('Step 7: User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('Step 8: User not found - returning invalid credentials');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Step 9: Comparing password with hash');
    const ok = await bcrypt.compare(password, user.contrase_a);
    console.log('Step 10: Password match:', ok ? 'YES' : 'NO');
    
    if (!ok) {
      console.log('Step 11: Password mismatch - returning invalid credentials');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Step 12: Generating tokens');
    const accessToken = signAccessToken({ sub: user.usuario_id, email: user.email, role: user.rol });
    const refreshToken = signRefreshToken({ sub: user.usuario_id });
    console.log('Step 13: Tokens generated successfully');

    console.log('Step 14: Setting cookies');
    setAuthCookies(res, { accessToken, refreshToken });

    console.log('Step 15: Preparing response');
    const { contrase_a: _omit, ...safeUser } = user;
    console.log('Step 16: Sending successful response');
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('LOGIN error at step:', err.message);
    console.error('Full error:', err);
    return res.status(500).json({ message: 'Error en login', error: err.message });
  }
  console.log('--- LOGIN REQUEST END ---');
});

// REGISTRO - CAMBIADO: sin /api
app.post('/auth/register', async function(req, res) {
  console.log('--- REGISTER REQUEST START ---');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const { nombre, apellido, email, password, rol } = req.body || {};
    
    console.log('Received data:', { nombre, apellido, email, rol, passwordLength: password?.length });
    
    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !rol) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (!['preparador', 'soporte'].includes(rol)) {
      console.log('Validation failed: invalid role');
      return res.status(400).json({ message: 'Rol inválido' });
    }

    console.log('Checking if user exists...');
    // Verificar si el email ya existe
    const existingUser = await prisma.usuariointerno.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    console.log('Hashing password...');
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Creating user...');
    // Crear usuario
    const newUser = await prisma.usuariointerno.create({
      data: {
        nombre,
        apellido,
        email,
        contrase_a: hashedPassword,
        rol: rol
      }
    });

    console.log('User created successfully:', newUser.usuario_id);

    console.log('Generating tokens...');
    // Crear sesión automáticamente
    const accessToken = signAccessToken({ sub: newUser.usuario_id, email: newUser.email, role: newUser.rol });
    const refreshToken = signRefreshToken({ sub: newUser.usuario_id });

    console.log('Setting cookies...');
    setAuthCookies(res, { accessToken, refreshToken });

    const { contrase_a: _omit, ...safeUser } = newUser;
    
    console.log('Sending response...');
    return res.json({ 
      user: safeUser, 
      message: 'Registro exitoso. Bienvenido al sistema.' 
    });

  } catch (err) {
    console.error('REGISTER error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ message: 'Error en el registro', error: err.message });
  }
});

// LOGOUT - CAMBIADO: sin /api
app.post('/auth/logout', function(req, res) {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

// === NUEVAS APIs PARA EL DASHBOARD ===

// Dashboard Stats - Obtener estadísticas generales
app.get('/api/dashboard/stats', authRequired, async function(req, res) {
  try {
    console.log('Getting dashboard stats...');
    
    // Verificar conexión y estructura de tablas
    try {
      // Intentar obtener el conteo de clientes de la tabla 'cliente'
      const totalClientes = await prisma.cliente.count();
      console.log('Total clientes found:', totalClientes);
      
      // Por ahora usar datos mock para casos hasta que tengamos la tabla correspondiente
      const casosActivos = 45; 
      const casosCompletados = 75; 
      const documentosPendientes = 15; 

      const stats = {
        clientes: totalClientes,
        casosActivos,
        casosCompletados,
        documentosPendientes
      };

      return res.json(stats);
    } catch (dbError) {
      console.error('Database error in stats:', dbError);
      // Si hay error con la BD, devolver datos mock
      const mockStats = {
        clientes: 120,
        casosActivos: 45,
        casosCompletados: 75,
        documentosPendientes: 15
      };
      return res.json(mockStats);
    }

  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

// Obtener resumen de clientes
app.get('/api/dashboard/clientes-resumen', authRequired, async function(req, res) {
  try {
    console.log('Getting clients summary...');
    
    try {
      // Primero verificar qué campos existen en la tabla cliente
      const clientes = await prisma.cliente.findMany({
        take: 10,
        orderBy: {
          fecha_registro: 'desc'
        }
      });

      console.log('Sample client data:', clientes[0]);

      const clientesFormateados = clientes.map(cliente => {
        const fechaRegistro = cliente.fecha_registro ? new Date(cliente.fecha_registro) : new Date();
        const diasRegistro = Math.floor((new Date() - fechaRegistro) / (1000 * 60 * 60 * 24));
        
        return {
          cliente_id: cliente.cliente_id,
          nombre_completo: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Sin nombre',
          email: cliente.email || 'Sin email',
          telefono: cliente.telefono || 'Sin teléfono',
          dias_registro: diasRegistro || 0
        };
      });

      return res.json(clientesFormateados);
    } catch (dbError) {
      console.error('Database error getting clients:', dbError);
      // Devolver datos mock si hay error
      const mockClientes = [
        { cliente_id: 1, nombre_completo: 'María González', email: 'maria@email.com', dias_registro: 1 },
        { cliente_id: 2, nombre_completo: 'Carlos Rivera', email: 'carlos@email.com', dias_registro: 2 },
        { cliente_id: 3, nombre_completo: 'Ana Martínez', email: 'ana@email.com', dias_registro: 3 },
        { cliente_id: 4, nombre_completo: 'José López', email: 'jose@email.com', dias_registro: 4 }
      ];
      return res.json(mockClientes);
    }

  } catch (err) {
    console.error('Error getting clients summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de clientes' });
  }
});

// Obtener resumen de casos
app.get('/api/dashboard/casos-resumen', authRequired, async function(req, res) {
  try {
    console.log('Getting cases summary...');
    
    // Por ahora usar datos mock hasta que tengamos la tabla de casos
    // TODO: Implementar cuando tengamos la tabla de casos en la BD
    const casosResumen = [
      {
        id: 1,
        cliente: 'María González',
        tipo: 'Residencia',
        estado: 'En proceso',
        fecha: '15/01/2025',
        prioridad: 'media'
      },
      {
        id: 2,
        cliente: 'Carlos Rivera', 
        tipo: 'Ciudadanía',
        estado: 'Documentos',
        fecha: '14/01/2025',
        prioridad: 'alta'
      },
      {
        id: 3,
        cliente: 'Ana Martínez',
        tipo: 'Visa trabajo',
        estado: 'Revisión',
        fecha: '13/01/2025',
        prioridad: 'baja'
      },
      {
        id: 4,
        cliente: 'José López',
        tipo: 'Reunificación',
        estado: 'Aprobado',
        fecha: '12/01/2025',
        prioridad: 'completado'
      }
    ];

    return res.json(casosResumen);
  } catch (err) {
    console.error('Error getting cases summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de casos' });
  }
});

// Obtener checklist pendientes
app.get('/api/dashboard/checklist-pendientes', authRequired, async function(req, res) {
  try {
    console.log('Getting pending checklist...');
    
    // Mock data para checklist - TODO: Implementar con tabla real
    const checklistPendientes = [
      {
        id: 1,
        cliente: 'María González',
        tarea: 'Revisar documentos de identidad',
        fecha_limite: '2025-01-20',
        prioridad: 'alta'
      },
      {
        id: 2,
        cliente: 'Carlos Rivera',
        tarea: 'Completar formulario I-485',
        fecha_limite: '2025-01-18',
        prioridad: 'media'
      },
      {
        id: 3,
        cliente: 'Ana Martínez',
        tarea: 'Agendar entrevista',
        fecha_limite: '2025-01-25',
        prioridad: 'baja'
      }
    ];

    return res.json(checklistPendientes);
  } catch (err) {
    console.error('Error getting pending checklist:', err);
    return res.status(500).json({ message: 'Error obteniendo checklist pendientes' });
  }
});

// Test endpoint para verificar estructura de tablas
app.get('/api/debug/tables', authRequired, async function(req, res) {
  try {
    // Verificar tablas disponibles
    const tableInfo = {};
    
    try {
      const sampleUsuario = await prisma.usuariointerno.findFirst();
      tableInfo.usuariointerno = sampleUsuario ? Object.keys(sampleUsuario) : 'No data';
    } catch (err) {
      tableInfo.usuariointerno = `Error: ${err.message}`;
    }

    try {
      const sampleCliente = await prisma.cliente.findFirst();
      tableInfo.cliente = sampleCliente ? Object.keys(sampleCliente) : 'No data';
    } catch (err) {
      tableInfo.cliente = `Error: ${err.message}`;
    }

    return res.json({ 
      message: 'Table structure info',
      tables: tableInfo,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error checking table structure:', err);
    return res.status(500).json({ message: 'Error verificando estructura de tablas' });
  }
});

// Catch-all route for unmatched requests
app.all('*', function(req, res) {
  console.log(`Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    url: req.url,
    available_routes: ['/health', '/auth/login', '/auth/register', '/auth/logout', '/api/dashboard/stats'],
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

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const userCount = await prisma.usuariointerno.count();
    console.log(`✅ Found ${userCount} users in usuariointerno table`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabaseConnection();

// === START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`🚀 Doctrack API escuchando en puerto ${PORT}`);
  console.log(`🌐 Server available at: https://doctrack-0jp0.onrender.com`);
});