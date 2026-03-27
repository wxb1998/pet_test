import { useSyncExternalStore, useCallback } from 'react';
import { gameStore } from './gameStore';
import type { GameAction } from './gameStore';
import type { GameState } from '../types';

export function useGameState(): GameState {
  return useSyncExternalStore(
    (cb) => gameStore.subscribe(cb),
    () => gameStore.getState()
  );
}

export function useDispatch() {
  return useCallback((action: GameAction) => {
    gameStore.dispatch(action);
  }, []);
}

export function useGameStore() {
  return gameStore;
}
