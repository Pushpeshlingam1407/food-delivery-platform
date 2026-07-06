import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket Client connected: ${socket.id}`);

    socket.on("join_order", (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined tracking room: order_${orderId}`);
    });

    socket.on(
      "driver_location",
      ({ driverId, orderId, latitude, longitude, bearing }) => {
        io.to(`order_${orderId}`).emit("location_update", {
          driverId,
          latitude,
          longitude,
          bearing,
          timestamp: new Date().toISOString(),
        });
      },
    );

    socket.on("disconnect", () => {
      console.log(`Socket Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function notifyOrderStatus(orderId, status) {
  if (io) {
    io.to(`order_${orderId}`).emit("status_update", {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
    console.log(
      `WebSocket: Dispatched status update [${status}] for order_${orderId}`,
    );
  }
}
