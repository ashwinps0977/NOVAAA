// services/attendanceService.ts
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'wfh' | 'late';
export type AttendanceRecord = {
  employeeId: string;
  name: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
};

// For this demo, we'll use localStorage. In real app, use API
class AttendanceService {
  private readonly ATTENDANCE_KEY = 'nova_attendance_records';
  private readonly EMPLOYEE_STATUS_KEY = 'nova_employee_daily_status';

  // Mark employee as present when they login
  markPresent(employeeId: string, employeeName: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing records
    const records = this.getAllRecords();
    
    // Check if already recorded today
    const existingIndex = records.findIndex(
      r => r.employeeId === employeeId && r.date === today
    );
    
    const record: AttendanceRecord = {
      employeeId,
      name: employeeName,
      date: today,
      status: 'present',
      checkIn: new Date().toTimeString().split(' ')[0].substring(0, 5), // HH:mm
    };
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(records));
    
    // Also update daily status for quick lookup
    this.updateDailyStatus(employeeId, 'present');
    
    return record;
  }

  // Update check-out time
  markCheckOut(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getAllRecords();
    
    const recordIndex = records.findIndex(
      r => r.employeeId === employeeId && r.date === today
    );
    
    if (recordIndex >= 0) {
      const checkOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
      records[recordIndex].checkOut = checkOutTime;
      
      // Calculate hours worked
      if (records[recordIndex].checkIn) {
        const checkIn = this.timeToMinutes(records[recordIndex].checkIn!);
        const checkOut = this.timeToMinutes(checkOutTime);
        records[recordIndex].hoursWorked = (checkOut - checkIn) / 60;
      }
      
      localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(records));
      return records[recordIndex];
    }
    
    return null;
  }

  // Apply for leave
  applyLeave(employeeId: string, employeeName: string, startDate: string, endDate: string) {
    const records = this.getAllRecords();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Mark all days in range as leave
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      const existingIndex = records.findIndex(
        r => r.employeeId === employeeId && r.date === dateStr
      );
      
      const record: AttendanceRecord = {
        employeeId,
        name: employeeName,
        date: dateStr,
        status: 'leave',
      };
      
      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }
    }
    
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(records));
    return true;
  }

  // Get all attendance records for HR
  getAllRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(this.ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Get records for specific employee
  getEmployeeRecords(employeeId: string): AttendanceRecord[] {
    const records = this.getAllRecords();
    return records.filter(r => r.employeeId === employeeId);
  }

  // Get today's attendance summary for HR dashboard
  getTodaySummary() {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getAllRecords();
    const todayRecords = records.filter(r => r.date === today);
    
    return {
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: todayRecords.filter(r => r.status === 'absent').length,
      leave: todayRecords.filter(r => r.status === 'leave').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      totalEmployees: todayRecords.length,
      records: todayRecords,
    };
  }

  // Get employee's today status
  getEmployeeTodayStatus(employeeId: string): AttendanceStatus {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getAllRecords();
    
    const todayRecord = records.find(
      r => r.employeeId === employeeId && r.date === today
    );
    
    return todayRecord?.status || 'absent'; // Default to absent if not recorded
  }

  // Helper methods
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private updateDailyStatus(employeeId: string, status: AttendanceStatus) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${this.EMPLOYEE_STATUS_KEY}_${today}`;
    const statusData = JSON.parse(localStorage.getItem(key) || '{}');
    statusData[employeeId] = status;
    localStorage.setItem(key, JSON.stringify(statusData));
  }
}

export const attendanceService = new AttendanceService();