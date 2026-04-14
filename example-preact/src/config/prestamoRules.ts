/**
 * Helpers for Prestamo sheet: sanitization, dates, phones, money, categorical mapping.
 * Used by custom validators/transformers in prestamoSheet.ts
 */

export type SheetRow = Record<string, string | number | boolean | undefined>;

/** Rule 7: Uppercase, replace accents (Á→A), Ñ→N, ¥→N, remove |;"()><'´@., trim, \n→space. Skip for money/email. */
export function sanitizeText(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const s = String(value).trim();
  if (!s) return '';
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ü/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/¥/g, 'N')
    .replace(/[|;"()><'´@.,]/g, '')
    .trim();
}

const MIN_DATE_NUM = 18000101;

function getTodayNum(): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
}

/** Max day in month (1-12), accounting for leap year in February. */
function getMaxDayInMonth(month: number, year: number): number {
  if (month < 1 || month > 12) return 0;
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/**
 * Validates that a YYYYMMDD string has real calendar values: month 1-12, day 1–maxDay(month,year), range 18000101–today.
 */
export function isValidDateStrict(yyyyMmDd: string): boolean {
  if (!/^\d{8}$/.test(yyyyMmDd)) return false;
  const n = parseInt(yyyyMmDd, 10);
  if (n < MIN_DATE_NUM || n > getTodayNum()) return false;
  const year = Math.floor(n / 10000);
  const month = Math.floor((n % 10000) / 100);
  const day = n % 100;
  if (month < 1 || month > 12) return false;
  const maxDay = getMaxDayInMonth(month, year);
  if (day < 1 || day > maxDay) return false;
  return true;
}

/**
 * Transform to YYYYMMDD. Accepts YYYY-MM-DD, DD/MM/YYYY, 8-digit. Only returns when valid: month 1-12, day valid for month, range 18000101–today.
 */
export function dateToYyyyMmDd(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const todayNum = getTodayNum();
  let year: number;
  let month: number;
  let day: number;

  if (/^\d{8}$/.test(s)) {
    const n = parseInt(s, 10);
    if (n < MIN_DATE_NUM || n > todayNum) return undefined;
    year = Math.floor(n / 10000);
    month = Math.floor((n % 10000) / 100);
    day = n % 100;
    if (month < 1 || month > 12) return undefined;
    const maxDay = getMaxDayInMonth(month, year);
    if (day < 1 || day > maxDay) return undefined;
    return s;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    year = y;
    month = m;
    day = d;
  } else {
    const parts = s.split(/[/\-.]/);
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 > 31) {
        year = p0;
        month = p1;
        day = p2;
      } else {
        day = p0;
        month = p1;
        year = p2;
        if (year < 100) year += 2000;
      }
    } else return undefined;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const y = Math.max(1800, Math.min(9999, year));
  const m = Math.max(1, Math.min(12, month));
  const maxDay = getMaxDayInMonth(m, y);
  const d = Math.max(1, Math.min(maxDay, day));
  const num = y * 10000 + m * 100 + d;
  if (num < MIN_DATE_NUM || num > todayNum) return undefined;
  return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

/**
 * Returns true if the value is a valid date (after parsing to YYYYMMDD and checking calendar validity).
 */
export function isValueValidDate(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  const normalized = dateToYyyyMmDd(String(value));
  return normalized !== undefined;
}

/** Dominican phone: 10 digits, prefix 809/829/849. If 7 digits, prepend 809. First of 7 cannot be 0 or 1. */
export function phoneDR(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 0) return undefined;
  if (digits.length === 7) {
    if (digits[0] === '0' || digits[0] === '1') return undefined;
    return `809${digits}`;
  }
  if (digits.length === 10) {
    const prefix = digits.slice(0, 3);
    if (prefix !== '809' && prefix !== '829' && prefix !== '849') return undefined;
    return digits;
  }
  return undefined;
}

/** Money: use . as decimal, remove thousands comma, truncate to 2 decimals (no round). */
export function moneyTruncate(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).replace(/,/g, '').trim();
  if (!s) return undefined;
  const num = parseFloat(s);
  if (Number.isNaN(num)) return undefined;
  const truncated = Math.floor(num * 100) / 100;
  return truncated.toFixed(2);
}

/** MONEDA / MONEDA_SALARIO: RD$, Pesos, RD, DOP, $ → DO. USD, Dólares → US. */
export function mapMoneda(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const v = String(value).trim().toUpperCase();
  if (!v) return undefined;
  if (/^(RD\$|PESOS|RD|DOP|\$)/i.test(v) || v === 'DO') return 'DO';
  if (/^(USD|DÓLARES|DOLARES|US)/i.test(v) || v === 'US') return 'US';
  return v;
}

/** RELACION_TIPO: 1, Deudor, Principal → DE. 2, Codeudor → CO. */
export function mapRelacionTipo(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const v = String(value).trim().toUpperCase();
  if (!v) return undefined;
  if (v === '1' || /^(DEUDOR|PRINCIPAL)$/i.test(v)) return 'DE';
  if (v === '2' || /^CODEUDOR$/i.test(v)) return 'CO';
  return v;
}

/** ESTATUS: N, Normal → N. A, Atraso → A. C, Castigado → C. */
export function mapEstatus(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const v = String(value).trim().toUpperCase();
  if (!v) return undefined;
  if (v === 'N' || /^NORMAL$/i.test(v)) return 'N';
  if (v === 'A' || /^ATRASO$/i.test(v)) return 'A';
  if (v === 'C' || /^CASTIGADO$/i.test(v) || /^SALDADO$/i.test(v)) return 'C';
  return v;
}
