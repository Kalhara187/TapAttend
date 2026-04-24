import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentChartBar,
  HiOutlineQrCode,
  HiOutlineCalendarDays,
  HiOutlineCamera,
  HiOutlineUserCircle,
} from "react-icons/hi2";

export const ADMIN_MENU = [
  { label: "Dashboard", path: "/admin/dashboard", icon: HiOutlineChartBar },
  { label: "Employees", path: "/admin/employees", icon: HiOutlineUsers },
  {
    label: "Attendance",
    path: "/admin/attendance",
    icon: HiOutlineClipboardDocumentCheck,
  },
  { label: "Reports", path: "/admin/reports", icon: HiOutlineDocumentChartBar },
  { label: "QR Generator", path: "/admin/qr-generator", icon: HiOutlineQrCode },
  { label: "Leaves", path: "/admin/leaves", icon: HiOutlineCalendarDays },
];

export const EMPLOYEE_MENU = [
  { label: "Scan QR", path: "/employee/scan-qr", icon: HiOutlineCamera },
  {
    label: "My Attendance",
    path: "/employee/my-attendance",
    icon: HiOutlineClipboardDocumentCheck,
  },
  { label: "Profile", path: "/employee/profile", icon: HiOutlineUserCircle },
  { label: "Apply Leave", path: "/employee/apply-leave", icon: HiOutlineCalendarDays },
];
