import { scanAttendance } from '../services/attendanceService.js';

export const scanAttendanceController = async (req, res, next) => {
  try {
    const result = await scanAttendance({
      reqUser: req.user,
      employeeId: req.body.employeeId,
      qrData: req.body.qrData,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};