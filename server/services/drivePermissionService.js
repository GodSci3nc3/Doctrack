
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper para obtener el cliente OAuth2 con el token personal
function getPersonalOAuth2Client() {
  const tokenPath = path.join(__dirname, 'personal_drive_token.json');
  const tokens = JSON.parse(fs.readFileSync(tokenPath));
  const oAuth2Client = new google.auth.OAuth2(
    process.env.DRIVE_OWNER_CLIENT_ID,
    process.env.DRIVE_OWNER_CLIENT_SECRET,
    process.env.DRIVE_OWNER_REDIRECT_URI
  );
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

// Obtiene el cliente OAuth2 para la API de Drive
function getOAuth2Client(accessToken) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

// Busca o crea una carpeta por usuario en Drive
// Crea o busca la carpeta del usuario usando SIEMPRE el token personal
export async function getOrCreateUserFolder({ userId, userEmail }) {
  const drive = google.drive({ version: 'v3', auth: getPersonalOAuth2Client() });
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const folderName = `doctrack_user_${userId}`;
  console.log('[DEBUG] GOOGLE_DRIVE_FOLDER_ID:', parentFolderId);
  console.log('[DEBUG] Datos recibidos:', { userId, userEmail });
  // Buscar si ya existe la carpeta
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;
  console.log('[DEBUG] Query de búsqueda de carpeta:', query);
  const res = await drive.files.list({ q: query, fields: 'files(id,name)' });
  let folderId = res.data.files?.[0]?.id;
  if (!folderId) {
    console.log('[DEBUG] Creando carpeta nueva para usuario:', folderName, 'en parent:', parentFolderId);
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
    console.log('[DEBUG] Carpeta de usuario ya existe con ID:', folderId);
  }
  // Asignar permisos de editor al usuario
  console.log('[DEBUG] Asignando permisos de editor a:', userEmail, 'en carpeta:', folderId);
  await drive.permissions.create({
    fileId: folderId,
    resource: {
      type: 'user',
      role: 'writer',
      emailAddress: userEmail
    },
    sendNotificationEmail: false
  });
  console.log('[DEBUG] Permiso de editor asignado a:', userEmail);
  return folderId;
}

// Utilidad: Dar permisos de editor en la carpeta raíz usando el token personal
export async function addEditorToRootFolderWithPersonalToken({ userEmail }) {
  // Leer token personal
  const tokenPath = path.join(__dirname, 'personal_drive_token.json');
  const tokens = JSON.parse(fs.readFileSync(tokenPath));
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials(tokens);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  try {
    const res = await drive.permissions.create({
      fileId: folderId,
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: userEmail
      },
      sendNotificationEmail: false
    });
    console.log(`[DRIVE] Permiso de editor otorgado a ${userEmail} en carpeta raíz ${folderId}`);
    return true;
  } catch (err) {
    console.error('[DRIVE] Error al agregar editor con token personal:', err.message);
    return false;
  }
}
// Helper para dar permisos de editor a cualquier carpeta
export async function addEditorToDriveFolder({ accessToken, folderId, email }) {
  const drive = google.drive({ version: 'v3', auth: getOAuth2Client(accessToken) });
  try {
    await drive.permissions.create({
      fileId: folderId,
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: email
      },
      sendNotificationEmail: false
    });
    return true;
  } catch (err) {
    console.error('Error al agregar editor a carpeta de Drive:', err.message);
    return false;
  }
}
