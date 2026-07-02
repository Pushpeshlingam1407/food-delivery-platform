import app from './app.js';
import pool from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL Database.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Failed to initialize application or connect to the database:', error);
    process.exit(1);
  }
}

startServer();
