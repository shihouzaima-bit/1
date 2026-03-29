import { useState, useEffect, useCallback } from 'react';
import { Card, GameStatus, Suit, Rank } from '../types';
import { createDeck, shuffle } from '../constants';

export const useCrazyEights = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [currentSuit, setCurrentSuit] = useState<Suit | null>(null);
  const [status, setStatus] = useState<GameStatus>('waiting');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [turnCount, setTurnCount] = useState(0);

  const startNewGame = useCallback(() => {
    const newDeck = shuffle(createDeck());
    const initialPlayerHand = newDeck.splice(0, 8);
    const initialAiHand = newDeck.splice(0, 8);
    const firstDiscard = newDeck.pop()!;
    
    setDeck(newDeck);
    setPlayerHand(initialPlayerHand);
    setAiHand(initialAiHand);
    setDiscardPile([firstDiscard]);
    setCurrentSuit(firstDiscard.suit);
    setStatus('player_turn');
    setWinner(null);
    setTurnCount(0);
  }, []);

  const isPlayable = useCallback((card: Card) => {
    if (card.rank === '8') return true;
    const topCard = discardPile[discardPile.length - 1];
    if (!topCard) return false;
    return card.suit === currentSuit || card.rank === topCard.rank;
  }, [discardPile, currentSuit]);

  const playCard = useCallback((card: Card, isPlayer: boolean, newSuit?: Suit) => {
    if (isPlayer) {
      setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setAiHand(prev => prev.filter(c => c.id !== card.id));
    }

    setDiscardPile(prev => [...prev, card]);
    
    if (card.rank === '8') {
      if (newSuit) {
        setCurrentSuit(newSuit);
        setStatus(isPlayer ? 'ai_turn' : 'player_turn');
      } else {
        setStatus('selecting_suit');
      }
    } else {
      setCurrentSuit(card.suit);
      setStatus(isPlayer ? 'ai_turn' : 'player_turn');
    }

    setTurnCount(prev => prev + 1);
  }, []);

  const drawCard = useCallback((isPlayer: boolean) => {
    if (deck.length === 0) {
      // If deck is empty, skip turn
      setStatus(isPlayer ? 'ai_turn' : 'player_turn');
      return;
    }

    const newDeck = [...deck];
    const drawnCard = newDeck.pop()!;
    setDeck(newDeck);

    if (isPlayer) {
      setPlayerHand(prev => [...prev, drawnCard]);
      // After drawing, check if the drawn card is playable. 
      // If not, it's still AI's turn next? 
      // In some variations, you can play it immediately if it matches.
      // For simplicity, drawing ends the turn if not playable.
      if (!isPlayable(drawnCard)) {
        setStatus('ai_turn');
      }
    } else {
      setAiHand(prev => [...prev, drawnCard]);
      if (!isPlayable(drawnCard)) {
        setStatus('player_turn');
      }
    }
  }, [deck, isPlayable]);

  // AI Logic
  useEffect(() => {
    if (status === 'ai_turn' && !winner) {
      const timer = setTimeout(() => {
        const playableCards = aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          // AI Strategy: Prefer non-8 cards first
          const nonEight = playableCards.find(c => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === '8') {
            // AI picks its most frequent suit
            const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            aiHand.forEach(c => { if (c.id !== cardToPlay.id) suitCounts[c.suit]++; });
            const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            playCard(cardToPlay, false, bestSuit);
          } else {
            playCard(cardToPlay, false);
          }
        } else {
          drawCard(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, aiHand, isPlayable, playCard, drawCard, winner]);

  // Win condition check
  useEffect(() => {
    if (playerHand.length === 0 && status !== 'waiting' && !winner) {
      setWinner('player');
      setStatus('game_over');
    } else if (aiHand.length === 0 && status !== 'waiting' && !winner) {
      setWinner('ai');
      setStatus('game_over');
    }
  }, [playerHand.length, aiHand.length, status, winner]);

  return {
    deck,
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
  };
};
