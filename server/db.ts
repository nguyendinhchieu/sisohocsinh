import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { INITIAL_CLASSES, INITIAL_STAFF, INITIAL_USERS, ClassSeedItem, StaffSeedItem } from './seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface AcademicMonth {
  id: string; // '2026-09'
  academicYear: string; // '2026-2027'
  monthNumber: number; // 9
  year: number; // 2026
  cutoffDate: string; // '2026-09-15'
  status: 'Đang nhập' | 'Đã kiểm tra' | 'Đã chốt';
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  createdAt: string;
}

export interface MonthlyClassStats {
  id: string; // '2026-09_PH1_1A1'
  monthId: string;
  classId: string;
  className: string;
  grade: number;
  campusId: 'PH1' | 'PH2' | 'DIEM_CHINH';
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

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  ethnic: string;
  classId: string;
  className: string;
  campusId: 'PH1' | 'PH2' | 'DIEM_CHINH';
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
  campusId: 'PH1' | 'PH2' | 'DIEM_CHINH';
  type: 'Chuyển đến' | 'Chuyển đi' | 'Nghỉ học' | 'Nhập học' | 'Thôi học' | 'Khác';
  delta: number; // +1, -1, 0
  reason: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details: string;
  ip?: string;
}

export interface DatabaseSchema {
  version: number;
  schoolInfo: {
    name: string;
    district: string;
    address: string;
    principal: string;
    itManager: string;
    academicYear: string;
  };
  users: Array<{
    id: string;
    username: string;
    passwordHash: string;
    role: 'ADMIN' | 'QUAN_LY';
    fullName: string;
    email: string;
    mustChangePassword: boolean;
    createdAt: string;
  }>;
  months: AcademicMonth[];
  classes: Array<{
    id: string;
    name: string;
    grade: number;
    campusId: 'PH1' | 'PH2' | 'DIEM_CHINH';
    level: 'Tiểu học' | 'THCS';
    homeroomTeacher: string;
    isActive: boolean;
  }>;
  monthlyStats: MonthlyClassStats[];
  students: Student[];
  fluctuations: StudentFluctuation[];
  staff: StaffSeedItem[];
  auditLogs: AuditLog[];
}

export function validateClassStats(stats: Partial<MonthlyClassStats>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = Number(stats.totalStudents ?? 0);
  const female = Number(stats.female ?? 0);
  const ethnic = Number(stats.ethnic ?? 0);
  const femaleEthnic = Number(stats.femaleEthnic ?? 0);
  const disabled = Number(stats.disabled ?? 0);
  const poor = Number(stats.poor ?? 0);
  const nearPoor = Number(stats.nearPoor ?? 0);
  const difficultVillage = Number(stats.difficultVillage ?? 0);
  const boarding = Number(stats.boarding ?? 0);

  if (total < 0) errors.push('Sĩ số tổng không được âm');
  if (female < 0) errors.push('Số học sinh nữ không được âm');
  if (ethnic < 0) errors.push('Số học sinh dân tộc không được âm');
  if (femaleEthnic < 0) errors.push('Số nữ dân tộc không được âm');
  if (disabled < 0) errors.push('Số học sinh khuyết tật không được âm');
  if (poor < 0) errors.push('Số học sinh hộ nghèo không được âm');
  if (nearPoor < 0) errors.push('Số học sinh hộ cận nghèo không được âm');
  if (difficultVillage < 0) errors.push('Số học sinh buôn khó khăn không được âm');
  if (boarding < 0) errors.push('Số học sinh bán trú không được âm');

  if (female > total) errors.push('Số học sinh Nữ không được vượt quá Tổng sĩ số');
  if (ethnic > total) errors.push('Số học sinh Dân tộc không được vượt quá Tổng sĩ số');
  if (femaleEthnic > ethnic) errors.push('Số Nữ dân tộc không được vượt quá Số dân tộc');
  if (femaleEthnic > female) errors.push('Số Nữ dân tộc không được vượt quá Số học sinh nữ');
  if (poor > total) errors.push('Số Hộ nghèo không được vượt quá Tổng sĩ số');
  if (nearPoor > total) errors.push('Số Hộ cận nghèo không được vượt quá Tổng sĩ số');
  if (poor + nearPoor > total) errors.push('Tổng Hộ nghèo và Cận nghèo không được vượt quá Tổng sĩ số');
  if (disabled > total) errors.push('Số học sinh Khuyết tật không được vượt quá Tổng sĩ số');
  if (boarding > total) errors.push('Số học sinh Bán trú không được vượt quá Tổng sĩ số');
  if (difficultVillage > total) errors.push('Số học sinh Buôn khó khăn không được vượt quá Tổng sĩ số');

  return {
    valid: errors.length === 0,
    errors
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadOrInitialize();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private generateSampleStudents(classes: ClassSeedItem[]): Student[] {
    const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Y', "H'", 'Lương', 'Trương'];
    const middleNames = ['Văn', 'Thị', 'Đình', 'Thành', 'Quang', 'Ngọc', 'Thu', 'Hồng', 'Minh', 'Hữu'];
    const givenNames = ['An', 'Bình', 'Châu', 'Dũng', 'Em', 'Giang', 'Hà', 'Hải', 'Khánh', 'Lan', 'Linh', 'Minh', 'Nam', 'Oanh', 'Phúc', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Trang', 'Tú', 'Uyên', 'Việt', 'Yến', 'Niê', 'Êban', 'Mlô', 'Kpơr', 'Byă'];

    const students: Student[] = [];
    let count = 0;

    for (const c of classes) {
      // For performance and realism, generate representative indexed students for each class
      for (let i = 1; i <= c.totalStudents; i++) {
        count++;
        const isFemale = i <= c.female;
        const isEthnic = i <= c.ethnic;
        const isFemaleEthnic = isFemale && isEthnic && i <= c.femaleEthnic;
        const isDisabled = i <= c.disabled;
        const isPoor = i > c.disabled && i <= c.disabled + c.poor;
        const isNearPoor = i > c.disabled + c.poor && i <= c.disabled + c.poor + c.nearPoor;
        const isDifficultVillage = i <= c.difficultVillage;
        const isBoarding = i <= c.boarding;

        let ethnicName = 'Kinh';
        let fullName = '';
        if (isEthnic) {
          const ethnicGroups = ['Ê-đê', 'Tày', 'Nùng', 'M’Nông'];
          ethnicName = c.campusId === 'PH2' ? 'Ê-đê' : ethnicGroups[(i + c.grade) % ethnicGroups.length];
          const prefix = isFemale ? "H'" : 'Y ';
          const surname = ethnicName === 'Ê-đê' ? prefix : surnames[i % surnames.length];
          fullName = ethnicName === 'Ê-đê'
            ? `${prefix}${givenNames[(count * 3) % givenNames.length]} ${c.campusId === 'PH2' ? 'Niê' : 'Êban'}`
            : `${surname} ${middleNames[i % middleNames.length]} ${givenNames[i % givenNames.length]}`;
        } else {
          fullName = `${surnames[i % surnames.length]} ${isFemale ? 'Thị' : 'Văn'} ${givenNames[i % givenNames.length]}`;
        }

        const birthYear = 2026 - (c.grade + 5);
        const birthMonth = String((i % 12) + 1).padStart(2, '0');
        const birthDay = String((i % 28) + 1).padStart(2, '0');

        students.push({
          id: `STU_${String(count).padStart(5, '0')}`,
          studentCode: `NDC26${String(count).padStart(4, '0')}`,
          fullName,
          birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
          gender: isFemale ? 'Nữ' : 'Nam',
          ethnic: ethnicName,
          classId: c.id,
          className: c.name,
          campusId: c.campusId,
          grade: c.grade,
          isPoor,
          isNearPoor,
          isDisabled,
          isBoarding,
          difficultVillage: isDifficultVillage,
          address: c.campusId === 'PH2' ? 'Thôn Cư Nghĩa, Ea Kar, Đắk Lắk' : 'Xã Ea Kar, huyện Ea Kar, Đắk Lắk',
          status: 'Đang học',
          notes: isDisabled ? 'HS khuyết tật học hòa nhập' : '',
          createdAt: '2026-09-15T00:00:00.000Z'
        });
      }
    }
    return students;
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version && parsed.months && parsed.monthlyStats) {
          return parsed;
        }
      } catch (err) {
        console.error('Error reading DB_FILE, reinitializing with seed data:', err);
      }
    }

    // Initialize with fresh seed data
    const initialMonthId = '2026-09';
    const monthRecord: AcademicMonth = {
      id: initialMonthId,
      academicYear: '2026-2027',
      monthNumber: 9,
      year: 2026,
      cutoffDate: '2026-09-15',
      status: 'Đã chốt',
      isLocked: true,
      lockedBy: 'admin',
      lockedAt: '2026-09-15T17:00:00.000Z',
      createdAt: '2026-09-15T00:00:00.000Z'
    };

    const classes = INITIAL_CLASSES.map(c => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      campusId: c.campusId,
      level: c.level,
      homeroomTeacher: c.homeroomTeacher,
      isActive: true
    }));

    const monthlyStats: MonthlyClassStats[] = INITIAL_CLASSES.map(c => ({
      id: `${initialMonthId}_${c.id}`,
      monthId: initialMonthId,
      classId: c.id,
      className: c.name,
      grade: c.grade,
      campusId: c.campusId,
      level: c.level,
      homeroomTeacher: c.homeroomTeacher,
      totalStudents: c.totalStudents,
      female: c.female,
      ethnic: c.ethnic,
      femaleEthnic: c.femaleEthnic,
      disabled: c.disabled,
      poor: c.poor,
      nearPoor: c.nearPoor,
      difficultVillage: c.difficultVillage,
      boarding: c.boarding,
      deltaStudents: 0,
      deltaReason: 'Chốt số liệu đầu năm học 2026-2027',
      notes: c.notes || '',
      updatedAt: '2026-09-15T17:00:00.000Z'
    }));

    const students = this.generateSampleStudents(INITIAL_CLASSES);

    const schema: DatabaseSchema = {
      version: 1,
      schoolInfo: {
        name: 'Trường TH&THCS Nguyễn Đình Chiểu',
        district: 'Thôn Cư Nghĩa, xã Ea Kar, tỉnh Đắk Lắk',
        address: 'Thôn Cư Nghĩa, xã Ea Kar, tỉnh Đắk Lắk',
        principal: 'Nguyễn Hồ Bắc',
        itManager: 'Phạm Ngọc Tiến',
        academicYear: '2026-2027'
      },
      users: INITIAL_USERS,
      months: [monthRecord],
      classes,
      monthlyStats,
      students,
      fluctuations: [],
      staff: INITIAL_STAFF,
      auditLogs: [
        {
          id: 'LOG_001',
          timestamp: '2026-09-15T17:00:00.000Z',
          username: 'admin',
          action: 'KHỞI TẠO HỆ THỐNG',
          details: 'Khởi tạo dữ liệu gốc tháng 09/2026 với 44 lớp và 1.467 học sinh toàn trường'
        }
      ]
    };

    this.saveDataDirect(schema);
    return schema;
  }

  private saveDataDirect(data: DatabaseSchema) {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public logAction(username: string, action: string, details: string, ip?: string) {
    const log: AuditLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
      ip
    };
    this.data.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  // --- GETTERS ---
  public getSchoolInfo() {
    return this.data.schoolInfo;
  }

  public getUsers() {
    return this.data.users;
  }

  public getUserByUsername(username: string) {
    return this.data.users.find(u => u.username === username);
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public updateUserPassword(userId: string, newPasswordHash: string) {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.mustChangePassword = false;
    this.save();
    return true;
  }

  public getMonths() {
    return [...this.data.months].sort((a, b) => a.id.localeCompare(b.id));
  }

  public getMonthById(monthId: string) {
    return this.data.months.find(m => m.id === monthId);
  }

  public getClasses() {
    return this.data.classes.filter(c => c.isActive);
  }

  public getAllClasses() {
    return this.data.classes;
  }

  public getClassById(classId: string) {
    return this.data.classes.find(c => c.id === classId);
  }

  public getMonthlyStats(monthId: string) {
    return this.data.monthlyStats.filter(s => s.monthId === monthId);
  }

  public getStaff() {
    return this.data.staff;
  }

  public getStudents(filter?: { classId?: string; campusId?: string; search?: string; status?: string }) {
    let result = this.data.students;
    if (!filter) return result;

    if (filter.classId) {
      result = result.filter(s => s.classId === filter.classId);
    }
    if (filter.campusId) {
      result = result.filter(s => s.campusId === filter.campusId);
    }
    if (filter.status) {
      result = result.filter(s => s.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.ethnic.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getFluctuations(monthId?: string) {
    if (monthId) {
      return this.data.fluctuations.filter(f => f.monthId === monthId);
    }
    return this.data.fluctuations;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  // --- ACTIONS ---

  // 1. Create next month based on previous month
  public createNextMonth(targetMonthStr: string, cutoffDate: string, username: string): AcademicMonth {
    // targetMonthStr like '2026-10'
    const existing = this.getMonthById(targetMonthStr);
    if (existing) {
      throw new Error(`Tháng ${targetMonthStr} đã tồn tại trong hệ thống.`);
    }

    const [yearStr, monthStr] = targetMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // Find the latest existing month
    const monthsSorted = [...this.data.months].sort((a, b) => b.id.localeCompare(a.id));
    const previousMonth = monthsSorted[0];

    const prevStats = previousMonth ? this.getMonthlyStats(previousMonth.id) : [];

    const newMonth: AcademicMonth = {
      id: targetMonthStr,
      academicYear: this.data.schoolInfo.academicYear,
      monthNumber: monthNum,
      year,
      cutoffDate,
      status: 'Đang nhập',
      isLocked: false,
      createdAt: new Date().toISOString()
    };

    this.data.months.push(newMonth);

    // Inherit class stats from previous month
    for (const p of prevStats) {
      const newStat: MonthlyClassStats = {
        id: `${targetMonthStr}_${p.classId}`,
        monthId: targetMonthStr,
        classId: p.classId,
        className: p.className,
        grade: p.grade,
        campusId: p.campusId,
        level: p.level,
        homeroomTeacher: p.homeroomTeacher,
        totalStudents: p.totalStudents,
        female: p.female,
        ethnic: p.ethnic,
        femaleEthnic: p.femaleEthnic,
        disabled: p.disabled,
        poor: p.poor,
        nearPoor: p.nearPoor,
        difficultVillage: p.difficultVillage,
        boarding: p.boarding,
        deltaStudents: 0,
        deltaReason: '',
        notes: p.notes,
        updatedAt: new Date().toISOString()
      };
      this.data.monthlyStats.push(newStat);
    }

    this.logAction(username, 'TẠO THÁNG MỚI', `Tạo dữ liệu cho tháng ${targetMonthStr}, kế thừa từ tháng ${previousMonth?.id || 'gốc'}`);
    this.save();
    return newMonth;
  }

  // 2. Update Month Status (Lock / Unlock / Đã kiểm tra / Đã chốt)
  public updateMonthStatus(monthId: string, status: 'Đang nhập' | 'Đã kiểm tra' | 'Đã chốt', isLocked: boolean, username: string) {
    const month = this.getMonthById(monthId);
    if (!month) throw new Error(`Không tìm thấy tháng ${monthId}`);

    month.status = status;
    month.isLocked = isLocked;
    if (isLocked) {
      month.lockedBy = username;
      month.lockedAt = new Date().toISOString();
    } else {
      month.lockedBy = undefined;
      month.lockedAt = undefined;
    }

    this.logAction(username, isLocked ? 'CHỐT SỐ LIỆU THÁNG' : 'MỞ KHÓA THÁNG', `Cập nhật trạng thái tháng ${monthId} thành: ${status}, Khóa: ${isLocked}`);
    this.save();
    return month;
  }

  // 3. Update single class stats with 8 validation rules
  public updateClassStats(monthId: string, classId: string, updates: Partial<MonthlyClassStats>, username: string) {
    const month = this.getMonthById(monthId);
    if (!month) throw new Error(`Không tìm thấy tháng ${monthId}`);
    if (month.isLocked) throw new Error(`Tháng ${monthId} đã bị khóa, không thể chỉnh sửa số liệu.`);

    const stat = this.data.monthlyStats.find(s => s.monthId === monthId && s.classId === classId);
    if (!stat) throw new Error(`Không tìm thấy số liệu cho lớp ${classId} trong tháng ${monthId}`);

    const candidate = {
      ...stat,
      ...updates
    };

    const validation = validateClassStats(candidate);
    if (!validation.valid) {
      throw new Error(`Dữ liệu không hợp lệ:\n- ${validation.errors.join('\n- ')}`);
    }

    // Apply updates
    stat.totalStudents = candidate.totalStudents;
    stat.female = candidate.female;
    stat.ethnic = candidate.ethnic;
    stat.femaleEthnic = candidate.femaleEthnic;
    stat.disabled = candidate.disabled;
    stat.poor = candidate.poor;
    stat.nearPoor = candidate.nearPoor;
    stat.difficultVillage = candidate.difficultVillage;
    stat.boarding = candidate.boarding;
    stat.deltaStudents = candidate.deltaStudents ?? stat.deltaStudents;
    stat.deltaReason = candidate.deltaReason ?? stat.deltaReason;
    stat.notes = candidate.notes ?? stat.notes;
    stat.homeroomTeacher = candidate.homeroomTeacher ?? stat.homeroomTeacher;
    stat.updatedAt = new Date().toISOString();

    this.logAction(username, 'CẬP NHẬT SĨ SỐ LỚP', `Cập nhật số liệu lớp ${stat.className} tháng ${monthId} (Sĩ số: ${stat.totalStudents})`);
    this.save();
    return stat;
  }

  // 4. Record Student Fluctuation
  public recordFluctuation(data: {
    date: string;
    monthId: string;
    studentName: string;
    studentCode?: string;
    classId: string;
    type: 'Chuyển đến' | 'Chuyển đi' | 'Nghỉ học' | 'Nhập học' | 'Thôi học' | 'Khác';
    reason: string;
    notes?: string;
    delta?: number;
    username: string;
  }) {
    const month = this.getMonthById(data.monthId);
    if (!month) throw new Error(`Không tìm thấy tháng ${data.monthId}`);
    if (month.isLocked) throw new Error(`Tháng ${data.monthId} đã bị khóa, không thể ghi nhận biến động.`);

    const classItem = this.getClassById(data.classId);
    if (!classItem) throw new Error(`Không tìm thấy lớp ${data.classId}`);

    // Determine delta
    let delta = 0;
    if (data.delta !== undefined) {
      delta = data.delta;
    } else {
      if (data.type === 'Chuyển đến' || data.type === 'Nhập học') delta = 1;
      else if (data.type === 'Chuyển đi' || data.type === 'Nghỉ học' || data.type === 'Thôi học') delta = -1;
    }

    const fluctuation: StudentFluctuation = {
      id: `FLUC_${Date.now()}`,
      date: data.date,
      monthId: data.monthId,
      studentName: data.studentName,
      studentCode: data.studentCode,
      classId: data.classId,
      className: classItem.name,
      campusId: classItem.campusId,
      type: data.type,
      delta,
      reason: data.reason,
      notes: data.notes,
      recordedBy: data.username,
      createdAt: new Date().toISOString()
    };

    this.data.fluctuations.unshift(fluctuation);

    // Update monthly class stats automatically
    const stat = this.data.monthlyStats.find(s => s.monthId === data.monthId && s.classId === data.classId);
    if (stat) {
      stat.totalStudents += delta;
      stat.deltaStudents = (stat.deltaStudents || 0) + delta;
      stat.deltaReason = stat.deltaReason ? `${stat.deltaReason}; ${data.reason}` : data.reason;
      stat.updatedAt = new Date().toISOString();
    }

    this.logAction(data.username, 'GHI NHẬN BIẾN ĐỘNG HS', `${data.type}: ${data.studentName} - Lớp ${classItem.name} (${delta > 0 ? '+' : ''}${delta})`);
    this.save();
    return fluctuation;
  }

  // 5. Staff Management CRUD
  public addStaff(staffData: Omit<StaffSeedItem, 'id'>, username: string) {
    const id = `STAFF_${String(this.data.staff.length + 1).padStart(3, '0')}`;
    const newStaff: StaffSeedItem = {
      id,
      ...staffData
    };
    this.data.staff.push(newStaff);
    this.logAction(username, 'THÊM CÁN BỘ GIÁO VIÊN', `Thêm: ${newStaff.fullName} - ${newStaff.position}`);
    this.save();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<StaffSeedItem>, username: string) {
    const item = this.data.staff.find(s => s.id === id);
    if (!item) throw new Error(`Không tìm thấy cán bộ có ID: ${id}`);
    Object.assign(item, updates);
    this.logAction(username, 'CẬP NHẬT CÁN BỘ GIÁO VIÊN', `Cập nhật thông tin cán bộ: ${item.fullName || item.position}`);
    this.save();
    return item;
  }

  public deleteStaff(id: string, username: string) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Không tìm thấy cán bộ có ID: ${id}`);
    const removed = this.data.staff.splice(idx, 1)[0];
    this.logAction(username, 'XÓA CÁN BỘ GIÁO VIÊN', `Xóa cán bộ: ${removed.fullName || removed.position}`);
    this.save();
    return removed;
  }

  // 6. Student Management CRUD
  public addStudent(studentData: Omit<Student, 'id' | 'createdAt'>, username: string) {
    const id = `STU_${Date.now()}`;
    const newStudent: Student = {
      id,
      createdAt: new Date().toISOString(),
      ...studentData
    };
    this.data.students.push(newStudent);
    this.logAction(username, 'THÊM HỌC SINH', `Thêm học sinh: ${newStudent.fullName} (${newStudent.studentCode})`);
    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>, username: string) {
    const item = this.data.students.find(s => s.id === id);
    if (!item) throw new Error(`Không tìm thấy học sinh ID: ${id}`);
    Object.assign(item, updates);
    this.logAction(username, 'CẬP NHẬT HỌC SINH', `Cập nhật thông tin học sinh: ${item.fullName}`);
    this.save();
    return item;
  }

  public deleteStudent(id: string, username: string) {
    const item = this.data.students.find(s => s.id === id);
    if (!item) throw new Error(`Không tìm thấy học sinh ID: ${id}`);
    item.status = 'Khác';
    this.logAction(username, 'XÓA/CHUYỂN TRẠNG THÁI HỌC SINH', `Học sinh: ${item.fullName}`);
    this.save();
    return item;
  }

  // 7. Full DB Backup & Restore
  public exportBackup() {
    return JSON.stringify(this.data, null, 2);
  }

  public restoreBackup(jsonString: string, username: string) {
    try {
      const parsed = JSON.parse(jsonString) as DatabaseSchema;
      if (!parsed.version || !parsed.months || !parsed.monthlyStats || !parsed.classes) {
        throw new Error('Định dạng tệp sao lưu không hợp lệ.');
      }
      this.data = parsed;
      this.logAction(username, 'PHỤC HỒI DỮ LIỆU', 'Khôi phục cơ sở dữ liệu từ tệp sao lưu JSON');
      this.save();
      return { success: true, message: 'Phục hồi cơ sở dữ liệu thành công.' };
    } catch (e: any) {
      throw new Error(`Lỗi phục hồi dữ liệu: ${e.message}`);
    }
  }
}

export const db = new Database();
