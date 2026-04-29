export const mockSummary = {
  totalEmployees: 128,
  presentToday: 112,
  lateEmployees: 14,
  absentEmployees: 16,
};

export const mockAttendanceTrends = [
  { date: '2026-04-23', present: 108, late: 11, absent: 9 },
  { date: '2026-04-24', present: 110, late: 10, absent: 8 },
  { date: '2026-04-25', present: 114, late: 9, absent: 5 },
  { date: '2026-04-26', present: 111, late: 13, absent: 6 },
  { date: '2026-04-27', present: 118, late: 8, absent: 4 },
  { date: '2026-04-28', present: 116, late: 12, absent: 7 },
  { date: '2026-04-29', present: 112, late: 14, absent: 6 },
];

export const mockMonthlyAttendance = [
  { month: '2026-01', present: 2080, late: 138, absent: 96, halfDay: 44 },
  { month: '2026-02', present: 2018, late: 120, absent: 88, halfDay: 37 },
  { month: '2026-03', present: 2146, late: 111, absent: 90, halfDay: 32 },
  { month: '2026-04', present: 2192, late: 102, absent: 79, halfDay: 28 },
];

export const mockDepartmentBreakdown = [
  { name: 'Engineering', present: 68, late: 8, absent: 5 },
  { name: 'HR', present: 16, late: 2, absent: 1 },
  { name: 'Finance', present: 18, late: 3, absent: 2 },
  { name: 'Sales', present: 26, late: 4, absent: 6 },
  { name: 'Operations', present: 22, late: 5, absent: 4 },
];

export const mockEmployees = [
  { id: 'EMP-1001', name: 'Amina Yusuf', email: 'amina@smartattend.com', department: 'Operations', role: 'employee', status: 'Active' },
  { id: 'EMP-1002', name: 'Daniel Carter', email: 'daniel@smartattend.com', department: 'Engineering', role: 'employee', status: 'Active' },
  { id: 'EMP-1003', name: 'Lina Chen', email: 'lina@smartattend.com', department: 'Finance', role: 'employee', status: 'On Leave' },
  { id: 'EMP-1004', name: 'Mason Reed', email: 'mason@smartattend.com', department: 'HR', role: 'admin', status: 'Active' },
  { id: 'EMP-1005', name: 'Sofia Khan', email: 'sofia@smartattend.com', department: 'Sales', role: 'employee', status: 'Active' },
  { id: 'EMP-1006', name: 'Owen Park', email: 'owen@smartattend.com', department: 'Engineering', role: 'employee', status: 'Inactive' },
  { id: 'EMP-1007', name: 'Nora James', email: 'nora@smartattend.com', department: 'Operations', role: 'employee', status: 'Active' },
  { id: 'EMP-1008', name: 'Victor Hugo', email: 'victor@smartattend.com', department: 'Sales', role: 'employee', status: 'Active' },
];

export const mockAttendanceRecords = [
  { id: 1, employeeId: 'EMP-1001', name: 'Amina Yusuf', department: 'Operations', date: '2026-04-29', status: 'Present', checkIn: '08:56', checkOut: '17:10' },
  { id: 2, employeeId: 'EMP-1002', name: 'Daniel Carter', department: 'Engineering', date: '2026-04-29', status: 'Late', checkIn: '09:22', checkOut: '17:48' },
  { id: 3, employeeId: 'EMP-1003', name: 'Lina Chen', department: 'Finance', date: '2026-04-29', status: 'Absent', checkIn: '-', checkOut: '-' },
  { id: 4, employeeId: 'EMP-1005', name: 'Sofia Khan', department: 'Sales', date: '2026-04-29', status: 'Present', checkIn: '08:49', checkOut: '17:06' },
  { id: 5, employeeId: 'EMP-1007', name: 'Nora James', department: 'Operations', date: '2026-04-29', status: 'Present', checkIn: '08:53', checkOut: '17:11' },
  { id: 6, employeeId: 'EMP-1008', name: 'Victor Hugo', department: 'Sales', date: '2026-04-29', status: 'Late', checkIn: '09:17', checkOut: '17:32' },
  { id: 7, employeeId: 'EMP-1004', name: 'Mason Reed', department: 'HR', date: '2026-04-29', status: 'Present', checkIn: '08:44', checkOut: '17:03' },
];

export const mockAttendanceHistory = [
  { id: 1, date: '2026-04-29', checkIn: '08:56', checkOut: '17:10', status: 'Present', duration: '8h 14m' },
  { id: 2, date: '2026-04-28', checkIn: '08:58', checkOut: '17:04', status: 'Present', duration: '8h 06m' },
  { id: 3, date: '2026-04-27', checkIn: '09:13', checkOut: '17:18', status: 'Late', duration: '8h 05m' },
  { id: 4, date: '2026-04-26', checkIn: '08:52', checkOut: '17:09', status: 'Present', duration: '8h 17m' },
  { id: 5, date: '2026-04-25', checkIn: '08:47', checkOut: '17:02', status: 'Present', duration: '8h 15m' },
];

export const mockLeaveRequests = [
  { id: 1, employee: 'Amina Yusuf', type: 'Annual Leave', startDate: '2026-05-04', endDate: '2026-05-08', reason: 'Family travel', status: 'Pending' },
  { id: 2, employee: 'Daniel Carter', type: 'Sick Leave', startDate: '2026-04-26', endDate: '2026-04-26', reason: 'Medical appointment', status: 'Approved' },
  { id: 3, employee: 'Sofia Khan', type: 'Casual Leave', startDate: '2026-05-12', endDate: '2026-05-13', reason: 'Personal work', status: 'Rejected' },
];

export const mockProfile = {
  name: 'Amina Yusuf',
  email: 'amina@smartattend.com',
  department: 'Operations',
  role: 'Employee',
  employeeId: 'EMP-1001',
  phone: '+1 (555) 230-8831',
  location: 'New York Office',
  joinDate: '2024-09-12',
};

export const mockReportHighlights = [
  { label: 'Attendance Rate', value: '93.4%', tone: 'teal' },
  { label: 'Average Late Arrivals', value: '11/day', tone: 'orange' },
  { label: 'Approved Leaves', value: '36', tone: 'blue' },
  { label: 'Payroll Impact', value: '$12.4k', tone: 'emerald' },
];
