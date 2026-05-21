const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

/*
 * MODULE: AUTHENTICATION
 */

// Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT EmployeeID, Name, Email, Role, Department FROM Employee WHERE Email = @Email');
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = result.recordset[0];
        // TODO: In a real app, compare hashed password using bcrypt.
        // For simplicity, we are assuming plain text match here or bypassing.
        
        const token = jwt.sign(
            { id: user.EmployeeID, email: user.Email, role: user.Role, name: user.Name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({ message: 'Login successful', user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng ký
// router.post('/register', async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;
//         const pool = await poolPromise;
//         await pool.request()
//             .input('Name', sql.NVarChar, name)
//             .input('Email', sql.NVarChar, email)
//             .input('Password', sql.NVarChar, password) // Should be hashed
//             .input('Role', sql.NVarChar, role)
//             .query(`INSERT INTO Employee (Name, Email, Password, Role) VALUES (@Name, @Email, @Password, @Role)`);
        
//         res.status(201).json({ message: 'Registration successful' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// Lấy thông tin tài khoản hiện tại
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
