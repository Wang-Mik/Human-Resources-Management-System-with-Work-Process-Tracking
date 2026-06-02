const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Helper to decode the token and see who is logged in
const getUserFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return null;
        }
    }
    return null;
};

/**
 * MODULE: HANDOVER MANAGEMENT
 */

router.post('/initiate', async (req, res) => {
    try {
        const { fromEmployeeId, toEmployeeId, reason } = req.body;
        const pool = await poolPromise;

        // Check if ToEmployeeID is a manager
        const managerCheck = await pool.request()
            .input('EmployeeID', sql.Int, toEmployeeId)
            .query("SELECT EmployeeID FROM Employee WHERE EmployeeID = @EmployeeID AND Role LIKE '%Manager%'");
        if (managerCheck.recordset.length > 0) {
            return res.status(400).json({ error: "Cannot initiate handover to managers." });
        }

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

// [Record Handover Detail] 
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

// [Submit Handover] 
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

// [Review Handover] 
router.put('/:id/review', async (req, res) => {
    try {
        const { status } = req.body;
        const pool = await poolPromise;
        const handoverId = req.params.id;

        if (status === 'Approved') {
            // 1. Get FromEmployeeID and ToEmployeeID
            const hoResult = await pool.request()
                .input('HandOverID', sql.Int, handoverId)
                .query('SELECT FromEmployeeID, ToEmployeeID FROM HandOverRecord WHERE HandOverID = @HandOverID');

            if (hoResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Handover record not found' });
            }

            const { FromEmployeeID, ToEmployeeID } = hoResult.recordset[0];

            // 2. Get all AssignmentIDs in this handover
            const itemsResult = await pool.request()
                .input('HandOverID', sql.Int, handoverId)
                .query('SELECT AssignmentID FROM HandOverItem WHERE HandOverID = @HandOverID');

            const assignmentIds = itemsResult.recordset.map(r => r.AssignmentID);

            // 3. Perform the slot transfer for each assignment
            for (const assignmentId of assignmentIds) {
                await pool.request()
                    .input('AssignmentID', sql.Int, assignmentId)
                    .input('FromEmployeeID', sql.Int, FromEmployeeID)
                    .input('ToEmployeeID', sql.Int, ToEmployeeID)
                    .query(`
                        UPDATE WorkAssignment 
                        SET EmployeeID = @ToEmployeeID 
                        WHERE AssignmentID = @AssignmentID AND EmployeeID = @FromEmployeeID
                    `);
            }
        }

        await pool.request()
            .input('HandOverID', sql.Int, handoverId)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE HandOverRecord SET Status = @Status WHERE HandOverID = @HandOverID');

        res.json({ message: `Handover ${status} and assignments transferred if approved` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Accept Handover] 
router.post('/:id/accept', async (req, res) => {
    try {
        const pool = await poolPromise;
        const handoverId = req.params.id;

        // 1. Get FromEmployeeID and ToEmployeeID
        const hoResult = await pool.request()
            .input('HandOverID', sql.Int, handoverId)
            .query('SELECT FromEmployeeID, ToEmployeeID FROM HandOverRecord WHERE HandOverID = @HandOverID');

        if (hoResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Handover record not found' });
        }

        const { FromEmployeeID, ToEmployeeID } = hoResult.recordset[0];

        // 2. Get all AssignmentIDs in this handover
        const itemsResult = await pool.request()
            .input('HandOverID', sql.Int, handoverId)
            .query('SELECT AssignmentID FROM HandOverItem WHERE HandOverID = @HandOverID');

        const assignmentIds = itemsResult.recordset.map(r => r.AssignmentID);

        // 3. Perform the slot transfer for each assignment
        for (const assignmentId of assignmentIds) {
            await pool.request()
                .input('AssignmentID', sql.Int, assignmentId)
                .input('FromEmployeeID', sql.Int, FromEmployeeID)
                .input('ToEmployeeID', sql.Int, ToEmployeeID)
                .query(`
                    UPDATE WorkAssignment 
                    SET EmployeeID = @ToEmployeeID 
                    WHERE AssignmentID = @AssignmentID AND EmployeeID = @FromEmployeeID
                `);
        }

        // 4. Set Handover status to Approved
        await pool.request()
            .input('HandOverID', sql.Int, handoverId)
            .input('Status', sql.NVarChar, 'Approved')
            .query('UPDATE HandOverRecord SET Status = @Status WHERE HandOverID = @HandOverID');

        res.json({ message: 'Handover Accepted and assignments transferred' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [Reject Handover] 
router.post('/:id/reject', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('HandOverID', sql.Int, req.params.id)
            .input('Status', sql.NVarChar, 'Rejected')
            .query('UPDATE HandOverRecord SET Status = @Status WHERE HandOverID = @HandOverID');

        res.json({ message: 'Handover Rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [View Handover Records] 
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const user = getUserFromToken(req);
        const { employeeId } = req.query;

        let query = `
            SELECT h.*, 
                   e1.Name as FromName,
                   e2.Name as ToName
            FROM HandOverRecord h
            LEFT JOIN Employee e1 ON h.FromEmployeeID = e1.EmployeeID
            LEFT JOIN Employee e2 ON h.ToEmployeeID = e2.EmployeeID
        `;

        const request = pool.request();

        if (user && user.role !== 'Manager') {
            query += ` WHERE h.FromEmployeeID = @EmployeeID OR h.ToEmployeeID = @EmployeeID`;
            request.input('EmployeeID', sql.Int, user.id);
        } else if (employeeId) {
            query += ` WHERE h.FromEmployeeID = @EmployeeID OR h.ToEmployeeID = @EmployeeID`;
            request.input('EmployeeID', sql.Int, parseInt(employeeId));
        }

        query += ` ORDER BY h.CreatedAt DESC`;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [View Handover Items] 
router.get('/:id/items', async (req, res) => {
    try {
        const pool = await poolPromise;
        const user = getUserFromToken(req);

        if (user && user.role !== 'Manager') {
            const checkQuery = `SELECT FromEmployeeID, ToEmployeeID FROM HandOverRecord WHERE HandOverID = @CheckID`;
            const checkResult = await pool.request()
                .input('CheckID', sql.Int, req.params.id)
                .query(checkQuery);

            if (checkResult.recordset.length > 0) {
                const ho = checkResult.recordset[0];
                if (ho.FromEmployeeID !== user.id && ho.ToEmployeeID !== user.id) {
                    return res.status(403).json({ message: 'Forbidden: You can only view your own handovers' });
                }
            }
        }

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
