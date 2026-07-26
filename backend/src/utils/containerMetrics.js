const fs = require('fs');
const os = require('os');

// Keep track of last cpu values globally for delta calculations
let lastCpuUsage = null; // in microseconds (cgroup v2) or nanoseconds (cgroup v1)
let lastCpuTimestamp = null; // Date.now()
let lastOsCpus = null;

/**
 * Detects if the platform is running inside cgroup v2 container
 */
function isCgroupsV2() {
    return fs.existsSync('/sys/fs/cgroup/cgroup.controllers') || fs.existsSync('/sys/fs/cgroup/memory.current');
}

/**
 * Gets memory metrics (total and used in GB)
 */
function getMemoryMetrics() {
    try {
        if (isCgroupsV2()) {
            const currentPath = '/sys/fs/cgroup/memory.current';
            const maxPath = '/sys/fs/cgroup/memory.max';
            if (fs.existsSync(currentPath)) {
                const currentBytes = parseInt(fs.readFileSync(currentPath, 'utf8').trim(), 10);
                let maxBytes = os.totalmem(); // Default fallback
                if (fs.existsSync(maxPath)) {
                    const maxStr = fs.readFileSync(maxPath, 'utf8').trim();
                    if (maxStr !== 'max' && !isNaN(maxStr)) {
                        maxBytes = parseInt(maxStr, 10);
                    }
                }
                // Convert to GB
                const totalMemGB = (maxBytes / (1024 ** 3)).toFixed(2);
                const usedMemGB = (currentBytes / (1024 ** 3)).toFixed(2);
                return { totalMemGB, usedMemGB };
            }
        } else {
            // Check cgroups v1
            const currentPath = '/sys/fs/cgroup/memory/memory.usage_in_bytes';
            const maxPath = '/sys/fs/cgroup/memory/memory.limit_in_bytes';
            if (fs.existsSync(currentPath)) {
                const currentBytes = parseInt(fs.readFileSync(currentPath, 'utf8').trim(), 10);
                let maxBytes = os.totalmem();
                if (fs.existsSync(maxPath)) {
                    const maxStr = fs.readFileSync(maxPath, 'utf8').trim();
                    const limitVal = parseInt(maxStr, 10);
                    // cgroup v1 sets limits to a super large number (e.g. 9223372036854771712) if no limit is set
                    if (!isNaN(limitVal) && limitVal < 9000000000000000000) {
                        maxBytes = limitVal;
                    }
                }
                const totalMemGB = (maxBytes / (1024 ** 3)).toFixed(2);
                const usedMemGB = (currentBytes / (1024 ** 3)).toFixed(2);
                return { totalMemGB, usedMemGB };
            }
        }
    } catch (err) {
        console.error("Error reading cgroup memory metrics:", err);
    }

    // Fallback to host OS metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const totalMemGB = (totalMem / (1024 ** 3)).toFixed(2);
    const usedMemGB = (usedMem / (1024 ** 3)).toFixed(2);
    return { totalMemGB, usedMemGB };
}

/**
 * Gets CPU usage percentage (scaled to 0-100% of container limits)
 */
function getCpuUsageMetric() {
    const now = Date.now();
    try {
        if (isCgroupsV2()) {
            const cpuStatPath = '/sys/fs/cgroup/cpu.stat';
            if (fs.existsSync(cpuStatPath)) {
                const content = fs.readFileSync(cpuStatPath, 'utf8');
                const match = content.match(/^usage_usec (\d+)/m);
                if (match) {
                    const currentUsageUsec = parseInt(match[1], 10);
                    
                    // Determine limit/cores
                    let limitCores = os.cpus().length;
                    const cpuMaxPath = '/sys/fs/cgroup/cpu.max';
                    if (fs.existsSync(cpuMaxPath)) {
                        const maxParts = fs.readFileSync(cpuMaxPath, 'utf8').trim().split(' ');
                        if (maxParts.length === 2 && maxParts[0] !== 'max') {
                            const quota = parseInt(maxParts[0], 10);
                            const period = parseInt(maxParts[1], 10);
                            if (quota > 0 && period > 0) {
                                limitCores = quota / period;
                            }
                        }
                    }

                    if (lastCpuUsage !== null && lastCpuTimestamp !== null) {
                        const deltaUsageUsec = currentUsageUsec - lastCpuUsage;
                        const deltaTimeUsec = (now - lastCpuTimestamp) * 1000;
                        if (deltaTimeUsec > 0) {
                            const usagePercent = (deltaUsageUsec / deltaTimeUsec) * 100;
                            // Scale by allocated cores
                            const scaledPercent = usagePercent / limitCores;
                            lastCpuUsage = currentUsageUsec;
                            lastCpuTimestamp = now;
                            return Math.min(Math.max(Math.round(scaledPercent), 0), 100);
                        }
                    }
                    lastCpuUsage = currentUsageUsec;
                    lastCpuTimestamp = now;
                    return 0;
                }
            }
        } else {
            // Check cgroups v1
            const cpuUsagePath = '/sys/fs/cgroup/cpuacct/cpuacct.usage';
            if (fs.existsSync(cpuUsagePath)) {
                const currentUsageNs = parseInt(fs.readFileSync(cpuUsagePath, 'utf8').trim(), 10);
                
                // Determine limit/cores
                let limitCores = os.cpus().length;
                const quotaPath = '/sys/fs/cgroup/cpu/cpu.cfs_quota_us';
                const periodPath = '/sys/fs/cgroup/cpu/cpu.cfs_period_us';
                if (fs.existsSync(quotaPath) && fs.existsSync(periodPath)) {
                    const quota = parseInt(fs.readFileSync(quotaPath, 'utf8').trim(), 10);
                    const period = parseInt(fs.readFileSync(periodPath, 'utf8').trim(), 10);
                    if (quota > 0 && period > 0) {
                        limitCores = quota / period;
                    }
                }

                if (lastCpuUsage !== null && lastCpuTimestamp !== null) {
                    const deltaUsageNs = currentUsageNs - lastCpuUsage;
                    const deltaTimeNs = (now - lastCpuTimestamp) * 1e6;
                    if (deltaTimeNs > 0) {
                        const usagePercent = (deltaUsageNs / deltaTimeNs) * 100;
                        const scaledPercent = usagePercent / limitCores;
                        lastCpuUsage = currentUsageNs;
                        lastCpuTimestamp = now;
                        return Math.min(Math.max(Math.round(scaledPercent), 0), 100);
                    }
                }
                lastCpuUsage = currentUsageNs;
                lastCpuTimestamp = now;
                return 0;
            }
        }
    } catch (err) {
        console.error("Error reading cgroup CPU metrics:", err);
    }

    // Fallback to host CPU calculation
    return getHostCpuUsage();
}

function getHostCpuUsage() {
    const cpus = os.cpus();
    if (!lastOsCpus) {
        lastOsCpus = cpus;
        return 0;
    }
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    for (let i = 0; i < cpus.length; i++) {
        if (!lastOsCpus[i]) continue;
        user += cpus[i].times.user - lastOsCpus[i].times.user;
        nice += cpus[i].times.nice - lastOsCpus[i].times.nice;
        sys += cpus[i].times.sys - lastOsCpus[i].times.sys;
        idle += cpus[i].times.idle - lastOsCpus[i].times.idle;
        irq += cpus[i].times.irq - lastOsCpus[i].times.irq;
    }
    lastOsCpus = cpus;
    const total = user + nice + sys + idle + irq;
    return total === 0 ? 0 : Math.min(100, Math.max(0, Math.round(((total - idle) / total) * 100)));
}

module.exports = {
    getMemoryMetrics,
    getCpuUsageMetric
};
