const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: HANDOVER MANAGEMENT
 * Dựa trên Use Case: "Module 2: Handover Management"
 * Bảng liên quan: HandOverRecord, HandOverItem
 */

// [USE CASE: Initiate Handover] - Khởi tạo bàn giao ca
router.post('/initiate', async (req, res) => {
    try {
        const { fromEmployeeId, toEmployeeId, reason } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FromEmployeeID', sql.Int, fromEmployeeId)
            .input('ToEmployeeID', sql.Int, toEmployeeId)
            .input('Reason', sql.NVarChar, reason)
            .input('Status', sql.NVarChar, 'Initiated')
            .input('CreatedAt', sql.DateTime, new Date())
            .query(`INSERT INTO HandOverRecord (FromEmployeeID, ToEmployeeID, Reason, Status, CreatedAt) 
                    OUTPUT INSERTED.HandOverID
                    VALUES (@FromEmployeeID, @ToEmployeeID, @Reason, @Status, @CreatedAt)`);
        
        res.status(201).json({ message: 'Handover Initiated', id: result.recordset[0].HandOverID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Record Handover Detail] - Thêm các task cần bàn giao (HandOverItem) vào Record
router.post('/:id/items', async (req, res) => {
    try {
        const handoverId = req.params.id;
        const { assignmentId, note } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('HandOverID', sql.Int, handoverId)
            .input('AssignmentID', sql.Int, assignmentId)
            .input('Note', sql.NVarChar, note)
            .query(`INSERT INTO HandOverItem (HandOverID, AssignmentID, Note) 
                    VALUES (@HandOverID, @AssignmentID, @Note)`);
        
        res.status(201).json({ message: 'Handover Item Added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Submit Handover] - Nhân viên xác nhận hoàn tất việc điền bàn giao
router.post('/:id/submit', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('HandOverID', sql.Int, req.params.id)
            .input('Status', sql.NVarChar, 'Submitted')
            .query('UPDATE HandOverRecord SET Status = @Status WHERE HandOverID = @HandOverID');
        
        res.json({ message: 'Handover Submitted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Review Handover] - Quản lý hoặc người nhận xem xét bản bàn giao
router.put('/:id/review', async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'Approved', 'Rejected'
        const pool = await poolPromise;
        await pool.request()
            .input('HandOverID', sql.Int, req.params.id)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE HandOverRecord SET Status = @Status WHERE HandOverID = @HandOverID');
        
        res.json({ message: `Handover ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: View Handover Records] - Xem danh sách các lịch sử bàn giao
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT h.*, 
                   e1.Name as FromName,
                   e2.Name as ToName
            FROM HandOverRecord h
            LEFT JOIN Employee e1 ON h.FromEmployeeID = e1.EmployeeID
            LEFT JOIN Employee e2 ON h.ToEmployeeID = e2.EmployeeID
        `;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: View Handover Items] - Xem chi tiết các task cụ thể trong 1 bản bàn giao
router.get('/:id/items', async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT hi.*, w.Title, w.Description, w.WorkItemID
            FROM HandOverItem hi
            LEFT JOIN WorkAssignment wa ON hi.AssignmentID = wa.AssignmentID
            LEFT JOIN WorkItem w ON wa.WorkItemID = w.WorkItemID
            WHERE hi.HandOverID = @HandOverID
        `;
        const result = await pool.request()
            .input('HandOverID', sql.Int, req.params.id)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
