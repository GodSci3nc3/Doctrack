// import { google } from 'googleapis';
// import fs from 'fs';
import multer from 'multer';
import path from 'path';

// === GOOGLE DRIVE CONFIGURATION ===
// const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
// const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
// const GOOGLE_DRIVE_REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
// const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

// // Configure Google Drive
// const auth = new google.auth.OAuth2(
//   GOOGLE_DRIVE_CLIENT_ID,
//   GOOGLE_DRIVE_CLIENT_SECRET,
//   'https://developers.google.com/oauthplayground'
// );

// auth.setCredentials({
//   refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN
// });

// const drive = google.drive({ version: 'v3', auth });

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