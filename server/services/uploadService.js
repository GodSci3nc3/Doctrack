import { google } from 'googleapis';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
// import { getOrCreateUserFolder } from './drivePermissionService.js'; // Ya no necesario

// === GOOGLE DRIVE CONFIGURATION ===
const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

// Configuración OAuth2 para Google Drive
function getOAuth2Client(accessToken) {
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

// Subida robusta: crea carpeta por usuario y sube el archivo ahí
async function uploadToGoogleDrive({ buffer, mimeType, fileName, userId, userEmail, accessToken, refreshToken }) {
  // DEBUG: Imprimir datos recibidos y variable de entorno
  console.log('[DEBUG uploadToGoogleDrive] Datos recibidos:', { 
    userEmail, 
    userId, 
    accessToken: accessToken ? 'PRESENTE' : 'AUSENTE',
    refreshToken: refreshToken ? 'PRESENTE' : 'AUSENTE'
  });
  console.log('[DEBUG uploadToGoogleDrive] GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
  
  if (!userEmail || !userId || !accessToken) {
    throw new Error('Faltan datos para Google Drive');
  }

  // Configurar OAuth2 client
  const auth = getOAuth2Client(accessToken);
  if (refreshToken) {
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  try {
    // Usar directamente el token del usuario para todo el proceso
    const drive = google.drive({ version: 'v3', auth });
    
    // Buscar o crear carpeta del usuario usando su propio token
    const folderId = await getOrCreateUserFolderWithUserToken(drive, { userId, userEmail });
    
    // Subir el archivo
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };
    const { Readable } = await import('stream');
    const media = {
      mimeType,
      body: Readable.from(buffer)
    };
    
    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id,webViewLink,webContentLink'
    });
    
    const fileId = res.data.id;
    const fileUrl = res.data.webViewLink;
    
    // Permisos: solo el usuario puede ver/editar su archivo
    await drive.permissions.create({
      fileId,
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: userEmail
      },
      sendNotificationEmail: false
    });
    
    return fileUrl;
    
  } catch (error) {
    console.error('[DEBUG] Error en uploadToGoogleDrive:', error);
    
    // Si el error es de autenticación, intentar refresh del token
    if ((error.code === 401 || error.status === 401) && refreshToken) {
      try {
        console.log('[DEBUG] Intentando refresh del token...');
        const { credentials } = await auth.refreshAccessToken();
        auth.setCredentials(credentials);
        
        console.log('[DEBUG] Token refreshed exitosamente');
        
        // Reintentar la subida con el nuevo token
        return await uploadToGoogleDrive({
          buffer, 
          mimeType, 
          fileName, 
          userId, 
          userEmail, 
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || refreshToken
        });
        
      } catch (refreshError) {
        console.error('[DEBUG] Error al refresh del token:', refreshError);
        // Lanzar el error original con código 401 para que sea manejado correctamente
        const originalError = new Error('Token de Google expirado y no se pudo renovar');
        originalError.code = 401;
        originalError.status = 401;
        throw originalError;
      }
    }
    
    // Para otros errores o si no hay refresh token, lanzar el error original
    throw error;
  }
}

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

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// === HELPER FUNCTIONS ===

// Upload file to Google Drive (DESHABILITADO)
// export async function uploadToGoogleDrive(filePath, originalName, mimeType, folderName) {
//   // Google Drive upload deshabilitado
//   throw new Error('Google Drive upload is disabled. Use Supabase Storage.');
// }

// Get or create folder in Google Drive (DESHABILITADO)
// async function getOrCreateFolder(folderName) {
//   return null;
// }

// Generate filename for organization
export function generateFileName(clienteName, casoId, tipoDocumento, originalExtension) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cleanClientName = clienteName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDocType = tipoDocumento.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanClientName}_Case${casoId}_${cleanDocType}_${timestamp}${originalExtension}`;
}

// Función para crear carpeta usando el token del usuario (sin token personal)
async function getOrCreateUserFolderWithUserToken(drive, { userId, userEmail }) {
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const folderName = `doctrack_user_${userId}`;
  
  console.log('[DEBUG] Buscando/creando carpeta:', folderName, 'en parent:', parentFolderId);
  
  try {
    // Buscar si ya existe la carpeta
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;
    const res = await drive.files.list({ q: query, fields: 'files(id,name)' });
    
    let folderId = res.data.files?.[0]?.id;
    
    if (!folderId) {
      console.log('[DEBUG] Creando nueva carpeta para usuario:', folderName);
      // Crear nueva carpeta
      const folderRes = await drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        },
        fields: 'id'
      });
      folderId = folderRes.data.id;
      console.log('[DEBUG] Carpeta creada con ID:', folderId);
    } else {
      console.log('[DEBUG] Carpeta existente encontrada con ID:', folderId);
    }
    
    return folderId;
  } catch (error) {
    console.error('[DEBUG] Error creando/buscando carpeta:', error.message);
    // Si falla, usar la carpeta raíz como fallback
    console.log('[DEBUG] Usando carpeta raíz como fallback:', parentFolderId);
    return parentFolderId;
  }
}

export { uploadToGoogleDrive };