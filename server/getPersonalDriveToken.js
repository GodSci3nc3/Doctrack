// Script para obtener token y refresh token de Google Drive personal
// Requiere: npm install googleapis
// Requiere: client_secret.json en /server

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid'
];
const TOKEN_PATH = path.join(__dirname, 'personal_drive_token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');

function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  console.log('Autoriza esta app visitando el siguiente URL:');
  console.log(authUrl);
  console.log('Pega el código que te da Google aquí:');

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (code) => {
    code = code.trim();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log('Token guardado en', TOKEN_PATH);
      console.log('Este es tu token y refresh token para el backend:');
      console.log(tokens);
      process.exit(0);
    } catch (err) {
      console.error('Error recuperando el token', err);
      process.exit(1);
    }
  });
}

authorize();
