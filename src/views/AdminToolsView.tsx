import React, { useState, useEffect } from 'react';
import { Shield, Download, Upload, History, Search, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { AuditLog, User, SchoolInfo } from '../types';
import { api } from '../services/api';

interface AdminToolsViewProps {
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
  onRefreshData: () => Promise<void>;
}

export const AdminToolsView: React.FC<AdminToolsViewProps> = ({
  currentUser,
  schoolInfo,
  onRefreshData
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownloadBackup = async () => {
    try {
      const blob = await api.downloadBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_th_thcs_nguyen_dinh_chieu_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải bản sao lưu');
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreFile) return;
    try {
      setRestoring(true);
      setRestoreMessage(null);
      const text = await restoreFile.text();
      const json = JSON.parse(text);
      await api.restoreBackup(json);
      await onRefreshData();
      await fetchLogs();
      setRestoreMessage({ text: 'Khôi phục cơ sở dữ liệu thành công!', type: 'success' });
      setRestoreFile(null);
    } catch (err: any) {
      setRestoreMessage({ text: err.message || 'Lỗi khi khôi phục dữ liệu', type: 'error' });
    } finally {
      setRestoring(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!searchLog.trim()) return true;
    const q = searchLog.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Công cụ Quản trị Hệ thống & An toàn Dữ liệu</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dành riêng cho Quản trị viên (ADMIN) · Trường TH&THCS Nguyễn Đình Chiểu
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới nhật ký</span>
        </button>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Sao lưu Cơ sở Dữ liệu</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Tải xuống bản sao lưu toàn vẹn bao gồm: 44 lớp, số liệu sĩ số qua các tháng, hồ sơ học sinh, biến động, danh sách cán bộ giáo viên và nhật ký kiểm toán.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Tải bản sao lưu hệ thống (.JSON)</span>
          </button>
        </div>

        {/* Restore Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Phục hồi Cơ sở Dữ liệu</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Khôi phục trạng thái hệ thống từ tệp sao lưu JSON đã lưu trước đó. Thao tác này sẽ ghi đè dữ liệu hiện tại bằng dữ liệu trong tệp sao lưu.
          </p>

          {restoreMessage && (
            <div className={`p-3 mb-3 rounded-lg text-xs flex items-center justify-between border ${
              restoreMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <span>{restoreMessage.text}</span>
              <button onClick={() => setRestoreMessage(null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".json"
              onChange={e => setRestoreFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {restoreFile && (
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
              >
                {restoring ? 'Đang phục hồi...' : 'Bắt đầu khôi phục'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Nhật ký Kiểm toán Hệ thống (Audit Logs)
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              placeholder="Tìm hành động, người dùng..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-56 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-3 w-40">Thời gian</th>
                <th className="py-2.5 px-3 w-28">Tài khoản</th>
                <th className="py-2.5 px-3 w-44">Hành động</th>
                <th className="py-2.5 px-3">Chi tiết nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Không có nhật ký nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 100).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-blue-700">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
