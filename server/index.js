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

// API para obtener documentos de un caso (ENHANCED)
app.get('/api/casos/:casoId/documentos', authRequired, async function(req, res) {
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
        message: 'Caso no encontrado o no tienes permisos para ver sus documentos'
      });
    }

    // Obtener documentos del caso con información adicional
    const documentos = await prisma.documento.findMany({
      where: { caso_id: casoId },
      orderBy: { created_at: 'desc' },
      include: {
        caso: {
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
        }
      }
    });

    console.log(`User ${userId} retrieved ${documentos.length} documents for case ${casoId}`);
    return res.json(documentos);
    
  } catch (err) {
    console.error('Error getting documents:', err);
    return res.status(500).json({ message: 'Error obteniendo documentos' });
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
    
    console.log(`User ${userId} created document ${newDocument.documento_id} for case ${caso_id}`);
    return res.status(201).json(newDocument);
    
  } catch (err) {
    console.error('Error creating document:', err);
    return res.status(500).json({
      message: 'Error al crear el documento',
      error: err.message
    });
  }
});

// API para actualizar un documento (ENHANCED)
app.put('/api/documentos/:id', authRequired, async function(req, res) {
  try {
    const documentoId = parseInt(req.params.id);
    const userId = req.user.sub;
    const { tipo, fecha_enviado, fecha_recibido, firma_digital, url_documento } = req.body;
    
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
    
    const updateData = {};
    if (tipo !== undefined) updateData.tipo = tipo;
    if (fecha_enviado !== undefined) {
      updateData.fecha_enviado = fecha_enviado ? new Date(fecha_enviado) : null;
    }
    if (fecha_recibido !== undefined) {
      updateData.fecha_recibido = fecha_recibido ? new Date(fecha_recibido) : null;
    }
    if (firma_digital !== undefined) updateData.firma_digital = firma_digital;
    if (url_documento !== undefined) updateData.url_documento = url_documento;
    
    // Auto-update timestamp
    updateData.updated_at = new Date();
    
    const updatedDocument = await prisma.documento.update({
      where: { documento_id: documentoId },
      data: updateData,
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
    
    console.log(`User ${userId} updated document ${documentoId}`);
    return res.json(updatedDocument);
    
  } catch (err) {
    console.error('Error updating document:', err);
    return res.status(500).json({
      message: 'Error al actualizar el documento',
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
    
    console.log(`User ${userId} marked document ${documentoId} as received`);
    return res.json(updatedDocument);
    
  } catch (err) {
    console.error('Error marking document as received:', err);
    return res.status(500).json({
      message: 'Error al marcar documento como recibido',
      error: err.message
    });
  }
});

// API para obtener estadísticas de documentos por caso
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
      total,
      recibidos,
      pendientes,
      enRevision,
      porcentajeCompletado: total > 0 ? Math.round((recibidos / total) * 100) : 0
    };

    console.log(`User ${userId} retrieved document stats for case ${casoId}:`, stats);
    return res.json(stats);
    
  } catch (err) {
    console.error('Error getting document stats:', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas de documentos' });
  }
});

// API para obtener plantilla de documentos requeridos por tipo de trámite
app.get('/api/tramites/:tipo/documentos-requeridos', authRequired, async function(req, res) {
  try {
    const tipoTramite = decodeURIComponent(req.params.tipo);
    
    // Document requirements mapping (this should ideally be in a database)
    const DOCUMENT_REQUIREMENTS = {
      'Asilo Político': [
        { tipo: 'Formulario', documento: 'I-589', requerido: true },
        { tipo: 'Evidencia', documento: 'Declaración personal', requerido: true },
        { tipo: 'Evidencia', documento: 'Pasaporte', requerido: true },
        { tipo: 'Evidencia', documento: 'Evidencia persecución', requerido: true },
        { tipo: 'Evidencia', documento: 'Documentos entrada a EE.UU.', requerido: true },
        { tipo: 'Evidencia', documento: 'Cartas de apoyo', requerido: false },
        { tipo: 'Evidencia', documento: 'Informes de país', requerido: false }
      ],
      'Residencia Permanente': [
        { tipo: 'Formulario', documento: 'I-485', requerido: true },
        { tipo: 'Formulario', documento: 'I-130', requerido: true },
        { tipo: 'Formulario', documento: 'I-864', requerido: true },
        { tipo: 'Evidencia', documento: 'Certificado matrimonio', requerido: true },
        { tipo: 'Evidencia', documento: 'Certificado nacimiento', requerido: true },
        { tipo: 'Evidencia', documento: 'Pasaporte beneficiario', requerido: true },
        { tipo: 'Evidencia', documento: 'Pasaporte solicitante', requerido: true },
        { tipo: 'Evidencia', documento: 'Evidencia relación genuina', requerido: true },
        { tipo: 'Evidencia', documento: 'Declaraciones de impuestos', requerido: true },
        { tipo: 'Evidencia', documento: 'Prueba de ingresos patrocinador', requerido: true }
      ],
      // Add more process types as needed...
    };

    const documentosRequeridos = DOCUMENT_REQUIREMENTS[tipoTramite] || [];
    
    return res.json({
      tipoTramite,
      documentos: documentosRequeridos,
      total: documentosRequeridos.length,
      requeridos: documentosRequeridos.filter(doc => doc.requerido).length
    });
    
  } catch (err) {
    console.error('Error getting required documents:', err);
    return res.status(500).json({ message: 'Error obteniendo documentos requeridos' });
  }
});

// API para crear múltiples documentos basados en plantilla
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

    // Get case details to determine document requirements
    const caseDetails = await prisma.caso.findUnique({
      where: { caso_id: casoId },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    // Get required documents for this case type
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/tramites/${encodeURIComponent(caseDetails.tipo_tramite)}/documentos-requeridos`, {
      headers: {
        'Cookie': req.headers.cookie
      }
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo plantilla de documentos');
    }
    
    const { documentos } = await response.json();

    // Get existing documents to avoid duplicates
    const existingDocs = await prisma.documento.findMany({
      where: { caso_id: casoId },
      select: { tipo: true }
    });

    const existingTypes = new Set(existingDocs.map(doc => doc.tipo));

    // Create documents that don't already exist
    const newDocuments = [];
    const documentsToCreate = documentos.filter(doc => !existingTypes.has(doc.documento));

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

    console.log(`User ${userId} created ${newDocuments.length} documents from template for case ${casoId}`);
    return res.status(201).json({
      message: `${newDocuments.length} documentos creados desde plantilla`,
      documentos: newDocuments,
      existentes: existingDocs.length,
      nuevos: newDocuments.length
    });
    
  } catch (err) {
    console.error('Error creating documents from template:', err);
    return res.status(500).json({
      message: 'Error creando documentos desde plantilla',
      error: err.message
    });
  }
});

// API para obtener resumen de documentos del usuario
app.get('/api/documentos/resumen', authRequired, async function(req, res) {
  try {
    const userId = req.user.sub;
    
    const [totalDocumentos, documentosRecibidos, documentosPendientes, documentosVencidos] = await Promise.all([
      // Total documentos del usuario
      prisma.documento.count({
        where: {
          caso: {
            cliente: { created_by: userId }
          }
        }
      }),
      
      // Documentos recibidos
      prisma.documento.count({
        where: {
          caso: {
            cliente: { created_by: userId }
          },
          fecha_recibido: { not: null }
        }
      }),
      
      // Documentos pendientes
      prisma.documento.count({
        where: {
          caso: {
            cliente: { created_by: userId }
          },
          fecha_recibido: null
        }
      }),
      
      // Documentos "vencidos" (enviados hace más de 30 días sin recibir)
      prisma.documento.count({
        where: {
          caso: {
            cliente: { created_by: userId }
          },
          fecha_enviado: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          fecha_recibido: null
        }
      })
    ]);

    const resumen = {
      totalDocumentos,
      documentosRecibidos,
      documentosPendientes,
      documentosVencidos,
      porcentajeCompletado: totalDocumentos > 0 ? Math.round((documentosRecibidos / totalDocumentos) * 100) : 0
    };

    console.log(`User ${userId} document summary:`, resumen);
    return res.json(resumen);
    
  } catch (err) {
    console.error('Error getting document summary:', err);
    return res.status(500).json({ message: 'Error obteniendo resumen de documentos' });
  }
});

// Función para verificar que un caso pertenece al usuario actual
async function verifyCaseOwnership(casoId, userId) {
  try {
    console.log(`Verifying case ownership: Case ${casoId} for User ${userId}`);
    
    const caso = await prisma.caso.findFirst({
      where: {
        caso_id: casoId,
        cliente: {
          created_by: userId // El caso debe pertenecer a un cliente del usuario
        }
      },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            apellido: true,
            created_by: true
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

// Función para verificar que un documento pertenece al usuario actual
async function verifyDocumentOwnership(documentoId, userId) {
  try {
    console.log(`Verifying document ownership: Document ${documentoId} for User ${userId}`);
    
    const documento = await prisma.documento.findFirst({
      where: {
        documento_id: documentoId,
        caso: {
          cliente: {
            created_by: userId // El documento debe pertenecer a un caso de un cliente del usuario
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
                apellido: true,
                created_by: true
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