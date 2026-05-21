# API Reference — HR Management System

Base URL: `http://localhost:5000/api`

Structure:
Method | Path | Description | Body | Response
--- | --- | --- | --- | ---


## Module 1: Authentication (`/api/auth`)

| `POST` | `/auth/login` | Login | `{ email, password }` |
| `GET` | `/auth/me` | Decode current JWT token, return user info | Header: `Authorization: Bearer <token>` |

## Module 2: Employee Management (`/api/employees`)

| `GET` | `/employees` | Get all employees | — |
| `GET` | `/employees/:id` | Get a single employee by ID | Param: `id` |
| `POST` | `/employees` | Create a new employee | `{ name, email, password, role, department, position, status }` | (not implemented in front end)
| `PUT` | `/employees/:id` | Update employee info | `{ name, department, position, status }` | (not implemented in front end)



## Module 3: Work Management (`/api/works`)

| `GET` | `/works` | Get all work items (joined with assignee name) | — |
| `GET` | `/works/:id` | Get a single work item by ID | Param: `id` |
| `POST` | `/works` | Create a new work item | `{ title, description, workType, status, dueDate }` |
| `POST` | `/works/:id/assign` | Assign a work item to an employee | `{ employeeId, assignedBy, roleInWork }` |
| `PUT` | `/works/:id/progress` | Update work item status + log to history | `{ status, employeeId, contextNote }` |
| `POST` | `/works/:id/subtasks` | Add a subtask to a work item | `{ title }` | (not implemented in front end)
| `PUT` | `/works/subtasks/:subtaskId` | Update a subtask's status | `{ status }` | (not implemented in front end)

## Module 4: Handover Management (`/api/handovers`)

| `POST` | `/handovers/initiate` | Create a new handover record | `{ fromEmployeeId, toEmployeeId, reason }` |
| `POST` | `/handovers/:id/items` | Add a task item to a handover record | `{ assignmentId, note }` |
| `POST` | `/handovers/:id/submit` | Submit handover (sender confirms) | — |
| `PUT` | `/handovers/:id/review` | Review handover (set Approved / Rejected) | `{ status }` |
| `POST` | `/handovers/:id/accept` | Accept handover (receiver approves) | — |
| `POST` | `/handovers/:id/reject` | Reject handover (receiver declines) | — |
| `GET` | `/handovers` | List handover records (filtered by role / employee) | Query: `?employeeId=<id>` |
| `GET` | `/handovers/:id/items` | Get all task items in a handover | Param: `id` |

## Module 5: Bottleneck Analysis (`/api/bottlenecks`)

| `GET` | `/bottlenecks/workload` | Get per-employee active task count (workload overview) | — |
| `GET` | `/bottlenecks/detect` | Detect overdue tasks and overloaded staff | — |
| `GET` | `/bottlenecks/suggestions/:workId` | Suggest available employees to reassign a task | Param: `workId` |
| `POST` | `/bottlenecks/reassign` | Reassign a task to a new employee | `{ workItemId, newEmployeeId, reassignedBy, reason }` |

## Module 6: Workforce Availability (`/api/availability`)

| `POST` | `/availability/attendance` | Clock in or clock out (multiple sessions per day allowed) | `{ employeeId, type }` — `type`: `"CheckIn"` or `"CheckOut"` |
| `GET` | `/availability/attendance/today/:employeeId` | Get the most recent attendance record for today | Param: `employeeId` | (not implemented in front end)
| `POST` | `/availability/status` | Update availability status | `{ employeeId, status, reason }` — `status`: `"Available"`, `"Busy"`, `"Emergency"` | (not implemented in front end)
| `GET` | `/availability` | Get all employees with their current availability status | — | (not implemented in front end)


## System

| `GET` | `/health` | Health check — returns `{ status: "OK" }` |

## Clock-in / Clock-out Rules

- An employee can **clock in multiple times per day** (e.g. after a break).
- **Clock In** is blocked if there is already an **open session** (a record with no `CheckOutTime`).
- **Clock Out** closes only the **most recent open session** for that day.
- All action buttons in the UI (Start Task, Update, Handover) are **disabled** when the employee is not clocked in.
