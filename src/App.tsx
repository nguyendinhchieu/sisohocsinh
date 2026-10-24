import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DashboardView } from './views/DashboardView';
import { MonthlyStatsView } from './views/MonthlyStatsView';
import { ClassesView } from './views/ClassesView';
import { StudentsView } from './views/StudentsView';
import { FluctuationsView } from './views/FluctuationsView';
import { StaffView } from './views/StaffView';
import { ReportsView } from './views/ReportsView';
import { AdminToolsView } from './views/AdminToolsView';

import { api, getStoredUser, clearAuthSession } from './services/api';
import { 
  AcademicMonth, 
  MonthlyClassStats, 
  ClassItem, 
  StaffItem, 
  User, 
  SchoolInfo, 
  CampusInfo 
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Core Data States
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [campuses, setCampuses] = useState<CampusInfo[]>([]);
  const [months, setMonths] = useState<AcademicMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonth | null>(null);
  const [stats, setStats] = useState<MonthlyClassStats[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Campus Filter for Dashboard
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');

  // Load Initial Metadata & Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [schoolRes, monthsRes, classesRes, staffRes] = await Promise.all([
        api.getSchoolInfo(),
        api.getMonths(),
        api.getClasses(),
        api.getStaff()
      ]);

      setSchoolInfo(schoolRes.school);
      setCampuses(schoolRes.campuses);
      setMonths(monthsRes);
      setClasses(classesRes);
      setStaffList(staffRes);

      // Default to initial month (2026-09) or latest month
      const initialM = monthsRes.find(m => m.id === '2026-09') || monthsRes[0];
      if (initialM) {
        setSelectedMonth(initialM);
        const statsRes = await api.getMonthlyStats(initialM.id);
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu ban đầu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload stats when selectedMonth changes
  const handleSelectMonth = async (m: AcademicMonth) => {
    setSelectedMonth(m);
    try {
      const statsRes = await api.getMonthlyStats(m.id);
      setStats(statsRes);
    } catch (e) {
      console.error(e);
    }
  };

  // Refresh all current data
  const handleRefreshData = async () => {
    try {
      const [monthsRes, staffRes, classesRes] = await Promise.all([
        api.getMonths(),
        api.getStaff(),
        api.getClasses()
      ]);
      setMonths(monthsRes);
      setStaffList(staffRes);
      setClasses(classesRes);

      const curId = selectedMonth?.id || '2026-09';
      const curMonth = monthsRes.find(m => m.id === curId) || monthsRes[0];
      if (curMonth) {
        setSelectedMonth(curMonth);
        const statsRes = await api.getMonthlyStats(curMonth.id);
        setStats(statsRes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    if (currentTab === 'admin_tools') {
      setCurrentTab('dashboard');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.mustChangePassword) {
      setChangePasswordModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
        onLogout={handleLogout}
        selectedMonth={selectedMonth}
      />

      {/* Main Viewport Content */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Đang khởi tạo hệ thống quản lý sĩ số...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                selectedMonth={selectedMonth}
                months={months}
                onSelectMonth={handleSelectMonth}
                selectedCampus={selectedCampus}
                onSelectCampus={setSelectedCampus}
                schoolInfo={schoolInfo}
                onNavigateToStats={() => setCurrentTab('monthly_stats')}
              />
            )}

            {currentTab === 'monthly_stats' && (
              <MonthlyStatsView
                stats={stats}
                selectedMonth={selectedMonth}
                months={months}
                onSelectMonth={handleSelectMonth}
                onRefreshData={handleRefreshData}
                currentUser={currentUser}
                schoolInfo={schoolInfo}
                staffList={staffList}
              />
            )}

            {currentTab === 'classes' && (
              <ClassesView
                stats={stats}
                classes={classes}
                currentUser={currentUser}
                schoolInfo={schoolInfo}
                onRefreshData={handleRefreshData}
              />
            )}

            {currentTab === 'students' && (
              <StudentsView
                stats={stats}
                currentUser={currentUser}
                schoolInfo={schoolInfo}
              />
            )}

            {currentTab === 'fluctuations' && (
              <FluctuationsView
                selectedMonth={selectedMonth}
                stats={stats}
                currentUser={currentUser}
                onRefreshData={handleRefreshData}
              />
            )}

            {currentTab === 'staff' && (
              <StaffView
                staffList={staffList}
                currentUser={currentUser}
                schoolInfo={schoolInfo}
                onRefreshData={handleRefreshData}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                stats={stats}
                selectedMonth={selectedMonth}
                months={months}
                schoolInfo={schoolInfo}
                staffList={staffList}
              />
            )}

            {currentTab === 'admin_tools' && currentUser?.role === 'ADMIN' && (
              <AdminToolsView
                currentUser={currentUser}
                schoolInfo={schoolInfo}
                onRefreshData={handleRefreshData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-800">
            TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU · HUYỆN EA KAR · TỈNH ĐẮK LẮK
          </p>
          <p className="text-slate-500">
            Địa chỉ: Thôn Cư Nghĩa, xã Ea Kar, tỉnh Đắk Lắk · Hiệu trưởng: <strong>Nguyễn Hồ Bắc</strong> · Quản lý CNTT: <strong>Phạm Ngọc Tiến</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Quy mô: 3 điểm trường (Phân hiệu 1: 20 lớp · Phân hiệu 2: 9 lớp · Điểm chính THCS: 15 lớp) · Tổng số: 44 lớp · 1.467 học sinh
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
}
