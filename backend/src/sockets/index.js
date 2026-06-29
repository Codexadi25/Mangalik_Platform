const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

/**
 * Socket.io namespaces:
 *  - /tracking  → live order status push to customer
 *  - /support   → live chat between user and agent
 *  - /superadmin-live → real-time platform metrics for owner dashboard
 * Every socket connection is authenticated with the same JWT access
 * token used by the REST API — no anonymous sockets are accepted.
 */
module.exports = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: user=${socket.user.sub} role=${socket.user.role}`);

    socket.join(`user:${socket.user.sub}`);
    if (["admin", "superadmin", "manager", "agent"].includes(socket.user.role)) {
      socket.join("staff-room");
    }

    socket.on("order:track", (orderId) => socket.join(`order:${orderId}`));
    socket.on("support:typing", ({ ticketId }) => socket.to(`ticket:${ticketId}`).emit("support:typing"));

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: user=${socket.user.sub}`);
    });
  });
};
