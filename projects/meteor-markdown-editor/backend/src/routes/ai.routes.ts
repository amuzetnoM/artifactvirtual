import express from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (limited access)
router.post('/analyze', aiController.analyzeContent);
router.post('/summarize', aiController.summarizeContent);
router.post('/grammar', aiController.checkGrammar);

// Protected routes (require authentication)
router.post('/generate', authenticate, aiController.generateContent);
router.post('/complete', authenticate, aiController.suggestCompletion);

// Get available AI models
router.get('/models', aiController.getAvailableModels);

export default router;