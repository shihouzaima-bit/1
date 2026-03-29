import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/Card';
import { useCrazyEights } from './hooks/useCrazyEights';
import { SUITS, SUIT_SYMBOLS, SUIT_COLORS } from './constants';
import { Suit, Card as CardType } from './types';
import { cn } from './lib/utils';
import { RotateCcw, Play, Trophy, User, Cpu, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const {
    playerHand,
    aiHand,
    discardPile,
    currentSuit,
    status,
    winner,
    startNewGame,
    playCard,
    drawCard,
    isPlayable,
    setCurrentSuit,
    setStatus
  } = useCrazyEights();

  const [showRules, setShowRules] = useState(false);
  const topDiscard = discardPile[discardPile.length - 1];

  useEffect(() => {
    if (winner === 'player') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [winner]);

  const handlePlayerPlay = (card: CardType) => {
    if (status !== 'player_turn') return;
    if (isPlayable(card)) {
      if (card.rank === '8') {
        playCard(card, true);
        setStatus('selecting_suit');
      } else {
        playCard(card, true);
      }
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    setCurrentSuit(suit);
    setStatus('ai_turn');
  };

  return (
    <div className="min-h-screen bg-emerald-900 text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">8</div>
          <h1 className="text-xl font-bold tracking-tight">Tina's Crazy Eights</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRules(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Rules"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={startNewGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Restart"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative p-4 flex flex-col items-center justify-center gap-8">
        {status === 'waiting' ? (
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-2"
            >
              <h2 className="text-4xl font-black italic">READY TO PLAY?</h2>
              <p className="text-emerald-200">Beat the AI in this classic card game.</p>
            </motion.div>
            <button 
              onClick={startNewGame}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-full shadow-xl transform active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Play fill="currentColor" size={20} />
              START GAME
            </button>
          </div>
        ) : (
          <>
            {/* AI Hand */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold uppercase tracking-widest">
                <Cpu size={16} />
                AI Opponent ({aiHand.length} cards)
              </div>
              <div className="flex flex-wrap justify-center -space-x-12 sm:-space-x-16">
                {aiHand.map((card, i) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    isFaceUp={false} 
                    className="scale-75 sm:scale-90 origin-top"
                    style={{ zIndex: i }}
                  />
                ))}
              </div>
            </div>

            {/* Center Area (Deck & Discard) */}
            <div className="flex items-center gap-8 sm:gap-16">
              {/* Draw Pile */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-yellow-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Card 
                    card={{} as CardType} 
                    isFaceUp={false} 
                    isPlayable={status === 'player_turn'}
                    onClick={() => drawCard(true)}
                    className="relative"
                  />
                  <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-emerald-900">
                    ?
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-tighter">Draw</span>
              </div>

              {/* Discard Pile */}
              <div className="flex flex-col items-center gap-2">
                <AnimatePresence mode="popLayout">
                  <Card 
                    key={topDiscard?.id}
                    card={topDiscard} 
                    className="shadow-2xl ring-4 ring-white/10"
                  />
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-tighter">Discard</span>
                  {currentSuit && (
                    <div className={cn("px-2 py-0.5 rounded bg-white/10 flex items-center gap-1", SUIT_COLORS[currentSuit])}>
                      <span className="text-sm">{SUIT_SYMBOLS[currentSuit]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Player Hand */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-widest">
                <User size={16} />
                Your Hand ({playerHand.length} cards)
              </div>
              <div className="flex flex-wrap justify-center -space-x-8 sm:-space-x-10 pb-4 overflow-x-auto max-w-full px-4">
                {playerHand.map((card, i) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    isPlayable={status === 'player_turn' && isPlayable(card)}
                    onClick={() => handlePlayerPlay(card)}
                    className="hover:z-50 transition-all"
                    style={{ zIndex: i }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Suit Selection Modal */}
      <AnimatePresence>
        {status === 'selecting_suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-800 p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center space-y-6"
            >
              <h3 className="text-2xl font-black italic text-yellow-500">CRAZY 8!</h3>
              <p className="text-emerald-100">Pick a new suit to continue the game.</p>
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map(suit => (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    className={cn(
                      "p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col items-center gap-2 group",
                      SUIT_COLORS[suit]
                    )}
                  >
                    <span className="text-4xl group-hover:scale-125 transition-transform">{SUIT_SYMBOLS[suit]}</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-emerald-800 p-12 rounded-[3rem] border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-md w-full text-center space-y-8"
            >
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">
                <Trophy size={48} className="text-black" />
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">
                  {winner === 'player' ? 'YOU WON!' : 'AI WON!'}
                </h2>
                <p className="text-emerald-200">
                  {winner === 'player' ? 'Incredible skills! You cleared your hand first.' : 'Better luck next time. The AI was faster.'}
                </p>
              </div>
              <button 
                onClick={startNewGame}
                className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 text-xl"
              >
                <RotateCcw size={24} />
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-emerald-900 p-8 rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-2xl font-black italic">GAME RULES</h3>
                <button onClick={() => setShowRules(false)} className="text-white/40 hover:text-white">✕</button>
              </div>
              <div className="space-y-4 text-emerald-100 text-sm leading-relaxed">
                <p><strong className="text-yellow-500">OBJECTIVE:</strong> Be the first to get rid of all your cards.</p>
                <div className="space-y-2">
                  <p><strong className="text-yellow-500">PLAYING:</strong> Match the top card of the discard pile by <span className="underline decoration-yellow-500/50">Suit</span> or <span className="underline decoration-yellow-500/50">Rank</span>.</p>
                  <p><strong className="text-yellow-500">CRAZY 8s:</strong> Eights are wild! Play them anytime and choose a new suit.</p>
                  <p><strong className="text-yellow-500">DRAWING:</strong> If you can't play, you must draw a card. If the deck is empty, you skip your turn.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
              >
                GOT IT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Status Bar */}
      <footer className="p-3 bg-black/40 text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400/60 flex justify-between items-center">
        <div className="flex gap-4">
          <span>DECK: {discardPile.length + playerHand.length + aiHand.length} / 52</span>
          <span>STATUS: {status.replace('_', ' ')}</span>
        </div>
        <div>TINA'S CRAZY EIGHTS v1.0</div>
      </footer>
    </div>
  );
}
