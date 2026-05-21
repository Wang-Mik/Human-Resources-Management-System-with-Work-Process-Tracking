const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: WORKFORCE AVAILABILITY
 */

router.post('/attendance', async (req, res) => {
    try {
        const { employeeId, type } = req.body;
        const pool = await poolPromise;

        if (type === 'CheckIn') {
            // Block if there is already an open session
            const openSession = await pool.request()
                .input('EmployeeID', sql.Int, employeeId)
                .query(`SELECT TOP 1 AttendanceID FROM Attendance
                        WHERE EmployeeID = @EmployeeID
                          AND WorkingDate = CAST(GETDATE() AS DATE)
                          AND CheckOutTime IS NULL`);

            if (openSession.recordset.length > 0) {
                return res.status(409).json({ error: 'Already clocked in' });
            }

            await pool.request()
                .input('EmployeeID', sql.Int, employeeId)
                .input('CheckInTime', sql.DateTime, new Date())
                .query(`INSERT INTO Attendance (EmployeeID, WorkingDate, CheckInTime, Status)
                        VALUES (@EmployeeID, CAST(GETDATE() AS DATE), @CheckInTime, 'Present')`);

        } else if (type === 'CheckOut') {
            // Close only the most recent open session
            await pool.request()
                .input('EmployeeID', sql.Int, employeeId)
                .input('CheckOutTime', sql.DateTime, new Date())
                .query(`UPDATE TOP(1) Attendance SET CheckOutTime = @CheckOutTime
                        WHERE EmployeeID = @EmployeeID
                          AND WorkingDate = CAST(GETDATE() AS DATE)
                          AND CheckOutTime IS NULL`);
        }

        res.json({ message: `Attendance ${type} recorded successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update availability status (Available / Busy / Emergency)
router.post('/status', async (req, res) => {
    try {
        const { employeeId, status, reason } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('EmployeeID', sql.Int, employeeId)
            .input('StartTime', sql.DateTime, new Date())
            .input('Status', sql.NVarChar, status)
            .input('Reason', sql.NVarChar, reason || '')
            .query(`INSERT INTO EmployeeAvailability (EmployeeID, StartTime, Status, Reason)
                    VALUES (@EmployeeID, @StartTime, @Status, @Reason)`);
        res.json({ message: 'Availability status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the most recent attendance record for today for a specific employee
router.get('/attendance/today/:employeeId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('EmployeeID', sql.Int, req.params.employeeId)
            .query(`SELECT TOP 1 * FROM Attendance
                    WHERE EmployeeID = @EmployeeID AND WorkingDate = CAST(GETDATE() AS DATE)
                    ORDER BY CheckInTime DESC`);
        res.json(result.recordset[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT e.EmployeeID, e.Name, e.Department, e.Role,
                   COALESCE(ea.Status, 'Available') as CurrentStatus
            FROM Employee e
            LEFT JOIN (
                SELECT EmployeeID, Status, ROW_NUMBER() OVER(PARTITION BY EmployeeID ORDER BY StartTime DESC) as rn
                FROM EmployeeAvailability
            ) ea ON e.EmployeeID = ea.EmployeeID AND ea.rn = 1
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
