import * as XLSX from 'xlsx';
import { MonthlyClassStats } from '../types';

export interface ParsedClassStatRow {
  className: string;
  campusId?: 'PH1' | 'PH2' | 'DIEM_CHINH';
  homeroomTeacher?: string;
  totalStudents: number;
  female: number;
  ethnic: number;
  femaleEthnic: number;
  disabled: number;
  poor: number;
  nearPoor: number;
  difficultVillage: number;
  boarding: number;
  notes?: string;
  deltaReason?: string;
  isValid: boolean;
  errors: string[];
}

export function validateRow(row: Partial<ParsedClassStatRow>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = Number(row.totalStudents ?? 0);
  const female = Number(row.female ?? 0);
  const ethnic = Number(row.ethnic ?? 0);
  const femaleEthnic = Number(row.femaleEthnic ?? 0);
  const disabled = Number(row.disabled ?? 0);
  const poor = Number(row.poor ?? 0);
  const nearPoor = Number(row.nearPoor ?? 0);
  const boarding = Number(row.boarding ?? 0);
  const difficultVillage = Number(row.difficultVillage ?? 0);

  if (!row.className) {
    errors.push('Tên lớp không được để trống.');
  }

  if (total < 0) errors.push('Sĩ số không được âm.');
  if (female < 0) errors.push('Số nữ không được âm.');
  if (ethnic < 0) errors.push('Số dân tộc không được âm.');
  if (femaleEthnic < 0) errors.push('Số nữ dân tộc không được âm.');

  if (female > total) errors.push('Số học sinh Nữ không được vượt quá Tổng sĩ số.');
  if (ethnic > total) errors.push('Số học sinh Dân tộc không được vượt quá Tổng sĩ số.');
  if (femaleEthnic > ethnic) errors.push('Số Nữ dân tộc không được vượt quá Số dân tộc.');
  if (femaleEthnic > female) errors.push('Số Nữ dân tộc không được vượt quá Số học sinh nữ.');
  if (poor > total) errors.push('Số Hộ nghèo không được vượt quá Tổng sĩ số.');
  if (nearPoor > total) errors.push('Số Hộ cận nghèo không được vượt quá Tổng sĩ số.');
  if (poor + nearPoor > total) errors.push('Tổng Hộ nghèo + Cận nghèo không được vượt quá Tổng sĩ số.');
  if (disabled > total) errors.push('Số học sinh Khuyết tật không được vượt quá Tổng sĩ số.');
  if (boarding > total) errors.push('Số học sinh Bán trú không được vượt quá Tổng sĩ số.');
  if (difficultVillage > total) errors.push('Số HS buôn khó khăn không được vượt quá Tổng sĩ số.');

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function parseExcelStatsFile(file: File): Promise<ParsedClassStatRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Look for first sheet or sheet with TONG_HOP / PH 1 / classes
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  if (rows.length < 2) {
    throw new Error('Tệp Excel không chứa đủ dữ liệu hoặc sai định dạng.');
  }

  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (Array.isArray(row)) {
      const text = row.map(c => String(c).toLowerCase()).join(' ');
      if (text.includes('lớp') || text.includes('sĩ số') || text.includes('lop') || text.includes('si so')) {
        headerRowIndex = i;
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headers = (rows[headerRowIndex] || []).map((h: any) => String(h || '').trim().toLowerCase());

  const colIdx = {
    className: headers.findIndex((h: string) => h === 'lớp' || h === 'lop' || h.includes('tên lớp')),
    campus: headers.findIndex((h: string) => h.includes('điểm') || h.includes('diem') || h.includes('phân hiệu')),
    homeroom: headers.findIndex((h: string) => h.includes('gvcn') || h.includes('chủ nhiệm') || h.includes('giáo viên')),
    total: headers.findIndex((h: string) => h.includes('sĩ số') || h.includes('si so') || h.includes('tổng')),
    female: headers.findIndex((h: string) => h === 'nữ' || h === 'nu'),
    ethnic: headers.findIndex((h: string) => (h.includes('dân tộc') || h.includes('dan toc')) && !h.includes('nữ')),
    femaleEthnic: headers.findIndex((h: string) => h.includes('nữ dt') || h.includes('nữ dân tộc') || h.includes('nu dan toc')),
    disabled: headers.findIndex((h: string) => h.includes('khuyết tật') || h.includes('khuyet tat') || h === 'kt'),
    poor: headers.findIndex((h: string) => h.includes('hộ nghèo') || h.includes('nghèo') || h === 'hn'),
    nearPoor: headers.findIndex((h: string) => h.includes('cận nghèo') || h.includes('can ngheo') || h === 'hcn'),
    village: headers.findIndex((h: string) => h.includes('buôn') || h.includes('kho khan') || h.includes('khó khăn')),
    boarding: headers.findIndex((h: string) => h.includes('bán trú') || h.includes('ban tru')),
    notes: headers.findIndex((h: string) => h.includes('ghi chú') || h.includes('ghi chu'))
  };

  const parsedList: ParsedClassStatRow[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    // Check if row is empty or is a total row
    const firstCell = String(row[0] || '').trim().toLowerCase();
    if (firstCell.startsWith('tổng') || firstCell.startsWith('tong')) continue;

    const className = String(colIdx.className !== -1 ? row[colIdx.className] : row[3] || row[0] || '').trim();
    if (!className || className.toLowerCase().includes('tổng') || className.toLowerCase() === 'stt') continue;

    const totalStudents = Number(colIdx.total !== -1 ? row[colIdx.total] : row[5] || 0) || 0;
    const female = Number(colIdx.female !== -1 ? row[colIdx.female] : row[6] || 0) || 0;
    const ethnic = Number(colIdx.ethnic !== -1 ? row[colIdx.ethnic] : row[7] || 0) || 0;
    const femaleEthnic = Number(colIdx.femaleEthnic !== -1 ? row[colIdx.femaleEthnic] : row[8] || 0) || 0;
    const disabled = Number(colIdx.disabled !== -1 ? row[colIdx.disabled] : row[9] || 0) || 0;
    const poor = Number(colIdx.poor !== -1 ? row[colIdx.poor] : row[10] || 0) || 0;
    const nearPoor = Number(colIdx.nearPoor !== -1 ? row[colIdx.nearPoor] : row[11] || 0) || 0;
    const difficultVillage = Number(colIdx.village !== -1 ? row[colIdx.village] : row[12] || 0) || 0;
    const boarding = Number(colIdx.boarding !== -1 ? row[colIdx.boarding] : row[13] || 0) || 0;
    const homeroomTeacher = String(colIdx.homeroom !== -1 ? row[colIdx.homeroom] : row[4] || '').trim();
    const notes = String(colIdx.notes !== -1 ? row[colIdx.notes] : row[16] || '').trim();

    const candidate: Partial<ParsedClassStatRow> = {
      className,
      totalStudents,
      female,
      ethnic,
      femaleEthnic,
      disabled,
      poor,
      nearPoor,
      difficultVillage,
      boarding,
      homeroomTeacher,
      notes
    };

    const val = validateRow(candidate);

    parsedList.push({
      className,
      totalStudents,
      female,
      ethnic,
      femaleEthnic,
      disabled,
      poor,
      nearPoor,
      difficultVillage,
      boarding,
      homeroomTeacher,
      notes,
      isValid: val.isValid,
      errors: val.errors
    });
  }

  return parsedList;
}
