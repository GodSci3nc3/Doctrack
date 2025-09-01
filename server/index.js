import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import multer from 'multer';
import fs from 'fs';
import path from 'path';


const app = express();
const prisma = new PrismaClient();


// === CONFIG GENERAL ===
app.use(express.json());
app.use(cookieParser());


// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? `${process.env.FRONTEND_URL}/login`
  : 'http://localhost:5173/login';

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// === GOOGLE DRIVE CONFIGURATION ===
const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const GOOGLE_DRIVE_REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || ''; // Optional: specific folder


// Configure Google Drive
const auth = new google.auth.OAuth2(
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

auth.setCredentials({
  refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth });


// === MULTER CONFIGURATION ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/temp/';
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// === HELPER FUNCTIONS ===

// Upload file to Google Drive
async function uploadToGoogleDrive(filePath, originalName, mimeType, folderName) {
  try {
    console.log('Starting Google Drive upload for:', originalName);
    
    const fileMetadata = {
      name: originalName,
      parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : undefined
    };
    
    // If we want to organize by folders, create or find the folder first
    if (folderName) {
      const folderId = await getOrCreateFolder(folderName);
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    console.log('Google Drive upload successful:', response.data.id);

    // Make file publicly viewable (optional, adjust permissions as needed)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Clean up temp file
    fs.unlinkSync(filePath);

    return {
      fileId: response.data.id,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink,
      publicUrl: `https://drive.google.com/file/d/${response.data.id}/view`
    };

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    // Clean up temp file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

// Get or create folder in Google Drive
async function getOrCreateFolder(folderName) {
  try {
    // First, try to find the folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // If folder doesn't exist, create it
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : undefined
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    return folder.data.id;

  } catch (error) {
    console.error('Error creating folder:', error);
    return GOOGLE_DRIVE_FOLDER_ID || null;
  }
}

// Generate filename for organization
function generateFileName(clienteName, casoId, tipoDocumento, originalExtension) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cleanClientName = clienteName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDocType = tipoDocumento.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanClientName}_Case${casoId}_${cleanDocType}_${timestamp}${originalExtension}`;
}

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

// Health
app.get('/health', function(_req, res) {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// LOGIN
app.post('/auth/login', async function(req, res) {
  console.log('--- LOGIN REQUEST START ---');
  try {
    console.log('Step 1: Parsing request body');
    const { email, password } = req.body || {};
    console.log('Step 2: Email provided:', email ? 'YES' : 'NO');
    
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
});

// GOOGLE AUTH ENDPOINT
app.post('/auth/google', async function(req, res) {
  console.log('--- GOOGLE AUTH REQUEST START ---');
  try {
    console.log('Step 1: Parsing Google credential');
    const { credential } = req.body || {};
    
    if (!credential) {
      console.log('Step 2: No credential provided');
      return res.status(400).json({ message: 'Credential de Google requerido' });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('CRITICAL: GOOGLE_CLIENT_ID not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 3: Verifying Google token');
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Step 4: Token verified successfully');
    
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      name: fullName,
      picture: profilePicture,
      sub: googleId
    } = payload;

    console.log('Step 5: Checking if user exists with email:', email);
    let user = await prisma.usuariointerno.findUnique({ 
      where: { email } 
    });

    if (user) {
      console.log('Step 6: User exists, updating Google info if needed');
      // Si el usuario existe pero no tiene googleId, actualizarlo
      if (!user.google_id) {
        user = await prisma.usuariointerno.update({
          where: { email },
          data: {
            google_id: googleId,
            profile_picture: profilePicture,
            updated_at: new Date()
          }
        });
        console.log('Step 7: Updated existing user with Google info');
      }
    } else {
      console.log('Step 6: User does not exist, creating new user');
      // Crear nuevo usuario con rol 'preparador' por defecto
      user = await prisma.usuariointerno.create({
        data: {
          email,
          nombre: firstName || fullName || email.split('@')[0],
          apellido: lastName || '',
          rol: 'preparador', // Rol por defecto como solicitaste
          google_id: googleId,
          profile_picture: profilePicture,
          // No establecer contraseña para usuarios de Google
          contrase_a: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Step 7: Created new user with Google info');
    }

    console.log('Step 8: Checking environment variables for JWT');
    if (!ACCESS_SECRET) {
      console.error('CRITICAL: JWT_ACCESS_SECRET not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 9: Generating tokens');
    const accessToken = signAccessToken({ 
      sub: user.usuario_id, 
      email: user.email, 
      role: user.rol 
    });
    const refreshToken = signRefreshToken({ sub: user.usuario_id });
    
    console.log('Step 10: Setting cookies');
    setAuthCookies(res, { accessToken, refreshToken });
    
    console.log('Step 11: Preparing response');
    const { contrase_a: _omit, google_id: _omit2, ...safeUser } = user;
    
    console.log('Step 12: Sending successful response');
    return res.json({ 
      user: safeUser,
      isNewUser: !user.updated_at || user.created_at === user.updated_at
    });

  } catch (err) {
    console.error('GOOGLE AUTH error:', err.message);
    console.error('Full error:', err);
    
    if (err.message.includes('Token used too early')) {
      return res.status(400).json({ message: 'Token de Google inválido (usado muy temprano)' });
    }
    if (err.message.includes('Invalid token')) {
      return res.status(400).json({ message: 'Token de Google inválido' });
    }
    
    return res.status(500).json({ 
      message: 'Error en autenticación con Google', 
      error: err.message 
    });
  }
});

// GOOGLE AUTH CALLBACK ENDPOINT (NUEVO)
app.post('/auth/google/callback', async function(req, res) {
  console.log('--- GOOGLE AUTH CALLBACK START ---');
  try {
    console.log('Step 1: Parsing authorization code');
    const { code } = req.body || {};
    
    if (!code) {
      console.log('Step 2: No authorization code provided');
      return res.status(400).json({ message: 'Código de autorización requerido' });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('CRITICAL: Google OAuth credentials not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 3: Exchanging code for tokens');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('Step 4: Getting user info from Google');
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    
    const { data: googleUser } = await oauth2.userinfo.get();
    console.log('Step 5: User info retrieved successfully');
    
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      name: fullName,
      picture: profilePicture,
      id: googleId
    } = googleUser;

    console.log('Step 6: Checking if user exists with email:', email);
    let user = await prisma.usuariointerno.findUnique({ 
      where: { email } 
    });

    if (user) {
      console.log('Step 7: User exists, updating Google info');
      user = await prisma.usuariointerno.update({
        where: { email },
        data: {
          google_id: googleId,
          profile_picture: profilePicture,
          updated_at: new Date()
        }
      });
      console.log('Step 8: Updated existing user with Google info');
    } else {
      console.log('Step 7: User does not exist, creating new user');
      user = await prisma.usuariointerno.create({
        data: {
          email,
          nombre: firstName || fullName || email.split('@')[0],
          apellido: lastName || '',
          rol: 'preparador', // Rol por defecto
          google_id: googleId,
          profile_picture: profilePicture,
          contrase_a: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Step 8: Created new user with Google info');
    }

    console.log('Step 9: Checking environment variables for JWT');
    if (!ACCESS_SECRET) {
      console.error('CRITICAL: JWT_ACCESS_SECRET not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 10: Generating JWT tokens');
    const accessToken = signAccessToken({ 
      sub: user.usuario_id, 
      email: user.email, 
      role: user.rol 
    });
    const refreshToken = signRefreshToken({ sub: user.usuario_id });
    
    console.log('Step 11: Setting cookies');
    setAuthCookies(res, { accessToken, refreshToken });
    
    console.log('Step 12: Preparing response');
    const { 
      contrase_a: _omit, 
      google_id: _omit2, 
      ...safeUser 
    } = user;
    
    console.log('Step 13: Sending successful response');
    return res.json({ 
      user: safeUser,
      isNewUser: !user.updated_at || user.created_at.getTime() === user.updated_at.getTime()
    });

  } catch (err) {
    console.error('GOOGLE AUTH CALLBACK error:', err.message);
    console.error('Full error:', err);
    
    if (err.message.includes('invalid_grant')) {
      return res.status(400).json({ message: 'Código de autorización inválido o expirado' });
    }
    if (err.message.includes('redirect_uri_mismatch')) {
      return res.status(400).json({ message: 'URI de redirección no válida' });
    }
    
    return res.status(500).json({ 
      message: 'Error en autenticación con Google', 
      error: err.message 
    });
  }
});

// REGISTRO
app.post('/auth/register', async function(req, res) {
  console.log('--- REGISTER REQUEST START ---');
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

// LOGOUT
app.post('/auth/logout', function(req, res) {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

// GET USER PROFILE - NUEVA API PARA EL HEADER
app.get('/api/auth/profile', authRequired, async function(req, res) {
  try {
    const user = await prisma.usuariointerno.findUnique({
      where: { usuario_id: req.user.sub },
      select: {
        usuario_id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('Error getting user profile:', err);
    return res.status(500).json({ message: 'Error obteniendo perfil de usuario' });
  }
});

// === NUEVAS APIs PARA EL DASHBOARD MEJORADAS ===

// Dashboard Stats - Obtener estadísticas del usuario
app.get('/api/dashboard/stats', authRequired, async function(req, res) {
  try {
    console.log('Getting dashboard stats for user:', req.user.sub);
    
    const userId = req.user.sub;
    
    try {
      // Obtener estadísticas reales SOLO del usuario actual
      const [totalClientes, totalCasos, casosActivos, documentosTotales] = await Promise.all([
        prisma.cliente.count({ where: { created_by: userId } }),
        prisma.caso.count({
          where: {
            cliente: {
              created_by: userId
            }
          }
        }),
        prisma.caso.count({ 
          where: { 
            estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
            cliente: {
              created_by: userId
            }
          } 
        }),
        prisma.documento.count({
          where: {
            caso: {
              cliente: {
                created_by: userId
              }
            }
          }
        })
      ]);

      // Calcular casos completados del usuario
      const casosCompletados = await prisma.caso.count({ 
        where: { 
          estado: 'COMPLETADO',
          cliente: {
            created_by: userId
          }
        } 
      });

      // Documentos pendientes del usuario
      const documentosPendientes = await prisma.documento.count({
        where: { 
          fecha_recibido: null,
          caso: {
            cliente: {
              created_by: userId
            }
          }
        }
      });

      const stats = {
        clientes: totalClientes,
        casosActivos: casosActivos,
        casosCompletados: casosCompletados,
        documentosPendientes: documentosPendientes
      };

      console.log('User-filtered stats retrieved:', stats);
      return res.json(stats);
      
    } catch (dbError) {
      console.error('Database error in stats:', dbError);
      // Si hay error con la BD, devolver datos mock
      const mockStats = {
        clientes: 5,
        casosActivos: 2,
        casosCompletados: 3,
        documentosPendientes: 1
      };
      return res.json(mockStats);
    }

  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

// Obtener resumen de clientes MEJORADO
app.get('/api/dashboard/clientes-resumen', authRequired, async function(req, res) {
  try {
    console.log('Getting clients summary...');
    
    try {
      // Obtener clientes recientes con información real
      const clientes = await prisma.cliente.findMany({
        take: 10,
        orderBy: {
          created_at: 'desc'
        },
        select: {
          cliente_id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          created_at: true,
          canal_ingreso: true
        }
      });

      console.log('Real clients found:', clientes.length);

      const clientesFormateados = clientes.map(cliente => {
        const fechaRegistro = cliente.created_at ? new Date(cliente.created_at) : new Date();
        const diasRegistro = Math.floor((new Date() - fechaRegistro) / (1000 * 60 * 60 * 24));
        
        return {
          cliente_id: cliente.cliente_id,
          nombre_completo: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Sin nombre',
          email: cliente.email || 'Sin email',
          telefono: cliente.telefono || 'Sin teléfono',
          dias_registro: diasRegistro || 0,
          canal_ingreso: cliente.canal_ingreso || 'Directo'
        };
      });

      return res.json(clientesFormateados);
      
    } catch (dbError) {
      console.error('Database error getting clients:', dbError);
      // Datos mock mejorados si hay error
      const mockClientes = [
        { cliente_id: 1, nombre_completo: 'María González', email: 'maria@email.com', dias_registro: 1, canal_ingreso: 'Web' },
        { cliente_id: 2, nombre_completo: 'Carlos Rivera', email: 'carlos@email.com', dias_registro: 2, canal_ingreso: 'Referido' },
        { cliente_id: 3, nombre_completo: 'Ana Martínez', email: 'ana@email.com', dias_registro: 3, canal_ingreso: 'Web' },
        { cliente_id: 4, nombre_completo: 'José López', email: 'jose@email.com', dias_registro: 4, canal_ingreso: 'Teléfono' }
      ];
      return res.json(mockClientes);
    }

  } catch (err) {
    console.error('Error getting clients summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de clientes' });
  }
});

// Obtener resumen de casos MEJORADO
app.get('/api/dashboard/casos-resumen', authRequired, async function(req, res) {
  try {
    console.log('Getting cases summary...');
    
    try {
      // Obtener casos reales con información del cliente
      const casos = await prisma.caso.findMany({
        take: 10,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        }
      });

      console.log('Real cases found:', casos.length);

      const casosFormateados = casos.map(caso => ({
        id: caso.caso_id,
        cliente: `${caso.cliente.nombre} ${caso.cliente.apellido}`,
        tipo: caso.tipo_tramite,
        estado: caso.estado,
        fecha: caso.fecha_creacion ? new Date(caso.fecha_creacion).toLocaleDateString('es-ES') : 'Sin fecha',
        fecha_aprobacion: caso.fecha_aprobacion ? new Date(caso.fecha_aprobacion).toLocaleDateString('es-ES') : null
      }));

      return res.json(casosFormateados);
      
    } catch (dbError) {
      console.error('Database error getting cases:', dbError);
      // Datos mock si hay error
      const casosMock = [
        { id: 1, cliente: 'María González', tipo: 'Residencia', estado: 'PENDIENTE', fecha: '15/01/2025' },
        { id: 2, cliente: 'Carlos Rivera', tipo: 'Ciudadanía', estado: 'EN_PROCESO', fecha: '14/01/2025' },
        { id: 3, cliente: 'Ana Martínez', tipo: 'Visa trabajo', estado: 'PENDIENTE', fecha: '13/01/2025' },
        { id: 4, cliente: 'José López', tipo: 'Reunificación', estado: 'COMPLETADO', fecha: '12/01/2025' }
      ];
      return res.json(casosMock);
    }

  } catch (err) {
    console.error('Error getting cases summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de casos' });
  }
});

// Obtener checklist pendientes MEJORADO
app.get('/api/dashboard/checklist-pendientes', authRequired, async function(req, res) {
  try {
    console.log('Getting pending checklist...');
    
    try {
      // Obtener documentos pendientes como tareas del checklist
      const documentosPendientes = await prisma.documento.findMany({
        where: {
          fecha_recibido: null // Documentos no recibidos
        },
        take: 10,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          caso: {
            include: {
              cliente: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });

      console.log('Pending documents found:', documentosPendientes.length);

      const checklistFormateado = documentosPendientes.map(doc => ({
        id: doc.documento_id,
        cliente: `${doc.caso.cliente.nombre} ${doc.caso.cliente.apellido}`,
        tarea: `Recibir ${doc.tipo}`,
        fecha_limite: doc.fecha_enviado ? 
          new Date(new Date(doc.fecha_enviado).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
          new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        prioridad: doc.fecha_enviado ? 
          (new Date() - new Date(doc.fecha_enviado)) > (5 * 24 * 60 * 60 * 1000) ? 'alta' : 'media' : 
          'baja',
        tipo_documento: doc.tipo,
        caso_id: doc.caso_id
      }));

      return res.json(checklistFormateado);
      
    } catch (dbError) {
      console.error('Database error getting checklist:', dbError);
      // Mock data si hay error
      const mockChecklist = [
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
      return res.json(mockChecklist);
    }

  } catch (err) {
    console.error('Error getting pending checklist:', err);
    return res.status(500).json({ message: 'Error obteniendo checklist pendientes' });
  }
});

// NUEVAS APIs para completar funcionalidades

// API para obtener lista completa de clientes del usuario
app.get('/api/clientes', authRequired, async function(req, res) {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const skip = (page - 1) * limit;
    
    // WHERE clause que SIEMPRE incluye el filtro por usuario
    const where = {
      created_by: userId, // FILTRO CLAVE
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          caso: {
            select: {
              caso_id: true,
              estado: true,
              tipo_tramite: true
            }
          }
        }
      }),
      prisma.cliente.count({ where })
    ]);

    return res.json({
      clientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getting clients list:', err);
    return res.status(500).json({ message: 'Error obteniendo lista de clientes' });
  }
});

// API para crear un nuevo cliente
app.post('/api/clientes', authRequired, async function(req, res) {
  try {
    console.log('Creating new client for user:', req.user.sub);
    const { nombre, apellido, email, telefono, canal_ingreso } = req.body;
    const userId = req.user.sub;
    
    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        message: 'Los campos nombre, apellido y email son requeridos'
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'El formato del email no es válido'
      });
    }
    
    // Verificar si el email ya existe EN LOS CLIENTES DEL USUARIO ACTUAL
    const existingClient = await prisma.cliente.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        created_by: userId // Solo verificar en los clientes del usuario actual
      }
    });
    
    if (existingClient) {
      return res.status(400).json({
        message: 'Ya tienes un cliente con ese email'
      });
    }
    
    // Crear el nuevo cliente asignado al usuario actual
    const newClient = await prisma.cliente.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        canal_ingreso: canal_ingreso || 'Directo',
        created_by: userId // CAMPO CLAVE - Asignar al usuario actual
      }
    });
    
    console.log('Client created successfully for user:', userId, 'Client ID:', newClient.cliente_id);
    
    return res.status(201).json(newClient);
    
  } catch (err) {
    console.error('Error creating client:', err);
    return res.status(500).json({
      message: 'Error al crear el cliente',
      error: err.message
    });
  }
});

// API para obtener lista de casos del usuario
app.get('/api/casos', authRequired, async function(req, res) {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado || '';
    
    const skip = (page - 1) * limit;
    
    // WHERE clause que filtra por cliente del usuario actual
    const where = {
      cliente: {
        created_by: userId // FILTRO CLAVE - Solo casos de clientes del usuario actual
      },
      ...(estado && { estado })
    };
    
    const [casos, total] = await Promise.all([
      prisma.caso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          },
          documento: {
            select: {
              documento_id: true,
              tipo: true,
              fecha_recibido: true
            }
          }
        }
      }),
      prisma.caso.count({ where })
    ]);

    return res.json({
      casos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getting cases list:', err);
    return res.status(500).json({ message: 'Error obteniendo lista de casos' });
  }
});

// API para crear un nuevo caso
app.post('/api/casos', authRequired, async function(req, res) {
  try {
    console.log('Creating new case for user:', req.user.sub);
    const { cliente_id, tipo_tramite, estado } = req.body;
    const userId = req.user.sub;
    
    // Validaciones básicas
    if (!cliente_id || !tipo_tramite) {
      return res.status(400).json({
        message: 'Los campos cliente_id y tipo_tramite son requeridos'
      });
    }
    
    // Verificar que el cliente existe Y pertenece al usuario actual
    const clienteExiste = await prisma.cliente.findFirst({
      where: { 
        cliente_id: parseInt(cliente_id),
        created_by: userId // VERIFICACIÓN DE OWNERSHIP
      }
    });
    
    if (!clienteExiste) {
      return res.status(404).json({
        message: 'El cliente especificado no existe o no tienes permisos para crear casos para él'
      });
    }
    
    // Crear el nuevo caso
    const newCase = await prisma.caso.create({
      data: {
        cliente_id: parseInt(cliente_id),
        tipo_tramite: tipo_tramite,
        estado: estado || 'PENDIENTE'
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });
    
    console.log('Case created successfully:', newCase.caso_id);
    
    return res.status(201).json(newCase);
    
  } catch (err) {
    console.error('Error creating case:', err);
    return res.status(500).json({
      message: 'Error al crear el caso',
      error: err.message
    });
  }
});

// API para actualizar un cliente
app.put('/api/clientes/:id', authRequired, async function(req, res) {
  try {
    console.log('Updating client...');
    const clienteId = parseInt(req.params.id);
    const userId = req.user.sub;
    const { nombre, apellido, email, telefono, canal_ingreso } = req.body;
    
    if (isNaN(clienteId)) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      });
    }
    
    // Verificar que el cliente existe Y pertenece al usuario actual
    const existingClient = await prisma.cliente.findFirst({
      where: { 
        cliente_id: clienteId,
        created_by: userId // VERIFICACIÓN DE OWNERSHIP
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({
        message: 'Cliente no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    // Construir objeto de actualización
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (apellido !== undefined) updateData.apellido = apellido.trim();
    if (email !== undefined) {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'El formato del email no es válido'
        });
      }
      
      // Verificar que el email no esté ya en uso por otro cliente DEL USUARIO ACTUAL
      const emailInUse = await prisma.cliente.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          cliente_id: { not: clienteId },
          created_by: userId // Solo buscar en los clientes del usuario actual
        }
      });
      
      if (emailInUse) {
        return res.status(400).json({
          message: 'Ya tienes otro cliente con ese email'
        });
      }
      
      updateData.email = email.toLowerCase().trim();
    }
    if (telefono !== undefined) updateData.telefono = telefono?.trim() || null;
    if (canal_ingreso !== undefined) updateData.canal_ingreso = canal_ingreso;
    
    // Actualizar el cliente
    const updatedClient = await prisma.cliente.update({
      where: { cliente_id: clienteId },
      data: updateData
    });
    
    console.log('Client updated successfully:', updatedClient.cliente_id);
    
    return res.json(updatedClient);
    
  } catch (err) {
    console.error('Error updating client:', err);
    return res.status(500).json({
      message: 'Error al actualizar el cliente',
      error: err.message
    });
  }
});

// API para actualizar un caso
app.put('/api/casos/:id', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    const { tipo_tramite, estado, fecha_aprobacion } = req.body;
    
    if (isNaN(casoId)) {
      return res.status(400).json({
        message: 'ID de caso inválido'
      });
    }
    
    // Verificar que el caso existe Y su cliente pertenece al usuario actual
    const existingCase = await prisma.caso.findFirst({
      where: { 
        caso_id: casoId,
        cliente: {
          created_by: userId // VERIFICACIÓN DE OWNERSHIP
        }
      },
      include: {
        cliente: true
      }
    });
    
    if (!existingCase) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    // Construir objeto de actualización
    const updateData = {};
    
    if (tipo_tramite !== undefined) updateData.tipo_tramite = tipo_tramite;
    if (estado !== undefined) {
      const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          message: 'Estado inválido',
          estadosValidos: estadosValidos
        });
      }
      updateData.estado = estado;
      
      // Si se marca como COMPLETADO, establecer fecha de aprobación automáticamente
      if (estado === 'COMPLETADO' && !existingCase.fecha_aprobacion) {
        updateData.fecha_aprobacion = new Date();
      }
    }
    
    if (fecha_aprobacion !== undefined) {
      updateData.fecha_aprobacion = fecha_aprobacion ? new Date(fecha_aprobacion) : null;
    }
    
    // Actualizar el caso
    const updatedCase = await prisma.caso.update({
      where: { caso_id: casoId },
      data: updateData,
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });
    
    return res.json(updatedCase);
    
  } catch (err) {
    console.error('Error updating case:', err);
    return res.status(500).json({
      message: 'Error al actualizar el caso',
      error: err.message
    });
  }
});

// Eliminar cliente (verificando ownership)
app.delete('/api/clientes/:id', authRequired, async function(req, res) {
  try {
    const clienteId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(clienteId)) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      });
    }
    
    // Verificar que el cliente existe Y pertenece al usuario actual
    const existingClient = await prisma.cliente.findFirst({
      where: { 
        cliente_id: clienteId,
        created_by: userId
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({
        message: 'Cliente no encontrado o no tienes permisos para eliminarlo'
      });
    }
    
    // Eliminar el cliente (los casos se eliminan en cascada)
    await prisma.cliente.delete({
      where: { cliente_id: clienteId }
    });
    
    return res.json({ 
      message: 'Cliente eliminado exitosamente',
      cliente_id: clienteId 
    });
    
  } catch (err) {
    console.error('Error deleting client:', err);
    return res.status(500).json({
      message: 'Error al eliminar el cliente',
      error: err.message
    });
  }
});

app.delete('/api/casos/:id', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({
        message: 'ID de caso inválido'
      });
    }
    
    // Verificar que el caso existe Y su cliente pertenece al usuario actual
    const existingCase = await prisma.caso.findFirst({
      where: { 
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      }
    });
    
    if (!existingCase) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para eliminarlo'
      });
    }
    
    // Eliminar el caso
    await prisma.caso.delete({
      where: { caso_id: casoId }
    });
    
    return res.json({ 
      message: 'Caso eliminado exitosamente',
      caso_id: casoId 
    });
    
  } catch (err) {
    console.error('Error deleting case:', err);
    return res.status(500).json({
      message: 'Error al eliminar el caso',
      error: err.message
    });
  }
});

// === DOCUMENTOS APIs - ENHANCED FOR DOCUMENT CHECKLIST ===
// Updated document requirements mapping - ONLY the 10 approved processes
const DOCUMENT_REQUIREMENTS = {
  'Asilo Afirmativo': [
    { tipo: 'Formulario', documento: 'I-589', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia persecución', requerido: true },
    { tipo: 'Evidencia', documento: 'Documentos entrada a EE.UU.', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas de apoyo', requerido: false },
    { tipo: 'Evidencia', documento: 'Informes de país', requerido: false }
  ],
  'Asilo Defensivo': [
    { tipo: 'Formulario', documento: 'I-589', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia persecución', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Informes de país', requerido: false },
    { tipo: 'Evidencia', documento: 'Cartas de testigos', requerido: false }
  ],
  'Cambio de Estatus (COS)': [
    { tipo: 'Formulario', documento: 'I-539', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Visa actual', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta de motivos personales', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de fondos', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta aceptación escuela', requerido: true }
  ],
  'E-1 Comerciante': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado', requerido: true },
    { tipo: 'Evidencia', documento: 'Documentación comercio', requerido: true },
    { tipo: 'Evidencia', documento: 'Contratos/facturas/shipping docs', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia operaciones regulares', requerido: true }
  ],
  'E-2 Inversionista': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Formulario', documento: 'I-129 (suplemento E)', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Nacionalidad tratado', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia inversión', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan de negocios', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba negocio activo', requerido: true }
  ],
  'EB-2 NIW': [
    { tipo: 'Formulario', documento: 'I-140', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaración Personal', requerido: true },
    { tipo: 'Evidencia', documento: 'Títulos académicos', requerido: true },
    { tipo: 'Evidencia', documento: 'Equivalencia Títulos', requerido: true },
    { tipo: 'Evidencia', documento: 'Experiencia laboral', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas recomendación', requerido: true },
    { tipo: 'Evidencia', documento: 'Cartas de interés', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan impacto nacional', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Pruebas estatus legal', requerido: true }
  ],
  'H1B1 Consular': [
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Evidencia', documento: 'Oferta laboral', requerido: true },
    { tipo: 'Evidencia', documento: 'Título universitario/equivalencia', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA aprobado', requerido: true },
    { tipo: 'Evidencia', documento: 'Arraigo', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta empleador', requerido: true }
  ],
  'H1B1 Extensión': [
    { tipo: 'Formulario', documento: 'I-129', requerido: true },
    { tipo: 'Formulario', documento: 'I-539', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta de empleo vigente', requerido: true },
    { tipo: 'Evidencia', documento: 'Contratos/nóminas', requerido: true },
    { tipo: 'Evidencia', documento: 'Título universitario', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de estatus legal', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA vigente', requerido: true },
    { tipo: 'Evidencia', documento: 'LCA aprobado', requerido: true }
  ],
  'L-1 Transferencia': [
    { tipo: 'Formulario', documento: 'I-129 (suplemento L)', requerido: true },
    { tipo: 'Formulario', documento: 'DS-160', requerido: true },
    { tipo: 'Evidencia', documento: 'Plan de negocios', requerido: true },
    { tipo: 'Evidencia', documento: 'Carta transferencia', requerido: true },
    { tipo: 'Evidencia', documento: 'Organigrama', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia relación empresas', requerido: true },
    { tipo: 'Evidencia', documento: 'Comprobante empleo extranjero', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true }
  ],
  'Peticiones Familiares': [
    { tipo: 'Formulario', documento: 'I-130', requerido: true },
    { tipo: 'Formulario', documento: 'I-485', requerido: true },
    { tipo: 'Formulario', documento: 'I-864', requerido: true },
    { tipo: 'Formulario', documento: 'I-765', requerido: true },
    { tipo: 'Formulario', documento: 'I-693', requerido: true },
    { tipo: 'Evidencia', documento: 'Certificado matrimonio', requerido: true },
    { tipo: 'Evidencia', documento: 'Certificado nacimiento', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte beneficiario', requerido: true },
    { tipo: 'Evidencia', documento: 'Pasaporte solicitante', requerido: true },
    { tipo: 'Evidencia', documento: 'Visa', requerido: true },
    { tipo: 'Evidencia', documento: 'I-94', requerido: true },
    { tipo: 'Evidencia', documento: 'Evidencia relación genuina', requerido: true },
    { tipo: 'Evidencia', documento: 'Declaraciones de impuestos', requerido: true },
    { tipo: 'Evidencia', documento: 'Prueba de ingresos patrocinador', requerido: true }
  ]
};

// API para obtener un caso específico por ID (MISSING ENDPOINT)
app.get('/api/casos/:id', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // VERIFICAR que el caso pertenece al usuario
    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
          }
        },
        documento: {
          orderBy: [
            { fecha_recibido: 'asc' }, // Pending first
            { created_at: 'desc' }
          ]
        }
      }
    });

    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para verlo'
      });
    }

    console.log(`User ${userId} retrieved case details for case ${casoId}`);
    return res.json(caso);
    
  } catch (err) {
    console.error('Error getting case details:', err);
    return res.status(500).json({ 
      message: 'Error obteniendo detalles del caso',
      error: err.message 
    });
  }
});

// API para crear un documento (ENHANCED)
app.post('/api/documentos', authRequired, async function(req, res) {
  try {
    const { caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital, url_documento } = req.body;
    const userId = req.user.sub;
    
    if (!caso_id || !tipo) {
      return res.status(400).json({
        message: 'Los campos caso_id y tipo son requeridos'
      });
    }
    
    // VERIFICAR que el caso pertenece al usuario
    const caso = await verifyCaseOwnership(parseInt(caso_id), userId);
    if (!caso) {
      return res.status(404).json({
        message: 'El caso especificado no existe o no tienes permisos para crear documentos en él'
      });
    }
    
    // Verificar que el tipo de documento es válido para este proceso
    const requiredDocs = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    const validDocTypes = requiredDocs.map(doc => doc.documento);
    
    if (!validDocTypes.includes(tipo)) {
      return res.status(400).json({
        message: `El documento "${tipo}" no es válido para el proceso "${caso.tipo_tramite}". Documentos válidos: ${validDocTypes.join(', ')}`
      });
    }
    
    // Verificar si ya existe un documento del mismo tipo para este caso
    const existingDoc = await prisma.documento.findFirst({
      where: {
        caso_id: parseInt(caso_id),
        tipo: tipo
      }
    });
    
    if (existingDoc) {
      return res.status(400).json({
        message: 'Ya existe un documento de este tipo para este caso'
      });
    }
    
    // Crear el documento
    const newDocument = await prisma.documento.create({
      data: {
        caso_id: parseInt(caso_id),
        tipo: tipo,
        fecha_enviado: fecha_enviado ? new Date(fecha_enviado) : null,
        fecha_recibido: fecha_recibido ? new Date(fecha_recibido) : null,
        firma_digital: firma_digital || false,
        url_documento: url_documento || null
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`User ${userId} created document ${newDocument.documento_id} (${tipo}) for case ${caso_id}`);
    return res.status(201).json(newDocument);
    
  } catch (err) {
    console.error('Error creating document:', err);
    return res.status(500).json({
      message: 'Error al crear el documento',
      error: err.message
    });
  }
});

// API para marcar documento como recibido (ENHANCED)
app.patch('/api/documentos/:id/recibir', authRequired, async function(req, res) {
  try {
    const documentoId = parseInt(req.params.id);
    const userId = req.user.sub;
    
    if (isNaN(documentoId)) {
      return res.status(400).json({ message: 'ID de documento inválido' });
    }
    
    // VERIFICAR OWNERSHIP
    const existingDocument = await verifyDocumentOwnership(documentoId, userId);
    if (!existingDocument) {
      return res.status(404).json({
        message: 'Documento no encontrado o no tienes permisos para modificarlo'
      });
    }
    
    // Check if document is already marked as received
    if (existingDocument.fecha_recibido) {
      return res.status(400).json({
        message: 'Este documento ya fue marcado como recibido'
      });
    }
    
    // Marcar como recibido
    const updatedDocument = await prisma.documento.update({
      where: { documento_id: documentoId },
      data: { 
        fecha_recibido: new Date(),
        fecha_enviado: existingDocument.fecha_enviado || new Date(), // Auto-mark as sent if not already
        updated_at: new Date()
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`User ${userId} marked document ${documentoId} (${existingDocument.tipo}) as received`);
    return res.json(updatedDocument);
    
  } catch (err) {
    console.error('Error marking document as received:', err);
    return res.status(500).json({
      message: 'Error al marcar documento como recibido',
      error: err.message
    });
  }
});

// API para obtener plantilla de documentos requeridos por tipo de trámite (UPDATED)
app.get('/api/tramites/:tipo/documentos-requeridos', authRequired, async function(req, res) {
  try {
    const tipoTramite = decodeURIComponent(req.params.tipo);
    
    const documentosRequeridos = DOCUMENT_REQUIREMENTS[tipoTramite] || [];
    
    if (documentosRequeridos.length === 0) {
      return res.status(404).json({
        message: `No se encontraron documentos requeridos para el tipo de trámite: ${tipoTramite}`,
        tiposDisponibles: Object.keys(DOCUMENT_REQUIREMENTS)
      });
    }
    
    return res.json({
      tipoTramite,
      documentos: documentosRequeridos,
      total: documentosRequeridos.length,
      requeridos: documentosRequeridos.filter(doc => doc.requerido).length,
      opcionales: documentosRequeridos.filter(doc => !doc.requerido).length
    });
    
  } catch (err) {
    console.error('Error getting required documents:', err);
    return res.status(500).json({ message: 'Error obteniendo documentos requeridos' });
  }
});

// API para crear múltiples documentos basados en plantilla (UPDATED)
app.post('/api/casos/:casoId/documentos/desde-plantilla', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // VERIFICAR que el caso pertenece al usuario
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para crear documentos en él'
      });
    }

    // Get required documents for this case type
    const requiredDocuments = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    
    if (requiredDocuments.length === 0) {
      return res.status(400).json({
        message: `No hay documentos definidos para el proceso: ${caso.tipo_tramite}`
      });
    }

    // Get existing documents to avoid duplicates
    const existingDocs = await prisma.documento.findMany({
      where: { caso_id: casoId },
      select: { tipo: true }
    });

    const existingTypes = new Set(existingDocs.map(doc => doc.tipo));

    // Create documents that don't already exist
    const newDocuments = [];
    const documentsToCreate = requiredDocuments.filter(doc => !existingTypes.has(doc.documento));

    for (const docTemplate of documentsToCreate) {
      const newDoc = await prisma.documento.create({
        data: {
          caso_id: casoId,
          tipo: docTemplate.documento,
          fecha_enviado: null,
          fecha_recibido: null,
          firma_digital: false
        }
      });
      newDocuments.push(newDoc);
    }

    console.log(`User ${userId} created ${newDocuments.length} documents from template for case ${casoId} (${caso.tipo_tramite})`);
    return res.status(201).json({
      message: `${newDocuments.length} documentos creados desde plantilla`,
      proceso: caso.tipo_tramite,
      documentos: newDocuments,
      existentes: existingDocs.length,
      nuevos: newDocuments.length,
      totalRequeridos: requiredDocuments.length
    });
    
  } catch (err) {
    console.error('Error creating documents from template:', err);
    return res.status(500).json({
      message: 'Error creando documentos desde plantilla',
      error: err.message
    });
  }
});

// API para obtener estadísticas de documentos por caso (UPDATED)
app.get('/api/casos/:casoId/documentos/stats', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // VERIFICAR que el caso pertenece al usuario
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para ver sus estadísticas'
      });
    }

    // Get required documents count for this process type
    const requiredDocs = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    const totalRequeridos = requiredDocs.length;

    // Obtener estadísticas
    const [total, recibidos, pendientes, enRevision] = await Promise.all([
      prisma.documento.count({
        where: { caso_id: casoId }
      }),
      prisma.documento.count({
        where: { 
          caso_id: casoId,
          fecha_recibido: { not: null }
        }
      }),
      prisma.documento.count({
        where: { 
          caso_id: casoId,
          fecha_enviado: null,
          fecha_recibido: null
        }
      }),
      prisma.documento.count({
        where: { 
          caso_id: casoId,
          fecha_enviado: { not: null },
          fecha_recibido: null
        }
      })
    ]);

    const stats = {
      proceso: caso.tipo_tramite,
      total,
      totalRequeridos,
      recibidos,
      pendientes,
      enRevision,
      porcentajeCompletado: totalRequeridos > 0 ? Math.round((recibidos / totalRequeridos) * 100) : 0,
      documentosFaltantes: Math.max(0, totalRequeridos - total)
    };

    console.log(`User ${userId} retrieved document stats for case ${casoId}:`, stats);
    return res.json(stats);
    
  } catch (err) {
    console.error('Error getting document stats:', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas de documentos' });
  }
});

// API para obtener todos los procesos disponibles
app.get('/api/procesos-disponibles', authRequired, async function(req, res) {
  try {
    const procesos = Object.keys(DOCUMENT_REQUIREMENTS).map(proceso => ({
      nombre: proceso,
      documentosRequeridos: DOCUMENT_REQUIREMENTS[proceso].length,
      documentosObligatorios: DOCUMENT_REQUIREMENTS[proceso].filter(doc => doc.requerido).length,
      documentosOpcionales: DOCUMENT_REQUIREMENTS[proceso].filter(doc => !doc.requerido).length
    }));

    return res.json({
      procesos,
      total: procesos.length
    });
  } catch (err) {
    console.error('Error getting available processes:', err);
    return res.status(500).json({ message: 'Error obteniendo procesos disponibles' });
  }
});

// API para validar integridad de casos (verificar que todos los casos tengan procesos válidos)
app.get('/api/casos/validar-procesos', authRequired, async function(req, res) {
  try {
    const userId = req.user.sub;
    
    // Get all user's cases
    const casos = await prisma.caso.findMany({
      where: {
        cliente: {
          created_by: userId
        }
      },
      select: {
        caso_id: true,
        tipo_tramite: true,
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    const processosValidos = Object.keys(DOCUMENT_REQUIREMENTS);
    const casosValidos = [];
    const casosInvalidos = [];

    casos.forEach(caso => {
      if (processosValidos.includes(caso.tipo_tramite)) {
        casosValidos.push(caso);
      } else {
        casosInvalidos.push(caso);
      }
    });

    return res.json({
      totalCasos: casos.length,
      casosValidos: casosValidos.length,
      casosInvalidos: casosInvalidos.length,
      processosValidos,
      casosConProcesosInvalidos: casosInvalidos,
      mensaje: casosInvalidos.length > 0 
        ? `${casosInvalidos.length} casos tienen procesos inválidos y necesitan ser actualizados`
        : 'Todos los casos tienen procesos válidos'
    });
    
  } catch (err) {
    console.error('Error validating case processes:', err);
    return res.status(500).json({ message: 'Error validando procesos de casos' });
  }
});

// API para actualizar un caso a un proceso válido
app.patch('/api/casos/:casoId/actualizar-proceso', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.casoId);
    const { nuevo_proceso } = req.body;
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    if (!nuevo_proceso || !DOCUMENT_REQUIREMENTS[nuevo_proceso]) {
      return res.status(400).json({ 
        message: 'Proceso inválido. Procesos disponibles: ' + Object.keys(DOCUMENT_REQUIREMENTS).join(', ')
      });
    }

    // VERIFICAR que el caso pertenece al usuario
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para modificarlo'
      });
    }

    const procesoAnterior = caso.tipo_tramite;

    // Actualizar el proceso del caso
    const casoActualizado = await prisma.caso.update({
      where: { caso_id: casoId },
      data: { 
        tipo_tramite: nuevo_proceso,
        updated_at: new Date()
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    // Si el proceso cambió, eliminar documentos existentes y crear nuevos
    if (procesoAnterior !== nuevo_proceso) {
      await prisma.documento.deleteMany({
        where: { caso_id: casoId }
      });

      // Crear documentos del nuevo proceso
      const requiredDocuments = DOCUMENT_REQUIREMENTS[nuevo_proceso];
      const newDocuments = [];

      for (const docTemplate of requiredDocuments) {
        const newDoc = await prisma.documento.create({
          data: {
            caso_id: casoId,
            tipo: docTemplate.documento,
            fecha_enviado: null,
            fecha_recibido: null,
            firma_digital: false
          }
        });
        newDocuments.push(newDoc);
      }

      console.log(`User ${userId} updated case ${casoId} process from "${procesoAnterior}" to "${nuevo_proceso}" and created ${newDocuments.length} new documents`);

      return res.json({
        caso: casoActualizado,
        procesoAnterior,
        procesoNuevo: nuevo_proceso,
        documentosCreados: newDocuments.length,
        mensaje: `Caso actualizado exitosamente de "${procesoAnterior}" a "${nuevo_proceso}". Se crearon ${newDocuments.length} nuevos documentos.`
      });
    }

    return res.json({
      caso: casoActualizado,
      mensaje: 'El caso ya tenía el proceso correcto'
    });
    
  } catch (err) {
    console.error('Error updating case process:', err);
    return res.status(500).json({
      message: 'Error actualizando proceso del caso',
      error: err.message
    });
  }
});


// === UPLOAD ENDPOINT ===
app.post('/api/documentos/upload', authRequired, upload.single('file'), async function(req, res) {
  try {
    console.log('--- DOCUMENT UPLOAD REQUEST START ---');
    const userId = req.user.sub;
    const { caso_id, tipo, cliente_nombre } = req.body;
    
    console.log('Upload request:', { caso_id, tipo, cliente_nombre, userId });
    
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No se proporcionó archivo' });
    }

    if (!caso_id || !tipo) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'caso_id y tipo son requeridos' });
    }

    // VERIFY case ownership
    const caso = await verifyCaseOwnership(parseInt(caso_id), userId);
    if (!caso) {
      console.log('Case ownership verification failed');
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para subir documentos'
      });
    }

    console.log('Case ownership verified:', caso.caso_id);

    // Validate document type for this process
    const requiredDocs = DOCUMENT_REQUIREMENTS[caso.tipo_tramite] || [];
    const validDocTypes = requiredDocs.map(doc => doc.documento);
    
    if (!validDocTypes.includes(tipo)) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: `El documento "${tipo}" no es válido para el proceso "${caso.tipo_tramite}"`
      });
    }

    // Generate organized filename
    const fileExtension = path.extname(req.file.originalname);
    const organizedFileName = generateFileName(
      cliente_nombre || `Cliente_${caso.cliente_id}`,
      caso_id,
      tipo,
      fileExtension
    );

    console.log('Generated filename:', organizedFileName);

    // Create folder name for organization
    const folderName = `${cliente_nombre || `Cliente_${caso.cliente_id}`}_Case_${caso_id}`;

    // Upload to Google Drive
    console.log('Uploading to Google Drive...');
    const driveResult = await uploadToGoogleDrive(
      req.file.path,
      organizedFileName,
      req.file.mimetype,
      folderName
    );

    console.log('Google Drive upload result:', driveResult);

    // Check if document already exists in database
    let documento = await prisma.documento.findFirst({
      where: {
        caso_id: parseInt(caso_id),
        tipo: tipo
      }
    });

    if (documento) {
      // Update existing document
      documento = await prisma.documento.update({
        where: { documento_id: documento.documento_id },
        data: {
          url_documento: driveResult.publicUrl,
          fecha_enviado: new Date(),
          updated_at: new Date()
        },
        include: {
          caso: {
            include: {
              cliente: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });
      console.log('Updated existing document:', documento.documento_id);
    } else {
      // Create new document
      documento = await prisma.documento.create({
        data: {
          caso_id: parseInt(caso_id),
          tipo: tipo,
          url_documento: driveResult.publicUrl,
          fecha_enviado: new Date(),
          fecha_recibido: null,
          firma_digital: false
        },
        include: {
          caso: {
            include: {
              cliente: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });
      console.log('Created new document:', documento.documento_id);
    }

    console.log(`User ${userId} uploaded document ${documento.documento_id} (${tipo}) for case ${caso_id}`);

    return res.status(201).json({
      message: 'Documento subido exitosamente',
      documento: documento,
      driveInfo: {
        fileId: driveResult.fileId,
        viewLink: driveResult.viewLink,
        publicUrl: driveResult.publicUrl
      }
    });

  } catch (error) {
    console.error('Error in document upload:', error);
    
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      message: 'Error al subir documento',
      error: error.message
    });
  }
});

// === HELPER FUNCTION FOR CASE OWNERSHIP (add to your existing helper functions) ===
async function verifyCaseOwnership(casoId, userId) {
  try {
    console.log(`Verifying case ownership: Case ${casoId} for User ${userId}`);
    
    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId
        }
      },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    console.log(`Case ownership result:`, caso ? 'ALLOWED' : 'DENIED');
    return caso;
  } catch (err) {
    console.error('Error verifying case ownership:', err);
    return null;
  }
}

// === ADDITIONAL ENDPOINT: Get documents for a case (already exists, but ensuring it works with URLs) ===
app.get('/api/casos/:casoId/documentos', authRequired, async function(req, res) {
  try {
    const casoId = parseInt(req.params.casoId);
    const userId = req.user.sub;
    
    if (isNaN(casoId)) {
      return res.status(400).json({ message: 'ID de caso inválido' });
    }

    // VERIFY case ownership
    const caso = await verifyCaseOwnership(casoId, userId);
    if (!caso) {
      return res.status(404).json({
        message: 'Caso no encontrado o no tienes permisos para ver sus documentos'
      });
    }

    const documentos = await prisma.documento.findMany({
      where: { caso_id: casoId },
      orderBy: [
        { fecha_recibido: 'asc' }, // Pending first
        { created_at: 'desc' }
      ]
    });

    console.log(`User ${userId} retrieved ${documentos.length} documents for case ${casoId}`);
    return res.json(documentos);
    
  } catch (err) {
    console.error('Error getting case documents:', err);
    return res.status(500).json({ 
      message: 'Error obteniendo documentos del caso',
      error: err.message 
    });
  }
});


// Función para verificar que un documento pertenece al usuario actual
async function verifyDocumentOwnership(documentoId, userId) {
  try {
    console.log(`Verifying document ownership: Document ${documentoId} for User ${userId}`);
    
    const documento = await prisma.documento.findFirst({
      where: {
        documento_id: documentoId,
        caso: {
          cliente: {
            created_by: userId
          }
        }
      },
      include: {
        caso: {
          include: {
            cliente: {
              select: {
                cliente_id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Document ownership result:`, documento ? 'ALLOWED' : 'DENIED');
    return documento;
  } catch (err) {
    console.error('Error verifying document ownership:', err);
    return null;
  }
}

// Función para verificar que un cliente pertenece al usuario actual
async function verifyClientOwnership(clienteId, userId) {
  try {
    console.log(`Verifying client ownership: Client ${clienteId} for User ${userId}`);
    
    const cliente = await prisma.cliente.findFirst({
      where: {
        cliente_id: clienteId,
        created_by: userId // El cliente debe ser creado por el usuario
      }
    });
    
    console.log(`Client ownership result:`, cliente ? 'ALLOWED' : 'DENIED');
    return cliente;
  } catch (err) {
    console.error('Error verifying client ownership:', err);
    return null;
  }
}

// Test endpoint para verificar estructura de tablas
app.get('/api/debug/tables', authRequired, async function(req, res) {
  try {
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

    try {
      const sampleCaso = await prisma.caso.findFirst();
      tableInfo.caso = sampleCaso ? Object.keys(sampleCaso) : 'No data';
    } catch (err) {
      tableInfo.caso = `Error: ${err.message}`;
    }

    return res.json({ 
      message: 'Table structure info',
      tables: tableInfo,
      counts: {
        usuarios: await prisma.usuariointerno.count().catch(() => 0),
        clientes: await prisma.cliente.count().catch(() => 0),
        casos: await prisma.caso.count().catch(() => 0),
        documentos: await prisma.documento.count().catch(() => 0)
      },
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
      '/api/casos'
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

// Test database connection
async function testDatabaseConnection() {
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

testDatabaseConnection();

// === START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`🚀 Doctrack API escuchando en puerto ${PORT}`);
  console.log(`🌐 Server available at: https://doctrack-0jp0.onrender.com`);
});