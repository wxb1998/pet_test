import type { BattleUnit, StatusEffect, Skill } from '../types';

export type GameEventType =
  | 'battle_start'
  | 'battle_end'
  | 'turn_start'
  | 'turn_end'
  | 'damage_dealt'
  | 'damage_taken'
  | 'monster_killed'
  | 'monster_revived'
  | 'buff_applied'
  | 'debuff_applied'
  | 'skill_used'
  | 'monster_summoned'
  | 'monster_evolved'
  | 'rune_equipped'
  | 'rune_upgraded'
  | 'dungeon_started'
  | 'dungeon_completed';

export interface BattleStartEvent {
  allies: BattleUnit[];
  enemies: BattleUnit[];
  timestamp: number;
}

export interface BattleEndEvent {
  status: 'victory' | 'defeat';
  allies: BattleUnit[];
  enemies: BattleUnit[];
  timestamp: number;
}

export interface TurnStartEvent {
  actor: BattleUnit;
  timestamp: number;
}

export interface TurnEndEvent {
  actor: BattleUnit;
  timestamp: number;
}

export interface DamageDealtEvent {
  source: BattleUnit;
  target: BattleUnit;
  damage: number;
  isCrit: boolean;
  timestamp: number;
}

export interface DamageTakenEvent {
  target: BattleUnit;
  source: BattleUnit;
  damage: number;
  timestamp: number;
}

export interface MonsterKilledEvent {
  victim: BattleUnit;
  killer: BattleUnit;
  timestamp: number;
}

export interface MonsterRevivedEvent {
  target: BattleUnit;
  source: BattleUnit;
  hpPercent: number;
  timestamp: number;
}

export interface BuffAppliedEvent {
  target: BattleUnit;
  buff: StatusEffect;
  source?: BattleUnit;
  timestamp: number;
}

export interface DebuffAppliedEvent {
  target: BattleUnit;
  debuff: StatusEffect;
  source?: BattleUnit;
  timestamp: number;
}

export interface SkillUsedEvent {
  source: BattleUnit;
  skill: Skill;
  targets: BattleUnit[];
  timestamp: number;
}

export interface MonsterSummonedEvent {
  templateId: string;
  stars: number;
  timestamp: number;
}

export interface MonsterEvolvedEvent {
  monsterId: string;
  previousStars: number;
  newStars: number;
  timestamp: number;
}

export interface RuneEquippedEvent {
  monsterId: string;
  runeId: string;
  slot: number;
  timestamp: number;
}

export interface RuneUpgradedEvent {
  runeId: string;
  previousLevel: number;
  newLevel: number;
  timestamp: number;
}

export interface DungeonStartedEvent {
  dungeonType: string;
  floor: number;
  team: string[];
  timestamp: number;
}

export interface DungeonCompletedEvent {
  dungeonType: string;
  floor: number;
  victory: boolean;
  rewards: { mana: number; runesDropped: number };
  timestamp: number;
}

export type GameEventData =
  | BattleStartEvent
  | BattleEndEvent
  | TurnStartEvent
  | TurnEndEvent
  | DamageDealtEvent
  | DamageTakenEvent
  | MonsterKilledEvent
  | MonsterRevivedEvent
  | BuffAppliedEvent
  | DebuffAppliedEvent
  | SkillUsedEvent
  | MonsterSummonedEvent
  | MonsterEvolvedEvent
  | RuneEquippedEvent
  | RuneUpgradedEvent
  | DungeonStartedEvent
  | DungeonCompletedEvent;

export type EventHandler<T extends GameEventData = GameEventData> = (data: T) => void;

export class EventBus {
  private listeners: Map<GameEventType, Set<EventHandler>> = new Map();

  constructor() {
    // Initialize listeners map for all event types
    const eventTypes: GameEventType[] = [
      'battle_start', 'battle_end', 'turn_start', 'turn_end',
      'damage_dealt', 'damage_taken', 'monster_killed', 'monster_revived',
      'buff_applied', 'debuff_applied', 'skill_used',
      'monster_summoned', 'monster_evolved',
      'rune_equipped', 'rune_upgraded',
      'dungeon_started', 'dungeon_completed',
    ];
    eventTypes.forEach(type => this.listeners.set(type, new Set()));
  }

  on<T extends GameEventType>(eventType: T, handler: EventHandler): () => void {
    const handlers = this.listeners.get(eventType);
    if (!handlers) return () => {};

    handlers.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler);
    };
  }

  emit<T extends GameEventType>(eventType: T, data: GameEventData): void {
    const handlers = this.listeners.get(eventType);
    if (!handlers) return;

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }

  once<T extends GameEventType>(eventType: T, handler: EventHandler): () => void {
    const wrappedHandler = (data: GameEventData) => {
      handler(data);
      unsubscribe();
    };

    const unsubscribe = this.on(eventType, wrappedHandler as EventHandler);
    return unsubscribe;
  }

  clear(eventType?: GameEventType): void {
    if (eventType) {
      this.listeners.get(eventType)?.clear();
    } else {
      this.listeners.forEach(handlers => handlers.clear());
    }
  }

  listenerCount(eventType: GameEventType): number {
    return this.listeners.get(eventType)?.size || 0;
  }
}
