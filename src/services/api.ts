import { 
  AcademicMonth, 
  MonthlyClassStats, 
  ClassItem, 
  Student, 
  StudentFluctuation, 
  StaffItem, 
  User, 
  AuditLog, 
  SchoolInfo,
  CampusInfo 
} from '../types';

const TOKEN_KEY = 'ndc_auth_token';
const USER_KEY = 'ndc_auth_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Có lỗi xảy ra trong quá trình xử lý.';
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      errorMsg = `Lỗi HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthSession(res.token, res.user);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  // School & Campuses
  async getSchoolInfo(): Promise<{ school: SchoolInfo; campuses: CampusInfo[] }> {
    return apiFetch<{ school: SchoolInfo; campuses: CampusInfo[] }>('/api/school-info');
  },

  // Months
  async getMonths(): Promise<AcademicMonth[]> {
    const data = await apiFetch<{ months: AcademicMonth[] }>('/api/months');
    return data.months;
  },

  async createMonth(monthStr: string, cutoffDate: string): Promise<AcademicMonth> {
    const res = await apiFetch<{ success: boolean; month: AcademicMonth }>('/api/months', {
      method: 'POST',
      body: JSON.stringify({ monthStr, cutoffDate })
    });
    return res.month;
  },

  async updateMonthStatus(monthId: string, status: 'Đang nhập' | 'Đã kiểm tra' | 'Đã chốt', isLocked: boolean): Promise<AcademicMonth> {
    const res = await apiFetch<{ success: boolean; month: AcademicMonth }>(`/api/months/${monthId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, isLocked })
    });
    return res.month;
  },

  // Monthly stats
  async getMonthlyStats(monthId: string): Promise<MonthlyClassStats[]> {
    const data = await apiFetch<{ stats: MonthlyClassStats[] }>(`/api/months/${monthId}/stats`);
    return data.stats;
  },

  async updateClassStats(monthId: string, classId: string, stats: Partial<MonthlyClassStats>): Promise<MonthlyClassStats> {
    const res = await apiFetch<{ success: boolean; stat: MonthlyClassStats }>(`/api/months/${monthId}/stats/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(stats)
    });
    return res.stat;
  },

  async batchUpdateStats(monthId: string, stats: Array<Partial<MonthlyClassStats> & { classId: string }>): Promise<{ updatedCount: number; errors: any[] }> {
    return apiFetch<{ updatedCount: number; errors: any[] }>(`/api/months/${monthId}/stats/batch`, {
      method: 'POST',
      body: JSON.stringify({ stats })
    });
  },

  // Classes
  async getClasses(): Promise<ClassItem[]> {
    const data = await apiFetch<{ classes: ClassItem[] }>('/api/classes');
    return data.classes;
  },

  // Students
  async getStudents(params?: { classId?: string; campusId?: string; search?: string; status?: string }): Promise<{ students: Student[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.classId) query.set('classId', params.classId);
    if (params?.campusId) query.set('campusId', params.campusId);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    return apiFetch<{ students: Student[]; total: number }>(`/api/students?${query.toString()}`);
  },

  async addStudent(studentData: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    const res = await apiFetch<{ success: boolean; student: Student }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    return res.student;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const res = await apiFetch<{ success: boolean; student: Student }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.student;
  },

  async deleteStudent(id: string): Promise<Student> {
    const res = await apiFetch<{ success: boolean; student: Student }>(`/api/students/${id}`, {
      method: 'DELETE'
    });
    return res.student;
  },

  // Fluctuations
  async getFluctuations(monthId?: string): Promise<StudentFluctuation[]> {
    const endpoint = monthId ? `/api/fluctuations?monthId=${monthId}` : '/api/fluctuations';
    const res = await apiFetch<{ fluctuations: StudentFluctuation[] }>(endpoint);
    return res.fluctuations;
  },

  async recordFluctuation(data: {
    date: string;
    monthId: string;
    studentName: string;
    studentCode?: string;
    classId: string;
    type: string;
    reason: string;
    notes?: string;
  }): Promise<StudentFluctuation> {
    const res = await apiFetch<{ success: boolean; fluctuation: StudentFluctuation }>('/api/fluctuations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.fluctuation;
  },

  // Staff
  async getStaff(): Promise<StaffItem[]> {
    const res = await apiFetch<{ staff: StaffItem[] }>('/api/staff');
    return res.staff;
  },

  async addStaff(staffData: Omit<StaffItem, 'id'>): Promise<StaffItem> {
    const res = await apiFetch<{ success: boolean; staff: StaffItem }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
    return res.staff;
  },

  async updateStaff(id: string, updates: Partial<StaffItem>): Promise<StaffItem> {
    const res = await apiFetch<{ success: boolean; staff: StaffItem }>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.staff;
  },

  async deleteStaff(id: string): Promise<StaffItem> {
    const res = await apiFetch<{ success: boolean; staff: StaffItem }>(`/api/staff/${id}`, {
      method: 'DELETE'
    });
    return res.staff;
  },

  // Audit logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await apiFetch<{ logs: AuditLog[] }>('/api/audit-logs');
    return res.logs;
  },

  // Backup & Restore
  async downloadBackup(): Promise<Blob> {
    const token = getStoredToken();
    const res = await fetch('/api/backup', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Không thể tải bản sao lưu');
    return res.blob();
  },

  async restoreBackup(backupData: any): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>('/api/restore', {
      method: 'POST',
      body: JSON.stringify({ data: backupData })
    });
  }
};
