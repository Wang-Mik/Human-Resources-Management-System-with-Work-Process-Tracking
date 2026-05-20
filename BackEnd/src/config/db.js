const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'HMSDB',
    options: {
        encrypt: false, // Set to true if you're on Azure
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql, poolPromise
};
