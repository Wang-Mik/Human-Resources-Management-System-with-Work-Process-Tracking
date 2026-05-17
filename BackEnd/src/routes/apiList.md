Module 1: Work Management (workRoutes.js)

POST /api/works: Create Work Items (Tạo task).
POST /api/works/:id/assign: Assign Work (Gán việc).
GET /api/works: View Overall Work Status.
GET /api/works/:id: View Task Progress.
PUT /api/works/:id/progress: Update Work Progress.
Bổ sung: POST /api/works/:id/subtasks (Vì ERD có thiết kế riêng bảng SubTask).

Module 2: Handover Management (handoverRoutes.js)

POST /api/handovers/initiate: Initiate Handover.
POST /api/handovers/:id/items: Record Handover Detail.
POST /api/handovers/:id/submit: Submit Handover.
PUT /api/handovers/:id/review: Review Handover.
GET /api/handovers: View Handover Records.
GET /api/handovers/:id/items: View Handover Items.

Module 3: Bottleneck Management (bottleneckRoutes.js)

GET /api/bottlenecks/workload: Monitor Workload.
GET /api/bottlenecks/detect: Detect Bottleneck.
GET /api/bottlenecks/suggestions/:workId: Suggest Reassignment.
POST /api/bottlenecks/reassign: Reassign Work.
Module 4: Workforce Availability (availabilityRoutes.js)

POST /api/availability/attendance: Record Attendance.
POST /api/availability/status: Update Availability Status.
GET /api/availability: View Employee Availability.

⚠️ CÁC API BỔ SUNG
authRoutes.js (Auth API)
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me (Lấy thông tin profile)

employeeRoutes.js (Employee API): Phải có API này thì Manager mới lấy được danh sách nhân viên để gán việc, và Nurse mới xem được ai đang rảnh để Bàn giao ca (Handover).
GET /api/employees (Lấy danh sách nv).
GET /api/employees/:id (Xem chi tiết).


=========================================How to run============================================================================

node src/app.jsdocker-compose up -d
