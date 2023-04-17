export function drawTable(table) {
  const gap = '  ';
  const columns = table[0].map((align) => ({ maxW: 0, cells: [], align }));
  for (let r = 1; r < table.length; ++r) {
    const row = table[r];
    if (!row) {
      continue;
    }
    for (let i = 0; i < row.length; ++i) {
      const col = columns[i];
      let cell = row[i];
      if (cell !== null) {
        if (Array.isArray(cell)) {
          cell = cell[1];
        }
        col.cells.push({ length: cell.length, row, pos: i });
      }
    }
  }
  let carry = [];
  for (const col of columns) {
    col.cells.push(...carry);
    col.maxW = Math.max(
      ...col.cells
        .filter((cell) => cell.row[cell.pos + 1] !== null)
        .map((cell) => cell.length),
    );
    carry = col.cells
      .filter((cell) => cell.row[cell.pos + 1] === null)
      .map((cell) => ({
        ...cell,
        length: cell.length - col.maxW,
        pos: cell.pos + 1,
      }));
  }
  const output = [];
  for (let r = 1; r < table.length; ++r) {
    let outputRow = [];
    const row = table[r];
    if (!row) {
      for (let i = 0; i < columns.length; ++i) {
        if (i > 0) {
          outputRow.push(gap);
        }
        outputRow.push('-'.repeat(columns[i].maxW));
      }
    } else {
      for (let i = 0; i < row.length; ) {
        if (i > 0) {
          outputRow.push(gap);
        }
        let end = i + 1;
        let totalW = columns[i].maxW;
        let align = columns[i].align;
        while (row[end] === null) {
          totalW += columns[end].maxW + gap.length;
          ++end;
        }
        let cell = row[i];
        if (Array.isArray(cell)) {
          align = cell[0];
          cell = cell[1];
        }
        if (align === 'r') {
          outputRow.push(cell.padStart(totalW, ' '));
        } else {
          outputRow.push(cell.padEnd(totalW, ' '));
        }
        i = end;
      }
    }
    outputRow.push('\n');
    output.push(outputRow.join(''));
  }
  return output.join('');
}
