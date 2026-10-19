const sql = require("mssql");

const config = {
  server: "localhost",
  port: 1433,
  user: "smartstudy",
  password: "SmartStudy123!",
  database: "SmartStudy",

  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = sql.connect(config).then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    throw error;
  });

module.exports = {
  sql,
  poolPromise
};