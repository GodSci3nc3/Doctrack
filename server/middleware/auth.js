import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.TOKEN_EXPIRES_IN || '15m';
const REFRESH_TTL = process.env.REFRESH_EXPIRES_IN || '7d';

export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  console.log('Setting auth cookies...');
  
  // Determine if running on localhost to allow cookies over HTTP in development
  const host = res.req.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const isProduction = process.env.NODE_ENV === 'production' && !isLocalhost;
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isLocalhost ? 'lax' : 'none',
    path: '/',
    // Do not set domain for localhost, in production you can configure COOKIE_DOMAIN
    ...(isLocalhost ? {} : { domain: process.env.COOKIE_DOMAIN })
  };
  
  // Configurar las cookies
  res.cookie('doctrack_access', accessToken, { 
    ...cookieOptions, 
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  });
  
  res.cookie('doctrack_refresh', refreshToken, { 
    ...cookieOptions, 
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
  });

  console.log('Cookies set:', res.getHeaders()['set-cookie']);
}

export function clearAuthCookies(res) {
  res.clearCookie('doctrack_access', { path: '/', sameSite: 'none', secure: true });
  res.clearCookie('doctrack_refresh', { path: '/', sameSite: 'none', secure: true });
}

export function authRequired(req, res, next) {
  console.log('=== Auth Middleware Check ===');
  console.log('Cookies received:', req.cookies);
  
  const token = req.cookies?.doctrack_access;
  
  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ 
      message: 'No autenticado',
      detail: 'No se encontró el token de acceso en las cookies'
    });
  }

  try {
    console.log('Verifying token...');
    const payload = jwt.verify(token, ACCESS_SECRET);
    console.log('Token verified successfully');
    req.user = payload;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    // Si el token está expirado, intentar usar el refresh token
    const refreshToken = req.cookies?.doctrack_refresh;
    if (refreshToken) {
      try {
        const refreshPayload = jwt.verify(refreshToken, REFRESH_SECRET);
        const newAccessToken = signAccessToken({ sub: refreshPayload.sub });
        
        // Establecer el nuevo token de acceso
        setAuthCookies(res, { 
          accessToken: newAccessToken, 
          refreshToken 
        });
        
        console.log('Access token refreshed successfully');
        req.user = jwt.verify(newAccessToken, ACCESS_SECRET);
        return next();
      } catch (refreshErr) {
        console.error('Refresh token verification failed:', refreshErr.message);
      }
    }
    
    return res.status(401).json({ 
      message: 'Token inválido o expirado',
      detail: err.message
    });
  }
}