const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: EMPLOYEE
 */

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT EmployeeID, Name, Email, Role, Department, Position, EmploymentStatus FROM Employee');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('EmployeeID', sql.Int, req.params.id)
            .query('SELECT EmployeeID, Name, Email, Role, Department, Position, EmploymentStatus FROM Employee WHERE EmployeeID = @EmployeeID');
        
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Employee not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, department, position, status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('Password', sql.NVarChar, password) 
            .input('Role', sql.NVarChar, role)
            .input('Department', sql.NVarChar, department)
            .input('Position', sql.NVarChar, position)
            .input('EmploymentStatus', sql.NVarChar, status || 'Active')
            .query(`INSERT INTO Employee (Name, Email, Password, Role, Department, Position, EmploymentStatus) 
                    VALUES (@Name, @Email, @Password, @Role, @Department, @Position, @EmploymentStatus)`);
        
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});//not implemented in front end

router.put('/:id', async (req, res) => {
    try {
        const { name, department, position, status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('EmployeeID', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, name)
            .input('Department', sql.NVarChar, department)
            .input('Position', sql.NVarChar, position)
            .input('EmploymentStatus', sql.NVarChar, status)
            .query(`UPDATE Employee 
                    SET Name = @Name, Department = @Department, Position = @Position, EmploymentStatus = @EmploymentStatus 
                    WHERE EmployeeID = @EmployeeID`);
        
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
