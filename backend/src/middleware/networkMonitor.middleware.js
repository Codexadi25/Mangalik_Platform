const NetworkMetric = require('../models/NetworkMetric.model');

const networkStats = {
    current: { reqs: 0, totalLatency: 0, errorCount: 0 }
};

// Start a 1-second interval to snapshot the data
setInterval(() => {
    const timestamp = new Date();
    const reqs = networkStats.current.reqs;
    const avgLatency = reqs > 0 ? Math.round(networkStats.current.totalLatency / reqs) : 0;
    const errorCount = networkStats.current.errorCount;

    // Save to Database asynchronously (fire and forget) if there is active traffic
    if (reqs > 0 || avgLatency > 0 || errorCount > 0) {
        NetworkMetric.create({ timestamp, reqs, avgLatency, errorCount }).catch(err => {
            console.error("Failed to save NetworkMetric:", err);
        });
    }

    // Reset current for the next second
    networkStats.current = { reqs: 0, totalLatency: 0, errorCount: 0 };
}, 1000);

const networkMonitor = (req, res, next) => {
    // Skip recording metrics for admin dashboard routes and metrics endpoints to avoid database pollution
    if (req.originalUrl.startsWith('/admin') || req.originalUrl.includes('metrics')) {
        return next();
    }

    const start = Date.now();
    res.on('finish', () => {
        const latency = Date.now() - start;
        networkStats.current.reqs++;
        networkStats.current.totalLatency += latency;
        if (res.statusCode >= 400) {
            networkStats.current.errorCount++;
        }
    });
    next();
};

module.exports = { networkMonitor, networkStats };
