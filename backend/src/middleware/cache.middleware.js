const logger = require("../utils/logger");

const memoryCache = new Map();

/**
 * Express middleware to cache responses in-memory (100% Free)
 * and set Cloudflare/CDN Cache-Control headers.
 * 
 * @param {number} durationInSeconds - Cache TTL in seconds
 */
const cacheRoute = (durationInSeconds) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // 1. Try to get from local Node.js Memory Cache
      let cachedData = null;
      const memEntry = memoryCache.get(key);
      if (memEntry && memEntry.expiry > Date.now()) {
        cachedData = memEntry.data;
      } else if (memEntry) {
        memoryCache.delete(key);
      }

      // Tell Cloudflare and Browsers to cache this response
      res.setHeader('Cache-Control', `public, s-maxage=${durationInSeconds}, max-age=${durationInSeconds}`);

      if (cachedData) {
        logger.info(`Memory Cache HIT for ${key}`);
        const parsed = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
        return res.status(200).json(parsed);
      }

      logger.info(`Memory Cache MISS for ${key}`);

      // 2. Intercept res.json to capture response
      const originalJson = res.json;
      res.json = function (body) {
        // Restore original res.json to avoid infinite loops if it's called again
        res.json = originalJson;

        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          memoryCache.set(key, {
            data: body,
            expiry: Date.now() + durationInSeconds * 1000,
          });
        }

        // Send the response
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      logger.error(`Cache middleware error: ${err.message}`);
      next(); // On error, bypass cache and process normally
    }
  };
};

module.exports = { cacheRoute };
