const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: BOTTLENECK MANAGEMENT
 */

// [Monitor Workload] - Lấy dữ liệu tổng quan về phân bổ khối lượng công việc
router.get('/workload', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                e.EmployeeID, 
                e.Name, 
                e.Department, 
                COUNT(wa.AssignmentID) as ActiveTasks 
            FROM Employee e
            LEFT JOIN WorkAssignment wa ON e.EmployeeID = wa.EmployeeID AND wa.AssignmentStatus IN ('Assigned', 'Active')
            GROUP BY e.EmployeeID, e.Name, e.Department
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Detect Bottleneck]
router.get('/detect', async (req, res) => {
    try {
        const pool = await poolPromise;
        // employees with > 10 active tasks
        const overdueTasks = await pool.request().query(`
            SELECT * FROM WorkItem 
            WHERE DueDate < GETDATE() AND Status != 'Completed'
        `);
        const overloadedStaff = await pool.request().query(`
            SELECT 
                e.EmployeeID, e.Name, COUNT(wa.AssignmentID) as TaskCount
            FROM Employee e
            JOIN WorkAssignment wa ON e.EmployeeID = wa.EmployeeID
            WHERE wa.AssignmentStatus IN ('Assigned', 'Active')
            GROUP BY e.EmployeeID, e.Name
            HAVING COUNT(wa.AssignmentID) > 5
        `);
        
        res.json({
            overdueTasks: overdueTasks.recordset,
            overloadedStaff: overloadedStaff.recordset
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Suggest Reassignment]
router.get('/suggestions/:workId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('WorkItemID', sql.Int, req.params.workId)
            .query(`
                SELECT e.EmployeeID, e.Name, COUNT(wa.AssignmentID) as ActiveTasks
                FROM Employee e
                LEFT JOIN WorkAssignment wa ON e.EmployeeID = wa.EmployeeID AND wa.AssignmentStatus IN ('Assigned', 'Active')
                WHERE e.EmployeeID NOT IN (SELECT EmployeeID FROM WorkAssignment WHERE WorkItemID = @WorkItemID AND AssignmentStatus IN ('Assigned', 'Active'))
                GROUP BY e.EmployeeID, e.Name
                ORDER BY ActiveTasks ASC
            `);
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Reassign Work]
router.post('/reassign', async (req, res) => {
    try {
        const { workItemId, newEmployeeId, reassignedBy, reason } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('WorkItemID', sql.Int, workItemId)
            .input('UnAssignedAt', sql.DateTime, new Date())
            .query(`UPDATE WorkAssignment 
                    SET AssignmentStatus = 'Unassigned', UnAssignedAt = @UnAssignedAt 
                    WHERE WorkItemID = @WorkItemID AND AssignmentStatus IN ('Assigned', 'Active')`);
        
        await pool.request()
            .input('WorkItemID', sql.Int, workItemId)
            .input('EmployeeID', sql.Int, newEmployeeId)
            .input('AssignedBy', sql.Int, reassignedBy)
            .input('AssignedAt', sql.DateTime, new Date())
            .input('AssignmentStatus', sql.NVarChar, 'Assigned')
            .input('RoleInWork', sql.NVarChar, 'Assignee')
            .query(`INSERT INTO WorkAssignment (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork) 
                    VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork)`);
        
        await pool.request()
            .input('WorkItemID', sql.Int, workItemId)
            .input('EmployeeID', sql.Int, reassignedBy)
            .input('ActionType', sql.NVarChar, 'Reassign')
            .input('ActionTimestamp', sql.DateTime, new Date())
            .input('ContextNote', sql.NVarChar, reason || 'Task Reassigned')
            .query(`INSERT INTO TaskHistoryLog (WorkItemID, EmployeeID, ActionType, ActionTimestamp, ContextNote) 
                    VALUES (@WorkItemID, @EmployeeID, @ActionType, @ActionTimestamp, @ContextNote)`);
        
        res.json({ message: 'Task Reassigned Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
