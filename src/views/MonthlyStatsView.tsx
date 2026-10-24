import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Lock, 
  Unlock, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Search, 
  Filter, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { MonthlyClassStats, AcademicMonth, SchoolInfo, User, StaffItem } from '../types';
import { api } from '../services/api';
import { exportMonthlyStatsToExcel } from '../utils/excelExport';
import { exportMonthlyReportPDF } from '../utils/pdfExport';
import { parseExcelStatsFile, ParsedClassStatRow } from '../utils/excelImport';

interface MonthlyStatsViewProps {
  stats: MonthlyClassStats[];
  selectedMonth: AcademicMonth | null;
  months: AcademicMonth[];
  onSelectMonth: (m: AcademicMonth) => void;
  onRefreshData: () => Promise<void>;
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
  staffList: StaffItem[];
}

export const MonthlyStatsView: React.FC<MonthlyStatsViewProps> = ({
  stats,
  selectedMonth,
  months,
  onSelectMonth,
  onRefreshData,
  currentUser,
  schoolInfo,
  staffList
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState<'ALL' | 'PH1' | 'PH2' | 'DIEM_CHINH'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');

  // Edit Class Modal state
  const [editingStat, setEditingStat] = useState<MonthlyClassStats | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<MonthlyClassStats>>({});
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // New Month Modal state
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);
  const [newMonthStr, setNewMonthStr] = useState('2026-10');
  const [newCutoffDate, setNewCutoffDate] = useState('2026-10-15');
  const [creatingMonth, setCreatingMonth] = useState(false);
  const [newMonthError, setNewMonthError] = useState<string | null>(null);

  // Excel Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<ParsedClassStatRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtered and sorted stats
  const filteredStats = useMemo(() => {
    return stats.filter(item => {
      if (campusFilter !== 'ALL' && item.campusId !== campusFilter) return false;
      if (gradeFilter !== 'ALL' && item.grade.toString() !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.className.toLowerCase().includes(q) ||
          item.homeroomTeacher.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stats, campusFilter, gradeFilter, searchQuery]);

  // Aggregate totals of currently filtered rows
  const totals = useMemo(() => {
    return filteredStats.reduce(
      (acc, s) => ({
        totalStudents: acc.totalStudents + s.totalStudents,
        female: acc.female + s.female,
        ethnic: acc.ethnic + s.ethnic,
        femaleEthnic: acc.femaleEthnic + s.femaleEthnic,
        disabled: acc.disabled + s.disabled,
        poor: acc.poor + s.poor,
        nearPoor: acc.nearPoor + s.nearPoor,
        difficultVillage: acc.difficultVillage + s.difficultVillage,
        boarding: acc.boarding + s.boarding,
        deltaStudents: acc.deltaStudents + (s.deltaStudents || 0)
      }),
      {
        totalStudents: 0,
        female: 0,
        ethnic: 0,
        femaleEthnic: 0,
        disabled: 0,
        poor: 0,
        nearPoor: 0,
        difficultVillage: 0,
        boarding: 0,
        deltaStudents: 0
      }
    );
  }, [filteredStats]);

  // Handle Edit Click
  const handleOpenEdit = (stat: MonthlyClassStats) => {
    if (selectedMonth?.isLocked && currentUser?.role !== 'ADMIN') {
      setStatusMessage({
        text: 'Tháng này đã được chốt và khóa. Chỉ ADMIN mới có quyền điều chỉnh.',
        type: 'error'
      });
      return;
    }
    setEditingStat(stat);
    setEditFormData({ ...stat });
    setEditErrors([]);
  };

  // Live client-side validate edit form
  const validateForm = (data: Partial<MonthlyClassStats>): string[] => {
    const errs: string[] = [];
    const total = Number(data.totalStudents ?? 0);
    const female = Number(data.female ?? 0);
    const ethnic = Number(data.ethnic ?? 0);
    const femaleEthnic = Number(data.femaleEthnic ?? 0);
    const disabled = Number(data.disabled ?? 0);
    const poor = Number(data.poor ?? 0);
    const nearPoor = Number(data.nearPoor ?? 0);
    const difficultVillage = Number(data.difficultVillage ?? 0);
    const boarding = Number(data.boarding ?? 0);

    if (total < 0) errs.push('Sĩ số tổng không được âm');
    if (female < 0) errs.push('Số học sinh nữ không được âm');
    if (ethnic < 0) errs.push('Số học sinh dân tộc không được âm');
    if (femaleEthnic < 0) errs.push('Số nữ dân tộc không được âm');

    if (female > total) errs.push('Số học sinh Nữ không được lớn hơn Tổng sĩ số');
    if (ethnic > total) errs.push('Số học sinh Dân tộc không được lớn hơn Tổng sĩ số');
    if (femaleEthnic > ethnic) errs.push('Số Nữ dân tộc không được lớn hơn Số dân tộc');
    if (femaleEthnic > female) errs.push('Số Nữ dân tộc không được lớn hơn Số học sinh nữ');
    if (poor > total) errs.push('Số Hộ nghèo không được lớn hơn Tổng sĩ số');
    if (nearPoor > total) errs.push('Số Hộ cận nghèo không được lớn hơn Tổng sĩ số');
    if (poor + nearPoor > total) errs.push('Tổng Hộ nghèo và Cận nghèo không được lớn hơn Tổng sĩ số');
    if (disabled > total) errs.push('Số Khuyết tật không được lớn hơn Tổng sĩ số');
    if (boarding > total) errs.push('Số Bán trú không được lớn hơn Tổng sĩ số');
    if (difficultVillage > total) errs.push('Số Buôn khó khăn không được lớn hơn Tổng sĩ số');

    return errs;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat || !selectedMonth) return;

    const validationErrors = validateForm(editFormData);
    if (validationErrors.length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    try {
      setSavingEdit(true);
      await api.updateClassStats(selectedMonth.id, editingStat.classId, editFormData);
      await onRefreshData();
      setEditingStat(null);
      setStatusMessage({ text: `Đã cập nhật số liệu lớp ${editingStat.className} thành công!`, type: 'success' });
    } catch (err: any) {
      setEditErrors([err.message || 'Lỗi khi lưu dữ liệu']);
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Lock/Unlock Month
  const handleToggleLock = async () => {
    if (!selectedMonth) return;
    if (!currentUser) {
      setStatusMessage({ text: 'Vui lòng đăng nhập để thực hiện thao tác.', type: 'error' });
      return;
    }

    const nextLockState = !selectedMonth.isLocked;
    const nextStatus = nextLockState ? 'Đã chốt' : 'Đang nhập';

    if (!nextLockState && currentUser.role !== 'ADMIN') {
      setStatusMessage({ text: 'Chỉ ADMIN mới có quyền mở khóa tháng đã chốt.', type: 'error' });
      return;
    }

    try {
      await api.updateMonthStatus(selectedMonth.id, nextStatus, nextLockState);
      await onRefreshData();
      setStatusMessage({
        text: nextLockState ? `Đã chốt và khóa tháng ${selectedMonth.monthNumber}/${selectedMonth.year}` : `Đã mở khóa tháng ${selectedMonth.monthNumber}/${selectedMonth.year}`,
        type: 'success'
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Lỗi khi cập nhật trạng thái tháng', type: 'error' });
    }
  };

  // Handle Create Month
  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthStr || !newCutoffDate) return;

    try {
      setCreatingMonth(true);
      setNewMonthError(null);
      const created = await api.createMonth(newMonthStr, newCutoffDate);
      await onRefreshData();
      onSelectMonth(created);
      setShowNewMonthModal(false);
      setStatusMessage({
        text: `Tạo thành công tháng ${created.monthNumber}/${created.year}. Đã kế thừa số liệu từ tháng trước.`,
        type: 'success'
      });
    } catch (err: any) {
      setNewMonthError(err.message || 'Lỗi tạo tháng mới');
    } finally {
      setCreatingMonth(false);
    }
  };

  // Handle Excel File Selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportErrorMsg(null);
      const parsed = await parseExcelStatsFile(file);
      setImportRows(parsed);
      setShowImportModal(true);
    } catch (err: any) {
      setImportErrorMsg(err.message || 'Không thể đọc tệp Excel');
    }
  };

  // Save parsed import
  const handleConfirmImport = async () => {
    if (!selectedMonth || importRows.length === 0) return;
    try {
      setImporting(true);
      setImportErrorMsg(null);

      // Match parsed rows with existing class IDs
      const updates = [];
      for (const row of importRows) {
        if (!row.isValid) continue;
        const matchingClass = stats.find(s => s.className.toLowerCase() === row.className.toLowerCase());
        if (matchingClass) {
          updates.push({
            classId: matchingClass.classId,
            totalStudents: row.totalStudents,
            female: row.female,
            ethnic: row.ethnic,
            femaleEthnic: row.femaleEthnic,
            disabled: row.disabled,
            poor: row.poor,
            nearPoor: row.nearPoor,
            difficultVillage: row.difficultVillage,
            boarding: row.boarding,
            notes: row.notes || matchingClass.notes,
            homeroomTeacher: row.homeroomTeacher || matchingClass.homeroomTeacher
          });
        }
      }

      if (updates.length === 0) {
        throw new Error('Không tìm thấy lớp học nào khớp với danh sách 44 lớp của trường.');
      }

      const res = await api.batchUpdateStats(selectedMonth.id, updates);
      await onRefreshData();
      setShowImportModal(false);
      setImportRows([]);
      setStatusMessage({
        text: `Nhập Excel thành công cho ${res.updatedCount} lớp!`,
        type: 'success'
      });
    } catch (err: any) {
      setImportErrorMsg(err.message || 'Lỗi khi nhập dữ liệu');
    } finally {
      setImporting(false);
    }
  };

  // Integrity Check
  const handleCheckIntegrity = () => {
    const errors: string[] = [];
    stats.forEach(s => {
      const errs = validateForm(s);
      if (errs.length > 0) {
        errors.push(`Lớp ${s.className}: ${errs.join(', ')}`);
      }
    });

    if (errors.length === 0) {
      setStatusMessage({
        text: `Kiểm tra dữ liệu hoàn tất: Tất cả 44 lớp đều đảm bảo tính toàn vẹn và 8 điều kiện logic học sinh.`,
        type: 'success'
      });
    } else {
      setStatusMessage({
        text: `Phát hiện ${errors.length} lỗi:\n${errors.slice(0, 3).join('\n')}`,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg flex items-center justify-between text-xs font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Quản lý Số liệu Tháng {selectedMonth?.monthNumber}/{selectedMonth?.year}
              </h1>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  selectedMonth?.isLocked
                    ? 'bg-amber-100 text-amber-800'
                    : selectedMonth?.status === 'Đã kiểm tra'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedMonth?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ngày chốt số liệu: <strong className="text-slate-700 font-mono">{selectedMonth?.cutoffDate}</strong>
              <span className="mx-2">·</span>
              Quy mô: <strong>44 lớp</strong> (Tiểu học 29 lớp + THCS 15 lớp)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* New Month */}
            <button
              onClick={() => setShowNewMonthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo tháng mới</span>
            </button>

            {/* Import Excel */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Nhập Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Export Excel */}
            <button
              onClick={() => {
                if (selectedMonth && schoolInfo) {
                  exportMonthlyStatsToExcel(selectedMonth, stats, schoolInfo, staffList);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={() => {
                if (selectedMonth && schoolInfo) {
                  exportMonthlyReportPDF(selectedMonth, stats, schoolInfo, campusFilter === 'ALL' ? undefined : campusFilter);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xuất PDF</span>
            </button>

            {/* Integrity Check */}
            <button
              onClick={handleCheckIntegrity}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Kiểm tra</span>
            </button>

            {/* Lock / Unlock */}
            <button
              onClick={handleToggleLock}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedMonth?.isLocked
                  ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                  : 'text-white bg-blue-600 hover:bg-blue-700 shadow-xs'
              }`}
            >
              {selectedMonth?.isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Mở khóa tháng</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Chốt tháng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
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

            {/* Campus Selector */}
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

            {/* Grade Selector */}
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
            Đang hiển thị: <strong className="text-slate-800">{filteredStats.length}</strong> / 44 lớp
          </div>
        </div>
      </div>

      {/* Main High-Density Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 font-semibold text-center w-10">STT</th>
                <th className="py-2.5 px-3 font-semibold">Điểm trường</th>
                <th className="py-2.5 px-3 font-semibold text-center">Khối</th>
                <th className="py-2.5 px-3 font-semibold">Lớp</th>
                <th className="py-2.5 px-3 font-semibold">GVCN</th>
                <th className="py-2.5 px-3 font-semibold text-right text-blue-300">Sĩ số</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nữ</th>
                <th className="py-2.5 px-3 font-semibold text-right text-emerald-300">Dân tộc</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nữ DT</th>
                <th className="py-2.5 px-3 font-semibold text-right">KT</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nghèo</th>
                <th className="py-2.5 px-3 font-semibold text-right">Cận</th>
                <th className="py-2.5 px-3 font-semibold text-right">Buôn KK</th>
                <th className="py-2.5 px-3 font-semibold text-right">Bán trú</th>
                <th className="py-2.5 px-3 font-semibold text-center">Tăng/giảm</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {filteredStats.map((item, index) => {
                const campusLabel =
                  item.campusId === 'PH1'
                    ? 'Phân hiệu 1'
                    : item.campusId === 'PH2'
                    ? 'Phân hiệu 2'
                    : 'Điểm chính THCS';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      {campusLabel}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {item.grade}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {item.className}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {item.homeroomTeacher}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700 text-sm">
                      {item.totalStudents}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 font-medium">
                      {item.female}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-medium">
                      {item.ethnic}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.femaleEthnic}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.disabled > 0 ? (
                        <span className="font-semibold text-purple-700">{item.disabled}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.poor}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.nearPoor}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.difficultVillage}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.boarding}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.deltaStudents === 0 ? (
                        <span className="text-slate-400">0</span>
                      ) : item.deltaStudents > 0 ? (
                        <span className="text-emerald-600 font-bold">+{item.deltaStudents}</span>
                      ) : (
                        <span className="text-red-600 font-bold">{item.deltaStudents}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Chỉnh sửa số liệu lớp"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Sticky/Bold Summary Footer */}
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs tabular-nums">
                <td colSpan={5} className="py-3 px-3 text-right uppercase">
                  TỔNG CỘNG ({filteredStats.length} LỚP):
                </td>
                <td className="py-3 px-3 text-right text-blue-700 text-sm">
                  {totals.totalStudents.toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.female.toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-3 text-right text-emerald-700">
                  {totals.ethnic.toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.femaleEthnic.toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-3 text-right text-purple-700">
                  {totals.disabled}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.poor}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.nearPoor}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.difficultVillage}
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.boarding}
                </td>
                <td className="py-3 px-3 text-center">
                  {totals.deltaStudents === 0 ? '0' : totals.deltaStudents > 0 ? `+${totals.deltaStudents}` : totals.deltaStudents}
                </td>
                <td className="py-3 px-3 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL 1: Edit Class Stats */}
      {editingStat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Cập nhật Sĩ số Lớp {editingStat.className}
                </h3>
                <p className="text-xs text-slate-500">
                  Điểm: {editingStat.campusId === 'PH1' ? 'Phân hiệu 1' : editingStat.campusId === 'PH2' ? 'Phân hiệu 2' : 'Điểm chính THCS'} · Khối {editingStat.grade}
                </p>
              </div>
              <button
                onClick={() => setEditingStat(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Validation errors */}
              {editErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Dữ liệu chưa thỏa mãn điều kiện quy định:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {editErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tổng Sĩ số <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.totalStudents ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, totalStudents: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số học sinh Nữ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.female ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, female: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dân tộc thiểu số
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.ethnic ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, ethnic: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nữ dân tộc
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.femaleEthnic ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, femaleEthnic: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Học sinh khuyết tật
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.disabled ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, disabled: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hộ nghèo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.poor ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, poor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hộ cận nghèo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.nearPoor ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, nearPoor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buôn khó khăn
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.difficultVillage ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, difficultVillage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bán trú
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.boarding ?? ''}
                    onChange={e => setEditFormData({ ...editFormData, boarding: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giáo viên chủ nhiệm
                  </label>
                  <input
                    type="text"
                    value={editFormData.homeroomTeacher || ''}
                    onChange={e => setEditFormData({ ...editFormData, homeroomTeacher: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editFormData.notes || ''}
                  onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Ghi chú về học sinh khuyết tật, chính sách..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStat(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Next Month */}
      {showNewMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Tạo Kỳ Thống Kê Tháng Mới</h3>
                <p className="text-xs text-slate-500">Kế thừa số liệu tháng trước, giữ nguyên lịch sử</p>
              </div>
              <button
                onClick={() => setShowNewMonthModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMonth} className="p-6 space-y-4">
              {newMonthError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{newMonthError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tháng (Định dạng YYYY-MM)
                </label>
                <input
                  type="text"
                  value={newMonthStr}
                  onChange={e => setNewMonthStr(e.target.value)}
                  placeholder="Ví dụ: 2026-10"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày chốt số liệu
                </label>
                <input
                  type="date"
                  value={newCutoffDate}
                  onChange={e => setNewCutoffDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800 leading-relaxed">
                Hệ thống sẽ sao chép số liệu từ tháng liền trước sang tháng mới. Số liệu tháng cũ được bảo lưu vĩnh viễn không bị ghi đè.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMonthModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingMonth}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {creatingMonth ? 'Đang tạo...' : 'Tạo tháng mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Excel Import Review */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Xem trước Dữ liệu Nhập từ Excel
                </h3>
                <p className="text-xs text-slate-500">
                  Đã đọc {importRows.length} dòng dữ liệu. Vui lòng kiểm tra tính hợp lệ trước khi áp dụng.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importErrorMsg && (
              <div className="p-3 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {importErrorMsg}
              </div>
            )}

            <div className="p-6 overflow-y-auto grow">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="py-2 px-2">Lớp</th>
                    <th className="py-2 px-2">GVCN</th>
                    <th className="py-2 px-2 text-right">Sĩ số</th>
                    <th className="py-2 px-2 text-right">Nữ</th>
                    <th className="py-2 px-2 text-right">Dân tộc</th>
                    <th className="py-2 px-2 text-right">Nữ DT</th>
                    <th className="py-2 px-2 text-right">Khuyết tật</th>
                    <th className="py-2 px-2 text-right">Nghèo</th>
                    <th className="py-2 px-2 text-right">Cận nghèo</th>
                    <th className="py-2 px-2">Trạng thái kiểm tra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {importRows.map((r, i) => (
                    <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                      <td className="py-2 px-2 font-bold">{r.className}</td>
                      <td className="py-2 px-2">{r.homeroomTeacher}</td>
                      <td className="py-2 px-2 text-right font-semibold">{r.totalStudents}</td>
                      <td className="py-2 px-2 text-right">{r.female}</td>
                      <td className="py-2 px-2 text-right">{r.ethnic}</td>
                      <td className="py-2 px-2 text-right">{r.femaleEthnic}</td>
                      <td className="py-2 px-2 text-right">{r.disabled}</td>
                      <td className="py-2 px-2 text-right">{r.poor}</td>
                      <td className="py-2 px-2 text-right">{r.nearPoor}</td>
                      <td className="py-2 px-2">
                        {r.isValid ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Hợp lệ
                          </span>
                        ) : (
                          <span className="text-red-700 font-medium" title={r.errors.join(', ')}>
                            Lỗi ({r.errors.length})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Hợp lệ: <strong className="text-emerald-700">{importRows.filter(r => r.isValid).length}</strong> / {importRows.length} dòng
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importing || importRows.filter(r => r.isValid).length === 0}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {importing ? 'Đang lưu...' : 'Xác nhận nhập vào hệ thống'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
