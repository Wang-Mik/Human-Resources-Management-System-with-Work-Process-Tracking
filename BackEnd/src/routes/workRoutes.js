const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

/**
 * MODULE: WORK MANAGEMENT
 */

// [Create Work Items] 
router.post('/', async (req, res) => {
    try {
        const { title, description, document, workType, status, dueDate } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('Document', sql.NVarChar, document || null)
            .input('WorkType', sql.NVarChar, workType)
            .input('Status', sql.NVarChar, status || 'Pending')
            .input('CreatedAt', sql.DateTime, new Date())
            .input('DueDate', sql.DateTime, new Date(dueDate))
            .query(`INSERT INTO WorkItem (Title, Description, Document, WorkType, Status, CreatedAt, DueDate) 
                    OUTPUT INSERTED.WorkItemID
                    VALUES (@Title, @Description, @Document, @WorkType, @Status, @CreatedAt, @DueDate)`);

        res.status(201).json({ message: 'Work Item Created', id: result.recordset[0].WorkItemID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign multiple tasks to multiple employees all at once
router.post('/assignments/bulk', async (req, res) => {
    try {
        const { workItemIds, employeeIds, assignedBy, roleInWork, assignmentName, description, status } = req.body;
        const pool = await poolPromise;
        
        if (!Array.isArray(workItemIds) || workItemIds.length === 0) {
            return res.status(400).json({ error: "workItemIds must be a non-empty array" });
        }
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ error: "employeeIds must be a non-empty array" });
        }

        const cleanEmpIds = employeeIds.map(id => parseInt(id)).filter(Boolean);
        if (cleanEmpIds.length > 0) {
            const managerCheck = await pool.request()
                .query(`SELECT EmployeeID FROM Employee WHERE EmployeeID IN (${cleanEmpIds.join(',')}) AND Role LIKE '%Manager%'`);
            if (managerCheck.recordset.length > 0) {
                return res.status(400).json({ error: "Cannot assign tasks to managers." });
            }
        }

        // Just checking if we have a valid assigner ID
        const resolvedAssignedBy = assignedBy ? parseInt(assignedBy) : null;
        
        // Make a group code so we can edit/delete this batch together
        const groupCode = 'WAG-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();

        // Loop through each task and employee to make the assignments
        for (const workId of workItemIds) {
            for (const empId of employeeIds) {
                // If they are already assigned, skip it so we don't get duplicates
                const existing = await pool.request()
                    .input('WorkItemID', sql.Int, workId)
                    .input('EmployeeID', sql.Int, empId)
                    .query(`SELECT AssignmentID FROM WorkAssignment 
                            WHERE WorkItemID = @WorkItemID AND EmployeeID = @EmployeeID 
                              AND AssignmentStatus NOT IN ('Unassigned','Cancelled')`);

                if (existing.recordset.length > 0) continue; 

                await pool.request()
                    .input('WorkItemID',       sql.Int,      workId)
                    .input('EmployeeID',       sql.Int,      empId)
                    .input('AssignedBy',       sql.Int,      resolvedAssignedBy)
                    .input('AssignedAt',       sql.DateTime, new Date())
                    .input('AssignmentStatus', sql.NVarChar, status || 'Assigned')
                    .input('RoleInWork',       sql.NVarChar, roleInWork || 'Assignee')
                    .input('AssignmentName',   sql.NVarChar, assignmentName || 'General Assignment')
                    .input('Description',      sql.NVarChar, description || '')
                    .input('Status',           sql.NVarChar, status || 'Assigned')
                    .input('GroupCode',        sql.NVarChar, groupCode)
                    .query(`INSERT INTO WorkAssignment 
                        (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork, AssignmentName, Description, Status, WorkAssignmentGroup) 
                        VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork, @AssignmentName, @Description, @Status, @GroupCode)`);
            }
        }
        res.json({ message: `Bulk Work Assignments Created Successfully`, GroupID: groupCode, WorkAssignmentGroup: groupCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Assign Work] 
router.post('/:id/assign', async (req, res) => {
    try {
        const workItemId = req.params.id;
        const { employeeId, employeeIds, assignedBy, roleInWork, assignmentName, description, status } = req.body;
        const pool = await poolPromise;

        // Clear out old assignments for this specific task first
        await pool.request()
            .input('WorkItemID', sql.Int, workItemId)
            .query("DELETE FROM WorkAssignment WHERE WorkItemID = @WorkItemID");

        const targetEmployeeIds = Array.isArray(employeeIds) 
            ? employeeIds 
            : (employeeId ? [parseInt(employeeId)] : []);

        const cleanEmpIds = targetEmployeeIds.map(id => parseInt(id)).filter(Boolean);
        if (cleanEmpIds.length > 0) {
            const managerCheck = await pool.request()
                .query(`SELECT EmployeeID FROM Employee WHERE EmployeeID IN (${cleanEmpIds.join(',')}) AND Role LIKE '%Manager%'`);
            if (managerCheck.recordset.length > 0) {
                return res.status(400).json({ error: "Cannot assign tasks to managers." });
            }
        }

        for (const empId of targetEmployeeIds) {
            await pool.request()
                .input('WorkItemID', sql.Int, workItemId)
                .input('EmployeeID', sql.Int, empId)
                .input('AssignedBy', sql.Int, assignedBy)
                .input('AssignedAt', sql.DateTime, new Date())
                .input('AssignmentStatus', sql.NVarChar, status || 'Assigned')
                .input('RoleInWork', sql.NVarChar, roleInWork || 'Assignee')
                .input('AssignmentName', sql.NVarChar, assignmentName || null)
                .input('Description', sql.NVarChar, description || null)
                .input('Status', sql.NVarChar, status || 'Assigned')
                .query(`INSERT INTO WorkAssignment (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork, AssignmentName, Description, Status) 
                        VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork, @AssignmentName, @Description, @Status)`);
        }

        res.json({ message: 'Work Assigned Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a list of all assignments with details of tasks and employees
router.get('/assignments', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                wa.AssignmentID, wa.WorkItemID, wa.AssignedAt,
                wi.Title AS TaskTitle, wi.Status AS TaskStatus,
                e.EmployeeID, e.Name AS EmployeeName, e.Email AS EmployeeEmail, e.Role AS EmployeeRole, e.Department,
                wa.RoleInWork,
                wa.AssignmentName,
                wa.Description,
                wa.Status,
                wa.WorkAssignmentGroup,
                wa.WorkAssignmentGroup AS GroupID,
                CASE WHEN EXISTS (
                    SELECT 1 FROM HandOverItem hoi
                    JOIN HandOverRecord hor ON hoi.HandOverID = hor.HandOverID
                    WHERE hoi.AssignmentID = wa.AssignmentID AND hor.Status IN ('Initiated', 'Pending', 'Submitted')
                ) THEN 1 ELSE 0 END AS IsHandoverPending
            FROM WorkAssignment wa
            JOIN Employee e ON wa.EmployeeID = e.EmployeeID
            JOIN WorkItem wi ON wa.WorkItemID = wi.WorkItemID
            ORDER BY wa.AssignedAt DESC, wa.AssignmentID DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update details for a group of assignments
router.put('/assignments/group/update', async (req, res) => {
    try {
        let { groupId, workAssignmentGroup, assignmentIds, assignmentName, description, status, roleInWork, workItemIds, employeeIds } = req.body;
        const pool = await poolPromise;

        let targetGroupCode = workAssignmentGroup || groupId || null;

        // Try finding the group code from the first assignment ID if it wasn't provided directly
        if (!targetGroupCode && Array.isArray(assignmentIds) && assignmentIds.length > 0) {
            const temp = await pool.request()
                .input('FirstID', sql.Int, assignmentIds[0])
                .query('SELECT WorkAssignmentGroup FROM WorkAssignment WHERE AssignmentID = @FirstID');
            if (temp.recordset.length > 0) {
                targetGroupCode = temp.recordset[0].WorkAssignmentGroup;
            }
        }

        if (!targetGroupCode) {
            return res.status(400).json({ error: 'Valid WorkAssignmentGroup code is required' });
        }

        // Get details from one of the rows in the group so we can reuse them if needed
        const metaResult = await pool.request()
            .input('GroupCode', sql.NVarChar, targetGroupCode)
            .query('SELECT TOP 1 AssignmentName, Description, Status, RoleInWork, AssignedBy FROM WorkAssignment WHERE WorkAssignmentGroup = @GroupCode');
            
        if (metaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Assignment group not found' });
        }

        const originalMeta = metaResult.recordset[0];

        // Sync the assignments combinations if new list of tasks and employees are provided
        if (Array.isArray(workItemIds) && Array.isArray(employeeIds)) {
            const currentRows = await pool.request()
                .input('GroupCode', sql.NVarChar, targetGroupCode)
                .query('SELECT AssignmentID, WorkItemID, EmployeeID FROM WorkAssignment WHERE WorkAssignmentGroup = @GroupCode');

            const current = currentRows.recordset;

            const desired = [];
            for (const wId of workItemIds) {
                for (const eId of employeeIds) {
                    desired.push({ workItemId: wId, employeeId: eId });
                }
            }

            // Figure out what assignments we should delete and what to add
            const toDelete = current.filter(c => 
                !desired.some(d => d.workItemId === c.WorkItemID && d.employeeId === c.EmployeeID)
            );

            const toInsert = desired.filter(d =>
                !current.some(c => c.WorkItemID === d.workItemId && c.EmployeeID === d.employeeId)
            );

            if (toDelete.length > 0) {
                const deleteIds = toDelete.map(row => row.AssignmentID);
                const reqDel = pool.request();
                const idParams = [];
                for (let i = 0; i < deleteIds.length; i++) {
                    const paramName = `DelId${i}`;
                    reqDel.input(paramName, sql.Int, deleteIds[i]);
                    idParams.push(`@${paramName}`);
                }
                await reqDel.query(`DELETE FROM WorkAssignment WHERE AssignmentID IN (${idParams.join(', ')})`);
            }

            for (const item of toInsert) {
                await pool.request()
                    .input('WorkItemID',       sql.Int,      item.workItemId)
                    .input('EmployeeID',       sql.Int,      item.employeeId)
                    .input('GroupCode',        sql.NVarChar, targetGroupCode)
                    .input('AssignedBy',       sql.Int,      originalMeta.AssignedBy)
                    .input('AssignedAt',       sql.DateTime, new Date())
                    .input('AssignmentStatus', sql.NVarChar, status || originalMeta.Status || 'Assigned')
                    .input('RoleInWork',       sql.NVarChar, roleInWork || originalMeta.RoleInWork || 'Assignee')
                    .input('AssignmentName',   sql.NVarChar, assignmentName || originalMeta.AssignmentName)
                    .input('Description',      sql.NVarChar, description || originalMeta.Description)
                    .input('Status',           sql.NVarChar, status || originalMeta.Status || 'Assigned')
                    .query(`INSERT INTO WorkAssignment 
                        (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork, AssignmentName, Description, Status, WorkAssignmentGroup) 
                        VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork, @AssignmentName, @Description, @Status, @GroupCode)`);
            }
        }

        // Update name, description, status for everything in the group
        const waUpdates = [];
        const waReq = pool.request().input('GroupCode', sql.NVarChar, targetGroupCode);
        if (assignmentName !== undefined) { waUpdates.push('AssignmentName = @AssignmentName'); waReq.input('AssignmentName', sql.NVarChar, assignmentName); }
        if (description !== undefined)    { waUpdates.push('Description = @Description');       waReq.input('Description', sql.NVarChar, description); }
        if (status !== undefined)         { waUpdates.push('Status = @Status');                 waReq.input('Status', sql.NVarChar, status); waReq.input('AssignmentStatus2', sql.NVarChar, status); }
        if (roleInWork !== undefined)     { waUpdates.push('RoleInWork = @RoleInWork');         waReq.input('RoleInWork', sql.NVarChar, roleInWork); }

        if (waUpdates.length > 0) {
            let query = `UPDATE WorkAssignment SET ${waUpdates.join(', ')}`;
            if (status !== undefined) query += `, AssignmentStatus = @AssignmentStatus2`;
            query += ` WHERE WorkAssignmentGroup = @GroupCode`;
            await waReq.query(query);
        }

        res.json({ message: 'Grouped assignments updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Update Staff for a Single WorkItem in a Group]
router.put('/assignments/group/task-staff', async (req, res) => {
    try {
        const { groupId, workItemId, employeeIds } = req.body;
        const pool = await poolPromise;

        if (!groupId || !workItemId || !Array.isArray(employeeIds)) {
            return res.status(400).json({ error: 'groupId, workItemId, and employeeIds (array) are required' });
        }

        // Fetch meta details so new rows have matching status/names
        const metaResult = await pool.request()
            .input('GroupCode', sql.NVarChar, groupId)
            .query('SELECT TOP 1 AssignmentName, Description, Status, RoleInWork, AssignedBy FROM WorkAssignment WHERE WorkAssignmentGroup = @GroupCode');

        if (metaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Assignment group not found' });
        }

        const originalMeta = metaResult.recordset[0];

        // Delete old assignments first
        await pool.request()
            .input('GroupCode', sql.NVarChar, groupId)
            .input('WorkItemID', sql.Int, workItemId)
            .query('DELETE FROM WorkAssignment WHERE WorkAssignmentGroup = @GroupCode AND WorkItemID = @WorkItemID');

        // Write the new ones
        for (const empId of employeeIds) {
            await pool.request()
                .input('WorkItemID',       sql.Int,      workItemId)
                .input('EmployeeID',       sql.Int,      empId)
                .input('GroupCode',        sql.NVarChar, groupId)
                .input('AssignedBy',       sql.Int,      originalMeta.AssignedBy)
                .input('AssignedAt',       sql.DateTime, new Date())
                .input('AssignmentStatus', sql.NVarChar, originalMeta.Status || 'Assigned')
                .input('RoleInWork',       sql.NVarChar, originalMeta.RoleInWork || 'Assignee')
                .input('AssignmentName',   sql.NVarChar, originalMeta.AssignmentName)
                .input('Description',      sql.NVarChar, originalMeta.Description)
                .input('Status',           sql.NVarChar, originalMeta.Status || 'Assigned')
                .query(`INSERT INTO WorkAssignment 
                    (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork, AssignmentName, Description, Status, WorkAssignmentGroup) 
                    VALUES (@WorkItemID, @EmployeeID, @AssignedBy, @AssignedAt, @AssignmentStatus, @RoleInWork, @AssignmentName, @Description, @Status, @GroupCode)`);
        }

        res.json({ message: 'Employees doing this work item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a whole group of assignments
router.post('/assignments/group/delete', async (req, res) => {
    try {
        const { groupId, workAssignmentGroup, assignmentIds } = req.body;
        const pool = await poolPromise;

        let targetGroupCode = workAssignmentGroup || groupId || null;

        if (!targetGroupCode && Array.isArray(assignmentIds) && assignmentIds.length > 0) {
            const temp = await pool.request()
                .input('FirstID', sql.Int, assignmentIds[0])
                .query('SELECT WorkAssignmentGroup FROM WorkAssignment WHERE AssignmentID = @FirstID');
            if (temp.recordset.length > 0) {
                targetGroupCode = temp.recordset[0].WorkAssignmentGroup;
            }
        }

        if (!targetGroupCode) {
            return res.status(400).json({ error: 'Valid WorkAssignmentGroup code is required' });
        }

        await pool.request()
            .input('GroupCode', sql.NVarChar, targetGroupCode)
            .query('DELETE FROM WorkAssignment WHERE WorkAssignmentGroup = @GroupCode');

        res.json({ message: 'Grouped assignments removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status, description or name of a single assignment row
router.put('/assignments/:id', async (req, res) => {
    try {
        const { assignmentName, description, status, roleInWork } = req.body;
        const pool = await poolPromise;

        const updates = [];
        const request = pool.request().input('AssignmentID', sql.Int, req.params.id);

        if (assignmentName !== undefined) { updates.push('AssignmentName = @AssignmentName'); request.input('AssignmentName', sql.NVarChar, assignmentName); }
        if (description !== undefined)    { updates.push('Description = @Description');       request.input('Description', sql.NVarChar, description); }
        if (status !== undefined)         { updates.push('Status = @Status');                 request.input('Status', sql.NVarChar, status); request.input('AssignmentStatus2', sql.NVarChar, status); }
        if (roleInWork !== undefined)     { updates.push('RoleInWork = @RoleInWork');         request.input('RoleInWork', sql.NVarChar, roleInWork); }

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        let query = `UPDATE WorkAssignment SET ${updates.join(', ')}`;
        if (status !== undefined) query += `, AssignmentStatus = @AssignmentStatus2`;
        query += ` WHERE AssignmentID = @AssignmentID`;

        await request.query(query);
        res.json({ message: 'Assignment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a single assignment row by ID
router.delete('/assignments/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AssignmentID', sql.Int, req.params.id)
            .query('DELETE FROM WorkAssignment WHERE AssignmentID = @AssignmentID');
        res.json({ message: 'Assignment removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [View Overall Work Status] 
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Get all base task items
        const worksResult = await pool.request().query('SELECT * FROM WorkItem ORDER BY WorkItemID DESC');
        const works = worksResult.recordset;
        
        // Get all assignment entries
        const assignmentsResult = await pool.request().query(`
            SELECT wa.AssignmentID, wa.WorkItemID, e.EmployeeID, e.Name, e.Email, e.Role, wa.RoleInWork, wa.AssignmentName, wa.Description, wa.Status, wa.AssignedAt,
                CASE WHEN EXISTS (
                    SELECT 1 FROM HandOverItem hoi
                    JOIN HandOverRecord hor ON hoi.HandOverID = hor.HandOverID
                    WHERE hoi.AssignmentID = wa.AssignmentID AND hor.Status IN ('Initiated', 'Pending', 'Submitted')
                ) THEN 1 ELSE 0 END AS IsHandoverPending
            FROM WorkAssignment wa
            JOIN Employee e ON wa.EmployeeID = e.EmployeeID
            WHERE wa.AssignmentStatus IS NOT NULL
        `);
        const assignments = assignmentsResult.recordset;
        
        // Get all subtask items
        const subtasksResult = await pool.request().query('SELECT * FROM SubTask');
        const subtasks = subtasksResult.recordset;
        
        // Merge assignments and subtasks into each task object
        const combined = works.map(w => {
            const workAssignments = assignments.filter(a => a.WorkItemID === w.WorkItemID);
            const workSubtasks = subtasks.filter(s => s.WorkItemID === w.WorkItemID);
            
            return {
                ...w,
                Assignees: workAssignments.map(a => ({
                    AssignmentID: a.AssignmentID,
                    EmployeeID: a.EmployeeID,
                    Name: a.Name,
                    Email: a.Email,
                    Role: a.Role,
                    RoleInWork: a.RoleInWork,
                    AssignmentName: a.AssignmentName,
                    Description: a.Description,
                    Status: a.Status,
                    AssignedAt: a.AssignedAt,
                    IsHandoverPending: a.IsHandoverPending
                })),
                AssigneeName: workAssignments.map(a => a.Name).join(', ') || 'Unassigned',
                SubTasks: workSubtasks
            };
        });
        
        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single task item details including its assignees and subtasks
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const workId = req.params.id;
        
        const workResult = await pool.request()
            .input('WorkItemID', sql.Int, workId)
            .query('SELECT * FROM WorkItem WHERE WorkItemID = @WorkItemID');
            
        if (workResult.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
        
        const work = workResult.recordset[0];
        
        const assignmentsResult = await pool.request()
            .input('WorkItemID', sql.Int, workId)
            .query(`
                SELECT wa.WorkItemID, e.EmployeeID, e.Name, e.Email, e.Role, wa.RoleInWork, wa.AssignmentName, wa.Description, wa.Status
                FROM WorkAssignment wa
                JOIN Employee e ON wa.EmployeeID = e.EmployeeID
                WHERE wa.WorkItemID = @WorkItemID AND (wa.AssignmentStatus = 'Assigned' OR wa.AssignmentStatus = 'Active' OR wa.AssignmentStatus = 'Completed')
            `);
            
        const subtasksResult = await pool.request()
            .input('WorkItemID', sql.Int, workId)
            .query('SELECT * FROM SubTask WHERE WorkItemID = @WorkItemID');
            
        const combined = {
            ...work,
            Assignees: assignmentsResult.recordset.map(a => ({
                EmployeeID: a.EmployeeID,
                Name: a.Name,
                Email: a.Email,
                Role: a.Role,
                RoleInWork: a.RoleInWork,
                AssignmentName: a.AssignmentName,
                Description: a.Description,
                Status: a.Status
            })),
            AssigneeName: assignmentsResult.recordset.map(a => a.Name).join(', ') || 'Unassigned',
            SubTasks: subtasksResult.recordset
        };
        
        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update the progress state of a task and insert a status history log entry
router.put('/:id/progress', async (req, res) => {
    try {
        const { status, employeeId, contextNote } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE WorkItem SET Status = @Status WHERE WorkItemID = @WorkItemID');

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

// Create a subtask for a work item
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

// Update the title or status of a subtask
router.put('/subtasks/:subtaskId', async (req, res) => {
    try {
        const { status, title } = req.body;
        const pool = await poolPromise;
        
        let query = "UPDATE SubTask SET ";
        const request = pool.request().input('SubTaskID', sql.Int, req.params.subtaskId);
        
        const updates = [];
        if (status !== undefined) {
            updates.push("Status = @Status");
            request.input('Status', sql.NVarChar, status);
        }
        if (title !== undefined) {
            updates.push("Title = @Title");
            request.input('Title', sql.NVarChar, title);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        query += updates.join(", ") + " WHERE SubTaskID = @SubTaskID";
        await request.query(query);

        res.json({ message: 'SubTask Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a subtask
router.delete('/subtasks/:subtaskId', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('SubTaskID', sql.Int, req.params.subtaskId)
            .query('DELETE FROM SubTask WHERE SubTaskID = @SubTaskID');
        res.json({ message: 'SubTask Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit work item properties like title, description, workType, or dueDate
router.put('/:id', async (req, res) => {
    try {
        const { title, description, document, workType, dueDate, status, employeeId } = req.body;
        const pool = await poolPromise;
        
        // Fetch current status to check if it has changed
        const currentResult = await pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .query('SELECT Status FROM WorkItem WHERE WorkItemID = @WorkItemID');
        
        let oldStatus = null;
        if (currentResult.recordset.length > 0) {
            oldStatus = currentResult.recordset[0].Status;
        }

        let query = `UPDATE WorkItem 
                     SET Title = @Title, 
                         Description = @Description, 
                         Document = @Document, 
                         WorkType = @WorkType`;
         
        const request = pool.request()
            .input('WorkItemID', sql.Int, req.params.id)
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .input('Document', sql.NVarChar, document || null)
            .input('WorkType', sql.NVarChar, workType);
            
        if (status) {
            query += `, Status = @Status`;
            request.input('Status', sql.NVarChar, status);
        }

        if (dueDate) {
            query += `, DueDate = @DueDate`;
            request.input('DueDate', sql.DateTime, new Date(dueDate));
        }
        
        query += ` WHERE WorkItemID = @WorkItemID`;
        await request.query(query);

        // If status changed, write to history log
        if (status && status !== oldStatus) {
            await pool.request()
                .input('WorkItemID', sql.Int, req.params.id)
                .input('EmployeeID', sql.Int, employeeId || null)
                .input('ActionType', sql.NVarChar, 'Status Update')
                .input('ActionTimestamp', sql.DateTime, new Date())
                .input('ContextNote', sql.NVarChar, `Status updated to ${status} via task details edit`)
                .query(`INSERT INTO TaskHistoryLog (WorkItemID, EmployeeID, ActionType, ActionTimestamp, ContextNote) 
                        VALUES (@WorkItemID, @EmployeeID, @ActionType, @ActionTimestamp, @ContextNote)`);
        }
        
        res.json({ message: 'Work Item Updated Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
