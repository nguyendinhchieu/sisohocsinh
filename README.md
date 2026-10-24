# HỆ THỐNG QUẢN LÝ SĨ SỐ, LỚP HỌC & CÁN BỘ GIÁO VIÊN
## TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU (EA KAR, ĐẮK LẮK)

Hệ thống ứng dụng web chuyên biệt phục vụ công tác quản lý sĩ số học sinh, lớp học, hồ sơ cán bộ giáo viên, theo dõi biến động học sinh theo tháng và xuất báo cáo thống kê cho **Trường Tiểu học & Trung học cơ sở Nguyễn Đình Chiểu**, địa chỉ tại Thôn Cư Nghĩa, xã Ea Kar, huyện Ea Kar, tỉnh Đắk Lắk.

---

### THÔNG TIN ĐƠN VỊ & LÃNH ĐẠO
- **Đơn vị**: Trường TH&THCS Nguyễn Đình Chiểu
- **Địa chỉ**: Thôn Cư Nghĩa, xã Ea Kar, tỉnh Đắk Lắk
- **Hiệu trưởng**: Nguyễn Hồ Bắc
- **Quản lý Hệ thống & CNTT**: Phạm Ngọc Tiến
- **Cơ cấu lãnh đạo điểm trường**:
  - Phó Hiệu trưởng – Phân hiệu 1 (vị trí chờ bổ nhiệm / cập nhật)
  - Phó Hiệu trưởng – Phân hiệu 2 (vị trí chờ bổ nhiệm / cập nhật)
  - Phó Hiệu trưởng – Điểm chính THCS (vị trí chờ bổ nhiệm / cập nhật)

---

### QUY MÔ TRƯỜNG & DỮ LIỆU GỐC THÁNG 9/2026
Toàn trường có đúng **3 điểm trường**, **44 lớp**, tổng sĩ số chính xác **1.467 học sinh** (Ngày chốt: 15/09/2026):
1. **Phân hiệu 1 (Tiểu học)**: 20 lớp (Khối 1: 4 lớp; Khối 2: 4 lớp; Khối 3: 4 lớp; Khối 4: 4 lớp; Khối 5: 4 lớp) — 678 học sinh.
2. **Phân hiệu 2 (Tiểu học)**: 9 lớp (Khối 1: 1 lớp; Khối 2: 2 lớp; Khối 3: 2 lớp; Khối 4: 2 lớp; Khối 5: 2 lớp) — 255 học sinh.
3. **Điểm chính (THCS)**: 15 lớp (Khối 6: 4 lớp; Khối 7: 4 lớp; Khối 8: 4 lớp; Khối 9: 3 lớp) — 534 học sinh.

Tổng: $678 + 255 + 534 = 1.467$ học sinh.

---

### TÀI KHOẢN HỆ THỐNG
1. **Quản trị viên (ADMIN)**:
   - Tên đăng nhập: `admin`
   - Mật khẩu: `123456@` (được băm mã hóa một chiều bằng bcrypt)
   - Quyền hạn: Toàn quyền quản trị, chốt tháng, mở khóa tháng đã chốt, sao lưu & phục hồi dữ liệu, xem nhật ký kiểm toán (audit log).
2. **Cán bộ quản lý trường (QUAN_LY)**:
   - Tên đăng nhập: `nguyendinhchieu`
   - Mật khẩu: `123456789` (được băm mã hóa một chiều bằng bcrypt)
   - Quyền hạn: Xem dashboard, nhập & chỉnh sửa dữ liệu sĩ số, quản lý học sinh, quản lý lớp, ghi nhận biến động, xuất Excel/PDF báo cáo.

---

### BỘ TẬP TIN DỮ LIỆU GỐC
- `/data/seed.sql`: Script SQL khởi tạo bảng và chèn dữ liệu mẫu cho hệ quản trị CSDL quan hệ (PostgreSQL / MySQL).
- `/data/seed-data.json`: Dữ liệu JSON chuẩn hóa cấu trúc trường học, điểm trường và danh sách lớp.
- `/data/monthly_class_stats_2026-09.csv`: Bảng thống kê chi tiết 44 lớp tháng 09/2026 dạng CSV.
- `/data/staff.csv`: Danh sách cán bộ giáo viên, ban giám hiệu và nhân viên dạng CSV.
- `/data/database.json`: File lưu trữ cơ sở dữ liệu bền vững của hệ thống (ACID atomic write).

---

### CÁC QUY TẮC TOÀN VẸN DỮ LIỆU (VALIDATION RULES)
Hệ thống kiểm tra tự động trước khi lưu bất kỳ số liệu lớp nào:
```text
Nữ <= Sĩ số
Dân tộc <= Sĩ số
Nữ dân tộc <= Dân tộc
Nữ dân tộc <= Nữ
Hộ nghèo <= Sĩ số
Hộ cận nghèo <= Sĩ số
Hộ nghèo + Hộ cận nghèo <= Sĩ số
Khuyết tật <= Sĩ số
Bán trú <= Sĩ số
Buôn khó khăn <= Sĩ số
```

---

### KHỞI CHẠY & TRIỂN KHAI
```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server (Express backend + Vite client)
npm run dev

# Kiểm tra cú pháp TypeScript
npm run lint

# Đóng gói sản phẩm
npm run build

# Khởi chạy production
npm start
```
Mặc định dịch vụ lắng nghe trên cổng `http://localhost:3000`.
