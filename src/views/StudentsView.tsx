import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';
import { Student, User, SchoolInfo, MonthlyClassStats } from '../types';
import { api } from '../services/api';
import { exportStudentsToExcel } from '../utils/excelExport';

interface StudentsViewProps {
  stats: MonthlyClassStats[];
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  stats,
  currentUser,
  schoolInfo
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      setStudents(res.students);
    } catch (e: any) {
      console.error('Error fetching students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (campusFilter !== 'ALL' && s.campusId !== campusFilter) return false;
      if (classFilter !== 'ALL' && s.className !== classFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q) ||
          s.ethnic.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, campusFilter, classFilter, statusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingStudent({
      studentCode: `NDC26${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      birthDate: '2016-01-01',
      gender: 'Nữ',
      ethnic: 'Kinh',
      className: stats[0]?.className || '1A1',
      campusId: stats[0]?.campusId || 'PH1',
      grade: stats[0]?.grade || 1,
      isPoor: false,
      isNearPoor: false,
      isDisabled: false,
      isBoarding: false,
      difficultVillage: false,
      address: 'Thôn Cư Nghĩa, Ea Kar, Đắk Lắk',
      status: 'Đang học',
      notes: ''
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (student: Student) => {
    setIsNew(false);
    setEditingStudent({ ...student });
    setErrorMsg(null);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.fullName || !editingStudent.studentCode) {
      setErrorMsg('Vui lòng điền đầy đủ Mã học sinh và Họ tên');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      // Find matching class
      const matchingClass = stats.find(c => c.className === editingStudent.className);
      const studentPayload = {
        ...editingStudent,
        campusId: matchingClass ? matchingClass.campusId : editingStudent.campusId || 'PH1',
        grade: matchingClass ? matchingClass.grade : editingStudent.grade || 1,
        classId: matchingClass ? matchingClass.classId : editingStudent.classId || 'PH1_1A1'
      } as any;

      if (isNew) {
        await api.addStudent(studentPayload);
      } else {
        await api.updateStudent(editingStudent.id!, studentPayload);
      }

      await fetchStudents();
      setEditingStudent(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin học sinh');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Quản lý Hồ sơ Học sinh</h1>
          <p className="text-xs text-slate-500">
            Tổng cộng: <strong>{students.length.toLocaleString('vi-VN')}</strong> hồ sơ học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm học sinh</span>
            </button>
          )}

          <button
            onClick={() => {
              if (schoolInfo) exportStudentsToExcel(filteredStudents, schoolInfo);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã, họ tên, dân tộc..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={campusFilter}
            onChange={e => setCampusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả điểm trường</option>
            <option value="PH1">Phân hiệu 1</option>
            <option value="PH2">Phân hiệu 2</option>
            <option value="DIEM_CHINH">Điểm chính THCS</option>
          </select>

          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả các lớp (44 lớp)</option>
            {stats.map(s => (
              <option key={s.classId} value={s.className}>{s.className} ({s.campusId})</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Chuyển đến">Chuyển đến</option>
            <option value="Chuyển đi">Chuyển đi</option>
            <option value="Nghỉ học">Nghỉ học</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Đang hiển thị: <strong className="text-slate-800">{filteredStudents.length}</strong> / {students.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3 font-mono">Mã HS</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Ngày sinh</th>
                <th className="py-2.5 px-3 text-center">Giới tính</th>
                <th className="py-2.5 px-3">Dân tộc</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3">Điểm trường</th>
                <th className="py-2.5 px-3 text-center">Diện chính sách</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                {currentUser && <th className="py-2.5 px-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Đang tải danh sách học sinh...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 100).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 font-medium">
                      {s.studentCode}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {s.fullName}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {s.birthDate}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={s.gender === 'Nữ' ? 'text-pink-600 font-medium' : 'text-blue-600 font-medium'}>
                        {s.gender}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {s.ethnic}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {s.className}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {s.campusId === 'PH1' ? 'Phân hiệu 1' : s.campusId === 'PH2' ? 'Phân hiệu 2' : 'Điểm chính THCS'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px]">
                        {s.isPoor && <span className="text-red-700 font-medium">Nghèo</span>}
                        {s.isNearPoor && <span className="text-amber-700 font-medium">Cận</span>}
                        {s.isDisabled && <span className="text-purple-700 font-medium">KT</span>}
                        {s.isBoarding && <span className="text-cyan-700 font-medium">Bán trú</span>}
                        {!s.isPoor && !s.isNearPoor && !s.isDisabled && !s.isBoarding && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-slate-700 font-medium">
                        {s.status}
                      </span>
                    </td>
                    {currentUser && (
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                          title="Sửa học sinh"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 100 && (
          <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
            Hiển thị 100 / {filteredStudents.length} học sinh. Dùng bộ lọc để thu hẹp kết quả hoặc xuất toàn bộ ra Excel.
          </div>
        )}
      </div>

      {/* MODAL: Add/Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {isNew ? 'Thêm Học sinh Mới' : 'Cập nhật Thông tin Học sinh'}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.studentCode || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.fullName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editingStudent.birthDate || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={editingStudent.gender || 'Nữ'}
                    onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dân tộc
                  </label>
                  <input
                    type="text"
                    value={editingStudent.ethnic || 'Kinh'}
                    onChange={e => setEditingStudent({ ...editingStudent, ethnic: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp
                  </label>
                  <select
                    value={editingStudent.className || '1A1'}
                    onChange={e => setEditingStudent({ ...editingStudent, className: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {stats.map(s => (
                      <option key={s.classId} value={s.className}>{s.className}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Policy checkboxes */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.isPoor || false}
                    onChange={e => setEditingStudent({ ...editingStudent, isPoor: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Hộ nghèo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.isNearPoor || false}
                    onChange={e => setEditingStudent({ ...editingStudent, isNearPoor: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Hộ cận nghèo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.isDisabled || false}
                    onChange={e => setEditingStudent({ ...editingStudent, isDisabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Học sinh khuyết tật</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStudent.isBoarding || false}
                    onChange={e => setEditingStudent({ ...editingStudent, isBoarding: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Bán trú</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
