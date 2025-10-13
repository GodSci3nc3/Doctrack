import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key para el backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorageService {
  constructor() {
    this.bucketName = 'documentos';
  }

  /**
   * Genera un nombre único para el archivo
   */
  generateFileName(originalName, tipo, clienteNombre, clienteApellido, casoId) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const cleanFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `caso_${casoId}/${clienteNombre}_${clienteApellido}/${tipo}/${timestamp}_${cleanFileName}`.toLowerCase();
  }

  /**
   * Sube un archivo a Supabase Storage
   */
  async uploadFile(fileBuffer, fileName, mimeType, metadata = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType: mimeType,
          metadata: metadata,
          upsert: true // Permite sobrescribir si ya existe
        });

      if (error) {
        console.error('Error uploading to Supabase:', error);
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      console.log('File uploaded successfully to Supabase:', data.path);
      return data.path;
    } catch (err) {
      console.error('Supabase upload error:', err);
      throw err;
    }
  }

  /**
   * Obtiene URL firmada para acceso temporal al archivo
   */
  async getSignedUrl(filePath, expiresIn = 3600) { // 1 hora por defecto
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        throw new Error(`Error al obtener URL del archivo: ${error.message}`);
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Signed URL error:', err);
      throw err;
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   */
  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting from Supabase:', error);
        throw new Error(`Error al eliminar archivo: ${error.message}`);
      }

      console.log('File deleted successfully from Supabase:', filePath);
      return true;
    } catch (err) {
      console.error('Supabase delete error:', err);
      throw err;
    }
  }

  /**
   * Lista archivos en una carpeta específica
   */
  async listFiles(folderPath = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Error listing files:', error);
        throw new Error(`Error al listar archivos: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.error('List files error:', err);
      throw err;
    }
  }

  /**
   * Mueve un archivo a una nueva ubicación
   */
  async moveFile(fromPath, toPath) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .move(fromPath, toPath);

      if (error) {
        console.error('Error moving file:', error);
        throw new Error(`Error al mover archivo: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.error('Move file error:', err);
      throw err;
    }
  }

  /**
   * Obtiene información del archivo
   */
  async getFileInfo(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('', {
          search: filePath
        });

      if (error) {
        throw new Error(`Error al obtener información del archivo: ${error.message}`);
      }

      return data.find(file => file.name === filePath.split('/').pop());
    } catch (err) {
      console.error('Get file info error:', err);
      throw err;
    }
  }
}

export const supabaseStorage = new SupabaseStorageService();