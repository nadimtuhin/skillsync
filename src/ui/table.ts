export interface TableColumn {
  header: string;
  key: string;
  width?: number;
}

export function printTable(columns: TableColumn[], rows: Record<string, string>[]): void {
  const widths = columns.map(col => {
    const maxData = Math.max(...rows.map(r => (r[col.key] ?? '').length));
    return Math.max(col.header.length, maxData, col.width ?? 0);
  });

  const separator = widths.map(w => '-'.repeat(w)).join('  ');
  const header = columns.map((col, i) => col.header.padEnd(widths[i])).join('  ');

  process.stdout.write(header + '\n');
  process.stdout.write(separator + '\n');
  for (const row of rows) {
    const line = columns.map((col, i) => (row[col.key] ?? '').padEnd(widths[i])).join('  ');
    process.stdout.write(line + '\n');
  }
}
