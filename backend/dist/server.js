"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js")); // Note the .js extension for NodeNext resolution
const db_js_1 = __importDefault(require("./config/db.js"));
const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    // Test the MySQL Connection Pool
    const connection = await db_js_1.default.getConnection();
    console.log("Successfully connected to the MySQL Database.");
    connection.release();
    app_js_1.default.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`,
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
