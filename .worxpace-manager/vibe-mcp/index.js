import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import { createServer } from 'http';
import healthRoutes from './routes/health.js';
import requestLogger from './middleware/request-logger.js';
import createVibeRoutes from './routes/vibe.js';

// Environment variables
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure logging
const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ 
            filename: 'logs/mcp-server.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger(logger));

// Basic health check route
// Root route handler
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Vibe MCP Server',
        status: 'running',
        timestamp: new Date().toISOString(),
        routes: [
            '/health - Server health check'
        ]
    });
});

// Use health routes
app.use('/health', healthRoutes);

// Use vibe routes
app.use('/vibe', createVibeRoutes(logger));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Create HTTP server
const server = createServer(app);

// Find an available port
function findAvailablePort(basePort, maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        function tryPort(port) {
            attempts++;
            const server = createServer();
            
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    if (attempts >= maxAttempts) {
                        reject(new Error(`Could not find available port after ${maxAttempts} attempts`));
                    } else {
                        tryPort(port + 1);
                    }
                } else {
                    reject(err);
                }
            });
            
            server.listen(port, HOST, () => {
                const actualPort = server.address().port;
                server.close(() => {
                    resolve(actualPort);
                });
            });
        }
        
        tryPort(basePort);
    });
}

// Graceful shutdown
const gracefulShutdown = () => {
    logger.info('Received kill signal, shutting down gracefully');
    server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
    });

    // Force close server after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
findAvailablePort(PORT).then((availablePort) => {
    server.listen(availablePort, HOST, () => {
        const serverUrl = `http://${HOST}:${availablePort}`;
        logger.info(`🚀 MCP Server started successfully`);
        logger.info(`📍 Listening on: ${serverUrl}`);
        logger.info(`🌐 Environment: ${NODE_ENV}`);
        logger.info(`📊 Log Level: ${LOG_LEVEL}`);
        
        // Optional: Open browser or perform additional startup tasks
        if (NODE_ENV === 'development') {
            try {
                import('child_process').then(({ exec }) => {
                    exec(`start ${serverUrl}`, (error) => {
                        if (error) {
                            logger.warn('Could not automatically open browser', error);
                        }
                    });
                }).catch(openErr => {
                    logger.warn('Could not import child_process', openErr);
                });
            } catch (err) {
                logger.warn('Could not automatically open browser', err);
            }
        }
    });
}).catch((err) => {
    logger.error('❌ Failed to start server', err);
    process.exit(1);
});

export { app, server, logger };
