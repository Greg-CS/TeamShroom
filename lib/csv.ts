// lib/csv.ts
// CSV parsing utilities

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (!lines.length) return [];

  const headers = lines[0]
    .replace(/\r/g, '')
    .split(',')
    .map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').replace(/\r/g, '').trim();
    });
    return row;
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export async function fetchCSV(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${url}`);
  }
  const text = await res.text();
  return parseCSV(text);
}
