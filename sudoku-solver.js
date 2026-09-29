function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function generateUniqueCombinations(size, total) {
  const results = [];
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function backtrack(start, remaining, current) {
    if (current.length === size) {
      if (remaining === 0) {
        results.push([...current]);
      }
      return;
    }

    for (let i = start; i < digits.length; i++) {
      const value = digits[i];
      if (value > remaining) break;
      current.push(value);
      backtrack(i + 1, remaining - value, current);
      current.pop();
    }
  }

  backtrack(0, total, []);
  return results;
}

function getPermutations(arr) {
  const results = [];
  function permute(current, remaining) {
    if (remaining.length === 0) {
      results.push([...current]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = [...remaining];
      const value = next.splice(i, 1)[0];
      current.push(value);
      permute(current, next);
      current.pop();
    }
  }
  permute([], arr);
  return results;
}

function cageCandidates(cage, board) {
  const size = cage.cells.length;
  const total = cage.total;
  const combos = generateUniqueCombinations(size, total);
  const valid = [];

  for (const combo of combos) {
    for (const permutation of getPermutations(combo)) {
      let ok = true;
      for (let i = 0; i < cage.cells.length; i++) {
        const [r, c] = cage.cells[i];
        const existing = board[r][c];
        if (existing !== 0 && existing !== permutation[i]) {
          ok = false;
          break;
        }
      }
      if (ok) valid.push(permutation);
    }
  }

  return valid;
}

function isValidStandard(board) {
  for (let r = 0; r < 9; r++) {
    const rowSet = new Set();
    for (let c = 0; c < 9; c++) {
      const value = board[r][c];
      if (value === 0) continue;
      if (rowSet.has(value)) return false;
      rowSet.add(value);
    }
  }

  for (let c = 0; c < 9; c++) {
    const colSet = new Set();
    for (let r = 0; r < 9; r++) {
      const value = board[r][c];
      if (value === 0) continue;
      if (colSet.has(value)) return false;
      colSet.add(value);
    }
  }

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const boxSet = new Set();
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const value = board[r][c];
          if (value === 0) continue;
          if (boxSet.has(value)) return false;
          boxSet.add(value);
        }
      }
    }
  }

  return true;
}

function assignCellCandidates(board, cages, row, col) {
  const basic = [];
  for (let value = 1; value <= 9; value++) {
    if (board[row][col] !== 0) return [];

    const rowHas = board[row].includes(value);
    const colHas = board.some((r) => r[col] === value);
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    let boxHas = false;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r === row && c === col) continue;
        if (board[r][c] === value) {
          boxHas = true;
        }
      }
    }

    if (rowHas || colHas || boxHas) continue;

    basic.push(value);
  }

  const cage = cages.find((item) => item.cells.some(([r, c]) => r === row && c === col));
  if (!cage) return basic;

  const results = [];
  for (const value of basic) {
    const next = cloneBoard(board);
    next[row][col] = value;
    const possible = cageCandidates(cage, next);
    if (possible.length > 0) results.push(value);
  }

  return results;
}

function findNextCell(board, cages) {
  let best = null;
  let bestOptions = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const options = assignCellCandidates(board, cages, r, c);
      if (bestOptions === null || options.length < bestOptions.length) {
        best = { r, c };
        bestOptions = options;
      }
      if (options.length === 1) return best;
    }
  }

  return best;
}

function solveKillerSudoku(board, cages) {
  if (!isValidStandard(board)) return null;

  const nextCell = findNextCell(board, cages);
  if (!nextCell) return board;

  const { r, c } = nextCell;
  const options = assignCellCandidates(board, cages, r, c);

  for (const value of options) {
    const nextBoard = cloneBoard(board);
    nextBoard[r][c] = value;

    const solved = solveKillerSudoku(nextBoard, cages);
    if (solved) return solved;
  }

  return null;
}

function printBoard(board) {
  for (const row of board) console.log(row.join(' '));
}

const sampleSolved = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const samplePuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const sampleCages = [
  { cells: [[0, 0], [0, 1]], total: 8 },
  { cells: [[0, 2], [1, 2]], total: 11 },
  { cells: [[0, 3], [0, 4]], total: 13 },
  { cells: [[0, 5], [0, 6]], total: 17 },
  { cells: [[0, 7], [0, 8]], total: 17 },
  { cells: [[1, 0], [1, 1]], total: 10 },
  { cells: [[1, 3], [2, 3]], total: 15 },
  { cells: [[1, 4], [1, 5]], total: 14 },
  { cells: [[1, 6], [1, 7]], total: 10 },
  { cells: [[1, 8], [2, 8]], total: 13 },
  { cells: [[2, 0], [2, 1]], total: 9 },
  { cells: [[2, 2], [3, 2]], total: 8 },
  { cells: [[2, 4], [3, 4]], total: 12 },
  { cells: [[2, 5], [2, 6]], total: 10 },
  { cells: [[2, 7], [3, 7]], total: 13 },
  { cells: [[3, 0], [3, 1]], total: 12 },
  { cells: [[3, 3], [4, 3]], total: 13 },
  { cells: [[3, 5], [3, 6]], total: 10 },
  { cells: [[3, 8], [4, 8]], total: 9 },
  { cells: [[4, 0], [4, 1]], total: 6 },
  { cells: [[4, 2], [5, 2]], total: 13 },
  { cells: [[4, 4], [5, 4]], total: 8 },
  { cells: [[4, 5], [4, 6]], total: 11 },
  { cells: [[4, 7], [5, 7]], total: 8 },
  { cells: [[5, 0], [5, 1]], total: 8 },
  { cells: [[5, 3], [6, 3]], total: 10 },
  { cells: [[5, 5], [5, 6]], total: 12 },
  { cells: [[5, 8], [6, 8]], total: 10 },
  { cells: [[6, 0], [6, 1]], total: 8 },
  { cells: [[6, 2], [7, 2]], total: 11 },
  { cells: [[6, 4], [7, 4]], total: 9 },
  { cells: [[6, 5], [6, 6]], total: 11 },
  { cells: [[6, 7], [7, 7]], total: 7 },
  { cells: [[7, 0], [7, 1]], total: 11 },
  { cells: [[7, 3], [8, 3]], total: 8 },
  { cells: [[7, 5], [7, 6]], total: 15 },
  { cells: [[7, 8], [8, 8]], total: 16 },
  { cells: [[8, 0], [8, 1]], total: 7 },
  { cells: [[8, 2], [8, 4]], total: 15 },
  { cells: [[8, 5], [8, 6]], total: 13 },
  { cells: [[8, 7], [8, 8]], total: 16 }
];

if (typeof module !== 'undefined') {
  module.exports = { solveKillerSudoku, generateUniqueCombinations, printBoard };
}

const result = solveKillerSudoku(cloneBoard(samplePuzzle), sampleCages);
if (result) {
  console.log('Solved sample killer board:');
  printBoard(result);
} else {
  console.log('No solution for sample board.');
}
