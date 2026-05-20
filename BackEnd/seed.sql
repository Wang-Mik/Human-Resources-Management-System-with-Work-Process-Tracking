USE hrm_db;
GO

-- Clear existing data (if any) to prevent duplication
DELETE FROM HandOverItem;
DELETE FROM HandOverRecord;
DELETE FROM TaskHistoryLog;
DELETE FROM OperationalStatusLog;
DELETE FROM SubTask;
DELETE FROM WorkAssignment;
DELETE FROM WorkItem;
DELETE FROM EmployeeAvailability;
DELETE FROM Attendance;
DELETE FROM Employee;
GO

-- Reset identity columns
DBCC CHECKIDENT ('Employee', RESEED, 0);
DBCC CHECKIDENT ('WorkItem', RESEED, 0);
DBCC CHECKIDENT ('WorkAssignment', RESEED, 0);
GO

-- Insert Employees
INSERT INTO Employee (Name, Email, Password, Role, Department, Position, EmploymentStatus)
VALUES 
    (N'Nguyễn Anh Khoa', 'khoa@hospital.com', 'password123', 'Manager', 'Internal Medicine', 'Head Manager', 'Active'),
    (N'Phan Quang Minh', 'minh@hospital.com', 'password123', 'Employee', 'Internal Medicine', 'Nurse', 'Active');
GO

DECLARE @ManagerID INT = (SELECT EmployeeID FROM Employee WHERE Email = 'khoa@hospital.com');
DECLARE @EmployeeID INT = (SELECT EmployeeID FROM Employee WHERE Email = 'minh@hospital.com');

-- Insert Work Items
INSERT INTO WorkItem (Title, Description, WorkType, Status, CreatedAt, DueDate)
VALUES
    ('Patient Vitals Check', 'Check vitals for Room 204', 'Clinical', 'In Progress', GETDATE(), DATEADD(hour, 2, GETDATE())),
    ('Medication Admin', 'Administer medication for ICU - Bed 04', 'Clinical', 'Pending', GETDATE(), DATEADD(hour, 4, GETDATE())),
    ('Patient check', 'Check patient in Recovery Room 1', 'Clinical', 'Pending', GETDATE(), DATEADD(hour, 6, GETDATE()));

DECLARE @Work1 INT = (SELECT WorkItemID FROM WorkItem WHERE Title = 'Patient Vitals Check');
DECLARE @Work2 INT = (SELECT WorkItemID FROM WorkItem WHERE Title = 'Medication Admin');
DECLARE @Work3 INT = (SELECT WorkItemID FROM WorkItem WHERE Title = 'Patient check');

-- Assign Work to Phan Quang Minh
INSERT INTO WorkAssignment (WorkItemID, EmployeeID, AssignedBy, AssignedAt, AssignmentStatus, RoleInWork)
VALUES
    (@Work1, @EmployeeID, @ManagerID, GETDATE(), 'Active', 'Primary'),
    (@Work2, @EmployeeID, @ManagerID, GETDATE(), 'Active', 'Primary'),
    (@Work3, @EmployeeID, @ManagerID, GETDATE(), 'Active', 'Primary');

-- HandOver
INSERT INTO HandOverRecord (FromEmployeeID, ToEmployeeID, Reason, Status, CreatedAt)
VALUES (@EmployeeID, @ManagerID, 'End of Shift: ICU Ward B', 'Pending', GETDATE());

DECLARE @HandOver1 INT = SCOPE_IDENTITY();

DECLARE @Assign1 INT = (SELECT AssignmentID FROM WorkAssignment WHERE WorkItemID = @Work1);
DECLARE @Assign2 INT = (SELECT AssignmentID FROM WorkAssignment WHERE WorkItemID = @Work2);

INSERT INTO HandOverItem (HandOverID, AssignmentID, Note)
VALUES 
    (@HandOver1, @Assign1, 'Patient in Bed 4 needs monitoring. BP fluctuating past 2 hours.'),
    (@HandOver1, @Assign2, 'Standard restock needed for Patient in room 101');
GO
