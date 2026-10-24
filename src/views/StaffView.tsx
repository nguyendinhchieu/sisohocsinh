import React, { useState, useMemo } from 'react';
import { Briefcase, UserCheck, Shield, Phone, Mail, Award, Edit3, Plus, Search, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { StaffItem, User, SchoolInfo } from '../types';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

interface StaffViewProps {
  staffList: StaffItem[];
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
  onRefreshData: () => Promise<void>;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  currentUser,
  schoolInfo,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [campusFilter, setCampusFilter] = useState('ALL');

  // Modal State
  const [editingStaff, setEditingStaff] = useState<Partial<StaffItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter(st => {
      if (roleFilter !== 'ALL' && st.role !== roleFilter) return false;
      if (campusFilter !== 'ALL' && st.campusId !== campusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.position.toLowerCase().includes(q) ||
          st.department.toLowerCase().includes(q) ||
          (st.phone && st.phone.includes(q))
        );
      }
      return true;
    });
  }, [staffList, roleFilter, campusFilter, searchQuery]);

  // Executive Leadership group
  const leadership = useMemo(() => {
    return staffList.filter(s => s.role === 'HIỆU TRƯỞNG' || s.role === 'PHÓ HIỆU TRƯỞNG' || s.role === 'QUẢN LÝ CNTT');
  }, [staffList]);

  const handleOpenEdit = (item: StaffItem) => {
    setIsNew(false);
    setEditingStaff({ ...item });
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingStaff({
      fullName: '',
      gender: 'Nữ',
      position: 'Giáo viên',
      role: 'GIÁO VIÊN',
      campusId: 'PH1',
      department: 'Tổ Chuyên môn',
      qualification: 'Đại học Sư phạm',
      major: 'Giáo dục Tiểu học',
      phone: '',
      email: '',
      status: 'Đang công tác',
      notes: ''
    });
    setErrorMsg(null);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      if (isNew) {
        await api.addStaff(editingStaff as any);
      } else {
        await api.updateStaff(editingStaff.id!, editingStaff);
      }
      await onRefreshData();
      setEditingStaff(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin cán bộ');
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data: (string | number)[][] = [
      ['DANH SÁCH CÁN BỘ - GIÁO VIÊN - NHÂN VIÊN'],
      ['TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU'],
      [`Tổng số: ${filteredStaff.length} cán bộ`],
      [],
      ['STT', 'Mã CBGV', 'Họ và tên', 'Giới tính', 'Chức vụ', 'Vai trò', 'Điểm trường', 'Tổ chuyên môn', 'Trình độ', 'Số điện thoại', 'Email', 'Trạng thái', 'Ghi chú']
    ];

    filteredStaff.forEach((st, idx) => {
      data.push([
        idx + 1,
        st.id,
        st.fullName || '(Chưa phân công)',
        st.gender,
        st.position,
        st.role,
        st.campusId === 'PH1' ? 'Phân hiệu 1' : st.campusId === 'PH2' ? 'Phân hiệu 2' : st.campusId === 'DIEM_CHINH' ? 'Điểm chính THCS' : 'Toàn trường',
        st.department,
        st.qualification || '',
        st.phone || '',
        st.email || '',
        st.status,
        st.notes || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'CAN_BO_GIAO_VIEN');
    XLSX.writeFile(wb, `Danh_sach_can_bo_giao_vien_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Cán bộ - Giáo viên - Nhân viên
          </h1>
          <p className="text-xs text-slate-500">
            Đội ngũ quản lý, giáo viên chủ nhiệm và nhân viên toàn trường ({staffList.length} nhân sự)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm cán bộ / GV</span>
            </button>
          )}

          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Leadership Structure Cards (Mandatory Requirement 16) */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Cơ cấu Lãnh đạo & Quản trị Hệ thống</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {leadership.map(leader => {
            const isUnassigned = !leader.fullName || leader.status === 'Chưa phân công';
            return (
              <div
                key={leader.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-shadow shadow-2xs ${
                  leader.role === 'HIỆU TRƯỞNG'
                    ? 'bg-blue-50/50 border-blue-200'
                    : leader.role === 'QUẢN LÝ CNTT'
                    ? 'bg-indigo-50/50 border-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    {leader.position}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {isUnassigned ? (
                      <span className="text-amber-700 italic font-normal">
                        (Vị trí chờ cập nhật tên)
                      </span>
                    ) : (
                      leader.fullName
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {leader.notes || leader.department}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {leader.phone || '09xx.xxx.xxx'}
                  </span>
                  {currentUser?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleOpenEdit(leader)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isUnassigned ? 'Cập nhật tên' : 'Sửa'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
              placeholder="Tìm họ tên, chức vụ, bộ môn..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="HIỆU TRƯỞNG">Hiệu trưởng</option>
            <option value="PHÓ HIỆU TRƯỞNG">Phó Hiệu trưởng</option>
            <option value="QUẢN LÝ CNTT">Quản lý CNTT</option>
            <option value="GIÁO VIÊN">Giáo viên</option>
            <option value="NHÂN VIÊN">Nhân viên</option>
          </select>

          <select
            value={campusFilter}
            onChange={e => setCampusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả điểm trường</option>
            <option value="TOAN_TRUONG">Toàn trường</option>
            <option value="PH1">Phân hiệu 1</option>
            <option value="PH2">Phân hiệu 2</option>
            <option value="DIEM_CHINH">Điểm chính THCS</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Số lượng nhân sự: <strong className="text-slate-800">{filteredStaff.length}</strong>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Chức vụ</th>
                <th className="py-2.5 px-3">Điểm trường</th>
                <th className="py-2.5 px-3">Tổ chuyên môn</th>
                <th className="py-2.5 px-3">Bộ môn</th>
                <th className="py-2.5 px-3">Trình độ</th>
                <th className="py-2.5 px-3">Điện thoại</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                {currentUser?.role === 'ADMIN' && <th className="py-2.5 px-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {filteredStaff.map((st, idx) => {
                const campusText =
                  st.campusId === 'PH1'
                    ? 'Phân hiệu 1'
                    : st.campusId === 'PH2'
                    ? 'Phân hiệu 2'
                    : st.campusId === 'DIEM_CHINH'
                    ? 'Điểm chính THCS'
                    : 'Toàn trường';

                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {st.fullName || (
                        <span className="text-amber-700 italic font-normal">
                          (Chưa phân công)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {st.position}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {campusText}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {st.department}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {st.subject || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {st.qualification || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {st.phone || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        st.status === 'Đang công tác' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Edit/Add Staff */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {isNew ? 'Thêm Cán bộ - Giáo viên Mới' : `Cập nhật: ${editingStaff.position}`}
              </h3>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editingStaff.fullName || ''}
                  onChange={e => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                  placeholder="Nhập họ và tên (hoặc để trống nếu chưa bổ nhiệm)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={editingStaff.position || ''}
                    onChange={e => setEditingStaff({ ...editingStaff, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={editingStaff.role || 'GIÁO VIÊN'}
                    onChange={e => setEditingStaff({ ...editingStaff, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="HIỆU TRƯỞNG">Hiệu trưởng</option>
                    <option value="PHÓ HIỆU TRƯỞNG">Phó Hiệu trưởng</option>
                    <option value="QUẢN LÝ CNTT">Quản lý CNTT</option>
                    <option value="GIÁO VIÊN">Giáo viên</option>
                    <option value="NHÂN VIÊN">Nhân viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điểm trường
                  </label>
                  <select
                    value={editingStaff.campusId || 'PH1'}
                    onChange={e => setEditingStaff({ ...editingStaff, campusId: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="TOAN_TRUONG">Toàn trường</option>
                    <option value="PH1">Phân hiệu 1</option>
                    <option value="PH2">Phân hiệu 2</option>
                    <option value="DIEM_CHINH">Điểm chính THCS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tổ chuyên môn
                  </label>
                  <input
                    type="text"
                    value={editingStaff.department || ''}
                    onChange={e => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={e => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    placeholder="09xx.xxx.xxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editingStaff.status || 'Đang công tác'}
                    onChange={e => setEditingStaff({ ...editingStaff, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Đang công tác">Đang công tác</option>
                    <option value="Chưa phân công">Chưa phân công</option>
                    <option value="Nghỉ hưu">Nghỉ hưu</option>
                    <option value="Chuyển trường">Chuyển trường</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
