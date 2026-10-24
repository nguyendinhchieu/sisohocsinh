import React, { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  HeartHandshake, 
  Home, 
  Utensils, 
  School, 
  TrendingUp, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MonthlyClassStats, AcademicMonth, SchoolInfo } from '../types';

interface DashboardViewProps {
  stats: MonthlyClassStats[];
  selectedMonth: AcademicMonth | null;
  months: AcademicMonth[];
  onSelectMonth: (month: AcademicMonth) => void;
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  schoolInfo: SchoolInfo | null;
  onNavigateToStats: () => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  selectedMonth,
  months,
  onSelectMonth,
  selectedCampus,
  onSelectCampus,
  schoolInfo,
  onNavigateToStats
}) => {
  // Filter stats by campus
  const filteredStats = useMemo(() => {
    if (!selectedCampus || selectedCampus === 'ALL') return stats;
    return stats.filter(s => s.campusId === selectedCampus);
  }, [stats, selectedCampus]);

  // Aggregate totals
  const totals = useMemo(() => {
    return filteredStats.reduce(
      (acc, curr) => ({
        totalStudents: acc.totalStudents + curr.totalStudents,
        female: acc.female + curr.female,
        ethnic: acc.ethnic + curr.ethnic,
        femaleEthnic: acc.femaleEthnic + curr.femaleEthnic,
        disabled: acc.disabled + curr.disabled,
        poor: acc.poor + curr.poor,
        nearPoor: acc.nearPoor + curr.nearPoor,
        difficultVillage: acc.difficultVillage + curr.difficultVillage,
        boarding: acc.boarding + curr.boarding,
        classesCount: acc.classesCount + 1,
        deltaStudents: acc.deltaStudents + (curr.deltaStudents || 0)
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
        classesCount: 0,
        deltaStudents: 0
      }
    );
  }, [filteredStats]);

  // Campus comparison data
  const campusData = useMemo(() => {
    const campusMap = {
      PH1: { name: 'Phân hiệu 1', students: 0, classes: 0, female: 0, ethnic: 0 },
      PH2: { name: 'Phân hiệu 2', students: 0, classes: 0, female: 0, ethnic: 0 },
      DIEM_CHINH: { name: 'Điểm chính THCS', students: 0, classes: 0, female: 0, ethnic: 0 }
    };

    stats.forEach(s => {
      if (campusMap[s.campusId]) {
        campusMap[s.campusId].students += s.totalStudents;
        campusMap[s.campusId].classes += 1;
        campusMap[s.campusId].female += s.female;
        campusMap[s.campusId].ethnic += s.ethnic;
      }
    });

    return Object.values(campusMap);
  }, [stats]);

  // Grade breakdown data (Grades 1 to 9)
  const gradeData = useMemo(() => {
    const grades: Record<number, { grade: string; students: number; female: number; ethnic: number }> = {};
    for (let g = 1; g <= 9; g++) {
      grades[g] = { grade: `Khối ${g}`, students: 0, female: 0, ethnic: 0 };
    }

    filteredStats.forEach(s => {
      if (grades[s.grade]) {
        grades[s.grade].students += s.totalStudents;
        grades[s.grade].female += s.female;
        grades[s.grade].ethnic += s.ethnic;
      }
    });

    return Object.values(grades).filter(g => g.students > 0);
  }, [filteredStats]);

  // Gender & Ethnic pie data
  const genderPieData = useMemo(() => {
    const male = Math.max(0, totals.totalStudents - totals.female);
    return [
      { name: 'Nữ', value: totals.female, color: '#ec4899' },
      { name: 'Nam', value: male, color: '#2563eb' }
    ];
  }, [totals]);

  const ethnicPieData = useMemo(() => {
    const nonEthnic = Math.max(0, totals.totalStudents - totals.ethnic);
    return [
      { name: 'Dân tộc thiểu số', value: totals.ethnic, color: '#10b981' },
      { name: 'Kinh', value: nonEthnic, color: '#94a3b8' }
    ];
  }, [totals]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{schoolInfo?.name || 'Trường TH&THCS Nguyễn Đình Chiểu'}</span>
              <span aria-hidden="true">·</span>
              <span>Năm học {schoolInfo?.academicYear || '2026-2027'}</span>
              <span aria-hidden="true">·</span>
              <span>{schoolInfo?.district || 'Thôn Cư Nghĩa, Ea Kar, Đắk Lắk'}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Bảng Tổng hợp Sĩ số & Biến động Học sinh
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Hiệu trưởng: <strong className="text-slate-800">{schoolInfo?.principal || 'Nguyễn Hồ Bắc'}</strong>
              <span className="mx-2">·</span>
              Quản trị CNTT: <strong className="text-slate-800">{schoolInfo?.itManager || 'Phạm Ngọc Tiến'}</strong>
            </p>
          </div>

          {/* Month and Campus Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedMonth?.id || ''}
                onChange={e => {
                  const m = months.find(item => item.id === e.target.value);
                  if (m) onSelectMonth(m);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none pr-2 cursor-pointer"
              >
                {months.map(m => (
                  <option key={m.id} value={m.id}>
                    Tháng {m.monthNumber}/{m.year} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Segmented Campus Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => onSelectCampus('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCampus === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn trường (44 lớp)
              </button>
              <button
                onClick={() => onSelectCampus('PH1')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCampus === 'PH1'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phân hiệu 1 (20 lớp)
              </button>
              <button
                onClick={() => onSelectCampus('PH2')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCampus === 'PH2'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phân hiệu 2 (9 lớp)
              </button>
              <button
                onClick={() => onSelectCampus('DIEM_CHINH')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCampus === 'DIEM_CHINH'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Điểm chính THCS (15 lớp)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Clean unboxed typography & tabular numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng Sĩ số</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.totalStudents.toLocaleString('vi-VN')}
            </span>
            <span className="text-[11px] text-slate-500">học sinh</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totals.classesCount} lớp học đang quản lý
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Học sinh Nữ</span>
            <UserCheck className="w-4 h-4 text-pink-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.female.toLocaleString('vi-VN')}
            </span>
            <span className="text-[11px] text-pink-600 font-medium tabular-nums">
              {totals.totalStudents > 0 ? ((totals.female / totals.totalStudents) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Nữ dân tộc: <strong className="text-slate-700 tabular-nums">{totals.femaleEthnic}</strong> em
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dân tộc thiểu số</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.ethnic.toLocaleString('vi-VN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium tabular-nums">
              {totals.totalStudents > 0 ? ((totals.ethnic / totals.totalStudents) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Ê-đê, Tày, Nùng, M'Nông...
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Khuyết tật</span>
            <HeartHandshake className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.disabled}
            </span>
            <span className="text-[11px] text-slate-500">em</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Học hòa nhập theo quy định
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hộ nghèo & Cận nghèo</span>
            <Home className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.poor + totals.nearPoor}
            </span>
            <span className="text-[11px] text-amber-600 font-medium tabular-nums">
              {totals.totalStudents > 0 ? (((totals.poor + totals.nearPoor) / totals.totalStudents) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Nghèo: <strong className="text-slate-700 tabular-nums">{totals.poor}</strong> · Cận: <strong className="text-slate-700 tabular-nums">{totals.nearPoor}</strong>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bán trú & Buôn KK</span>
            <Utensils className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totals.boarding}
            </span>
            <span className="text-[11px] text-slate-500">bán trú</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Buôn khó khăn: <strong className="text-slate-700 tabular-nums">{totals.difficultVillage}</strong> em
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Grade Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Phân bố Sĩ số theo Khối lớp (Khối 1 đến Khối 9)
              </h2>
              <p className="text-xs text-slate-500">
                Chi tiết số học sinh, số nữ và số học sinh dân tộc từng khối
              </p>
            </div>
            <button
              onClick={onNavigateToStats}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Xem chi tiết 44 lớp &rarr;
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} học sinh`,
                    name === 'students' ? 'Tổng số' : name === 'female' ? 'Nữ' : 'Dân tộc'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => (value === 'students' ? 'Tổng số' : value === 'female' ? 'Nữ' : 'Dân tộc')}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} name="students" />
                <Bar dataKey="female" fill="#ec4899" radius={[4, 4, 0, 0]} name="female" />
                <Bar dataKey="ethnic" fill="#10b981" radius={[4, 4, 0, 0]} name="ethnic" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Campus Breakdown & Demographics (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Quy mô 3 Điểm trường
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cơ cấu sĩ số theo phân hiệu & điểm chính
            </p>

            <div className="space-y-3">
              {campusData.map((item, idx) => {
                const totalAll = stats.reduce((sum, s) => sum + s.totalStudents, 0);
                const percent = totalAll > 0 ? ((item.students / totalAll) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {item.students} HS ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>{item.classes} lớp</span>
                      <span>Nữ: {item.female} · Dân tộc: {item.ethnic}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[11px] text-slate-500 block">Tỷ lệ Nữ</span>
              <span className="text-base font-bold text-pink-600 tabular-nums">
                {totals.totalStudents > 0 ? ((totals.female / totals.totalStudents) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] text-slate-500 block">Tỷ lệ Dân tộc</span>
              <span className="text-base font-bold text-emerald-600 tabular-nums">
                {totals.totalStudents > 0 ? ((totals.ethnic / totals.totalStudents) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] text-slate-500 block">Hộ nghèo/cận</span>
              <span className="text-base font-bold text-amber-600 tabular-nums">
                {totals.totalStudents > 0 ? (((totals.poor + totals.nearPoor) / totals.totalStudents) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
