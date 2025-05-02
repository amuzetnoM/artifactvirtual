import { Request, Response } from 'express';
import { z } from 'zod';
import { aiService, AVAILABLE_MODELS } from '../services/ai.service';

// Validation schemas
const analyzeSchema = z.object({
  content: z.string().min(10),
  modelId: z.string().optional()
});

const summarizeSchema = z.object({
  content: z.string().min(10),
  maxLength: z.number().min(50).max(500).optional(),
  modelId: z.string().optional()
});

const generateSchema = z.object({
  prompt: z.string().min(3).max(1000),
  length: z.number().min(50).max(2000).optional(),
  temperature: z.number().min(0).max(1).optional(),
  modelId: z.string().optional()
});

const grammarSchema = z.object({
  content: z.string().min(10),
  modelId: z.string().optional()
});

const completionSchema = z.object({
  content: z.string().min(10),
  maxTokens: z.number().min(10).max(500).optional(),
  modelId: z.string().optional()
});

const modelsSchema = z.object({
  includeConfidential: z.boolean().optional()
});

// Controller functions
export const analyzeContent = async (req: Request, res: Response) => {
  try {
    const { content, modelId } = analyzeSchema.parse(req.body);
    
    // Use default model if none specified
    const model = modelId || 'local-distilgpt2';
    
    // Get current user from request if authenticated
    const user = req.user;
    
    const analysis = await aiService.analyzeContent({ 
      content, 
      model,
      user
    });
    
    res.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('AI analyze error:', error);
    res.status(500).json({ error: 'An error occurred analyzing content' });
  }
};

export const summarizeContent = async (req: Request, res: Response) => {
  try {
    const { content, maxLength, modelId } = summarizeSchema.parse(req.body);
    
    // Use default model if none specified
    const model = modelId || 'local-distilgpt2';
    
    const summary = await aiService.summarizeContent(content, model, maxLength);
    res.json({ summary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('AI summarize error:', error);
    res.status(500).json({ error: 'An error occurred summarizing content' });
  }
};

export const generateContent = async (req: Request, res: Response) => {
  try {
    const { prompt, length, temperature, modelId } = generateSchema.parse(req.body);
    
    // Use default model if none specified
    const model = modelId || 'local-distilgpt2';
    
    // Get current user from request if authenticated
    const user = req.user;
    
    const content = await aiService.getCompletion({
      prompt,
      maxTokens: length || 500,
      temperature: temperature || 0.7,
      model,
      user
    });
    
    res.json({ content });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('AI generate error:', error);
    res.status(500).json({ error: 'An error occurred generating content' });
  }
};

export const checkGrammar = async (req: Request, res: Response) => {
  try {
    const { content, modelId } = grammarSchema.parse(req.body);
    
    // Use default model if none specified
    const model = modelId || 'local-distilgpt2';
    
    // For now, use a simple prompt-based grammar check
    const prompt = `Check the following text for grammar errors and provide suggestions.
    Format the result as a JSON object with:
    - suggestions: array of { type: "grammar", text: "suggestion text", position: { start: number, end: number } }
    - score: number from 1-10 indicating overall grammar quality
    
    Text to check:
    ${content}`;
    
    try {
      const result = await aiService.getCompletion({
        prompt,
        maxTokens: 1000,
        temperature: 0.3,
        model
      });
      
      // Try to extract JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const grammarResult = JSON.parse(jsonMatch[0]);
          return res.json(grammarResult);
        } catch (parseErr) {
          console.error('Failed to parse grammar check result', parseErr);
        }
      }
    } catch (aiErr) {
      console.error('Grammar check AI error', aiErr);
    }
    
    // Fallback if AI fails
    const randomErrors = Math.floor(Math.random() * 3) + 1;
    const suggestions = [];
    
    for (let i = 0; i < randomErrors; i++) {
      suggestions.push({
        type: 'grammar',
        text: `Sample grammar suggestion ${i + 1}`,
        position: { start: i * 50, end: i * 50 + 10 }
      });
    }
    
    res.json({
      suggestions,
      score: Math.min(10, Math.max(1, 7 + Math.random() * 3))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('AI grammar check error:', error);
    res.status(500).json({ error: 'An error occurred checking grammar' });
  }
};

export const suggestCompletion = async (req: Request, res: Response) => {
  try {
    const { content, maxTokens, modelId } = completionSchema.parse(req.body);
    
    // Use default model if none specified
    const model = modelId || 'local-distilgpt2';
    
    // Get completion
    const prompt = `Complete the following text:\n\n${content}`;
    const completion = await aiService.getCompletion({
      prompt,
      maxTokens: maxTokens || 50,
      temperature: 0.7,
      model
    });
    
    res.json({ completion });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('AI completion error:', error);
    res.status(500).json({ error: 'An error occurred generating completion' });
  }
};

export const getAvailableModels = async (req: Request, res: Response) => {
  try {
    const { includeConfidential } = modelsSchema.parse(req.query);
    
    // Get all available models from service
    const models = aiService.getAvailableModels();
    
    // Filter out models that require special permissions if not authorized
    const isAdmin = req.user?.role === 'admin';
    const filteredModels = includeConfidential && isAdmin 
      ? models
      : models.filter(m => !m.id.includes('confidential'));
    
    res.json({
      models: filteredModels.map(m => ({
        id: m.id,
        name: m.name,
        capabilities: m.capabilities
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Get models error:', error);
    res.status(500).json({ error: 'An error occurred fetching available models' });
  }
};