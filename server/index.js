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

// Ajusta estos orígenes:
const FRONT_ORIGINS = [
  'http://localhost:5173',
  'https://doctrack-phnt.vercel.app'
];

app.use(
  cors({
    origin: (origin, cb) => {
      // permitir requests sin origin (Postman/Healthchecks)
      if (!origin) return cb(null, true);
      if (FRONT_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Origin no permitido por CORS: ' + origin), false);
    },
    credentials: true
  })
);

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
  // Cookies en dominios diferentes → SameSite=None + secure
  const common = {
    httpOnly: true,
    secure: true,        // Render usa HTTPS
    sameSite: 'none',    // porque front/back están en dominios distintos
    path: '/',           // envía a todo el sitio
  };
  res.cookie('doctrack_access', accessToken, { ...common, maxAge: 1000 * 60 * 60 }); // 1h (aunque el JWT sea 15m)
  res.cookie('doctrack_refresh', refreshToken, { ...common, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7d
}
function clearAuthCookies(res) {
  res.clearCookie('doctrack_access', { path: '/', sameSite: 'none', secure: true });
  res.clearCookie('doctrack_refresh', { path: '/', sameSite: 'none', secure: true });
}

// Middleware de autenticación (lee cookie de access)
function authRequired(req, res, next) {
  const token = req.cookies?.doctrack_access;
  if (!token) return res.status(401).json({ message: 'No autenticado' });
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload; // { sub, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// === ENDPOINTS ===

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Doctrack API', env: process.env.NODE_ENV || 'development' });
});

// 1) LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    // IMPORTANTE: en tu DB guarda el PASSWORD **hasheado**
    // Si aún guardas texto plano, primero corre un seed para hashearlos.
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    setAuthCookies(res, { accessToken, refreshToken });

    // Devuelve el usuario sin password
    const { password: _omit, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('LOGIN error:', err);
    return res.status(500).json({ message: 'Error en login' });
  }
});


// 2) LOGOUT
app.post('/api/auth/logout', (req, res) => {
  clearAuthCookies(res);
  return res.json({ ok: true });
});




// === START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Doctrack API escuchando en puerto ${PORT}`);
});
