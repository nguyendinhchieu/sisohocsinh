import * as XLSX from 'xlsx';
import { MonthlyClassStats, AcademicMonth, SchoolInfo, StaffItem, Student } from '../types';

export function exportMonthlyStatsToExcel(
  month: AcademicMonth,
  stats: MonthlyClassStats[],
  schoolInfo: SchoolInfo,
  staffList?: StaffItem[]
) {
  const wb = XLSX.utils.book_new();

  // Helper to build rows for a set of classes
  const buildSheetData = (title: string, classStats: MonthlyClassStats[]) => {
    const data: (string | number)[][] = [
      ['ỦY BAN NHÂN DÂN HUYỆN EA KAR', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      ['TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
      ['Địa chỉ: Thôn Cư Nghĩa, xã Ea Kar, tỉnh Đắk Lắk'],
      [],
      [`BÁO CÁO THỐNG KÊ SĨ SỐ HỌC SINH - ${title.toUpperCase()}`],
      [`Năm học: ${schoolInfo.academicYear} | Tháng: ${month.monthNumber}/${month.year} (Ngày chốt: ${month.cutoffDate})`],
      [],
      [
        'STT',
        'Điểm trường',
        'Khối',
        'Lớp',
        'Giáo viên chủ nhiệm',
        'Tổng sĩ số',
        'Nữ',
        'Dân tộc',
        'Nữ dân tộc',
        'Khuyết tật',
        'Hộ nghèo',
        'Hộ cận nghèo',
        'Buôn khó khăn',
        'Bán trú',
        'Tăng/Giảm',
        'Nguyên nhân biến động',
        'Ghi chú'
      ]
    ];

    let totalStudents = 0;
    let totalFemale = 0;
    let totalEthnic = 0;
    let totalFemaleEthnic = 0;
    let totalDisabled = 0;
    let totalPoor = 0;
    let totalNearPoor = 0;
    let totalVillage = 0;
    let totalBoarding = 0;
    let totalDelta = 0;

    classStats.forEach((st, idx) => {
      totalStudents += st.totalStudents;
      totalFemale += st.female;
      totalEthnic += st.ethnic;
      totalFemaleEthnic += st.femaleEthnic;
      totalDisabled += st.disabled;
      totalPoor += st.poor;
      totalNearPoor += st.nearPoor;
      totalVillage += st.difficultVillage;
      totalBoarding += st.boarding;
      totalDelta += st.deltaStudents || 0;

      const campusName =
        st.campusId === 'PH1'
          ? 'Phân hiệu 1'
          : st.campusId === 'PH2'
          ? 'Phân hiệu 2'
          : 'Điểm chính THCS';

      data.push([
        idx + 1,
        campusName,
        `Khối ${st.grade}`,
        st.className,
        st.homeroomTeacher,
        st.totalStudents,
        st.female,
        st.ethnic,
        st.femaleEthnic,
        st.disabled,
        st.poor,
        st.nearPoor,
        st.difficultVillage,
        st.boarding,
        st.deltaStudents || 0,
        st.deltaReason || '',
        st.notes || ''
      ]);
    });

    // Summary row
    data.push([
      'TỔNG',
      `${classStats.length} lớp`,
      '',
      '',
      '',
      totalStudents,
      totalFemale,
      totalEthnic,
      totalFemaleEthnic,
      totalDisabled,
      totalPoor,
      totalNearPoor,
      totalVillage,
      totalBoarding,
      totalDelta,
      '',
      ''
    ]);

    // Signatures
    data.push([]);
    data.push(['', '', '', '', '', '', '', '', '', `Ea Kar, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`]);
    data.push(['', 'NGƯỜI LẬP BIỂU', '', '', '', '', '', '', '', 'HIỆU TRƯỞNG']);
    data.push(['', '(Ký và ghi rõ họ tên)', '', '', '', '', '', '', '', '(Ký, ghi rõ họ tên và đóng dấu)']);
    data.push([]);
    data.push([]);
    data.push(['', '', '', '', '', '', '', '', '', schoolInfo.principal || 'Nguyễn Hồ Bắc']);

    return data;
  };

  // 1. Sheet Toàn trường
  const allData = buildSheetData('Toàn trường', stats);
  const wsAll = XLSX.utils.aoa_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, wsAll, 'TONG_HOP_TOAN_TRUONG');

  // 2. Sheet Phân hiệu 1 (20 lớp)
  const ph1Stats = stats.filter(s => s.campusId === 'PH1');
  if (ph1Stats.length > 0) {
    const ph1Data = buildSheetData('Phân hiệu 1', ph1Stats);
    const wsPH1 = XLSX.utils.aoa_to_sheet(ph1Data);
    XLSX.utils.book_append_sheet(wb, wsPH1, 'PHAN_HIEU_1');
  }

  // 3. Sheet Phân hiệu 2 (9 lớp)
  const ph2Stats = stats.filter(s => s.campusId === 'PH2');
  if (ph2Stats.length > 0) {
    const ph2Data = buildSheetData('Phân hiệu 2', ph2Stats);
    const wsPH2 = XLSX.utils.aoa_to_sheet(ph2Data);
    XLSX.utils.book_append_sheet(wb, wsPH2, 'PHAN_HIEU_2');
  }

  // 4. Sheet THCS (15 lớp)
  const thcsStats = stats.filter(s => s.campusId === 'DIEM_CHINH');
  if (thcsStats.length > 0) {
    const thcsData = buildSheetData('Điểm chính THCS', thcsStats);
    const wsTHCS = XLSX.utils.aoa_to_sheet(thcsData);
    XLSX.utils.book_append_sheet(wb, wsTHCS, 'DIEM_CHINH_THCS');
  }

  // 5. Sheet Cán bộ giáo viên nếu có
  if (staffList && staffList.length > 0) {
    const staffData: (string | number)[][] = [
      ['DANH SÁCH CÁN BỘ - GIÁO VIÊN - NHÂN VIÊN'],
      ['TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU'],
      [],
      [
        'STT',
        'Mã CBGV',
        'Họ và tên',
        'Giới tính',
        'Chức vụ',
        'Vai trò',
        'Điểm trường',
        'Tổ chuyên môn',
        'Môn giảng dạy',
        'Trình độ',
        'Số điện thoại',
        'Trạng thái'
      ]
    ];

    staffList.forEach((st, idx) => {
      staffData.push([
        idx + 1,
        st.id,
        st.fullName || '(Chưa phân công)',
        st.gender,
        st.position,
        st.role,
        st.campusId === 'PH1' ? 'Phân hiệu 1' : st.campusId === 'PH2' ? 'Phân hiệu 2' : st.campusId === 'DIEM_CHINH' ? 'Điểm chính THCS' : 'Toàn trường',
        st.department,
        st.subject || '',
        st.qualification || '',
        st.phone || '',
        st.status
      ]);
    });

    const wsStaff = XLSX.utils.aoa_to_sheet(staffData);
    XLSX.utils.book_append_sheet(wb, wsStaff, 'CAN_BO_GIAO_VIEN');
  }

  // Trigger download
  const fileName = `Bao_cao_si_so_TH_THCS_Nguyen_Dinh_Chieu_${month.id}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportStudentsToExcel(students: Student[], schoolInfo: SchoolInfo) {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [
    ['DANH SÁCH HỌC SINH - TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU'],
    [`Năm học: ${schoolInfo.academicYear} | Tổng số: ${students.length} học sinh`],
    [],
    [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Ngày sinh',
      'Giới tính',
      'Dân tộc',
      'Lớp',
      'Khối',
      'Điểm trường',
      'Hộ nghèo',
      'Hộ cận nghèo',
      'Khuyết tật',
      'Bán trú',
      'Buôn khó khăn',
      'Trạng thái'
    ]
  ];

  students.forEach((s, idx) => {
    data.push([
      idx + 1,
      s.studentCode,
      s.fullName,
      s.birthDate,
      s.gender,
      s.ethnic,
      s.className,
      s.grade,
      s.campusId === 'PH1' ? 'Phân hiệu 1' : s.campusId === 'PH2' ? 'Phân hiệu 2' : 'Điểm chính THCS',
      s.isPoor ? 'Có' : 'Không',
      s.isNearPoor ? 'Có' : 'Không',
      s.isDisabled ? 'Có' : 'Không',
      s.isBoarding ? 'Có' : 'Không',
      s.difficultVillage ? 'Có' : 'Không',
      s.status
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'DANH_SACH_HOC_SINH');
  XLSX.writeFile(wb, `Danh_sach_hoc_sinh_Nguyen_Dinh_Chieu_${Date.now()}.xlsx`);
}
