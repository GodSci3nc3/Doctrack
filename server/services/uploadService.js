import { google } from 'googleapis';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// === GOOGLE DRIVE CONFIGURATION ===
const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const GOOGLE_DRIVE_REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

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

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// === HELPER FUNCTIONS ===

// Upload file to Google Drive
export async function uploadToGoogleDrive(filePath, originalName, mimeType, folderName) {
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
export function generateFileName(clienteName, casoId, tipoDocumento, originalExtension) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cleanClientName = clienteName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDocType = tipoDocumento.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanClientName}_Case${casoId}_${cleanDocType}_${timestamp}${originalExtension}`;
}