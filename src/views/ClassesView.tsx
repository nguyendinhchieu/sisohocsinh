import React, { useState, useMemo } from 'react';
import { School, Search, Filter, Plus, Edit3, Trash2, FileSpreadsheet, AlertTriangle, X } from 'lucide-react';
import { MonthlyClassStats, ClassItem, User, SchoolInfo } from '../types';
import * as XLSX from 'xlsx';

interface ClassesViewProps {
  stats: MonthlyClassStats[];
  classes: ClassItem[];
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
  onRefreshData: () => Promise<void>;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  stats,
  classes,
  currentUser,
  schoolInfo,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState<'ALL' | 'PH1' | 'PH2' | 'DIEM_CHINH'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  // Filtered rows
  const filteredList = useMemo(() => {
    return stats.filter(c => {
      if (campusFilter !== 'ALL' && c.campusId !== campusFilter) return false;
      if (gradeFilter !== 'ALL' && c.grade.toString() !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.className.toLowerCase().includes(q) ||
          c.homeroomTeacher.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stats, campusFilter, gradeFilter, searchQuery]);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data: (string | number)[][] = [
      ['DANH SÁCH LỚP HỌC - TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU'],
      [`Năm học: ${schoolInfo?.academicYear || '2026-2027'} | Tổng số: ${filteredList.length} lớp`],
      [],
      ['STT', 'Điểm trường', 'Khối', 'Tên lớp', 'Giáo viên chủ nhiệm', 'Sĩ số', 'Nữ', 'Dân tộc', 'Khuyết tật', 'Hộ nghèo', 'Cận nghèo', 'Bán trú', 'Ghi chú']
    ];

    filteredList.forEach((c, i) => {
      const campus = c.campusId === 'PH1' ? 'Phân hiệu 1' : c.campusId === 'PH2' ? 'Phân hiệu 2' : 'Điểm chính THCS';
      data.push([
        i + 1,
        campus,
        `Khối ${c.grade}`,
        c.className,
        c.homeroomTeacher,
        c.totalStudents,
        c.female,
        c.ethnic,
        c.disabled,
        c.poor,
        c.nearPoor,
        c.boarding,
        c.notes || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'DANH_SACH_LOP');
    XLSX.writeFile(wb, `Danh_sach_lop_Nguyen_Dinh_Chieu_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Quản lý Lớp học</h1>
          <p className="text-xs text-slate-500">
            Quy mô toàn trường: <strong>44 lớp</strong> (Phân hiệu 1: 20 lớp · Phân hiệu 2: 9 lớp · Điểm chính THCS: 15 lớp)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel lớp học</span>
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
              placeholder="Tìm tên lớp, GVCN..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          <select
            value={campusFilter}
            onChange={e => setCampusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả điểm trường (44 lớp)</option>
            <option value="PH1">Phân hiệu 1 (20 lớp)</option>
            <option value="PH2">Phân hiệu 2 (9 lớp)</option>
            <option value="DIEM_CHINH">Điểm chính THCS (15 lớp)</option>
          </select>

          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả các khối (1-9)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
              <option key={g} value={g.toString()}>Khối {g}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Số lượng lớp: <strong className="text-slate-800">{filteredList.length}</strong>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3">Điểm trường</th>
                <th className="py-2.5 px-3 text-center">Khối</th>
                <th className="py-2.5 px-3">Tên lớp</th>
                <th className="py-2.5 px-3">Giáo viên chủ nhiệm</th>
                <th className="py-2.5 px-3 text-right">Sĩ số</th>
                <th className="py-2.5 px-3 text-right">Nữ</th>
                <th className="py-2.5 px-3 text-right">Dân tộc</th>
                <th className="py-2.5 px-3 text-right">Khuyết tật</th>
                <th className="py-2.5 px-3 text-right">Hộ nghèo</th>
                <th className="py-2.5 px-3 text-right">Cận nghèo</th>
                <th className="py-2.5 px-3 text-right">Bán trú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {filteredList.map((c, idx) => {
                const campusName =
                  c.campusId === 'PH1'
                    ? 'Phân hiệu 1'
                    : c.campusId === 'PH2'
                    ? 'Phân hiệu 2'
                    : 'Điểm chính THCS';

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {campusName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                      {c.grade}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-sm">
                      {c.className}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {c.homeroomTeacher}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700 text-sm">
                      {c.totalStudents}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {c.female}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                      {c.ethnic}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-700">
                      {c.disabled > 0 ? c.disabled : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {c.poor}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {c.nearPoor}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {c.boarding > 0 ? c.boarding : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
