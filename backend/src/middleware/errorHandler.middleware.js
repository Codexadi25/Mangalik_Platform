const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

/* eslint-disable no-unused-vars */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  statusCode = statusCode || 500;
  message = message || "Internal server error.";

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${message}`);
  }

  // Never leak stack traces or internal details in production responses.
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
