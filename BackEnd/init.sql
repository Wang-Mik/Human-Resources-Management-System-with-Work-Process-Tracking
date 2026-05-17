CREATE DATABASE HMSDB;
GO
USE HMSDB;
GO

-- Employee (Cập nhật thêm các trường cơ bản và thay đổi Department/Position thành chuỗi)
CREATE TABLE Employee (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL, -- vd: 'Manager', 'Employee'
    Department NVARCHAR(100),
    Position NVARCHAR(100),
    EmploymentStatus NVARCHAR(50)
);

-- Attendance
CREATE TABLE Attendance (
    AttendanceID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    WorkingDate DATE,
    CheckInTime DATETIME,
    CheckOutTime DATETIME,
    Status NVARCHAR(50)
);

-- EmployeeAvailability
CREATE TABLE EmployeeAvailability (
    AvailabilityID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    StartTime DATETIME,
    EndTime DATETIME,
    Reason NVARCHAR(255),
    Status NVARCHAR(50)
);

-- WorkItem
CREATE TABLE WorkItem (
    WorkItemID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    WorkType NVARCHAR(50),
    Status NVARCHAR(50),
    CreatedAt DATETIME,
    DueDate DATETIME,
    CompletedAt DATETIME
);

-- SubTask
CREATE TABLE SubTask (
    SubTaskID INT IDENTITY(1,1) PRIMARY KEY,
    WorkItemID INT FOREIGN KEY REFERENCES WorkItem(WorkItemID),
    Title NVARCHAR(255),
    Status NVARCHAR(50),
    CreatedAt DATETIME
);

-- WorkAssignment
CREATE TABLE WorkAssignment (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    WorkItemID INT FOREIGN KEY REFERENCES WorkItem(WorkItemID),
    EmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    AssignedBy INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    AssignedAt DATETIME,
    UnAssignedAt DATETIME,
    AssignmentStatus NVARCHAR(50),
    RoleInWork NVARCHAR(50)
);

-- HandOverRecord
CREATE TABLE HandOverRecord (
    HandOverID INT IDENTITY(1,1) PRIMARY KEY,
    FromEmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    ToEmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    Reason NVARCHAR(255),
    Status NVARCHAR(50),
    CreatedAt DATETIME
);

-- HandOverItem
CREATE TABLE HandOverItem (
    HandOverItemID INT IDENTITY(1,1) PRIMARY KEY,
    HandOverID INT FOREIGN KEY REFERENCES HandOverRecord(HandOverID),
    AssignmentID INT FOREIGN KEY REFERENCES WorkAssignment(AssignmentID),
    Note NVARCHAR(MAX)
);

-- TaskHistoryLog
CREATE TABLE TaskHistoryLog (
    TaskHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    WorkItemID INT FOREIGN KEY REFERENCES WorkItem(WorkItemID),
    EmployeeID INT FOREIGN KEY REFERENCES Employee(EmployeeID),
    ActionType NVARCHAR(50),
    ActionTimestamp DATETIME,
    ContextNote NVARCHAR(MAX)
);

-- OperationalStatusLog
CREATE TABLE OperationalStatusLog (
    StatusLogID INT IDENTITY(1,1) PRIMARY KEY,
    WorkItemID INT FOREIGN KEY REFERENCES WorkItem(WorkItemID),
    Status NVARCHAR(50),
    ChangedAt DATETIME
);
GO
