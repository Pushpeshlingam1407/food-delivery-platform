import fs from "fs";
import path from "path";
import pool from "./config/db.js";

async function runSeed() {
  try {
    const seedFilePath = path.join(process.cwd(), "seed.sql");
    console.log("Reading seed file from:", seedFilePath);
    const sqlContent = fs.readFileSync(seedFilePath, "utf8");

    // Clean up carriage returns and split queries by semicolon followed by newline
    const queries = sqlContent
      .split(/;\r?\n/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith("--"));

    console.log(`Found ${queries.length} SQL queries to execute.`);

    const connection = await pool.getConnection();
    try {
      await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        if (query.startsWith("USE ") || query.startsWith("SET ")) {
          continue;
        }
        await connection.query(query);
      }
      await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
      console.log("Database successfully seeded with new Unsplash images!");
    } catch (err) {
      console.error("SQL Execution error:", err);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to run seed script:", error);
  } finally {
    process.exit(0);
  }
}

runSeed();
