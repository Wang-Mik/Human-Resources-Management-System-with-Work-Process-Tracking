const express = require('express');
const router = express.Router();

/**
 * MODULE: WORK MANAGEMENT
 * Dựa trên Use Case: "Module 1: Work Management"
 * Bảng liên quan: WorkItem, SubTask, WorkAssignment, TaskHistoryLog
 */

// [USE CASE: Create Work Items] - Manager tạo công việc mới
router.post('/', (req, res) => {
    res.json({ message: 'Create Work Item API (To be implemented)' });
});

// [USE CASE: Assign Work] - Manager gán công việc cho Employee
router.post('/:id/assign', (req, res) => {
    res.json({ message: 'Assign Work API (To be implemented)' });
});

// [USE CASE: View Overall Work Status] - Manager/Employee xem danh sách và trạng thái công việc
router.get('/', (req, res) => {
    res.json({ message: 'Get all work items (Overall Status) API (To be implemented)' });
});

// [USE CASE: View Task Progress] - Xem chi tiết 1 công việc
router.get('/:id', (req, res) => {
    res.json({ message: 'Get work item details & progress API (To be implemented)' });
});

// [USE CASE: Update Work Progress] - Employee cập nhật tiến độ công việc (Kèm theo ghi log vào TaskHistoryLog)
router.put('/:id/progress', (req, res) => {
    res.json({ message: 'Update Work Progress API (To be implemented)' });
});

// --- API phụ trợ (Chưa có trong sơ đồ nhưng cần thiết cho cấu trúc ERD) ---

// Tạo SubTask cho một WorkItem (Do ERD có bảng SubTask)
router.post('/:id/subtasks', (req, res) => {
    res.json({ message: 'Create SubTask API (To be implemented)' });
});

// Cập nhật trạng thái SubTask
router.put('/subtasks/:subtaskId', (req, res) => {
    res.json({ message: 'Update SubTask Status API (To be implemented)' });
});

module.exports = router;
