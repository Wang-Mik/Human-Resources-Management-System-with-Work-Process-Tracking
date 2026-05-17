const express = require('express');
const router = express.Router();

/**
 * MODULE: AUTHENTICATION
 * Tình trạng: [BỔ SUNG] - Không có trong sơ đồ thiết kế Use Case gốc nhưng là BẮT BUỘC phải có để:
 * 1. Đăng nhập hệ thống (Employee / Manager).
 * 2. Cấp JWT Token để gọi các API khác.
 * 3. Lấy thông tin user hiện tại.
 */

// Đăng nhập
router.post('/login', (req, res) => {
    res.json({ message: 'Login API (To be implemented)' });
});

// Đăng ký (Tuỳ chọn - dùng để tạo tài khoản ban đầu)
router.post('/register', (req, res) => {
    res.json({ message: 'Register API (To be implemented)' });
});

// Lấy thông tin tài khoản hiện tại (thường truyền JWT Token trên Header)
router.get('/me', (req, res) => {
    res.json({ message: 'Get Current User API (To be implemented)' });
});

module.exports = router;
