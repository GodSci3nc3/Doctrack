import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { prisma } from '../config/database.js';
import { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies } from '../middleware/auth.js';

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || (
  process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/auth/google/callback`
    : 'http://localhost:3001/auth/google/callback'
);

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const login = async (req, res) => {
  console.log('=== LOGIN REQUEST START ===');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  
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
    
    // Verificar que las cookies se establecieron correctamente
    console.log('Step 16: Cookies set in response:', res.getHeaders()['set-cookie']);
    
    console.log('Step 17: Sending successful response with auth info');
    return res.json({ 
      user: safeUser,
      auth: {
        isAuthenticated: true,
        tokenExpires: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
      }
    });
  } catch (err) {
    console.error('LOGIN error at step:', err.message);
    console.error('Full error:', err);
    return res.status(500).json({ message: 'Error en login', error: err.message });
  }
};

// GET /auth/google - Iniciar flujo de OAuth
export const googleAuthRedirect = async (req, res) => {
  console.log('--- GOOGLE AUTH REDIRECT START ---');
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('CRITICAL: Google OAuth credentials not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Configurar OAuth2 client
    oauth2Client.setCredentials({});
    
    // Generar URL de autorización - Solo login básico
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'profile',
        'email'
      ],
      prompt: 'consent'
    });

    console.log('Redirecting to Google Auth URL');
    res.redirect(authUrl);
  } catch (error) {
    console.error('GOOGLE AUTH REDIRECT error:', error.message);
    res.status(500).json({ message: 'Error al iniciar autenticación con Google' });
  }
};

export const googleAuth = async (req, res) => {
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
      user = await prisma.usuariointerno.create({
        data: {
          email,
          nombre: firstName || fullName || email.split('@')[0],
          apellido: lastName || '',
          rol: 'preparador',
          google_id: googleId,
          profile_picture: profilePicture,
          contrase_a: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Step 7: Created new user with Google info');
    }

      // Paso extra: Dar permisos de editor en la carpeta de Google Drive
      try {
        const { addEditorToRootFolderWithPersonalToken } = await import('../services/drivePermissionService.js');
        if (user.email) {
          const success = await addEditorToRootFolderWithPersonalToken({ userEmail: user.email });
          if (success) {
            console.log(`[DRIVE] Permiso de editor otorgado a ${user.email} en carpeta raíz`);
          } else {
            console.error(`[DRIVE] Error al otorgar permiso de editor a ${user.email}`);
          }
        } else {
          console.warn('No se encontró email para el usuario, no se puede otorgar permiso de editor en Drive.');
        }
      } catch (err) {
        console.error('[DRIVE] Error al intentar otorgar permisos de Drive:', err.message);
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
};

export const googleAuthCallback = async (req, res) => {
  console.log('--- GOOGLE AUTH CALLBACK START ---');
  try {
    console.log('Step 1: Parsing authorization code');
    console.log('[DEBUG] Request method:', req.method);
    console.log('[DEBUG] Request body:', req.body);
    console.log('[DEBUG] Request query:', req.query);
    console.log('[DEBUG] Request headers:', req.headers);
    
    // Manejar tanto GET (query) como POST (body)
    const { code } = req.query || req.body || {};
    
    console.log('[DEBUG] Extracted code:', code ? code.substring(0, 20) + '...' : 'NULL');
    
    if (!code) {
      console.log('Step 2: No authorization code provided');
      console.log('[DEBUG] req.body:', req.body);
      console.log('[DEBUG] req.query:', req.query);
      return res.status(400).json({ message: 'Código de autorización requerido' });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('CRITICAL: Google OAuth credentials not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Step 3: Exchanging code for tokens');
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Guardar el access_token y refresh_token en el usuario
  const googleAccessToken = tokens.access_token;
  const googleRefreshToken = tokens.refresh_token;
    
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
          google_token: googleAccessToken,
          google_refresh_token: googleRefreshToken,
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
          rol: 'preparador',
          google_id: googleId,
          profile_picture: profilePicture,
          google_token: googleAccessToken,
          google_refresh_token: googleRefreshToken,
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
    
    // Si es GET (redirección desde el modal), redirigir al frontend
    if (req.method === 'GET') {
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://your-frontend-url.com'
        : 'http://localhost:5173';
      
      // Redirigir a /cases por defecto o usar sessionStorage si está disponible
      return res.redirect(`${frontendUrl}/cases`);
    }
    
    // Si es POST (desde login), devolver JSON
    return res.json({ 
      user: safeUser,
      isNewUser: !user.updated_at || user.created_at.getTime() === user.updated_at.getTime()
    });

  } catch (err) {
    console.error('GOOGLE AUTH CALLBACK error:', err.message);
    console.error('Full error:', err);
    
    // Si es GET (redirección), redirigir al frontend con error
    if (req.method === 'GET') {
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://your-frontend-url.com'
        : 'http://localhost:5173';
      
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
    
    // Si es POST, devolver JSON con error
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
};

export const register = async (req, res) => {
  console.log('--- REGISTER REQUEST START ---');
  try {
    const { nombre, apellido, email, password, rol } = req.body || {};
    
    console.log('Received data:', { nombre, apellido, email, rol, passwordLength: password?.length });
    
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
    const existingUser = await prisma.usuariointerno.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Creating user...');
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
};

export const logout = (req, res) => {
  clearAuthCookies(res);
  return res.json({ ok: true });
};

export const getProfile = async (req, res) => {
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
};