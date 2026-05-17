const express = require('express');
const router = express.Router();

/**
 * MODULE: EMPLOYEE
 * Tình trạng: [BỔ SUNG] - Không có trong sơ đồ thiết kế Use Case gốc nhưng CẦN THIẾT để:
 * 1. Manager lấy danh sách nhân viên để gán việc (Assign Work).
 * 2. Employee lấy danh sách đồng nghiệp để Bàn giao (Initiate Handover).
 */

// Lấy danh sách tất cả nhân viên (có thể lọc theo phòng ban, trạng thái)
router.get('/', (req, res) => {
    res.json({ message: 'Get all employees API (To be implemented)' });
});

// Lấy chi tiết một nhân viên
router.get('/:id', (req, res) => {
    res.json({ message: 'Get employee details API (To be implemented)' });
});

// Thêm/Sửa thông tin nhân viên (dành cho Admin)
router.post('/', (req, res) => {
    res.json({ message: 'Create employee API (To be implemented)' });
});

router.put('/:id', (req, res) => {
    res.json({ message: 'Update employee API (To be implemented)' });
});

module.exports = router;
