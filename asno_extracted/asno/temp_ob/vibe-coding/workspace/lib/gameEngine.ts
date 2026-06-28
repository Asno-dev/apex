export type Board = (string | null)[];

export interface WinLine {
  combination: number[];
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'antidiagonal';
}

// Check win condition for 3x3 (3 in a row) or 5x5 (4 in a row)
export function checkWin(board: Board, size: number): { winner: string; line: number[] } | null {
  const winLength = size === 3 ? 3 : 4;

  // Helper to check if a line of length winLength is owned by one player
  const checkLine = (indices: number[]): string | null => {
    if (indices.length < winLength) return null;
    const first = board[indices[0]];
    if (!first) return null;
    for (let i = 1; i < indices.length; i++) {
      if (board[indices[i]] !== first) return null;
    }
    return first;
  };

  // Horizontal lines
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const indices = [];
      for (let i = 0; i < winLength; i++) {
        indices.push(r * size + (c + i));
      }
      const winner = checkLine(indices);
      if (winner) return { winner, line: indices };
    }
  }

  // Vertical lines
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const indices = [];
      for (let i = 0; i < winLength; i++) {
        indices.push((r + i) * size + c);
      }
      const winner = checkLine(indices);
      if (winner) return { winner, line: indices };
    }
  }

  // Diagonal lines (top-left to bottom-right)
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const indices = [];
      for (let i = 0; i < winLength; i++) {
        indices.push((r + i) * size + (c + i));
      }
      const winner = checkLine(indices);
      if (winner) return { winner, line: indices };
    }
  }

  // Antidiagonal lines (top-right to bottom-left)
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const indices = [];
      for (let i = 0; i < winLength; i++) {
        indices.push((r + i) * size + (c - i));
      }
      const winner = checkLine(indices);
      if (winner) return { winner, line: indices };
    }
  }

  return null;
}

export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, val, idx) => {
    if (val === null) acc.push(idx);
    return acc;
  }, []);
}

// Minimax for 3x3 board
function minimax(board: Board, depth: number, isMaximizing: boolean): number {
  const winResult = checkWin(board, 3);
  if (winResult) {
    return winResult.winner === 'O' ? 10 - depth : depth - 10;
  }
  if (getAvailableMoves(board).length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Heuristic evaluation for 5x5 board (depth-limited Alpha-Beta)
function evaluate5x5(board: Board): number {
  const size = 5;
  const winLength = 4;
  let score = 0;

  // Helper to score a line of length 4
  const scoreLine = (indices: number[]): number => {
    let xCount = 0;
    let oCount = 0;
    for (const idx of indices) {
      if (board[idx] === 'X') xCount++;
      else if (board[idx] === 'O') oCount++;
    }
    if (xCount > 0 && oCount > 0) return 0; // Blocked
    if (oCount === 4) return 10000;
    if (xCount === 4) return -10000;
    if (oCount === 3) return 500;
    if (xCount === 3) return -500;
    if (oCount === 2) return 50;
    if (xCount === 2) return -50;
    if (oCount === 1) return 5;
    if (xCount === 1) return -5;
    return 0;
  };

  // Evaluate all possible 4-in-a-row lines on 5x5 board
  // Horizontal
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      score += scoreLine([r * size + c, r * size + c + 1, r * size + c + 2, r * size + c + 3]);
    }
  }
  // Vertical
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      score += scoreLine([r * size + c, (r + 1) * size + c, (r + 2) * size + c, (r + 3) * size + c]);
    }
  }
  // Diagonal
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      score += scoreLine([r * size + c, (r + 1) * size + c + 1, (r + 2) * size + c + 2, (r + 3) * size + c + 3]);
    }
  }
  // Antidiagonal
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      score += scoreLine([r * size + c, (r + 1) * size + c - 1, (r + 2) * size + c - 2, (r + 3) * size + c - 3]);
    }
  }

  return score;
}

// Alpha-Beta Pruning for 5x5
function alphaBeta(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  const winResult = checkWin(board, 5);
  if (winResult) {
    return winResult.winner === 'O' ? 100000 - depth : depth - 100000;
  }
  if (depth >= 3 || getAvailableMoves(board).length === 0) {
    return evaluate5x5(board);
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = alphaBeta(board, depth + 1, alpha, beta, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = alphaBeta(board, depth + 1, alpha, beta, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  }
}

// Main AI Move Selector
export function getAIMove(board: Board, size: number, difficulty: string): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // 1. Easy Difficulty: Pure Random
  if (difficulty === 'easy') {
    return available[Math.floor(Math.random() * available.length)];
  }

  // 2. Medium Difficulty: 50% optimal, 50% random
  if (difficulty === 'medium' && Math.random() > 0.5) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // 3. Impossible or Medium (when choosing optimal move)
  if (size === 3) {
    let bestScore = -Infinity;
    let bestMove = available[0];
    for (const move of available) {
      board[move] = 'O';
      const score = minimax(board, 0, false);
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  } else {
    // 5x5 Board with Alpha-Beta
    let bestScore = -Infinity;
    let bestMove = available[0];
    for (const move of available) {
      board[move] = 'O';
      const score = alphaBeta(board, 0, -Infinity, Infinity, false);
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }
}

// Chaos Mode Modifiers
export interface ChaosModifier {
  id: string;
  name: string;
  description: string;
  effect: (board: Board, size: number) => { board: Board; message: string };
}

export const CHAOS_MODIFIERS: ChaosModifier[] = [
  {
    id: 'rotate',
    name: 'Grid Rotation 🌀',
    description: 'Rotates the entire board 90 degrees clockwise!',
    effect: (board, size) => {
      const newBoard = new Array(board.length).fill(null);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const oldIdx = r * size + c;
          const newIdx = c * size + (size - 1 - r);
          newBoard[newIdx] = board[oldIdx];
        }
      }
      return { board: newBoard, message: 'The board rotated 90 degrees!' };
    }
  },
  {
    id: 'erase',
    name: 'Glitch Erase ⚡',
    description: 'A random cell on the board gets completely erased!',
    effect: (board) => {
      const filled = board.reduce<number[]>((acc, val, idx) => {
        if (val !== null) acc.push(idx);
        return acc;
      }, []);
      if (filled.length === 0) return { board, message: 'Glitch Erase had no effect!' };
      const target = filled[Math.floor(Math.random() * filled.length)];
      const newBoard = [...board];
      const oldVal = newBoard[target];
      newBoard[target] = null;
      return { board: newBoard, message: `A cell with '${oldVal}' was erased!` };
    }
  },
  {
    id: 'swap',
    name: 'Quantum Swap ⚛️',
    description: 'Swaps the position of two random non-empty cells!',
    effect: (board) => {
      const filled = board.reduce<number[]>((acc, val, idx) => {
        if (val !== null) acc.push(idx);
        return acc;
      }, []);
      if (filled.length < 2) return { board, message: 'Quantum Swap had no effect!' };
      const idx1 = filled[Math.floor(Math.random() * filled.length)];
      let idx2 = filled[Math.floor(Math.random() * filled.length)];
      while (idx1 === idx2) {
        idx2 = filled[Math.floor(Math.random() * filled.length)];
      }
      const newBoard = [...board];
      const temp = newBoard[idx1];
      newBoard[idx1] = newBoard[idx2];
      newBoard[idx2] = temp;
      return { board: newBoard, message: `Swapped cells at index ${idx1} and ${idx2}!` };
    }
  },
  {
    id: 'flip',
    name: 'Polarity Flip 🧲',
    description: 'Flips all Xs to Os and all Os to Xs on the board!',
    effect: (board) => {
      const newBoard = board.map(cell => {
        if (cell === 'X') return 'O';
        if (cell === 'O') return 'X';
        return null;
      });
      return { board: newBoard, message: 'All symbols flipped polarity!' };
    }
  }
];
