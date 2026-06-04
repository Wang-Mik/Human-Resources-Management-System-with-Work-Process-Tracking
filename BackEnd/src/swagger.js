const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "HR Management & Work Process Tracking API",
    version: "1.0.0",
    description: "Interactive API documentation for the Human Resources Management System with Work Process Tracking."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development Server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: <token>"
      }
    },
    schemas: {
      Employee: {
        type: "object",
        properties: {
          EmployeeID: { type: "integer", example: 1 },
          Name: { type: "string", example: "Nguyen Van A" },
          Email: { type: "string", example: "nva@hospital.gov.vn" },
          Role: { type: "string", example: "Employee" },
          Department: { type: "string", example: "Emergency Department" },
          Position: { type: "string", example: "Nurse" },
          EmploymentStatus: { type: "string", example: "Active" }
        }
      },
      WorkItem: {
        type: "object",
        properties: {
          WorkItemID: { type: "integer", example: 101 },
          Title: { type: "string", example: "Check Patient Vitals" },
          Description: { type: "string", example: "Check and log vitals for patient room 302" },
          Document: { type: "string", example: "doc_vitals_302.pdf" },
          WorkType: { type: "string", example: "Clinical Task" },
          Status: { type: "string", example: "Pending" },
          CreatedAt: { type: "string", format: "date-time", example: "2026-06-03T11:30:00Z" },
          DueDate: { type: "string", format: "date-time", example: "2026-06-03T18:00:00Z" },
          Assignees: {
            type: "array",
            items: {
              type: "object",
              properties: {
                AssignmentID: { type: "integer", example: 50 },
                EmployeeID: { type: "integer", example: 1 },
                Name: { type: "string", example: "Nguyen Van A" },
                Email: { type: "string", example: "nva@hospital.gov.vn" },
                Role: { type: "string", example: "Employee" },
                RoleInWork: { type: "string", example: "Assignee" },
                AssignmentName: { type: "string", example: "Check Vitals" },
                Description: { type: "string", example: "Task details" },
                Status: { type: "string", example: "Assigned" },
                AssignedAt: { type: "string", format: "date-time", example: "2026-06-03T11:30:00Z" },
                IsHandoverPending: { type: "integer", example: 0 }
              }
            }
          },
          AssigneeName: { type: "string", example: "Nguyen Van A" },
          SubTasks: {
            type: "array",
            items: {
              $ref: "#/components/schemas/SubTask"
            }
          }
        }
      },
      SubTask: {
        type: "object",
        properties: {
          SubTaskID: { type: "integer", example: 201 },
          WorkItemID: { type: "integer", example: 101 },
          Title: { type: "string", example: "Sanitize equipment" },
          Status: { type: "string", example: "Pending" },
          CreatedAt: { type: "string", format: "date-time", example: "2026-06-03T11:30:00Z" }
        }
      },
      WorkAssignment: {
        type: "object",
        properties: {
          AssignmentID: { type: "integer", example: 50 },
          WorkItemID: { type: "integer", example: 101 },
          EmployeeID: { type: "integer", example: 1 },
          AssignedBy: { type: "integer", example: 2 },
          AssignedAt: { type: "string", format: "date-time", example: "2026-06-03T11:30:00Z" },
          AssignmentStatus: { type: "string", example: "Assigned" },
          RoleInWork: { type: "string", example: "Assignee" },
          AssignmentName: { type: "string", example: "Shift checkup" },
          Description: { type: "string", example: "Check patient room 302" },
          Status: { type: "string", example: "Assigned" },
          WorkAssignmentGroup: { type: "string", example: "WAG-XYZ123" }
        }
      },
      HandOverRecord: {
        type: "object",
        properties: {
          HandOverID: { type: "integer", example: 12 },
          FromEmployeeID: { type: "integer", example: 1 },
          ToEmployeeID: { type: "integer", example: 3 },
          Reason: { type: "string", example: "Shift ended" },
          Status: { type: "string", example: "Initiated" },
          CreatedAt: { type: "string", format: "date-time", example: "2026-06-03T12:00:00Z" },
          FromName: { type: "string", example: "Nguyen Van A" },
          ToName: { type: "string", example: "Tran Thi B" }
        }
      },
      HandOverItem: {
        type: "object",
        properties: {
          HandOverItemID: { type: "integer", example: 45 },
          HandOverID: { type: "integer", example: 12 },
          AssignmentID: { type: "integer", example: 50 },
          Note: { type: "string", example: "Please check patient room 302 temperature regularly" },
          Title: { type: "string", example: "Check Patient Vitals" },
          Description: { type: "string", example: "Check and log vitals" },
          WorkItemID: { type: "integer", example: 101 }
        }
      },
      Attendance: {
        type: "object",
        properties: {
          AttendanceID: { type: "integer", example: 10 },
          EmployeeID: { type: "integer", example: 1 },
          WorkingDate: { type: "string", format: "date", example: "2026-06-03" },
          CheckInTime: { type: "string", format: "date-time", example: "2026-06-03T07:00:00Z" },
          CheckOutTime: { type: "string", format: "date-time", nullable: true, example: null },
          Status: { type: "string", example: "Present" }
        }
      },
      EmployeeAvailability: {
        type: "object",
        properties: {
          AvailabilityID: { type: "integer", example: 5 },
          EmployeeID: { type: "integer", example: 1 },
          StartTime: { type: "string", format: "date-time", example: "2026-06-03T07:00:00Z" },
          Status: { type: "string", example: "Available" },
          Reason: { type: "string", example: "Working shift" }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    "/api/auth/login": {
      post: {
        summary: "User login",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "nva@hospital.gov.vn" },
                  password: { type: "string", example: "password123" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful" },
                    user: { $ref: "#/components/schemas/Employee" },
                    token: { type: "string", example: "jwt_token_here" }
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid credentials"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        summary: "Get current user profile from JWT token",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "Returns current employee decoded JWT data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", example: "nva@hospital.gov.vn" },
                        role: { type: "string", example: "Employee" },
                        name: { type: "string", example: "Nguyen Van A" }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "No token provided or invalid token"
          }
        }
      }
    },
    "/api/employees": {
      get: {
        summary: "Get all employees",
        tags: ["Employee Management"],
        responses: {
          200: {
            description: "List of all employees",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Employee"
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      },
      post: {
        summary: "Create a new employee",
        tags: ["Employee Management"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Nguyen Van A" },
                  email: { type: "string", example: "nva@hospital.gov.vn" },
                  password: { type: "string", example: "password123" },
                  role: { type: "string", example: "Employee" },
                  department: { type: "string", example: "Emergency Department" },
                  position: { type: "string", example: "Nurse" },
                  status: { type: "string", example: "Active" }
                },
                required: ["name", "email", "password", "role"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Employee created successfully"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/employees/{id}": {
      get: {
        summary: "Get a single employee by ID",
        tags: ["Employee Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Employee details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Employee"
                }
              }
            }
          },
          404: {
            description: "Employee not found"
          },
          500: {
            description: "Server error"
          }
        }
      },
      put: {
        summary: "Update employee details",
        tags: ["Employee Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Nguyen Van A" },
                  department: { type: "string", example: "Cardiology" },
                  position: { type: "string", example: "Senior Nurse" },
                  status: { type: "string", example: "Active" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Employee updated successfully"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works": {
      get: {
        summary: "Get all work items (with assignees and subtasks)",
        tags: ["Work Management"],
        responses: {
          200: {
            description: "List of all work items",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WorkItem"
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      },
      post: {
        summary: "Create a new work item",
        tags: ["Work Management"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Daily Ward Inspection" },
                  description: { type: "string", example: "Inspect general wards for safety and cleanliness." },
                  document: { type: "string", example: "inspection_guideline.pdf" },
                  workType: { type: "string", example: "Operations" },
                  status: { type: "string", example: "Pending" },
                  dueDate: { type: "string", format: "date-time", example: "2026-06-03T18:00:00Z" }
                },
                required: ["title", "workType", "dueDate"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Work Item Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Work Item Created" },
                    id: { type: "integer", example: 102 }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/{id}": {
      get: {
        summary: "Get a single work item details (including assignees and subtasks)",
        tags: ["Work Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Work item details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WorkItem"
                }
              }
            }
          },
          404: {
            description: "Work item not found"
          },
          500: {
            description: "Server error"
          }
        }
      },
      put: {
        summary: "Edit work item properties",
        tags: ["Work Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Ward Inspection V2" },
                  description: { type: "string", example: "Updated description" },
                  document: { type: "string", example: "doc.pdf" },
                  workType: { type: "string", example: "Operations" },
                  dueDate: { type: "string", format: "date-time" },
                  status: { type: "string", example: "Active" },
                  employeeId: { type: "integer", description: "The actor performing the edit (optional, for history logging)" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Work Item Updated Successfully"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/{id}/assign": {
      post: {
        summary: "Assign employee(s) to a task",
        description: "Replaces any existing assignments for this task with the new assignment(s).",
        tags: ["Work Assignments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  employeeId: { type: "integer", example: 1 },
                  employeeIds: { type: "array", items: { type: "integer" }, example: [1, 3] },
                  assignedBy: { type: "integer", example: 2 },
                  roleInWork: { type: "string", example: "Assignee" },
                  assignmentName: { type: "string", example: "General Assignment" },
                  description: { type: "string", example: "Please handle this task" },
                  status: { type: "string", example: "Assigned" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Work Assigned Successfully"
          },
          400: {
            description: "Cannot assign tasks to managers"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/{id}/progress": {
      put: {
        summary: "Update work item progress status and log in history",
        tags: ["Work Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "Active" },
                  employeeId: { type: "integer", example: 1, description: "ID of employee updating progress" },
                  contextNote: { type: "string", example: "Started working on patient documentation" }
                },
                required: ["status", "employeeId"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Work Progress Updated"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/{id}/subtasks": {
      post: {
        summary: "Create a subtask for a work item",
        tags: ["Subtasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Double check patient temperature" }
                },
                required: ["title"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "SubTask Created"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/subtasks/{subtaskId}": {
      put: {
        summary: "Update the title or status of a subtask",
        tags: ["Subtasks"],
        parameters: [
          {
            name: "subtaskId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated subtask title" },
                  status: { type: "string", example: "Completed" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "SubTask Updated"
          },
          400: {
            description: "No fields to update"
          },
          500: {
            description: "Server error"
          }
        }
      },
      delete: {
        summary: "Delete a subtask",
        tags: ["Subtasks"],
        parameters: [
          {
            name: "subtaskId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "SubTask Deleted"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments": {
      get: {
        summary: "Get all assignments (flat list with task and employee details)",
        tags: ["Work Assignments"],
        responses: {
          200: {
            description: "List of assignments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WorkAssignment"
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments/bulk": {
      post: {
        summary: "Create bulk assignments for multiple tasks/employees",
        tags: ["Work Assignments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  workItemIds: { type: "array", items: { type: "integer" }, example: [101, 102] },
                  employeeIds: { type: "array", items: { type: "integer" }, example: [1, 3] },
                  assignedBy: { type: "integer", example: 2 },
                  roleInWork: { type: "string", example: "Assignee" },
                  assignmentName: { type: "string", example: "Bulk Shift Task" },
                  description: { type: "string", example: "Routine assignments" },
                  status: { type: "string", example: "Assigned" }
                },
                required: ["workItemIds", "employeeIds"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Bulk Work Assignments Created Successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Bulk Work Assignments Created Successfully" },
                    GroupID: { type: "string", example: "WAG-ABCD123-EFGH" },
                    WorkAssignmentGroup: { type: "string", example: "WAG-ABCD123-EFGH" }
                  }
                }
              }
            }
          },
          400: {
            description: "Invalid input or cannot assign to managers"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments/group/update": {
      put: {
        summary: "Update details or recreate combinations for a group of assignments",
        tags: ["Work Assignments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  groupId: { type: "string", example: "WAG-ABCD123" },
                  workAssignmentGroup: { type: "string", example: "WAG-ABCD123" },
                  assignmentIds: { type: "array", items: { type: "integer" } },
                  assignmentName: { type: "string", example: "Updated Assignment Group Name" },
                  description: { type: "string", example: "Updated description" },
                  status: { type: "string", example: "Active" },
                  roleInWork: { type: "string", example: "Assignee" },
                  workItemIds: { type: "array", items: { type: "integer" }, description: "If provided along with employeeIds, re-syncs combinations" },
                  employeeIds: { type: "array", items: { type: "integer" } }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Grouped assignments updated successfully"
          },
          400: {
            description: "Valid group code required"
          },
          404: {
            description: "Assignment group not found"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments/group/task-staff": {
      put: {
        summary: "Update staff assigned to a single task inside a group",
        tags: ["Work Assignments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  groupId: { type: "string", example: "WAG-ABCD123" },
                  workItemId: { type: "integer", example: 101 },
                  employeeIds: { type: "array", items: { type: "integer" }, example: [1, 4] }
                },
                required: ["groupId", "workItemId", "employeeIds"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Employees doing this work item updated successfully"
          },
          404: {
            description: "Assignment group not found"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments/group/delete": {
      post: {
        summary: "Delete an entire assignment group",
        tags: ["Work Assignments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  groupId: { type: "string", example: "WAG-ABCD123" },
                  workAssignmentGroup: { type: "string", example: "WAG-ABCD123" },
                  assignmentIds: { type: "array", items: { type: "integer" } }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Grouped assignments removed"
          },
          400: {
            description: "Valid group code required"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/works/assignments/{id}": {
      put: {
        summary: "Update a single assignment row",
        tags: ["Work Assignments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  assignmentName: { type: "string", example: "New assignment name" },
                  description: { type: "string", example: "New description" },
                  status: { type: "string", example: "Completed" },
                  roleInWork: { type: "string", example: "Collaborator" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Assignment updated successfully"
          },
          400: {
            description: "No fields to update"
          },
          500: {
            description: "Server error"
          }
        }
      },
      delete: {
        summary: "Delete a single assignment",
        tags: ["Work Assignments"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Assignment removed"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/initiate": {
      post: {
        summary: "Initiate a shift handover",
        tags: ["Handover Management"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fromEmployeeId: { type: "integer", example: 1 },
                  toEmployeeId: { type: "integer", example: 3 },
                  reason: { type: "string", example: "Shift ended, handing over urgent tasks" }
                },
                required: ["fromEmployeeId", "toEmployeeId", "reason"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Handover Initiated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Handover Initiated" },
                    id: { type: "integer", example: 12 }
                  }
                }
              }
            }
          },
          400: {
            description: "Cannot initiate handover to managers"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/{id}/items": {
      get: {
        summary: "Get items detail for a specific handover",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "List of items in the handover",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/HandOverItem"
                  }
                }
              }
            }
          },
          403: {
            description: "Forbidden: You can only view your own handovers"
          },
          500: {
            description: "Server error"
          }
        }
      },
      post: {
        summary: "Add item detail to a handover",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  assignmentId: { type: "integer", example: 50 },
                  note: { type: "string", example: "Please check patient room 302 vitals" }
                },
                required: ["assignmentId", "note"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Handover Item Added"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/{id}/submit": {
      post: {
        summary: "Submit handover for review",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Handover Submitted"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/{id}/review": {
      put: {
        summary: "Review handover (change status and trigger transfers if Approved)",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "Approved", enum: ["Approved", "Rejected", "Pending"] }
                },
                required: ["status"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Handover reviewed status successfully updated"
          },
          404: {
            description: "Handover record not found"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/{id}/accept": {
      post: {
        summary: "Accept handover and transfer assignments to recipient",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Handover Accepted and assignments transferred"
          },
          404: {
            description: "Handover record not found"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers/{id}/reject": {
      post: {
        summary: "Reject handover",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Handover Rejected"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/handovers": {
      get: {
        summary: "View list of handover records",
        description: "Managers can view all records. Regular employees can only view records where they are either sender or recipient.",
        tags: ["Handover Management"],
        parameters: [
          {
            name: "employeeId",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter records by employee ID"
          }
        ],
        responses: {
          200: {
            description: "List of handover records",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/HandOverRecord"
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/bottlenecks/workload": {
      get: {
        summary: "Get per-employee active task count & clock-in status",
        tags: ["Bottleneck Analysis"],
        responses: {
          200: {
            description: "Workload distribution summary",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      EmployeeID: { type: "integer", example: 1 },
                      Name: { type: "string", example: "Nguyen Van A" },
                      Department: { type: "string", example: "Emergency Department" },
                      ActiveTasks: { type: "integer", example: 3 },
                      IsClockedIn: { type: "integer", example: 1 }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/bottlenecks/detect": {
      get: {
        summary: "Detect overdue tasks and overloaded staff (> 5 active tasks)",
        tags: ["Bottleneck Analysis"],
        responses: {
          200: {
            description: "List of overdue tasks and overloaded employees",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    overdueTasks: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/WorkItem"
                      }
                    },
                    overloadedStaff: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          EmployeeID: { type: "integer", example: 1 },
                          Name: { type: "string", example: "Nguyen Van A" },
                          TaskCount: { type: "integer", example: 6 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/bottlenecks/suggestions/{workId}": {
      get: {
        summary: "Suggest available employees to reassign a task to (ordered by lowest active tasks)",
        tags: ["Bottleneck Analysis"],
        parameters: [
          {
            name: "workId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Suggested employees",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      EmployeeID: { type: "integer", example: 3 },
                      Name: { type: "string", example: "Tran Thi B" },
                      ActiveTasks: { type: "integer", example: 1 }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/bottlenecks/reassign": {
      post: {
        summary: "Reassign a task to a new employee",
        tags: ["Bottleneck Analysis"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  workItemId: { type: "integer", example: 101 },
                  newEmployeeId: { type: "integer", example: 3 },
                  reassignedBy: { type: "integer", example: 2, description: "Manager ID performing the action" },
                  reason: { type: "string", example: "Employee A is currently overloaded" }
                },
                required: ["workItemId", "newEmployeeId", "reassignedBy"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Task Reassigned Successfully"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/availability/attendance": {
      post: {
        summary: "Clock in or Clock out for attendance",
        tags: ["Workforce Availability"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  employeeId: { type: "integer", example: 1 },
                  type: { type: "string", example: "CheckIn", enum: ["CheckIn", "CheckOut"] }
                },
                required: ["employeeId", "type"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Attendance action recorded successfully"
          },
          409: {
            description: "Already clocked in (if CheckIn is requested again before CheckOut)"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/availability/attendance/today/{employeeId}": {
      get: {
        summary: "Get the most recent attendance record for today for a specific employee",
        tags: ["Workforce Availability"],
        parameters: [
          {
            name: "employeeId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Most recent attendance record for today, or null if none",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    { $ref: "#/components/schemas/Attendance" },
                    { type: "object", nullable: true }
                  ]
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/availability/status": {
      post: {
        summary: "Update current availability status (Available, Busy, Emergency)",
        tags: ["Workforce Availability"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  employeeId: { type: "integer", example: 1 },
                  status: { type: "string", example: "Busy" },
                  reason: { type: "string", example: "In surgery" }
                },
                required: ["employeeId", "status"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Availability status updated"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/availability": {
      get: {
        summary: "Get all employees along with their current availability status",
        tags: ["Workforce Availability"],
        responses: {
          200: {
            description: "List of employees and their statuses",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      EmployeeID: { type: "integer", example: 1 },
                      Name: { type: "string", example: "Nguyen Van A" },
                      Department: { type: "string", example: "Emergency Department" },
                      Role: { type: "string", example: "Employee" },
                      CurrentStatus: { type: "string", example: "Available" }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/api/health": {
      get: {
        summary: "API Health check",
        tags: ["System"],
        security: [],
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "API is running successfully!" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = setupSwagger;
