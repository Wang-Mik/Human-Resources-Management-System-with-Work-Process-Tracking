## Module 1: Authentication

| /api/auth/login | POST | Login |
| /api/auth/me | GET | Decode current JWT token, return user info |

## Module 2: Employee Management

| /api/employees | GET | Get all employees |
| /api/employees/:id | GET | Get a single employee by ID |
| /api/employees | POST | Create a new employee | (no frontend code)
| /api/employees/:id | PUT | Update employee info | (no frontend code)

## Module 3: Work Management

| /api/works | GET | Get all work items with assignees |
| /api/works/:id | GET | Get a single work item with assignees and subtasks |
| /api/works | POST | Create a new work item |
| /api/works/:id | PUT | Edit work item details |
| /api/works/:id/assign | POST | Assign employee(s) to a task |
| /api/works/assignments | GET | Get all assignments (flat list with details) |
| /api/works/assignments/bulk | POST | Create assignments for multiple tasks/employees |
| /api/works/assignments/group/update | PUT | Update details/combinations for a group of assignments |
| /api/works/assignments/group/task-staff | PUT | Update staff assigned to a single task in a group |
| /api/works/assignments/group/delete | POST | Delete an assignment group |
| /api/works/assignments/:id | PUT | Update a single assignment row |
| /api/works/assignments/:id | DELETE | Delete a single assignment |
| /api/works/:id/subtasks | POST | Create a subtask for a work item | 
| /api/works/subtasks/:subtaskId | PUT | Update a subtask's title or status | 
| /api/works/subtasks/:subtaskId | DELETE | Delete a subtask |

## Module 4: Handover Management

| /api/handovers/initiate | POST | Initiate handover |
| /api/handovers/:id/submit | POST | Submit handover |
| /api/handovers/:id/review | PUT | Review handover |
| /api/handovers/:id/accept | POST | Accept handover |
| /api/handovers/:id/reject | POST | Reject handover |
| /api/handovers | GET | View handover records |
| /api/handovers/:id/items | GET | View handover items detail |

## Module 5: Bottleneck Analysis

| /api/bottlenecks/workload | GET | Get per-employee active task count |
| /api/bottlenecks/detect | GET | Get staff > 10 tasks(overload) |
| /api/bottlenecks/suggestions/:workId | GET | Suggest available free/less tasks employees to reassign a task |
| /api/bottlenecks/reassign | POST | Reassign a task to a new employee old employee remove old employee from task |

## Module 6: Workforce Availability

| /api/availability/attendance | POST | Clock in or clock out |
| /api/availability/status | POST | Update availability status |
| /api/availability | GET | Get all employees with their current availability status |
