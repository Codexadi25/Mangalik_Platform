require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/**
 * Socket.io — used for real-time order status updates (delivery
 * tracking), live support chat, and superadmin live dashboard
 * metrics. Namespaced and CORS-locked to the two known frontends.
 */
const io = new Server(server, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    credentials: true,
  },
});
require("./sockets/index")(io);
app.set("io", io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Mangalik API server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();

// --- Graceful shutdown & crash safety ---
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully.");
  server.close(() => process.exit(0));
});
