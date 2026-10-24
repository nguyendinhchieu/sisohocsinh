import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, Calendar, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { StudentFluctuation, AcademicMonth, MonthlyClassStats, User } from '../types';
import { api } from '../services/api';

interface FluctuationsViewProps {
  selectedMonth: AcademicMonth | null;
  stats: MonthlyClassStats[];
  currentUser: User | null;
  onRefreshData: () => Promise<void>;
}

export const FluctuationsView: React.FC<FluctuationsViewProps> = ({
  selectedMonth,
  stats,
  currentUser,
  onRefreshData
}) => {
  const [fluctuations, setFluctuations] = useState<StudentFluctuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    studentName: '',
    studentCode: '',
    classId: stats[0]?.classId || 'PH1_1A1',
    type: 'Chuyển đến' as const,
    reason: '',
    notes: ''
  });

  const fetchFluctuations = async () => {
    try {
      setLoading(true);
      const res = await api.getFluctuations();
      setFluctuations(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFluctuations();
  }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return;
    if (selectedMonth.isLocked) {
      setErrorMsg('Tháng này đã bị khóa, không thể ghi nhận biến động mới.');
      return;
    }
    if (!formData.studentName || !formData.reason) {
      setErrorMsg('Vui lòng nhập Họ tên học sinh và Lý do biến động.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await api.recordFluctuation({
        ...formData,
        monthId: selectedMonth.id
      });
      await fetchFluctuations();
      await onRefreshData();
      setShowAddModal(false);
      setSuccessMsg(`Đã ghi nhận biến động cho học sinh ${formData.studentName} và cập nhật sĩ số tháng.`);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        studentName: '',
        studentCode: '',
        classId: stats[0]?.classId || 'PH1_1A1',
        type: 'Chuyển đến',
        reason: '',
        notes: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi ghi nhận biến động');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner / Success */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Quản lý Biến động Học sinh</h1>
          <p className="text-xs text-slate-500">
            Theo dõi học sinh chuyển đến, chuyển đi, thôi học và tự động cập nhật sĩ số tháng {selectedMonth?.monthNumber}/{selectedMonth?.year}
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi nhận biến động</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3">Ngày ghi nhận</th>
                <th className="py-2.5 px-3">Học sinh</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3">Điểm trường</th>
                <th className="py-2.5 px-3 text-center">Loại biến động</th>
                <th className="py-2.5 px-3 text-center">Tác động (+/-)</th>
                <th className="py-2.5 px-3">Nguyên nhân</th>
                <th className="py-2.5 px-3">Người ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Đang tải danh sách biến động...
                  </td>
                </tr>
              ) : fluctuations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Chưa có biến động học sinh nào được ghi nhận trong hệ thống.
                  </td>
                </tr>
              ) : (
                fluctuations.map((fluc, idx) => (
                  <tr key={fluc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {fluc.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {fluc.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {fluc.className}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {fluc.campusId === 'PH1' ? 'Phân hiệu 1' : fluc.campusId === 'PH2' ? 'Phân hiệu 2' : 'Điểm chính THCS'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        fluc.type === 'Chuyển đến' || fluc.type === 'Nhập học' ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {fluc.type === 'Chuyển đến' || fluc.type === 'Nhập học' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {fluc.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {fluc.delta > 0 ? (
                        <span className="text-emerald-600">+{fluc.delta}</span>
                      ) : (
                        <span className="text-red-600">{fluc.delta}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {fluc.reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {fluc.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Fluctuation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Ghi nhận Biến động Học sinh</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày biến động
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Nhập tên học sinh"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp
                  </label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {stats.map(s => (
                      <option key={s.classId} value={s.classId}>{s.className} ({s.campusId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại biến động
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Chuyển đến">Chuyển đến (+1)</option>
                    <option value="Chuyển đi">Chuyển đi (-1)</option>
                    <option value="Nhập học">Nhập học (+1)</option>
                    <option value="Nghỉ học">Nghỉ học (-1)</option>
                    <option value="Thôi học">Thôi học (-1)</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nguyên nhân biến động <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ví dụ: Chuyển trường theo gia đình về quê..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú hồ sơ bàn giao..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu biến động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
