import express from 'express';
import AudioGenerator from '../services/audio-generator.js';

export default function createVibeRoutes(logger) {
    const router = express.Router();
    const audioGenerator = new AudioGenerator(logger);

    // Expose available tools
    router.get('/tools', (req, res) => {
        res.json({
            tools: Object.keys(audioGenerator.tools),
            description: 'Available MCP tools for music generation'
        });
    });

    // Start a vibe session
    router.post('/start', async (req, res) => {
        try {
            const result = await audioGenerator.tools.start_vibe_session(req.body);

            res.json({
                message: 'Vibe session started',
                ...result
            });
        } catch (error) {
            logger.error('Failed to start vibe session', { error });
            res.status(500).json({ 
                error: 'Could not start vibe session', 
                details: error.message 
            });
        }
    });

    // Generate more music
    router.post('/generate', async (req, res) => {
        try {
            const result = await audioGenerator.tools.generate_more_music(req.body);

            res.json({
                message: 'Generated more music',
                ...result
            });
        } catch (error) {
            logger.error('Failed to generate more music', { error });
            res.status(500).json({ 
                error: 'Could not generate more music', 
                details: error.message 
            });
        }
    });

    // Stop vibe session
    router.post('/stop', (req, res) => {
        try {
            const result = audioGenerator.tools.stop_vibe_session();
            res.json(result);
        } catch (error) {
            logger.error('Failed to stop vibe session', { error });
            res.status(500).json({ 
                error: 'Could not stop vibe session', 
                details: error.message 
            });
        }
    });

    return router;
}
