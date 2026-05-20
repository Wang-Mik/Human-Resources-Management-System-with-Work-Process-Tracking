const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: WORK MANAGEMENT
 * Dựa trên Use Case: "Module 1: Work Management"
 * Bảng liên quan: WorkItem, SubTask, WorkAssignment, TaskHistoryLog
 */

// [USE CASE: Create Work Items] - Manager tạo công việc mới
router.post('/', async (req, res) => {
    try {
        const { title, description, workType, status, dueDate } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('WorkType', sql.NVarChar, workType)
            .input('Status', sql.NVarChar, status || 'Pending')
            .input('CreatedAt', sql.DateTime, new Date())
            .input('DueDate', sql.DateTime, new Date(dueDate))
            .query(`INSERT INTO WorkItem (Title, Description, WorkType, Status, CreatedAt, DueDate) 
                    OUTPUT INSERTED.WorkItemID
                    VALUES (@Title, @Description, @WorkType, @Status, @CreatedAt, @DueDate)`);
        
        res.status(201).json({ message: 'Work Item Created', id: result.recordset[0].WorkItemID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Assign Work] - Manager gán công việc cho Employee
router.post('/:id/assign', async (req, res) => {
    try {
        const workItemId = req.params.id;
        const { employeeId, assignedBy, roleInWork } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('WorkItemID', sql.Int, workItemId)
            .input('EmployeeID', sql.Int, employeeId)
            .input('AssignedBy', sql.Int, assignedBy)
            .input('AssignedAt', sql.DateTime, new Date())
            .input('AssignmentStatus', sql.NVarChar, 'Assigned')
            .input('RoleInWork', sql.NVarChar, roleInWork || 'Assignee')
            .query(`INSERT INTO WorkAssignment (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork) 
                    VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork)`);
        
        res.json({ message: 'Work Assigned Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: View Overall Work Status] - Manager/Employee xem danh sách và trạng thái công việc
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT w.*, e.Name as AssigneeName 
            FROM WorkItem w
            LEFT JOIN WorkAssignment wa ON w.WorkItemID = wa.WorkItemID
            LEFT JOIN Employee e ON wa.EmployeeID = e.EmployeeID
        `;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: View Task Progress] - Xem chi tiết 1 công việc
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .query('SELECT * FROM WorkItem WHERE WorkItemID = @WorkItemID');
        
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [USE CASE: Update Work Progress] - Employee cập nhật tiến độ công việc (Kèm theo ghi log vào TaskHistoryLog)
router.put('/:id/progress', async (req, res) => {
    try {
        const { status, employeeId, contextNote } = req.body;
        const pool = await poolPromise;
        
        // Update WorkItem Status
        await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE WorkItem SET Status = @Status WHERE WorkItemID = @WorkItemID');
        
        // Insert History Log
        await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .input('EmployeeID', sql.Int, employeeId)
            .input('ActionType', sql.NVarChar, 'Status Update')
            .input('ActionTimestamp', sql.DateTime, new Date())
            .input('ContextNote', sql.NVarChar, contextNote)
            .query(`INSERT INTO TaskHistoryLog (WorkItemID, EmployeeID, ActionType, ActionTimestamp, ContextNote) 
                    VALUES (@WorkItemID, @EmployeeID, @ActionType, @ActionTimestamp, @ContextNote)`);
        
        res.json({ message: 'Work Progress Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API phụ trợ (Chưa có trong sơ đồ nhưng cần thiết cho cấu trúc ERD) ---

// Tạo SubTask cho một WorkItem
router.post('/:id/subtasks', async (req, res) => {
    try {
        const { title } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .input('Title', sql.NVarChar, title)
            .input('Status', sql.NVarChar, 'Pending')
            .input('CreatedAt', sql.DateTime, new Date())
            .query(`INSERT INTO SubTask (WorkItemID, Title, Status, CreatedAt) 
                    VALUES (@WorkItemID, @Title, @Status, @CreatedAt)`);
        
        res.status(201).json({ message: 'SubTask Created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật trạng thái SubTask
router.put('/subtasks/:subtaskId', async (req, res) => {
    try {
        const { status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('SubTaskID', sql.Int, req.params.subtaskId)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE SubTask SET Status = @Status WHERE SubTaskID = @SubTaskID');
        
        res.json({ message: 'SubTask Status Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
