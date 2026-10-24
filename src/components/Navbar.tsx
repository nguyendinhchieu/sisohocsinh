import React from 'react';
import { 
  School, 
  BarChart3, 
  CalendarDays, 
  GraduationCap, 
  Users2, 
  TrendingUp, 
  Briefcase, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  KeyRound,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { User, AcademicMonth } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  selectedMonth: AcademicMonth | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  onOpenChangePassword,
  onLogout,
  selectedMonth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
    { id: 'monthly_stats', label: 'Sĩ số theo tháng', icon: CalendarDays },
    { id: 'classes', label: 'Lớp học', icon: School },
    { id: 'students', label: 'Học sinh', icon: GraduationCap },
    { id: 'fluctuations', label: 'Biến động', icon: TrendingUp },
    { id: 'staff', label: 'Cán bộ - GV', icon: Briefcase },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin_tools', label: 'Nhật ký & Sao lưu', icon: ShieldCheck }] : [])
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark with official emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm border border-blue-400/30">
                <School className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white uppercase font-sans">
                  TH&THCS Nguyễn Đình Chiểu
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Hệ thống Quản lý Sĩ số · Ea Kar, Đắk Lắk
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line, text with subtle states) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User Info */}
          <div className="flex items-center gap-2.5">
            {selectedMonth && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 tabular-nums">
                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                <span>Tháng {selectedMonth.monthNumber}/{selectedMonth.year}</span>
                {selectedMonth.isLocked && (
                  <span className="inline-flex items-center text-amber-400 gap-0.5 text-[11px] ml-1">
                    <Lock className="w-3 h-3" /> Chốt
                  </span>
                )}
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'CÁN BỘ QUẢN LÝ'}
                  </span>
                </div>

                <div className="relative group">
                  <button 
                    onClick={onOpenChangePassword}
                    title="Đổi mật khẩu"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-900 border-b border-slate-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
