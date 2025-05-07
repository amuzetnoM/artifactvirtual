export default function requestLogger(logger) {
    return (req, res, next) => {
        const start = Date.now();
        
        // Log the original request details
        logger.info(`Request: ${req.method} ${req.url}`, {
            method: req.method,
            url: req.url,
            headers: req.headers,
            timestamp: new Date().toISOString()
        });

        // Capture the original end function
        const originalEnd = res.end;

        // Override the end function to log response details
        res.end = function(...args) {
            const duration = Date.now() - start;
            
            logger.info(`Response: ${req.method} ${req.url}`, {
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString()
            });

            // Call the original end function
            originalEnd.apply(this, args);
        };

        next();
    };
}
