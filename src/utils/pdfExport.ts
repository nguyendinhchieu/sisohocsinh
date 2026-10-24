import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyClassStats, AcademicMonth, SchoolInfo } from '../types';

export function exportMonthlyReportPDF(
  month: AcademicMonth,
  stats: MonthlyClassStats[],
  schoolInfo: SchoolInfo,
  campusFilter?: string
) {
  // Use landscape A4 for rich tabular reporting
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const filteredStats = campusFilter
    ? stats.filter(s => s.campusId === campusFilter)
    : stats;

  const campusTitle = campusFilter === 'PH1'
    ? 'PHÂN HIỆU 1'
    : campusFilter === 'PH2'
    ? 'PHÂN HIỆU 2'
    : campusFilter === 'DIEM_CHINH'
    ? 'ĐIỂM CHÍNH THCS'
    : 'TOÀN TRƯỜNG';

  // Header
  doc.setFontSize(10);
  doc.text('ỦY BAN NHÂN DÂN XÃ EA KAR', 20, 15);
  doc.setFont('helvetica', 'bold');
  doc.text('TRƯỜNG TH&THCS NGUYỄN ĐÌNH CHIỂU', 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`Địa chỉ: ${schoolInfo.address || 'Thôn Cư Nghĩa, xã Ea Kar, Đắk Lắk'}`, 20, 25);

  doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 210, 15);
  doc.text('Độc lập - Tự do - Hạnh phúc', 225, 20);
  doc.line(225, 22, 265, 22);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`BÁO CÁO SĨ SỐ HỌC SINH - ${campusTitle}`, 148, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Năm học: ${schoolInfo.academicYear} | Tháng: ${month.monthNumber}/${month.year} (Ngày chốt: ${month.cutoffDate})`, 148, 41, { align: 'center' });

  // Table columns
  const tableColumns = [
    'STT',
    'Điểm',
    'Khối',
    'Lớp',
    'GVCN',
    'Sĩ số',
    'Nữ',
    'Dân tộc',
    'Nữ DT',
    'KT',
    'Nghèo',
    'Cận nghèo',
    'Buôn KK',
    'Bán trú',
    'Tăng/giảm',
    'Ghi chú'
  ];

  let sumTotal = 0;
  let sumFemale = 0;
  let sumEthnic = 0;
  let sumFemaleEthnic = 0;
  let sumDisabled = 0;
  let sumPoor = 0;
  let sumNearPoor = 0;
  let sumVillage = 0;
  let sumBoarding = 0;
  let sumDelta = 0;

  const tableRows = filteredStats.map((s, idx) => {
    sumTotal += s.totalStudents;
    sumFemale += s.female;
    sumEthnic += s.ethnic;
    sumFemaleEthnic += s.femaleEthnic;
    sumDisabled += s.disabled;
    sumPoor += s.poor;
    sumNearPoor += s.nearPoor;
    sumVillage += s.difficultVillage;
    sumBoarding += s.boarding;
    sumDelta += s.deltaStudents || 0;

    const shortCampus = s.campusId === 'PH1' ? 'PH 1' : s.campusId === 'PH2' ? 'PH 2' : 'THCS';

    return [
      idx + 1,
      shortCampus,
      s.grade,
      s.className,
      s.homeroomTeacher,
      s.totalStudents,
      s.female,
      s.ethnic,
      s.femaleEthnic,
      s.disabled,
      s.poor,
      s.nearPoor,
      s.difficultVillage,
      s.boarding,
      s.deltaStudents === 0 ? '0' : s.deltaStudents > 0 ? `+${s.deltaStudents}` : `${s.deltaStudents}`,
      s.notes || s.deltaReason || ''
    ];
  });

  // Total summary row
  tableRows.push([
    'TỔNG',
    `${filteredStats.length} lớp`,
    '',
    '',
    '',
    sumTotal,
    sumFemale,
    sumEthnic,
    sumFemaleEthnic,
    sumDisabled,
    sumPoor,
    sumNearPoor,
    sumVillage,
    sumBoarding,
    sumDelta === 0 ? '0' : sumDelta > 0 ? `+${sumDelta}` : `${sumDelta}`,
    ''
  ]);

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 46,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [30, 58, 138], // Royal Navy Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 16 },
      2: { cellWidth: 12 },
      3: { cellWidth: 14, fontStyle: 'bold' },
      4: { cellWidth: 34, halign: 'left' },
      5: { cellWidth: 14, fontStyle: 'bold' },
      6: { cellWidth: 12 },
      7: { cellWidth: 14 },
      8: { cellWidth: 14 },
      9: { cellWidth: 10 },
      10: { cellWidth: 12 },
      11: { cellWidth: 15 },
      12: { cellWidth: 16 },
      13: { cellWidth: 14 },
      14: { cellWidth: 16 },
      15: { cellWidth: 'auto', halign: 'left' }
    },
    didParseCell: (data) => {
      // Highlight summary row
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Footer & Signatures
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  const pageHeight = doc.internal.pageSize.getHeight();
  const signatureY = finalY + 12 > pageHeight - 35 ? 20 : finalY + 12;

  if (signatureY === 20) {
    doc.addPage();
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const today = new Date();
  const dateStr = `Ea Kar, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  doc.text(dateStr, 220, signatureY);

  doc.setFont('helvetica', 'bold');
  doc.text('NGƯỜI LẬP BÁO CÁO', 45, signatureY + 6);
  doc.text('HIỆU TRƯỞNG', 230, signatureY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('(Ký và ghi rõ họ tên)', 45, signatureY + 11);
  doc.text('(Ký, đóng dấu và ghi rõ họ tên)', 222, signatureY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(schoolInfo.principal || 'Nguyễn Hồ Bắc', 230, signatureY + 30);

  doc.save(`Bao_cao_si_so_${month.id}_${campusFilter || 'Toan_truong'}.pdf`);
}
