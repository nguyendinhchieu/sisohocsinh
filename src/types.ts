export type CampusId = 'PH1' | 'PH2' | 'DIEM_CHINH';

export interface CampusInfo {
  id: CampusId;
  name: string;
  shortName: string;
  level: 'Tiểu học' | 'THCS';
  totalClasses: number;
}

export interface SchoolInfo {
  name: string;
  district: string;
  address: string;
  principal: string;
  itManager: string;
  academicYear: string;
}

export interface AcademicMonth {
  id: string; // '2026-09'
  academicYear: string; // '2026-2027'
  monthNumber: number;
  year: number;
  cutoffDate: string;
  status: 'Đang nhập' | 'Đã kiểm tra' | 'Đã chốt';
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  createdAt: string;
}

export interface MonthlyClassStats {
  id: string;
  monthId: string;
  classId: string;
  className: string;
  grade: number;
  campusId: CampusId;
  level: 'Tiểu học' | 'THCS';
  homeroomTeacher: string;
  totalStudents: number;
  female: number;
  ethnic: number;
  femaleEthnic: number;
  disabled: number;
  poor: number;
  nearPoor: number;
  difficultVillage: number;
  boarding: number;
  deltaStudents: number;
  deltaReason?: string;
  notes?: string;
  updatedAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: number;
  campusId: CampusId;
  level: 'Tiểu học' | 'THCS';
  homeroomTeacher: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  ethnic: string;
  classId: string;
  className: string;
  campusId: CampusId;
  grade: number;
  isPoor: boolean;
  isNearPoor: boolean;
  isDisabled: boolean;
  isBoarding: boolean;
  difficultVillage: boolean;
  address: string;
  status: 'Đang học' | 'Chuyển đi' | 'Chuyển đến' | 'Nghỉ học' | 'Khác';
  notes?: string;
  createdAt: string;
}

export interface StudentFluctuation {
  id: string;
  date: string;
  monthId: string;
  studentName: string;
  studentCode?: string;
  classId: string;
  className: string;
  campusId: CampusId;
  type: 'Chuyển đến' | 'Chuyển đi' | 'Nghỉ học' | 'Nhập học' | 'Thôi học' | 'Khác';
  delta: number;
  reason: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface StaffItem {
  id: string;
  fullName: string;
  birthDate?: string;
  gender: 'Nam' | 'Nữ';
  position: string;
  role: 'HIỆU TRƯỞNG' | 'PHÓ HIỆU TRƯỞNG' | 'QUẢN LÝ CNTT' | 'GIÁO VIÊN' | 'NHÂN VIÊN';
  campusId: 'TOAN_TRUONG' | CampusId;
  department: string;
  subject?: string;
  qualification?: string;
  major?: string;
  phone?: string;
  email?: string;
  joinDate?: string;
  status: 'Đang công tác' | 'Nghỉ hưu' | 'Chuyển trường' | 'Chưa phân công';
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'QUAN_LY';
  fullName: string;
  email?: string;
  mustChangePassword?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details: string;
  ip?: string;
}
