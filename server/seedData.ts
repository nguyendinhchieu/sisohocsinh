import bcrypt from 'bcryptjs';

export interface ClassSeedItem {
  id: string;
  name: string;
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
  difficultVillage: number; // Hộ khẩu buôn khó khăn
  boarding: number; // Bán trú
  deltaStudents: number;
  deltaReason?: string;
  notes?: string;
}

export interface StaffSeedItem {
  id: string;
  fullName: string;
  birthDate?: string;
  gender: 'Nam' | 'Nữ';
  position: string;
  role: 'HIỆU TRƯỞNG' | 'PHÓ HIỆU TRƯỞNG' | 'QUẢN LÝ CNTT' | 'GIÁO VIÊN' | 'NHÂN VIÊN';
  campusId: 'TOAN_TRUONG' | 'PH1' | 'PH2' | 'DIEM_CHINH';
  department: string;
  subject?: string;
  qualification: string;
  major: string;
  phone?: string;
  email?: string;
  joinDate?: string;
  status: 'Đang công tác' | 'Nghỉ hưu' | 'Chuyển trường' | 'Chưa phân công';
  notes?: string;
}

export const INITIAL_CLASSES: ClassSeedItem[] = [
  // --- PHÂN HIỆU 1 (Tiểu học - 20 lớp - 678 học sinh) ---
  // Khối 1 (4 lớp: 34 + 33 + 34 + 33 = 134)
  { id: 'PH1_1A1', name: '1A1', grade: 1, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Lê Thị Thu Hà', totalStudents: 34, female: 17, ethnic: 11, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 8, boarding: 22, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: 'Lớp 1 chuẩn hóa' },
  { id: 'PH1_1A2', name: '1A2', grade: 1, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Nguyễn Thị Mai', totalStudents: 33, female: 16, ethnic: 10, femaleEthnic: 5, disabled: 1, poor: 1, nearPoor: 3, difficultVillage: 7, boarding: 20, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật vận động nhẹ' },
  { id: 'PH1_1A3', name: '1A3', grade: 1, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Trần Thị Bích', totalStudents: 34, female: 18, ethnic: 12, femaleEthnic: 7, disabled: 0, poor: 2, nearPoor: 1, difficultVillage: 9, boarding: 24, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_1A4', name: '1A4', grade: 1, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Hoàng Thị Thủy', totalStudents: 33, female: 16, ethnic: 9, femaleEthnic: 4, disabled: 0, poor: 1, nearPoor: 2, difficultVillage: 6, boarding: 21, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 2 (4 lớp: 35 + 34 + 34 + 35 = 138)
  { id: 'PH1_2A1', name: '2A1', grade: 2, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Phạm Thị Huệ', totalStudents: 35, female: 17, ethnic: 13, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 10, boarding: 25, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_2A2', name: '2A2', grade: 2, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Vũ Thị Loan', totalStudents: 34, female: 16, ethnic: 11, femaleEthnic: 5, disabled: 1, poor: 2, nearPoor: 1, difficultVillage: 8, boarding: 22, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật nhìn' },
  { id: 'PH1_2A3', name: '2A3', grade: 2, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Đặng Thị Hồng', totalStudents: 34, female: 18, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 1, nearPoor: 3, difficultVillage: 9, boarding: 23, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_2A4', name: '2A4', grade: 2, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Nguyễn Thị Yến', totalStudents: 35, female: 17, ethnic: 10, femaleEthnic: 5, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 7, boarding: 24, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 3 (4 lớp: 33 + 34 + 33 + 34 = 134)
  { id: 'PH1_3A1', name: '3A1', grade: 3, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Bùi Thị Hằng', totalStudents: 33, female: 16, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 1, nearPoor: 2, difficultVillage: 8, boarding: 21, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_3A2', name: '3A2', grade: 3, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Phan Thị Lệ', totalStudents: 34, female: 17, ethnic: 12, femaleEthnic: 6, disabled: 1, poor: 2, nearPoor: 2, difficultVillage: 9, boarding: 23, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật nghe nói' },
  { id: 'PH1_3A3', name: '3A3', grade: 3, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Lê Thị Tuyết', totalStudents: 33, female: 15, ethnic: 10, femaleEthnic: 4, disabled: 0, poor: 1, nearPoor: 1, difficultVillage: 7, boarding: 22, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_3A4', name: '3A4', grade: 3, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Đinh Thị Hương', totalStudents: 34, female: 18, ethnic: 13, femaleEthnic: 7, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 10, boarding: 25, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 4 (4 lớp: 35 + 35 + 34 + 34 = 138)
  { id: 'PH1_4A1', name: '4A1', grade: 4, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Võ Thị Nga', totalStudents: 35, female: 17, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 9, boarding: 24, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_4A2', name: '4A2', grade: 4, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Mai Thị Quỳnh', totalStudents: 35, female: 18, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 1, nearPoor: 2, difficultVillage: 8, boarding: 23, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_4A3', name: '4A3', grade: 4, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Trương Thị Vân', totalStudents: 34, female: 16, ethnic: 13, femaleEthnic: 6, disabled: 1, poor: 2, nearPoor: 1, difficultVillage: 10, boarding: 22, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật vận động' },
  { id: 'PH1_4A4', name: '4A4', grade: 4, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Đào Thị Linh', totalStudents: 34, female: 17, ethnic: 10, femaleEthnic: 5, disabled: 0, poor: 1, nearPoor: 3, difficultVillage: 7, boarding: 21, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 5 (4 lớp: 34 + 33 + 34 + 33 = 134)
  { id: 'PH1_5A1', name: '5A1', grade: 5, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Nguyễn Thị Oanh', totalStudents: 34, female: 17, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 9, boarding: 20, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_5A2', name: '5A2', grade: 5, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Hoàng Văn Nam', totalStudents: 33, female: 16, ethnic: 10, femaleEthnic: 5, disabled: 0, poor: 1, nearPoor: 2, difficultVillage: 8, boarding: 19, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH1_5A3', name: '5A3', grade: 5, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Lê Văn Cường', totalStudents: 34, female: 18, ethnic: 11, femaleEthnic: 5, disabled: 1, poor: 2, nearPoor: 1, difficultVillage: 8, boarding: 21, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khiếm thị' },
  { id: 'PH1_5A4', name: '5A4', grade: 5, campusId: 'PH1', level: 'Tiểu học', homeroomTeacher: 'Trần Thị Diễm', totalStudents: 33, female: 16, ethnic: 9, femaleEthnic: 4, disabled: 0, poor: 1, nearPoor: 2, difficultVillage: 6, boarding: 20, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // --- PHÂN HIỆU 2 (Tiểu học - 9 lớp - 255 học sinh) ---
  // Khối 1: 1 lớp = 28
  { id: 'PH2_1B1', name: '1B1', grade: 1, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: "H'Lâm Niê", totalStudents: 28, female: 14, ethnic: 15, femaleEthnic: 8, disabled: 0, poor: 3, nearPoor: 3, difficultVillage: 12, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: 'Buôn Cư Nghĩa' },

  // Khối 2: 2 lớp: 29 + 28 = 57
  { id: 'PH2_2B1', name: '2B1', grade: 2, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Y Thoan Mlô', totalStudents: 29, female: 15, ethnic: 16, femaleEthnic: 8, disabled: 1, poor: 4, nearPoor: 2, difficultVillage: 14, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật vận động' },
  { id: 'PH2_2B2', name: '2B2', grade: 2, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Nguyễn Thị Duyên', totalStudents: 28, female: 13, ethnic: 14, femaleEthnic: 7, disabled: 0, poor: 3, nearPoor: 4, difficultVillage: 13, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 3: 2 lớp: 28 + 29 = 57
  { id: 'PH2_3B1', name: '3B1', grade: 3, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: "H'Hoa Êban", totalStudents: 28, female: 14, ethnic: 15, femaleEthnic: 8, disabled: 0, poor: 3, nearPoor: 3, difficultVillage: 12, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH2_3B2', name: '3B2', grade: 3, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Đỗ Thị Minh', totalStudents: 29, female: 15, ethnic: 17, femaleEthnic: 9, disabled: 0, poor: 4, nearPoor: 3, difficultVillage: 15, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 4: 2 lớp: 28 + 28 = 56
  { id: 'PH2_4B1', name: '4B1', grade: 4, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Y Phi Kpơr', totalStudents: 28, female: 13, ethnic: 14, femaleEthnic: 7, disabled: 1, poor: 3, nearPoor: 3, difficultVillage: 13, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật nghe nói' },
  { id: 'PH2_4B2', name: '4B2', grade: 4, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Trần Đình Trọng', totalStudents: 28, female: 14, ethnic: 15, femaleEthnic: 8, disabled: 0, poor: 2, nearPoor: 4, difficultVillage: 12, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 5: 2 lớp: 29 + 28 = 57
  { id: 'PH2_5B1', name: '5B1', grade: 5, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: "H'Nhi Byă", totalStudents: 29, female: 15, ethnic: 16, femaleEthnic: 8, disabled: 0, poor: 4, nearPoor: 2, difficultVillage: 14, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'PH2_5B2', name: '5B2', grade: 5, campusId: 'PH2', level: 'Tiểu học', homeroomTeacher: 'Lương Văn Thắng', totalStudents: 28, female: 14, ethnic: 15, femaleEthnic: 7, disabled: 0, poor: 3, nearPoor: 3, difficultVillage: 13, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // --- ĐIỂM CHÍNH THCS (15 lớp - 534 học sinh) ---
  // Khối 6: 4 lớp: 36 + 36 + 35 + 35 = 142
  { id: 'THCS_6A', name: '6A', grade: 6, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Nguyễn Văn Tuấn', totalStudents: 36, female: 18, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_6B', name: '6B', grade: 6, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Phạm Thị Ánh', totalStudents: 36, female: 17, ethnic: 13, femaleEthnic: 6, disabled: 1, poor: 3, nearPoor: 2, difficultVillage: 9, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật vận động' },
  { id: 'THCS_6C', name: '6C', grade: 6, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Lê Hoàng Việt', totalStudents: 35, female: 18, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 7, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_6D', name: '6D', grade: 6, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Bùi Thị Mai', totalStudents: 35, female: 16, ethnic: 14, femaleEthnic: 7, disabled: 0, poor: 3, nearPoor: 3, difficultVillage: 10, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 7: 4 lớp: 36 + 35 + 36 + 35 = 142
  { id: 'THCS_7A', name: '7A', grade: 7, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Đinh Quang Huy', totalStudents: 36, female: 19, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_7B', name: '7B', grade: 7, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Vũ Thị Phương', totalStudents: 35, female: 17, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 7, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_7C', name: '7C', grade: 7, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Trần Quốc Toản', totalStudents: 36, female: 18, ethnic: 13, femaleEthnic: 7, disabled: 1, poor: 3, nearPoor: 2, difficultVillage: 9, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật nhìn' },
  { id: 'THCS_7D', name: '7D', grade: 7, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Nguyễn Thị Lan', totalStudents: 35, female: 16, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 8: 4 lớp: 35 + 36 + 35 + 35 = 141
  { id: 'THCS_8A', name: '8A', grade: 8, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Hoàng Minh Đức', totalStudents: 35, female: 18, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_8B', name: '8B', grade: 8, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Đỗ Thị Thu', totalStudents: 36, female: 17, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 3, nearPoor: 2, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_8C', name: '8C', grade: 8, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Lại Văn Kiên', totalStudents: 35, female: 17, ethnic: 10, femaleEthnic: 5, disabled: 1, poor: 2, nearPoor: 2, difficultVillage: 7, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '1 HS khuyết tật ngôn ngữ' },
  { id: 'THCS_8D', name: '8D', grade: 8, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Ngô Thị Cúc', totalStudents: 35, female: 18, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 9, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },

  // Khối 9: 3 lớp: 37 + 36 + 36 = 109
  { id: 'THCS_9A', name: '9A', grade: 9, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Trịnh Văn Hải', totalStudents: 37, female: 19, ethnic: 13, femaleEthnic: 7, disabled: 0, poor: 2, nearPoor: 3, difficultVillage: 9, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_9B', name: '9B', grade: 9, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Lâm Thị Hoa', totalStudents: 36, female: 18, ethnic: 12, femaleEthnic: 6, disabled: 0, poor: 3, nearPoor: 2, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' },
  { id: 'THCS_9C', name: '9C', grade: 9, campusId: 'DIEM_CHINH', level: 'THCS', homeroomTeacher: 'Phạm Quang Minh', totalStudents: 36, female: 17, ethnic: 11, femaleEthnic: 5, disabled: 0, poor: 2, nearPoor: 2, difficultVillage: 8, boarding: 0, deltaStudents: 0, deltaReason: 'Đầu năm học', notes: '' }
];

export const INITIAL_STAFF: StaffSeedItem[] = [
  // 1. Hiệu trưởng toàn trường
  {
    id: 'STAFF_001',
    fullName: 'Nguyễn Hồ Bắc',
    birthDate: '1975-08-15',
    gender: 'Nam',
    position: 'Hiệu trưởng',
    role: 'HIỆU TRƯỞNG',
    campusId: 'TOAN_TRUONG',
    department: 'Ban Giám hiệu',
    subject: 'Quản lý giáo dục / Toán',
    qualification: 'Thạc sĩ',
    major: 'Quản lý Giáo dục',
    phone: '0913.456.789',
    email: 'hieutruong.ndc@daklak.edu.vn',
    joinDate: '1998-09-01',
    status: 'Đang công tác',
    notes: 'Hiệu trưởng toàn trường'
  },

  // 2. Quản lý hệ thống / CNTT
  {
    id: 'STAFF_002',
    fullName: 'Phạm Ngọc Tiến',
    birthDate: '1988-04-12',
    gender: 'Nam',
    position: 'Quản lý Hệ thống & CNTT / Giáo viên Tin học',
    role: 'QUẢN LÝ CNTT',
    campusId: 'TOAN_TRUONG',
    department: 'Tổ CNTT - Thiết bị',
    subject: 'Tin học',
    qualification: 'Cử nhân / Kỹ sư',
    major: 'Công nghệ Thông tin & Sư phạm Tin',
    phone: '0988.765.432',
    email: 'tienpn.cntt@daklak.edu.vn',
    joinDate: '2012-10-01',
    status: 'Đang công tác',
    notes: 'Quản trị hệ thống, dữ liệu trường'
  },

  // 3. Đúng 03 vị trí Phó Hiệu trưởng để trống tên theo yêu cầu
  {
    id: 'STAFF_003',
    fullName: '', // Không bịa tên
    birthDate: '',
    gender: 'Nam',
    position: 'Phó Hiệu trưởng – Phân hiệu 1',
    role: 'PHÓ HIỆU TRƯỞNG',
    campusId: 'PH1',
    department: 'Ban Giám hiệu',
    qualification: 'Đại học',
    major: 'Giáo dục Tiểu học',
    status: 'Chưa phân công',
    notes: 'Vị trí Phó Hiệu trưởng phụ trách Phân hiệu 1 (chờ bổ nhiệm/cập nhật)'
  },
  {
    id: 'STAFF_004',
    fullName: '', // Không bịa tên
    birthDate: '',
    gender: 'Nam',
    position: 'Phó Hiệu trưởng – Phân hiệu 2',
    role: 'PHÓ HIỆU TRƯỞNG',
    campusId: 'PH2',
    department: 'Ban Giám hiệu',
    qualification: 'Đại học',
    major: 'Giáo dục Tiểu học',
    status: 'Chưa phân công',
    notes: 'Vị trí Phó Hiệu trưởng phụ trách Phân hiệu 2 (chờ bổ nhiệm/cập nhật)'
  },
  {
    id: 'STAFF_005',
    fullName: '', // Không bịa tên
    birthDate: '',
    gender: 'Nam',
    position: 'Phó Hiệu trưởng – Điểm chính THCS',
    role: 'PHÓ HIỆU TRƯỞNG',
    campusId: 'DIEM_CHINH',
    department: 'Ban Giám hiệu',
    qualification: 'Thạc sĩ/Đại học',
    major: 'Sư phạm THCS',
    status: 'Chưa phân công',
    notes: 'Vị trí Phó Hiệu trưởng phụ trách Điểm chính THCS (chờ bổ nhiệm/cập nhật)'
  },

  // 4. Các Tổ trưởng chuyên môn và Giáo viên chủ nhiệm chính
  {
    id: 'STAFF_006',
    fullName: 'Lê Thị Thu Hà',
    birthDate: '1985-03-20',
    gender: 'Nữ',
    position: 'Tổ trưởng Khối 1 / GVCN 1A1',
    role: 'GIÁO VIÊN',
    campusId: 'PH1',
    department: 'Tổ Chuyên môn Khối 1',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0973.111.222',
    email: 'lehatha@gmail.com',
    joinDate: '2008-09-01',
    status: 'Đang công tác',
    notes: 'GVCN Lớp 1A1'
  },
  {
    id: 'STAFF_007',
    fullName: 'Phạm Thị Huệ',
    birthDate: '1987-11-14',
    gender: 'Nữ',
    position: 'Tổ trưởng Khối 2 / GVCN 2A1',
    role: 'GIÁO VIÊN',
    campusId: 'PH1',
    department: 'Tổ Chuyên môn Khối 2',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0975.222.333',
    email: 'phamthihue@gmail.com',
    joinDate: '2010-09-01',
    status: 'Đang công tác',
    notes: 'GVCN Lớp 2A1'
  },
  {
    id: 'STAFF_008',
    fullName: 'Bùi Thị Hằng',
    birthDate: '1984-06-08',
    gender: 'Nữ',
    position: 'Tổ trưởng Khối 3 / GVCN 3A1',
    role: 'GIÁO VIÊN',
    campusId: 'PH1',
    department: 'Tổ Chuyên môn Khối 3',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0982.333.444',
    email: 'buithihang@gmail.com',
    joinDate: '2007-09-01',
    status: 'Đang công tác',
    notes: 'GVCN Lớp 3A1'
  },
  {
    id: 'STAFF_009',
    fullName: 'Võ Thị Nga',
    birthDate: '1986-09-12',
    gender: 'Nữ',
    position: 'Tổ trưởng Khối 4 / GVCN 4A1',
    role: 'GIÁO VIÊN',
    campusId: 'PH1',
    department: 'Tổ Chuyên môn Khối 4',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0978.444.555',
    email: 'vothinga@gmail.com',
    joinDate: '2009-09-01',
    status: 'Đang công tác',
    notes: 'GVCN Lớp 4A1'
  },
  {
    id: 'STAFF_010',
    fullName: 'Nguyễn Thị Oanh',
    birthDate: '1983-02-18',
    gender: 'Nữ',
    position: 'Tổ trưởng Khối 5 / GVCN 5A1',
    role: 'GIÁO VIÊN',
    campusId: 'PH1',
    department: 'Tổ Chuyên môn Khối 5',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0912.555.666',
    email: 'nguyenoanh@gmail.com',
    joinDate: '2006-09-01',
    status: 'Đang công tác',
    notes: 'GVCN Lớp 5A1'
  },
  {
    id: 'STAFF_011',
    fullName: "H'Lâm Niê",
    birthDate: '1990-05-24',
    gender: 'Nữ',
    position: 'Giáo viên Chủ nhiệm 1B1',
    role: 'GIÁO VIÊN',
    campusId: 'PH2',
    department: 'Tổ Tiểu học Phân hiệu 2',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0963.777.888',
    email: 'hlamnie@gmail.com',
    joinDate: '2014-09-01',
    status: 'Đang công tác',
    notes: 'Dân tộc Ê-đê, công tác tốt tại Phân hiệu 2'
  },
  {
    id: 'STAFF_012',
    fullName: 'Y Thoan Mlô',
    birthDate: '1989-10-10',
    gender: 'Nam',
    position: 'Giáo viên Chủ nhiệm 2B1',
    role: 'GIÁO VIÊN',
    campusId: 'PH2',
    department: 'Tổ Tiểu học Phân hiệu 2',
    subject: 'Tiểu học',
    qualification: 'Đại học Sư phạm',
    major: 'Giáo dục Tiểu học',
    phone: '0979.888.999',
    email: 'ythoanmlo@gmail.com',
    joinDate: '2013-09-01',
    status: 'Đang công tác',
    notes: 'Phân hiệu 2'
  },
  {
    id: 'STAFF_013',
    fullName: 'Nguyễn Văn Tuấn',
    birthDate: '1982-12-05',
    gender: 'Nam',
    position: 'Tổ trưởng Tự nhiên / GVCN 6A',
    role: 'GIÁO VIÊN',
    campusId: 'DIEM_CHINH',
    department: 'Tổ Toán - KHTN',
    subject: 'Toán học',
    qualification: 'Đại học Sư phạm',
    major: 'Toán học',
    phone: '0914.123.456',
    email: 'tuannv.toan@gmail.com',
    joinDate: '2005-09-01',
    status: 'Đang công tác',
    notes: 'Điểm chính THCS'
  },
  {
    id: 'STAFF_014',
    fullName: 'Đinh Quang Huy',
    birthDate: '1985-07-19',
    gender: 'Nam',
    position: 'Tổ phó Tự nhiên / GVCN 7A',
    role: 'GIÁO VIÊN',
    campusId: 'DIEM_CHINH',
    department: 'Tổ Toán - KHTN',
    subject: 'Vật lý - KHTN',
    qualification: 'Đại học Sư phạm',
    major: 'Vật lý',
    phone: '0983.234.567',
    email: 'huydq.ly@gmail.com',
    joinDate: '2008-09-01',
    status: 'Đang công tác',
    notes: 'Điểm chính THCS'
  },
  {
    id: 'STAFF_015',
    fullName: 'Hoàng Minh Đức',
    birthDate: '1984-01-25',
    gender: 'Nam',
    position: 'Tổ trưởng Xã hội / GVCN 8A',
    role: 'GIÁO VIÊN',
    campusId: 'DIEM_CHINH',
    department: 'Tổ Ngữ văn - KHXH',
    subject: 'Ngữ văn',
    qualification: 'Thạc sĩ',
    major: 'Văn học Việt Nam',
    phone: '0972.345.678',
    email: 'duchm.van@gmail.com',
    joinDate: '2007-09-01',
    status: 'Đang công tác',
    notes: 'Điểm chính THCS'
  },
  {
    id: 'STAFF_016',
    fullName: 'Trịnh Văn Hải',
    birthDate: '1981-09-30',
    gender: 'Nam',
    position: 'Tổ phó Xã hội / GVCN 9A',
    role: 'GIÁO VIÊN',
    campusId: 'DIEM_CHINH',
    department: 'Tổ Ngữ văn - KHXH',
    subject: 'Lịch sử - Địa lý',
    qualification: 'Đại học Sư phạm',
    major: 'Lịch sử',
    phone: '0918.456.789',
    email: 'haitv.su@gmail.com',
    joinDate: '2004-09-01',
    status: 'Đang công tác',
    notes: 'Điểm chính THCS'
  },
  {
    id: 'STAFF_017',
    fullName: 'Nguyễn Thị Thu Hiền',
    birthDate: '1991-04-16',
    gender: 'Nữ',
    position: 'Kế toán trưởng',
    role: 'NHÂN VIÊN',
    campusId: 'TOAN_TRUONG',
    department: 'Tổ Văn phòng',
    qualification: 'Cử nhân Kế toán',
    major: 'Kế toán tài chính',
    phone: '0905.123.987',
    email: 'ketoan.ndc@gmail.com',
    joinDate: '2015-01-01',
    status: 'Đang công tác',
    notes: 'Phụ trách chế độ chính sách học sinh'
  },
  {
    id: 'STAFF_018',
    fullName: 'Trần Thị Thu Trang',
    birthDate: '1993-08-22',
    gender: 'Nữ',
    position: 'Nhân viên Y tế học đường',
    role: 'NHÂN VIÊN',
    campusId: 'TOAN_TRUONG',
    department: 'Tổ Văn phòng',
    qualification: 'Cao đẳng Y tế',
    major: 'Điều dưỡng / Y tế trường học',
    phone: '0935.654.321',
    email: 'ytetruonghoc.ndc@gmail.com',
    joinDate: '2017-03-01',
    status: 'Đang công tác',
    notes: 'Theo dõi sức khỏe, học sinh khuyết tật'
  }
];

export const INITIAL_USERS = [
  {
    id: 'USR_001',
    username: 'admin',
    passwordHash: bcrypt.hashSync('123456@', 10),
    role: 'ADMIN' as const,
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin.ndc@daklak.edu.vn',
    mustChangePassword: true,
    createdAt: '2026-09-15T00:00:00.000Z'
  },
  {
    id: 'USR_002',
    username: 'nguyendinhchieu',
    passwordHash: bcrypt.hashSync('123456789', 10),
    role: 'QUAN_LY' as const,
    fullName: 'Cán bộ Quản lý Trường TH&THCS Nguyễn Đình Chiểu',
    email: 'quanly.ndc@daklak.edu.vn',
    mustChangePassword: true,
    createdAt: '2026-09-15T00:00:00.000Z'
  }
];
