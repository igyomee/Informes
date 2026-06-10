function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function timestampForId(date = new Date()): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(
    date.getMinutes()
  )}${pad(date.getSeconds())}`;
}

export function sanitizeCodeForId(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function generateReviewId(codigoEquipo: string, date = new Date()): string {
  return `REV-${timestampForId(date)}-${sanitizeCodeForId(codigoEquipo)}`;
}
