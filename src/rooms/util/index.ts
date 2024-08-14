export function checkWinner(cells: string[]) {
  const offsets = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (let offset of offsets) {
    const [a, b, c] = offset;
    if (cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return undefined;
}

export function checkForDraw(cells: string[]) {
  let winner = checkWinner(cells);
  if (!winner && isBoardFull(cells)) {
    return true;
  }
  return false;
}

export function isBoardFull(cells: string[]) {
  return cells.every((cell) => cell !== null);
}
