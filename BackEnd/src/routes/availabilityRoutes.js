const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: WORKFORCE AVAILABILITY
 * Dựa trên Use Case: "Module 4: Workforce Ability"
 * Bảng liên quan: Attendance, EmployeeAvailability
 */

// [USE CASE: Record Attendance] - Nhân viên check-in / check-out
router.post('/attendance', async (req, res) => {
    try {
        const { employeeId, type } = req.body; // type: 'CheckIn' or 'CheckOut'
        const pool = await poolPromise;
        
        if (type === 'CheckIn') {
            await pool.request()
                .input('EmployeeID', sql.Int, employeeId)
                .input('WorkingDate', sql.Date, new Date())
                .input('CheckInTime', sql.DateTime, new Date())
                .input('Status', sql.NVarChar, 'Present')
                .query(`INSERT INTO Attendance (EmployeeID, WorkingDate, CheckInTime, Status) 
                        VALUES (@EmployeeID, @WorkingDate, @CheckInTime, @Status)`);
        } else if (type === 'CheckOut') {
            await pool.request()
                .input('EmployeeID', sql.Int, employeeId)
                .input('WorkingDate', sql.Date, new Date())
                .input('CheckOutTime', sql.DateTime, new Date())
                .query(`UPDATE Attendance SET CheckOutTime = @CheckOutTime 
                        WHERE EmployeeID = @EmployeeID AND WorkingDate = @WorkingDate`);
        }
        
        res.json({ message: `Attendance ${type} recorded successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Update Availability Status] - Cập nhật trạng thái (Available, Busy, Emergency) và lý do (nếu có)
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

// [USE CASE: View Employee Availability] - Lấy danh sách nhân viên và trạng thái hiện tại của họ
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
