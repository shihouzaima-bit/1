import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { cn } from '../lib/utils';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isFaceUp = true,
  onClick,
  isPlayable = false,
  className,
}) => {
  const { suit, rank } = card;
  const colorClass = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        "relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg shadow-md flex flex-col justify-between p-2 cursor-default select-none transition-shadow",
        isFaceUp ? "bg-white" : "bg-blue-800 border-2 border-white",
        isPlayable && "cursor-pointer ring-2 ring-yellow-400 shadow-lg",
        className
      )}
    >
      {isFaceUp ? (
        <>
          <div className={cn("flex flex-col items-start leading-none", colorClass)}>
            <span className="text-lg sm:text-xl font-bold">{rank}</span>
            <span className="text-sm sm:text-base">{symbol}</span>
          </div>
          
          <div className={cn("absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl", colorClass)}>
            {symbol}
          </div>

          <div className={cn("flex flex-col items-end leading-none rotate-180 self-end", colorClass)}>
            <span className="text-lg sm:text-xl font-bold">{rank}</span>
            <span className="text-sm sm:text-base">{symbol}</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4/5 h-4/5 border border-white/20 rounded flex items-center justify-center">
            <div className="text-white/20 text-4xl">♠</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
