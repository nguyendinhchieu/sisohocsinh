-- ============================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU & SEED THÁNG 9/2026
-- TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU (EA KAR, ĐẮK LẮK)
-- Hiệu trưởng: Nguyễn Hồ Bắc | Quản lý CNTT: Phạm Ngọc Tiến
-- ============================================================

-- Bảng điểm trường (Campuses)
CREATE TABLE IF NOT EXISTS campuses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  total_classes INT NOT NULL,
  vice_principal_title VARCHAR(255) NOT NULL
);

-- Bảng người dùng (Users)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng quản lý tháng (Academic Months)
CREATE TABLE IF NOT EXISTS academic_months (
  id VARCHAR(20) PRIMARY KEY, -- '2026-09'
  academic_year VARCHAR(20) NOT NULL, -- '2026-2027'
  month_number INT NOT NULL, -- 9
  year INT NOT NULL, -- 2026
  cutoff_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'Đang nhập', 'Đã kiểm tra', 'Đã chốt'
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by VARCHAR(50),
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lớp học (Classes)
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  grade INT NOT NULL,
  campus_id VARCHAR(50) REFERENCES campuses(id),
  level VARCHAR(50) NOT NULL,
  homeroom_teacher VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng số liệu lớp theo tháng (Monthly Class Stats)
CREATE TABLE IF NOT EXISTS monthly_class_stats (
  id VARCHAR(100) PRIMARY KEY,
  month_id VARCHAR(20) REFERENCES academic_months(id),
  class_id VARCHAR(50) REFERENCES classes(id),
  total_students INT NOT NULL CHECK (total_students >= 0),
  female INT NOT NULL CHECK (female >= 0 AND female <= total_students),
  ethnic INT NOT NULL CHECK (ethnic >= 0 AND ethnic <= total_students),
  female_ethnic INT NOT NULL CHECK (female_ethnic >= 0 AND female_ethnic <= ethnic AND female_ethnic <= female),
  disabled INT NOT NULL CHECK (disabled >= 0 AND disabled <= total_students),
  poor INT NOT NULL CHECK (poor >= 0 AND poor <= total_students),
  near_poor INT NOT NULL CHECK (near_poor >= 0 AND near_poor <= total_students),
  difficult_village INT NOT NULL CHECK (difficult_village >= 0 AND difficult_village <= total_students),
  boarding INT NOT NULL CHECK (boarding >= 0 AND boarding <= total_students),
  delta_students INT DEFAULT 0,
  delta_reason VARCHAR(255),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng cán bộ giáo viên (Staff)
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  gender VARCHAR(10) NOT NULL,
  position VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  campus_id VARCHAR(50) NOT NULL,
  department VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  qualification VARCHAR(100),
  major VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  join_date DATE,
  status VARCHAR(50) NOT NULL,
  notes TEXT
);

-- Bảng học sinh (Students)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  student_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  ethnic VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) REFERENCES classes(id),
  campus_id VARCHAR(50) REFERENCES campuses(id),
  is_poor BOOLEAN DEFAULT FALSE,
  is_near_poor BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  is_boarding BOOLEAN DEFAULT FALSE,
  difficult_village BOOLEAN DEFAULT FALSE,
  address TEXT,
  status VARCHAR(50) DEFAULT 'Đang học',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng biến động học sinh (Student Fluctuations)
CREATE TABLE IF NOT EXISTS student_fluctuations (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  month_id VARCHAR(20) REFERENCES academic_months(id),
  student_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50),
  class_id VARCHAR(50) REFERENCES classes(id),
  campus_id VARCHAR(50) REFERENCES campuses(id),
  type VARCHAR(50) NOT NULL, -- 'Chuyển đến', 'Chuyển đi', 'Nghỉ học', 'Nhập học', 'Thôi học', 'Khác'
  reason TEXT NOT NULL,
  delta INT NOT NULL, -- +1 hoặc -1
  recorded_by VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhật ký hệ thống (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(50),
  username VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50)
);

-- INSERT CÁC ĐIỂM TRƯỜNG
INSERT INTO campuses (id, name, short_name, level, total_classes, vice_principal_title) VALUES
('PH1', 'Trường TH&THCS Nguyễn Đình Chiểu (Phân hiệu 1)', 'Phân hiệu 1', 'Tiểu học', 20, 'Phó Hiệu trưởng – Phân hiệu 1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campuses (id, name, short_name, level, total_classes, vice_principal_title) VALUES
('PH2', 'Trường TH&THCS Nguyễn Đình Chiểu (Phân hiệu 2)', 'Phân hiệu 2', 'Tiểu học', 9, 'Phó Hiệu trưởng – Phân hiệu 2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campuses (id, name, short_name, level, total_classes, vice_principal_title) VALUES
('DIEM_CHINH', 'Trường TH&THCS Nguyễn Đình Chiểu (Điểm chính)', 'Điểm chính THCS', 'THCS', 15, 'Phó Hiệu trưởng – Điểm chính THCS')
ON CONFLICT (id) DO NOTHING;

-- INSERT 2 TÀI KHOẢN BAN ĐẦU
-- admin / 123456@ (bcrypt hash: $2b$10$wN1G159K2r/3vYqN9OaKqO1r3bBq5Q9U3Zz0b2b8j9s8f0a0d9m.u)
-- nguyendinhchieu / 123456789
INSERT INTO users (id, username, password_hash, role, full_name, email, must_change_password) VALUES
('USR_001', 'admin', '$2a$10$tZ8QGZ9E1Pzq6hA9hY5Efe7Gz1vI8rR4mJbX8sK1L3M0N9P8Q7R6S', 'ADMIN', 'Quản trị viên Hệ thống', 'admin.ndc@daklak.edu.vn', TRUE),
('USR_002', 'nguyendinhchieu', '$2a$10$k1h8yG8a0e8d0e8g0e8g0e7Gz1vI8rR4mJbX8sK1L3M0N9P8Q7R6S', 'QUAN_LY', 'Cán bộ Quản lý Trường', 'quanly.ndc@daklak.edu.vn', TRUE)
ON CONFLICT (username) DO NOTHING;

-- INSERT THÁNG 9/2026
INSERT INTO academic_months (id, academic_year, month_number, year, cutoff_date, status, is_locked) VALUES
('2026-09', '2026-2027', 9, 2026, '2026-09-15', 'Đã chốt', TRUE)
ON CONFLICT (id) DO NOTHING;
