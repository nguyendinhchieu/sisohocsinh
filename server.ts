import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple auth middleware (bearer token or header)
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'ADMIN' | 'QUAN_LY';
    fullName: string;
  };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If unauthenticated, allow public reading of school info or reject for protected endpoints
    return next();
  }

  try {
    const token = authHeader.replace(/^Bearer\s+/, '');
    // Token is encoded user info or simple secure payload
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const user = db.getUserById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      };
    }
  } catch (e) {
    // Ignore invalid token
  }
  next();
};

app.use(authMiddleware);

// --- API ROUTES ---

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
  }

  const token = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role, timestamp: Date.now() })).toString('base64');

  db.logAction(user.username, 'ĐĂNG NHẬP', `Người dùng ${user.fullName} (${user.role}) đăng nhập thành công`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      mustChangePassword: user.mustChangePassword
    }
  });
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập.' });
  }
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }
  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      mustChangePassword: user.mustChangePassword
    }
  });
});

app.post('/api/auth/change-password', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập.' });
  }
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
  }

  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

  const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(user.id, newHash);
  db.logAction(user.username, 'ĐỔI MẬT KHẨU', `Người dùng ${user.fullName} đã thay đổi mật khẩu`);

  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

// 2. School Info
app.get('/api/school-info', (_req: Request, res: Response) => {
  res.json({
    school: db.getSchoolInfo(),
    campuses: [
      { id: 'PH1', name: 'Trường TH&THCS Nguyễn Đình Chiểu (Phân hiệu 1)', shortName: 'Phân hiệu 1', level: 'Tiểu học', totalClasses: 20 },
      { id: 'PH2', name: 'Trường TH&THCS Nguyễn Đình Chiểu (Phân hiệu 2)', shortName: 'Phân hiệu 2', level: 'Tiểu học', totalClasses: 9 },
      { id: 'DIEM_CHINH', name: 'Trường TH&THCS Nguyễn Đình Chiểu (Điểm chính)', shortName: 'Điểm chính THCS', level: 'THCS', totalClasses: 15 }
    ]
  });
});

// 3. Academic Months
app.get('/api/months', (_req: Request, res: Response) => {
  res.json({ months: db.getMonths() });
});

app.post('/api/months', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  const { monthStr, cutoffDate } = req.body;
  if (!monthStr || !cutoffDate) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tháng (YYYY-MM) và ngày chốt.' });
  }

  try {
    const newMonth = db.createNextMonth(monthStr, cutoffDate, req.user.username);
    res.json({ success: true, month: newMonth });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/months/:monthId/status', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  const { monthId } = req.params;
  const { status, isLocked } = req.body;

  // Only admin can unlock a locked month
  if (isLocked === false && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ ADMIN mới có quyền mở khóa tháng đã chốt.' });
  }

  try {
    const updated = db.updateMonthStatus(monthId, status, isLocked, req.user.username);
    res.json({ success: true, month: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 4. Monthly Class Stats
app.get('/api/months/:monthId/stats', (req: Request, res: Response) => {
  const { monthId } = req.params;
  const stats = db.getMonthlyStats(monthId);
  res.json({ stats });
});

app.put('/api/months/:monthId/stats/:classId', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  const { monthId, classId } = req.params;
  const updates = req.body;

  try {
    const updated = db.updateClassStats(monthId, classId, updates, req.user.username);
    res.json({ success: true, stat: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/months/:monthId/stats/batch', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  const { monthId } = req.params;
  const { stats } = req.body;

  if (!Array.isArray(stats)) {
    return res.status(400).json({ error: 'Dữ liệu cập nhật phải là danh sách.' });
  }

  const results = [];
  const errors = [];

  for (const item of stats) {
    try {
      const updated = db.updateClassStats(monthId, item.classId, item, req.user.username);
      results.push(updated);
    } catch (err: any) {
      errors.push({ classId: item.classId, error: err.message });
    }
  }

  res.json({ success: errors.length === 0, updatedCount: results.length, errors });
});

// 5. Classes Management
app.get('/api/classes', (_req: Request, res: Response) => {
  res.json({ classes: db.getClasses() });
});

// 6. Students Management
app.get('/api/students', (req: Request, res: Response) => {
  const { classId, campusId, search, status } = req.query as Record<string, string>;
  const students = db.getStudents({ classId, campusId, search, status });
  res.json({ students, total: students.length });
});

app.post('/api/students', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const student = db.addStudent(req.body, req.user.username);
    res.json({ success: true, student });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/students/:id', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const student = db.updateStudent(req.params.id, req.body, req.user.username);
    res.json({ success: true, student });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/students/:id', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const student = db.deleteStudent(req.params.id, req.user.username);
    res.json({ success: true, student });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 7. Student Fluctuations
app.get('/api/fluctuations', (req: Request, res: Response) => {
  const { monthId } = req.query as { monthId?: string };
  res.json({ fluctuations: db.getFluctuations(monthId) });
});

app.post('/api/fluctuations', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const fluc = db.recordFluctuation({
      ...req.body,
      username: req.user.username
    });
    res.json({ success: true, fluctuation: fluc });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 8. Staff Management
app.get('/api/staff', (_req: Request, res: Response) => {
  res.json({ staff: db.getStaff() });
});

app.post('/api/staff', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const staffMember = db.addStaff(req.body, req.user.username);
    res.json({ success: true, staff: staffMember });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/staff/:id', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const staffMember = db.updateStaff(req.params.id, req.body, req.user.username);
    res.json({ success: true, staff: staffMember });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/staff/:id', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  try {
    const staffMember = db.deleteStaff(req.params.id, req.user.username);
    res.json({ success: true, staff: staffMember });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 9. Audit Logs (Admin only)
app.get('/api/audit-logs', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Cần đăng nhập.' });
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ ADMIN mới có quyền xem nhật ký kiểm toán hệ thống.' });
  }
  res.json({ logs: db.getAuditLogs() });
});

// 10. Backup & Restore (Admin only)
app.get('/api/backup', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ ADMIN mới có quyền tải bản sao lưu.' });
  }
  const backupData = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=backup_ndc_${Date.now()}.json`);
  res.send(backupData);
});

app.post('/api/restore', (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ ADMIN mới có quyền phục hồi dữ liệu.' });
  }
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Không có dữ liệu phục hồi.' });

  try {
    const result = db.restoreBackup(typeof data === 'string' ? data : JSON.stringify(data), req.user.username);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- VITE MIDDLEWARE OR STATIC SERVING ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
    console.log(`Quản lý Sĩ số - Trường TH&THCS Nguyễn Đình Chiểu`);
  });
}

startServer().catch(err => {
  console.error('Lỗi khởi động máy chủ:', err);
});
