import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version
    });
});

export default router;
