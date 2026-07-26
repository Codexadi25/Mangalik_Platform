const winston = require("winston");
const path = require("path");

// Custom Winston Transport for MongoDB that safely handles failures asynchronously
const Transport = require("winston-transport");
class DatabaseTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const { level, message, ...meta } = info;
    const Log = require("../models/Log.model");
    
    // Asynchronously save to DB without blocking or crashing if connection fails
    Log.create({ level, message, meta }).catch((err) => {
      console.error("Failed to write log to Database:", err.message);
    });

    if (callback) callback();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/combined.log") }),
    new DatabaseTransport()
  ],
});

module.exports = logger;
