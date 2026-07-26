const express = require('express');
const router = express.Router();
const os = require('os');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const NetworkMetric = require('../models/NetworkMetric.model');
const { getMemoryMetrics, getCpuUsageMetric } = require('../utils/containerMetrics');

// Import your authentication middleware here to ensure only SuperAdmins can access
// const { protect, authorize } = require('../middleware/auth.middleware');

// For now, simple mock protection middleware just to demonstrate
const mockSuperAdminAuth = (req, res, next) => {
    // In production, this would verify JWT and role === 'superadmin'
    req.user = { role: 'superadmin' }; 
    next();
};

router.use(mockSuperAdminAuth);

router.get('/server-dashboard/metrics', async (req, res) => {
    try {
        const { totalMemGB, usedMemGB } = getMemoryMetrics();

        // CPU Usage (calculated across container cores or host fallback)
        const cpuUsage = getCpuUsageMetric();

        // Uptime format (using process.uptime for container accuracy)
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        // Database Metrics
        let dbStats = { collections: 0, objects: 0, dataSize: 0 };
        let dbState = "Disconnected";
        
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            dbState = "Connected";
            try {
                const stats = await mongoose.connection.db.command({ dbStats: 1 });
                dbStats = {
                    collections: stats.collections || 0,
                    objects: stats.objects || 0,
                    dataSize: stats.dataSize ? (stats.dataSize / (1024 * 1024)).toFixed(2) : 0 // in MB
                };
            } catch (e) {
                console.error("DB Stats Error:", e);
                dbState = "Error retrieving stats";
            }
        }

        res.json({
            cpuUsage: Math.min(cpuUsage, 100),
            memoryUsage: usedMemGB,
            memoryTotal: totalMemGB,
            activeConnections: Math.floor(Math.random() * 50) + 120, // Simulated network connections
            uptime: `${days}d ${hours}h ${minutes}m`,
            dbStats,
            dbState,
            timestamp: new Date().toLocaleTimeString()
        });
    } catch (error) {
        console.error("Dashboard metrics error:", error);
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
});

router.get('/server-dashboard', (req, res) => {
    res.render('dashboard', { user: req.user, activeTab: 'dashboard' });
});

router.get('/network', (req, res) => {
    res.render('network', { user: req.user, activeTab: 'network' });
});

router.get('/network-metrics', async (req, res) => {
    try {
        const range = req.query.range || 'live';

        if (range === 'live') {
            const metrics = await NetworkMetric.find().sort({ timestamp: -1 }).limit(60);
            const history = metrics.reverse().map(m => ({
                time: new Date(m.timestamp).toLocaleTimeString(),
                reqs: m.reqs,
                avgLatency: m.avgLatency,
                errorCount: m.errorCount
            }));

            let peakUsage = 0;
            let lowUsage = history.length > 0 ? history[0].reqs : 0;
            history.forEach(m => {
                if (m.reqs > peakUsage) peakUsage = m.reqs;
                if (m.reqs < lowUsage) lowUsage = m.reqs;
            });

            return res.json({ history, peakUsage, lowUsage, isHistorical: false });
        }

        // Historical Aggregation
        const now = new Date();
        let startDate = new Date(0);
        let groupFormat = "%Y-%m-%d";

        if (range === '1h') { startDate = new Date(now.getTime() - 3600000); groupFormat = "%H:%M"; }
        else if (range === '1w') { startDate = new Date(now.getTime() - 7 * 86400000); groupFormat = "%Y-%m-%d %H:00"; }
        else if (range === '1m') { startDate = new Date(now.getTime() - 30 * 86400000); groupFormat = "%Y-%m-%d"; }
        else if (range === '3m') { startDate = new Date(now.getTime() - 90 * 86400000); groupFormat = "%Y-%m-%d"; }
        else if (range === '6m') { startDate = new Date(now.getTime() - 180 * 86400000); groupFormat = "%Y-%V"; }
        else if (range === '1y') { startDate = new Date(now.getTime() - 365 * 86400000); groupFormat = "%Y-%V"; }
        else if (range === 'all') { groupFormat = "%Y-%m"; }

        const pipeline = [
            { $match: { timestamp: { $gte: startDate } } },
            { 
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$timestamp" } },
                    reqs: { $avg: "$reqs" }, // Average reqs/s over this period
                    avgLatency: { $avg: "$avgLatency" },
                    errorCount: { $sum: "$errorCount" }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const aggregated = await NetworkMetric.aggregate(pipeline);
        
        const history = aggregated.map(m => ({
            time: m._id,
            reqs: Math.round(m.reqs || 0),
            avgLatency: Math.round(m.avgLatency || 0),
            errorCount: m.errorCount || 0
        }));

        let peakUsage = 0;
        let lowUsage = history.length > 0 ? history[0].reqs : 0;
        history.forEach(m => {
            if (m.reqs > peakUsage) peakUsage = m.reqs;
            if (m.reqs < lowUsage) lowUsage = m.reqs;
        });

        res.json({ history, peakUsage, lowUsage, isHistorical: true });
    } catch (err) {
        console.error('Failed to fetch network metrics from DB:', err);
        res.status(500).json({ history: [], peakUsage: 0, lowUsage: 0, isHistorical: false });
    }
});

router.get("/roles-ui", (req, res) => {
  const roles = [
    { value: "superadmin", label: "Superadmin" },
    { value: "admin", label: "Operations (Admin)" },
    { value: "manager", label: "Operations (Manager)" },
    { value: "agent", label: "Agent (Support)" },
    { value: "vendor", label: "Vendor (Seller)" },
    { value: "salesPartner", label: "Sales Partner" },
    { value: "deliveryPartner", label: "Logistics (XpressD)" }
  ];
  res.render("roles-options", { roles });
});

router.get('/server-logs', (req, res) => {
    let logs = [];
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        if (fs.existsSync(logPath)) {
            const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).slice(-100);
            logs = lines.reverse().map(line => {
                try {
                    const parsed = JSON.parse(line);
                    return { level: (parsed.level || 'INFO').toUpperCase(), message: parsed.message, timestamp: parsed.timestamp || new Date().toISOString() };
                } catch {
                    return { level: 'INFO', message: line.substring(0, 100), timestamp: new Date().toISOString() };
                }
            });
        } else {
            logs = [{ level: 'INFO', message: 'No log file found.', timestamp: new Date().toISOString() }];
        }
    } catch(err) {
        logs = [{ level: 'ERROR', message: 'Failed to read logs', timestamp: new Date().toISOString() }];
    }
    res.render('logs', { user: req.user, logs, activeTab: 'logs' });
});

router.get('/attack-logs', (req, res) => {
    let attacks = [];
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        if (fs.existsSync(logPath)) {
            const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
            const suspicious = lines.filter(l => l.includes('429') || l.includes('403') || l.includes('401') || l.includes('Unauthorized') || l.includes('RateLimit')).slice(-50);
            attacks = suspicious.reverse().map(line => {
                const ipMatch = line.match(/\d+\.\d+\.\d+\.\d+/);
                return { ip: ipMatch ? ipMatch[0] : 'Unknown IP', type: 'Suspicious Activity / Rate Limit', timestamp: new Date().toISOString(), actionTaken: 'Logged / Blocked' };
            });
            if (attacks.length === 0) {
                 attacks = [{ ip: '-', type: 'No attacks detected recently', timestamp: new Date().toISOString(), actionTaken: '-' }];
            }
        }
    } catch(err) {
        attacks = [];
    }
    res.render('attacks', { user: req.user, attacks, activeTab: 'attacks' });
});

module.exports = router;
