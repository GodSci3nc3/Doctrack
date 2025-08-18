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

// CORS configuration - more permissive for proper preflight handling
app.use(cors({
  origin: [
    'https://doctrack-phnt.vercel.app',
    'http://localhost:5173' // Para desarrollo local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Set-Cookie',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

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

// Middleware de autenticación
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

// Debug middleware to log all requests
app.use(function(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Global OPTIONS handler for all routes
app.options('*', function(req, res) {
  console.log('OPTIONS request received for:', req.url);
  res.status(200).end();
});

// === ENDPOINTS ===

// Health
app.get('/api/health', function(_req, res) {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// LOGIN
app.post('/api/auth/login', async function(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const user = await prisma.usuariointerno.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.contrase_a);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    setAuthCookies(res, { accessToken, refreshToken });

    const { password: _omit, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('LOGIN error:', err);
    return res.status(500).json({ message: 'Error en login' });
  }
});

// REGISTRO
app.post('/api/auth/register', async function(req, res) {
  try {
    const { nombre, apellidos, email, password, rol } = req.body || {};
    
    // Validaciones básicas
    if (!nombre || !apellidos || !email || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (!['preparador', 'soporte'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        nombre,
        apellidos,
        email,
        password: hashedPassword,
        role: rol,
        // Si es preparador se aprueba automáticamente, si es soporte queda pendiente
        status: rol === 'preparador' ? 'active' : 'pending'
      }
    });

    // Si es preparador, crear sesión automáticamente
    if (rol === 'preparador') {
      const accessToken = signAccessToken({ sub: newUser.id, email: newUser.email, role: newUser.role });
      const refreshToken = signRefreshToken({ sub: newUser.id });

      setAuthCookies(res, { accessToken, refreshToken });

      const { password: _omit, ...safeUser } = newUser;
      return res.json({ 
        user: safeUser, 
        message: 'Registro exitoso. Bienvenido al sistema.' 
      });
    } else {
      // Si es soporte, solo confirmar registro sin crear sesión
      return res.json({ 
        message: 'Registro enviado correctamente. Tu cuenta está pendiente de aprobación por el equipo de soporte técnico.',
        pending: true 
      });
    }

  } catch (err) {
    console.error('REGISTER error:', err);
    return res.status(500).json({ message: 'Error en el registro' });
  }
});

// LOGOUT
app.post('/api/auth/logout', function(req, res) {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

// Catch-all route for unmatched requests
app.all('*', function(req, res) {
  console.log(`Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    url: req.url,
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

// === START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Doctrack API escuchando en puerto ${PORT}`);
});
