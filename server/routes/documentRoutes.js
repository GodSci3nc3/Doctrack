import express from 'express';
import multer from 'multer';
import { 
  createDocument,
  updateDocument,
  deleteDocument,
  markDocumentReceived,
  uploadDocument,
  getDocumentFile,
  getRequiredDocuments,
  getDocumentStats,
  getCaseDocuments
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configuración de multer para manejo de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// CRUD de documentos
router.post('/', createDocument);                           // Crear documento (entrada vacía)
router.put('/:id', updateDocument);                        // Actualizar nombre del documento
router.delete('/:id', deleteDocument);                     // Eliminar documento
router.patch('/:id/recibir', markDocumentReceived);        // Marcar como recibido

// Subida y descarga de archivos
router.post('/upload', upload.single('file'), uploadDocument);  // Subir archivo
router.get('/:id/file', getDocumentFile);                      // Obtener URL del archivo

// Consultas de documentos
router.get('/casos/:casoId', getCaseDocuments);            // Obtener documentos de un caso
router.get('/casos/:casoId/stats', getDocumentStats);      // Estadísticas de documentos
router.get('/requeridos/:tipo', getRequiredDocuments);     // Documentos requeridos por tipo

// Manejo de errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'El archivo es muy grande. Tamaño máximo: 10MB'
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({
      message: 'Tipo de archivo no permitido. Use PDF, JPG, PNG o DOC.'
    });
  }
  
  next(error);
});

export default router;