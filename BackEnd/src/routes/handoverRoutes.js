const express = require('express');
const router = express.Router();

/**
 * MODULE: HANDOVER MANAGEMENT
 * Dựa trên Use Case: "Module 2: Handover Management"
 * Bảng liên quan: HandOverRecord, HandOverItem
 */

// [USE CASE: Initiate Handover] - Khởi tạo bàn giao ca
router.post('/initiate', (req, res) => {
    res.json({ message: 'Initiate Handover API (To be implemented)' });
});

// [USE CASE: Record Handover Detail] - Thêm các task cần bàn giao (HandOverItem) vào Record
router.post('/:id/items', (req, res) => {
    res.json({ message: 'Record Handover Details (Add Items) API (To be implemented)' });
});

// [USE CASE: Submit Handover] - Nhân viên xác nhận hoàn tất việc điền bàn giao
router.post('/:id/submit', (req, res) => {
    res.json({ message: 'Submit Handover API (To be implemented)' });
});

// [USE CASE: Review Handover] - Quản lý hoặc người nhận xem xét bản bàn giao
router.put('/:id/review', (req, res) => {
    res.json({ message: 'Review Handover API (To be implemented)' });
});

// [USE CASE: View Handover Records] - Xem danh sách các lịch sử bàn giao
router.get('/', (req, res) => {
    res.json({ message: 'View Handover Records API (To be implemented)' });
});

// [USE CASE: View Handover Items] - Xem chi tiết các task cụ thể trong 1 bản bàn giao
router.get('/:id/items', (req, res) => {
    res.json({ message: 'View Handover Items API (To be implemented)' });
});

module.exports = router;
