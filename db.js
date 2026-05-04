const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: Number(process.env.MAX_CONNECTION), // max connections in pool
  queueLimit: 10,
});

const query = async (text, params) => {
  return await pool.query(text, params);
};

async function checkConnection() {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log("✅ MySQL connection successful!");

    // Optionally, test a simple query
    const [rows] = await connection.query("SELECT NOW() AS currentTime");
    console.log("Server time:", rows[0].currentTime);

    // Release the connection back to the pool
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
}

const bulkInsert = async (table, column, values) => {
  return await query(`INSERT INTO ${table} (${column}) VALUES ?`, [values]);
};

module.exports = {
  pool,
  query,
  checkConnection,
  bulkInsert,
};
