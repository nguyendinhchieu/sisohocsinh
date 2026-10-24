import React, { useState, useMemo } from 'react';
import { FileText, FileSpreadsheet, Download, Printer, CheckCircle, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { MonthlyClassStats, AcademicMonth, SchoolInfo, StaffItem } from '../types';
import { exportMonthlyStatsToExcel } from '../utils/excelExport';
import { exportMonthlyReportPDF } from '../utils/pdfExport';

interface ReportsViewProps {
  stats: MonthlyClassStats[];
  selectedMonth: AcademicMonth | null;
  months: AcademicMonth[];
  schoolInfo: SchoolInfo | null;
  staffList: StaffItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  selectedMonth,
  months,
  schoolInfo,
  staffList
}) => {
  const [reportType, setReportType] = useState<
    'TOAN_TRUONG' | 'PH1' | 'PH2' | 'DIEM_CHINH' | 'THEO_KHOI' | 'THEO_LOP' | 'SO_SANH_THANG'
  >('TOAN_TRUONG');

  // Breakdown by Grade
  const gradeBreakdown = useMemo(() => {
    const grades: Record<number, {
      grade: number;
      classesCount: number;
      totalStudents: number;
      female: number;
      ethnic: number;
      femaleEthnic: number;
      disabled: number;
      poor: number;
      nearPoor: number;
      boarding: number;
      difficultVillage: number;
    }> = {};

    for (let g = 1; g <= 9; g++) {
      grades[g] = {
        grade: g,
        classesCount: 0,
        totalStudents: 0,
        female: 0,
        ethnic: 0,
        femaleEthnic: 0,
        disabled: 0,
        poor: 0,
        nearPoor: 0,
        boarding: 0,
        difficultVillage: 0
      };
    }

    stats.forEach(s => {
      if (grades[s.grade]) {
        const item = grades[s.grade];
        item.classesCount += 1;
        item.totalStudents += s.totalStudents;
        item.female += s.female;
        item.ethnic += s.ethnic;
        item.femaleEthnic += s.femaleEthnic;
        item.disabled += s.disabled;
        item.poor += s.poor;
        item.nearPoor += s.nearPoor;
        item.boarding += s.boarding;
        item.difficultVillage += s.difficultVillage;
      }
    });

    return Object.values(grades).filter(g => g.classesCount > 0);
  }, [stats]);

  // Breakdown by Campus
  const campusBreakdown = useMemo(() => {
    const list = [
      { id: 'PH1', name: 'Phân hiệu 1 (Tiểu học)', level: 'Tiểu học' },
      { id: 'PH2', name: 'Phân hiệu 2 (Tiểu học)', level: 'Tiểu học' },
      { id: 'DIEM_CHINH', name: 'Điểm chính THCS', level: 'THCS' }
    ];

    return list.map(c => {
      const cStats = stats.filter(s => s.campusId === c.id);
      return {
        ...c,
        classesCount: cStats.length,
        totalStudents: cStats.reduce((sum, s) => sum + s.totalStudents, 0),
        female: cStats.reduce((sum, s) => sum + s.female, 0),
        ethnic: cStats.reduce((sum, s) => sum + s.ethnic, 0),
        femaleEthnic: cStats.reduce((sum, s) => sum + s.femaleEthnic, 0),
        disabled: cStats.reduce((sum, s) => sum + s.disabled, 0),
        poor: cStats.reduce((sum, s) => sum + s.poor, 0),
        nearPoor: cStats.reduce((sum, s) => sum + s.nearPoor, 0),
        boarding: cStats.reduce((sum, s) => sum + s.boarding, 0),
        difficultVillage: cStats.reduce((sum, s) => sum + s.difficultVillage, 0)
      };
    });
  }, [stats]);

  const schoolGrandTotals = useMemo(() => {
    return stats.reduce(
      (acc, s) => ({
        classesCount: acc.classesCount + 1,
        totalStudents: acc.totalStudents + s.totalStudents,
        female: acc.female + s.female,
        ethnic: acc.ethnic + s.ethnic,
        femaleEthnic: acc.femaleEthnic + s.femaleEthnic,
        disabled: acc.disabled + s.disabled,
        poor: acc.poor + s.poor,
        nearPoor: acc.nearPoor + s.nearPoor,
        boarding: acc.boarding + s.boarding,
        difficultVillage: acc.difficultVillage + s.difficultVillage
      }),
      {
        classesCount: 0,
        totalStudents: 0,
        female: 0,
        ethnic: 0,
        femaleEthnic: 0,
        disabled: 0,
        poor: 0,
        nearPoor: 0,
        boarding: 0,
        difficultVillage: 0
      }
    );
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Báo cáo Thống kê Sĩ số</h1>
          <p className="text-xs text-slate-500">
            Năm học {schoolInfo?.academicYear || '2026-2027'} · Kỳ báo cáo: Tháng {selectedMonth?.monthNumber}/{selectedMonth?.year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedMonth && schoolInfo) {
                exportMonthlyStatsToExcel(selectedMonth, stats, schoolInfo, staffList);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel toàn diện</span>
          </button>

          <button
            onClick={() => {
              if (selectedMonth && schoolInfo) {
                const campus =
                  reportType === 'PH1'
                    ? 'PH1'
                    : reportType === 'PH2'
                    ? 'PH2'
                    : reportType === 'DIEM_CHINH'
                    ? 'DIEM_CHINH'
                    : undefined;
                exportMonthlyReportPDF(selectedMonth, stats, schoolInfo, campus);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất PDF báo cáo</span>
          </button>
        </div>
      </div>

      {/* Segmented Report Type Selection */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setReportType('TOAN_TRUONG')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'TOAN_TRUONG'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Báo cáo Toàn trường (44 lớp)
        </button>
        <button
          onClick={() => setReportType('PH1')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'PH1'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Báo cáo Phân hiệu 1 (20 lớp)
        </button>
        <button
          onClick={() => setReportType('PH2')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'PH2'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Báo cáo Phân hiệu 2 (9 lớp)
        </button>
        <button
          onClick={() => setReportType('DIEM_CHINH')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'DIEM_CHINH'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Báo cáo Điểm chính THCS (15 lớp)
        </button>
        <button
          onClick={() => setReportType('THEO_KHOI')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            reportType === 'THEO_KHOI'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Báo cáo Tổng hợp theo Khối (1-9)
        </button>
      </div>

      {/* REPORT CONTENT: By Grade */}
      {reportType === 'THEO_KHOI' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Bảng Thống kê Sĩ số theo Khối (Khối 1 đến Khối 9)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                  <th className="py-2.5 px-3">Khối</th>
                  <th className="py-2.5 px-3 text-center">Số lớp</th>
                  <th className="py-2.5 px-3 text-right">Tổng sĩ số</th>
                  <th className="py-2.5 px-3 text-right">Nữ</th>
                  <th className="py-2.5 px-3 text-right">Dân tộc</th>
                  <th className="py-2.5 px-3 text-right">Nữ DT</th>
                  <th className="py-2.5 px-3 text-right">Khuyết tật</th>
                  <th className="py-2.5 px-3 text-right">Hộ nghèo</th>
                  <th className="py-2.5 px-3 text-right">Cận nghèo</th>
                  <th className="py-2.5 px-3 text-right">Buôn KK</th>
                  <th className="py-2.5 px-3 text-right">Bán trú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gradeBreakdown.map(g => (
                  <tr key={g.grade} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Khối {g.grade}</td>
                    <td className="py-2.5 px-3 text-center">{g.classesCount} lớp</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">{g.totalStudents}</td>
                    <td className="py-2.5 px-3 text-right">{g.female}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">{g.ethnic}</td>
                    <td className="py-2.5 px-3 text-right">{g.femaleEthnic}</td>
                    <td className="py-2.5 px-3 text-right text-purple-700">{g.disabled}</td>
                    <td className="py-2.5 px-3 text-right">{g.poor}</td>
                    <td className="py-2.5 px-3 text-right">{g.nearPoor}</td>
                    <td className="py-2.5 px-3 text-right">{g.difficultVillage}</td>
                    <td className="py-2.5 px-3 text-right">{g.boarding}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td className="py-3 px-3 uppercase">TOÀN TRƯỜNG</td>
                  <td className="py-3 px-3 text-center">{schoolGrandTotals.classesCount} lớp</td>
                  <td className="py-3 px-3 text-right text-blue-700 text-sm">{schoolGrandTotals.totalStudents}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.female}</td>
                  <td className="py-3 px-3 text-right text-emerald-700">{schoolGrandTotals.ethnic}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.femaleEthnic}</td>
                  <td className="py-3 px-3 text-right text-purple-700">{schoolGrandTotals.disabled}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.poor}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.nearPoor}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.difficultVillage}</td>
                  <td className="py-3 px-3 text-right">{schoolGrandTotals.boarding}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: By Campus & Entire School */}
      {reportType !== 'THEO_KHOI' && (
        <div className="space-y-4">
          {/* Subtotal table by campus */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Thống kê Tổng hợp theo 3 Điểm trường
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse tabular-nums">
                <thead>
                  <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-700">
                    <th className="py-2.5 px-3">Điểm trường</th>
                    <th className="py-2.5 px-3 text-center">Cấp học</th>
                    <th className="py-2.5 px-3 text-center">Số lớp</th>
                    <th className="py-2.5 px-3 text-right">Tổng sĩ số</th>
                    <th className="py-2.5 px-3 text-right">Nữ</th>
                    <th className="py-2.5 px-3 text-right">Dân tộc</th>
                    <th className="py-2.5 px-3 text-right">Nữ DT</th>
                    <th className="py-2.5 px-3 text-right">Khuyết tật</th>
                    <th className="py-2.5 px-3 text-right">Hộ nghèo</th>
                    <th className="py-2.5 px-3 text-right">Cận nghèo</th>
                    <th className="py-2.5 px-3 text-right">Buôn KK</th>
                    <th className="py-2.5 px-3 text-right">Bán trú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {campusBreakdown.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-3 text-center">{c.level}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{c.classesCount} lớp</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">{c.totalStudents}</td>
                      <td className="py-2.5 px-3 text-right">{c.female}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">{c.ethnic}</td>
                      <td className="py-2.5 px-3 text-right">{c.femaleEthnic}</td>
                      <td className="py-2.5 px-3 text-right text-purple-700">{c.disabled}</td>
                      <td className="py-2.5 px-3 text-right">{c.poor}</td>
                      <td className="py-2.5 px-3 text-right">{c.nearPoor}</td>
                      <td className="py-2.5 px-3 text-right">{c.difficultVillage}</td>
                      <td className="py-2.5 px-3 text-right">{c.boarding}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="py-3 px-3 uppercase" colSpan={2}>TỔNG CỘNG TOÀN TRƯỜNG</td>
                    <td className="py-3 px-3 text-center">{schoolGrandTotals.classesCount} lớp</td>
                    <td className="py-3 px-3 text-right text-blue-700 text-sm">{schoolGrandTotals.totalStudents}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.female}</td>
                    <td className="py-3 px-3 text-right text-emerald-700">{schoolGrandTotals.ethnic}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.femaleEthnic}</td>
                    <td className="py-3 px-3 text-right text-purple-700">{schoolGrandTotals.disabled}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.poor}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.nearPoor}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.difficultVillage}</td>
                    <td className="py-3 px-3 text-right">{schoolGrandTotals.boarding}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
