import http from "http";
import https from "https";
import fs from "fs";
import app from "./app.js";
import pool from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Strengthen server robustness against unexpected query drops or promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "CRITICAL: Unhandled Promise Rejection at:",
    promise,
    "reason:",
    reason,
  );
});

process.on("uncaughtException", (error) => {
  console.error("CRITICAL: Uncaught Exception thrown:", error);
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the MySQL Database.");
    connection.release();

    const useTls = process.env.TLS_ENABLED === "true";
    if (
      process.env.NODE_ENV === "production" &&
      !useTls &&
      process.env.TRUSTED_TLS_PROXY !== "true"
    ) {
      throw new Error(
        "Production requires TLS_ENABLED=true or TRUSTED_TLS_PROXY=true.",
      );
    }
    const server = useTls
      ? https.createServer(
          {
            key: fs.readFileSync(process.env.TLS_KEY_PATH),
            cert: fs.readFileSync(process.env.TLS_CERT_PATH),
            ...(process.env.TLS_CA_PATH
              ? { ca: fs.readFileSync(process.env.TLS_CA_PATH) }
              : {}),
          },
          app,
        )
      : http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(
        `${useTls ? "HTTPS" : "HTTP"} server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode with Socket.IO enabled.`,
      );
    });
  } catch (error) {
    console.error(
      "Failed to initialize application or connect to the database:",
      error,
    );
    process.exit(1);
  }
}

startServer();
