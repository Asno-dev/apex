'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare: boolean;
  size: number;
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  isWinningSquare,
  size,
}) => {
  const squareSizeClass = size === 3 ? 'w-24 h-24 text-5xl' : 'w-16 h-16 text-3xl';
  const winningClass = isWinningSquare ? 'bg-indigo-600/70 text-white' : 'hover:bg-zinc-800/50';

  return (
    <motion.button
      type="button"
      className={cn(
        "flex items-center justify-center font-bold rounded-lg transition-colors duration-200 ease-in-out",
        "border border-zinc-700 text-zinc-200",
        squareSizeClass,
        winningClass,
        value === 'X' && 'text-indigo-400',
        value === 'O' && 'text-emerald-400'
      )}
      onClick={onClick}
      disabled={value !== null}
      whileHover={{ scale: value === null ? 1.05 : 1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {value && (
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
};

export default Square;
