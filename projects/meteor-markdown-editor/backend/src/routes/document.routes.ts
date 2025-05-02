import express from 'express';
import * as documentController from '../controllers/document.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Document routes
router.get('/', authenticate, documentController.getAllDocuments);
router.post('/', authenticate, documentController.createDocument);
router.get('/:id', optionalAuthenticate, documentController.getDocumentById);
router.put('/:id', authenticate, documentController.updateDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

// Version history routes
router.get('/:id/versions', authenticate, documentController.getDocumentVersions);
router.get('/:id/versions/:versionId', authenticate, documentController.getDocumentVersion);

export default router;