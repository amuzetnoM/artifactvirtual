import express from 'express';
import * as communityController from '../controllers/community.controller';

const router = express.Router();

// Public discovery routes
router.get('/documents/public', communityController.getPublicDocuments);
router.get('/documents/trending', communityController.getTrendingDocuments);
router.get('/documents/recent', communityController.getRecentDocuments);
router.get('/documents/featured', communityController.getFeaturedDocuments);

// Tag-based routes
router.get('/tags', communityController.getAllTags);
router.get('/tags/:tag/documents', communityController.getDocumentsByTag);

// User profile routes
router.get('/users/:username', communityController.getUserProfile);
router.get('/users/:username/documents', communityController.getUserPublicDocuments);

// Search route
router.get('/search', communityController.searchDocuments);

export default router;