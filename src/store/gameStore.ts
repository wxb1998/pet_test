import type { GameState, MonsterInstance, Rune, RuneSlot, RuneMainStat, DungeonType, Element } from '../types';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { createMonsterInstance, computeStats, generateId, chance, randomInt } from '../utils/helpers';
import { BattleEngine, createBattleUnit, createEnemyUnit } from '../engine/BattleEngine';
import { getDungeonFloor } from '../data/dungeons';

const SAVE_KEY = 'sw_idle_save';

// Initial game state
function createInitialState(): GameState {
  // Give player some starter monsters
  const starters = [
    createMonsterInstance('fran_light', 25, 4),      // Fran
    createMonsterInstance('loren_light', 25, 4),      // Loren
    createMonsterInstance('bernard_wind', 20, 3),     // Bernard
    createMonsterInstance('shannon_wind', 20, 3),     // Shannon
    createMonsterInstance('belladeon_light', 25, 4),  // Belladeon
    createMonsterInstance('konamiya_water', 20, 3),   // Konamiya
  ];

  return {
    player: {
      name: '召唤师',
      level: 1,
      experience: 0,
      mana: 50000,
      crystals: 500,
      energy: 90,
      maxEnergy: 90,
      arenaScore: 1000,
      lastEnergyRefresh: Date.now(),
    },
    monsters: starters,
    runes: [],
    inventory: {
      mysticalScrolls: 10,
      elementalScrolls: { fire: 3, water: 3, wind: 3 },
      legendaryScrolls: 1,
      devilmons: 3,
      angelmons: { fire: 0, water: 0, wind: 0, light: 0, dark: 0 },
    },
    dungeonProgress: {},
    arenaDefense: [],
    idleProgress: {
      runsCompleted: 0,
      totalManaEarned: 0,
      runesDropped: 0,
    },
    settings: {
      language: 'zh',
      battleSpeed: 1,
      autoSell: { enabled: false, minStars: 4 },
    },
  };
}

export type GameAction =
  | { type: 'SUMMON'; scrollType: 'mystical' | 'fire' | 'water' | 'wind' | 'legendary' }
  | { type: 'LEVEL_UP_MONSTER'; monsterId: string; amount: number }
  | { type: 'STAR_UP_MONSTER'; monsterId: string }
  | { type: 'AWAKEN_MONSTER'; monsterId: string }
  | { type: 'EQUIP_RUNE'; monsterId: string; rune: Rune }
  | { type: 'UNEQUIP_RUNE'; monsterId: string; slot: RuneSlot }
  | { type: 'UPGRADE_RUNE'; runeId: string }
  | { type: 'SELL_RUNE'; runeId: string }
  | { type: 'START_DUNGEON'; dungeon: DungeonType; floor: number; team: string[] }
  | { type: 'COMPLETE_DUNGEON_RUN'; dungeon: DungeonType; floor: number; victory: boolean; mana: number; rune?: Rune }
  | { type: 'START_IDLE'; dungeon: DungeonType; floor: number }
  | { type: 'STOP_IDLE' }
  | { type: 'COLLECT_IDLE_REWARDS' }
  | { type: 'ARENA_ATTACK'; team: string[] }
  | { type: 'SET_ARENA_DEFENSE'; team: string[] }
  | { type: 'USE_CRYSTALS'; amount: number; purpose: string }
  | { type: 'REFRESH_ENERGY' }
  | { type: 'SET_LANGUAGE'; language: 'zh' | 'en' }
  | { type: 'SET_BATTLE_SPEED'; speed: 1 | 2 | 3 }
  | { type: 'TICK_ENERGY' }
  | { type: 'LOAD_SAVE'; state: GameState }
  | { type: 'RESET_GAME' };

// Game Store class
export class GameStore {
  private state: GameState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadSave() || createInitialState();
    // Start energy regen timer
    this.startEnergyTimer();
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private setState(newState: GameState) {
    this.state = newState;
    this.notify();
    this.autoSave();
  }

  // Save/Load
  private autoSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  private loadSave(): GameState | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as GameState;
        // Recompute stats for all monsters
        for (const mon of state.monsters) {
          mon.computedStats = computeStats(mon);
        }
        return state;
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return null;
  }

  exportSave(): string {
    return btoa(JSON.stringify(this.state));
  }

  importSave(data: string): boolean {
    try {
      const state = JSON.parse(atob(data)) as GameState;
      this.setState(state);
      return true;
    } catch {
      return false;
    }
  }

  // Energy regen: 1 per 5 minutes
  private startEnergyTimer() {
    setInterval(() => {
      this.dispatch({ type: 'TICK_ENERGY' });
    }, 60000); // Check every minute
  }

  // Main dispatch
  dispatch(action: GameAction) {
    const s = { ...this.state };

    switch (action.type) {
      case 'SUMMON':
        this.handleSummon(s, action.scrollType);
        break;

      case 'LEVEL_UP_MONSTER': {
        const mon = s.monsters.find(m => m.id === action.monsterId);
        if (mon) {
          const maxLevel = mon.stars * 5 + 10; // e.g., 6* = 40
          mon.level = Math.min(maxLevel, mon.level + action.amount);
          mon.computedStats = computeStats(mon);
        }
        break;
      }

      case 'STAR_UP_MONSTER': {
        const mon = s.monsters.find(m => m.id === action.monsterId);
        if (mon && mon.stars < 6) {
          mon.stars++;
          mon.level = 1;
          mon.computedStats = computeStats(mon);
        }
        break;
      }

      case 'AWAKEN_MONSTER': {
        const mon = s.monsters.find(m => m.id === action.monsterId);
        if (mon) {
          mon.awakened = true;
          mon.computedStats = computeStats(mon);
        }
        break;
      }

      case 'EQUIP_RUNE': {
        const mon = s.monsters.find(m => m.id === action.monsterId);
        if (mon) {
          // Unequip from previous monster if needed
          if (action.rune.equippedTo) {
            const prevMon = s.monsters.find(m => m.id === action.rune.equippedTo);
            if (prevMon) {
              delete prevMon.runes[action.rune.slot];
              prevMon.computedStats = computeStats(prevMon);
            }
          }
          action.rune.equippedTo = mon.id;
          mon.runes[action.rune.slot] = action.rune;
          mon.computedStats = computeStats(mon);
        }
        break;
      }

      case 'UNEQUIP_RUNE': {
        const mon = s.monsters.find(m => m.id === action.monsterId);
        if (mon && mon.runes[action.slot]) {
          const rune = mon.runes[action.slot]!;
          rune.equippedTo = undefined;
          delete mon.runes[action.slot];
          mon.computedStats = computeStats(mon);
          s.player.mana -= 25000; // unequip cost
        }
        break;
      }

      case 'UPGRADE_RUNE': {
        const rune = this.findRune(s, action.runeId);
        if (rune && rune.level < 15) {
          const cost = this.getRuneUpgradeCost(rune);
          if (s.player.mana >= cost) {
            s.player.mana -= cost;
            if (chance(this.getRuneUpgradeChance(rune.level))) {
              rune.level++;
              this.upgradeRuneStats(rune);
              // Recompute if equipped
              if (rune.equippedTo) {
                const mon = s.monsters.find(m => m.id === rune.equippedTo);
                if (mon) mon.computedStats = computeStats(mon);
              }
            }
          }
        }
        break;
      }

      case 'SELL_RUNE': {
        const rune = this.findRune(s, action.runeId);
        if (rune) {
          const sellPrice = (rune.stars * 2000 + rune.level * 500);
          s.player.mana += sellPrice;
          if (rune.equippedTo) {
            const mon = s.monsters.find(m => m.id === rune.equippedTo);
            if (mon) {
              delete mon.runes[rune.slot];
              mon.computedStats = computeStats(mon);
            }
          }
          s.runes = s.runes.filter(r => r.id !== action.runeId);
        }
        break;
      }

      case 'COMPLETE_DUNGEON_RUN': {
        s.player.mana += action.mana;
        if (action.rune) {
          s.runes.push(action.rune);
        }
        if (action.victory) {
          const current = s.dungeonProgress[action.dungeon] || 0;
          s.dungeonProgress[action.dungeon] = Math.max(current, action.floor);
          s.idleProgress.runsCompleted++;
          s.idleProgress.totalManaEarned += action.mana;
          if (action.rune) s.idleProgress.runesDropped++;
        }
        break;
      }

      case 'START_IDLE': {
        s.idleProgress.currentDungeon = action.dungeon;
        s.idleProgress.currentFloor = action.floor;
        s.idleProgress.startTime = Date.now();
        break;
      }

      case 'STOP_IDLE': {
        s.idleProgress.currentDungeon = undefined;
        s.idleProgress.currentFloor = undefined;
        s.idleProgress.startTime = undefined;
        break;
      }

      case 'REFRESH_ENERGY': {
        if (s.player.crystals >= 30) {
          s.player.crystals -= 30;
          s.player.energy = Math.min(s.player.maxEnergy + 90, s.player.energy + 90);
        }
        break;
      }

      case 'SET_ARENA_DEFENSE': {
        s.arenaDefense = action.team;
        break;
      }

      case 'TICK_ENERGY': {
        const now = Date.now();
        const elapsed = now - s.player.lastEnergyRefresh;
        const energyGained = Math.floor(elapsed / 300000); // 1 per 5 min
        if (energyGained > 0) {
          s.player.energy = Math.min(s.player.maxEnergy, s.player.energy + energyGained);
          s.player.lastEnergyRefresh = now;
        }
        break;
      }

      case 'SET_LANGUAGE':
        s.settings.language = action.language;
        break;

      case 'SET_BATTLE_SPEED':
        s.settings.battleSpeed = action.speed;
        break;

      case 'LOAD_SAVE':
        this.setState(action.state);
        return;

      case 'RESET_GAME':
        this.setState(createInitialState());
        return;
    }

    this.setState(s);
  }

  // Summoning system
  private handleSummon(s: GameState, scrollType: string) {
    let element: Element | undefined;
    let hasScroll = false;

    switch (scrollType) {
      case 'mystical':
        if (s.inventory.mysticalScrolls > 0) {
          s.inventory.mysticalScrolls--;
          hasScroll = true;
        }
        break;
      case 'fire':
        if (s.inventory.elementalScrolls.fire > 0) {
          s.inventory.elementalScrolls.fire--;
          element = 'fire';
          hasScroll = true;
        }
        break;
      case 'water':
        if (s.inventory.elementalScrolls.water > 0) {
          s.inventory.elementalScrolls.water--;
          element = 'water';
          hasScroll = true;
        }
        break;
      case 'wind':
        if (s.inventory.elementalScrolls.wind > 0) {
          s.inventory.elementalScrolls.wind--;
          element = 'wind';
          hasScroll = true;
        }
        break;
      case 'legendary':
        if (s.inventory.legendaryScrolls > 0) {
          s.inventory.legendaryScrolls--;
          hasScroll = true;
        }
        break;
    }

    if (!hasScroll) return;

    // Determine star rating (rates faithful to SW)
    let stars: number;
    if (scrollType === 'legendary') {
      stars = chance(0.065) ? 5 : 4; // 6.5% nat 5 from legendary
    } else {
      const roll = Math.random();
      if (roll < 0.005) stars = 5;       // 0.5% nat 5
      else if (roll < 0.085) stars = 4;  // 8% nat 4
      else stars = 3;                     // 91.5% nat 3
    }

    // Filter templates by star rating and element
    let candidates = MONSTER_TEMPLATES.filter(t =>
      t.naturalStars === stars &&
      t.id.indexOf('boss') === -1 // exclude bosses
    );

    if (element) {
      const elementCandidates = candidates.filter(t => t.element === element);
      if (elementCandidates.length > 0) candidates = elementCandidates;
    }

    if (candidates.length === 0) {
      // Fallback - get any monster of that star level
      candidates = MONSTER_TEMPLATES.filter(t => t.naturalStars <= stars && t.id.indexOf('boss') === -1);
    }

    if (candidates.length === 0) return;

    const template = candidates[randomInt(0, candidates.length - 1)];
    const instance = createMonsterInstance(template.id, 1, template.naturalStars);
    s.monsters.push(instance);
  }

  // Run a dungeon battle
  runDungeonBattle(team: string[], dungeon: DungeonType, floor: number): {
    engine: BattleEngine;
    victory: boolean;
    rewards: { mana: number; rune?: Rune; exp: number };
  } {
    const s = this.state;
    const floorData = getDungeonFloor(dungeon, floor);

    if (!floorData) {
      return {
        engine: new BattleEngine([], []),
        victory: false,
        rewards: { mana: 0, exp: 0 },
      };
    }

    // Create ally units
    const allies = team
      .map(id => s.monsters.find(m => m.id === id))
      .filter((m): m is MonsterInstance => !!m)
      .map(m => createBattleUnit(m, true));

    // Create enemy units
    const enemies = [
      ...floorData.enemies.map(e => createEnemyUnit(e.templateId, e.level, e.stars)),
      createEnemyUnit(floorData.boss.templateId, floorData.boss.level, floorData.boss.stars),
    ];

    const engine = new BattleEngine(allies, enemies);
    const result = engine.runFullBattle();

    const victory = result.status === 'victory';
    const rewards = {
      mana: victory ? randomInt(floorData.rewards.mana[0], floorData.rewards.mana[1]) : Math.floor(randomInt(floorData.rewards.mana[0], floorData.rewards.mana[1]) * 0.2),
      rune: victory ? this.generateRuneDrop(floorData) : undefined,
      exp: victory ? floorData.rewards.expPerMon : Math.floor(floorData.rewards.expPerMon * 0.3),
    };

    return { engine, victory, rewards };
  }

  // Generate a random rune drop from dungeon
  private generateRuneDrop(floorData: any): Rune | undefined {
    if (!chance(0.6)) return undefined; // 60% chance to drop

    const stars = floorData.rewards.runeStars[randomInt(0, floorData.rewards.runeStars.length - 1)] as 1 | 2 | 3 | 4 | 5 | 6;
    const set = floorData.rewards.runeSets[randomInt(0, floorData.rewards.runeSets.length - 1)];
    const slot = randomInt(1, 6) as RuneSlot;

    const mainStatOptions = this.getMainStatOptions(slot);
    const mainType = mainStatOptions[randomInt(0, mainStatOptions.length - 1)];
    const mainValue = this.getMainStatValue(mainType, stars, 0);

    // Generate sub stats (0-4 initial)
    const numSubs = Math.min(4, Math.max(0, stars - 2 + (chance(0.3) ? 1 : 0)));
    const subStats = [];
    const usedTypes = new Set([mainType]);

    for (let i = 0; i < numSubs; i++) {
      const subOptions = this.getSubStatOptions().filter(t => !usedTypes.has(t));
      if (subOptions.length === 0) break;
      const subType = subOptions[randomInt(0, subOptions.length - 1)];
      usedTypes.add(subType);
      subStats.push({
        type: subType,
        value: this.getSubStatValue(subType, stars),
      });
    }

    return {
      id: generateId(),
      set,
      slot,
      stars,
      level: 0,
      mainStat: { type: mainType, value: mainValue },
      subStats,
    };
  }

  private getMainStatOptions(slot: RuneSlot): RuneMainStat[] {
    switch (slot) {
      case 1: return ['atk_flat'];
      case 2: return ['atk_percent', 'hp_percent', 'def_percent', 'spd'];
      case 3: return ['def_flat'];
      case 4: return ['atk_percent', 'hp_percent', 'def_percent', 'crit_rate', 'crit_dmg'];
      case 5: return ['hp_flat'];
      case 6: return ['atk_percent', 'hp_percent', 'def_percent', 'resistance', 'accuracy'];
      default: return ['atk_percent'];
    }
  }

  private getSubStatOptions(): RuneMainStat[] {
    return ['hp_flat', 'hp_percent', 'atk_flat', 'atk_percent', 'def_flat', 'def_percent', 'spd', 'crit_rate', 'crit_dmg', 'resistance', 'accuracy'];
  }

  private getMainStatValue(type: string, stars: number, level: number): number {
    const base: Record<string, number> = {
      hp_flat: 100 * stars, atk_flat: 10 * stars, def_flat: 10 * stars,
      hp_percent: 4 + stars, atk_percent: 4 + stars, def_percent: 4 + stars,
      spd: 2 + stars, crit_rate: 3 + stars, crit_dmg: 4 + stars * 2,
      resistance: 4 + stars, accuracy: 4 + stars,
    };
    const growth: Record<string, number> = {
      hp_flat: 60 * stars, atk_flat: 6 * stars, def_flat: 6 * stars,
      hp_percent: 3, atk_percent: 3, def_percent: 3,
      spd: 2, crit_rate: 3, crit_dmg: 4,
      resistance: 3, accuracy: 3,
    };
    return (base[type] || 5) + Math.floor((growth[type] || 2) * level / 3);
  }

  private getSubStatValue(type: string, stars: number): number {
    const ranges: Record<string, [number, number]> = {
      hp_flat: [80, 400], hp_percent: [3, 8], atk_flat: [5, 20],
      atk_percent: [3, 8], def_flat: [5, 20], def_percent: [3, 8],
      spd: [2, 6], crit_rate: [2, 6], crit_dmg: [3, 7],
      resistance: [3, 8], accuracy: [3, 8],
    };
    const range = ranges[type] || [1, 5];
    const mult = Math.max(0.5, stars / 6);
    return Math.floor(randomInt(range[0], range[1]) * mult);
  }

  private findRune(s: GameState, runeId: string): Rune | undefined {
    // Check in inventory
    let rune = s.runes.find(r => r.id === runeId);
    if (rune) return rune;
    // Check equipped on monsters
    for (const mon of s.monsters) {
      for (const slot of [1, 2, 3, 4, 5, 6] as RuneSlot[]) {
        if (mon.runes[slot]?.id === runeId) return mon.runes[slot];
      }
    }
    return undefined;
  }

  private getRuneUpgradeCost(rune: Rune): number {
    return Math.floor((500 + rune.level * 1000) * (1 + rune.stars * 0.3));
  }

  private getRuneUpgradeChance(level: number): number {
    if (level < 3) return 1.0;
    if (level < 6) return 0.85;
    if (level < 9) return 0.7;
    if (level < 12) return 0.5;
    return 0.35;
  }

  private upgradeRuneStats(rune: Rune) {
    // Increase main stat
    const growth = this.getMainStatValue(rune.mainStat.type, rune.stars, rune.level) - this.getMainStatValue(rune.mainStat.type, rune.stars, rune.level - 1);
    rune.mainStat.value += Math.max(1, growth);

    // Every 3 levels, add or upgrade a sub stat
    if (rune.level % 3 === 0) {
      if (rune.subStats.length < 4) {
        // Add new sub stat
        const usedTypes = new Set([rune.mainStat.type, ...rune.subStats.map(s => s.type)]);
        const options = this.getSubStatOptions().filter((t) => !usedTypes.has(t));
        if (options.length > 0) {
          const type = options[randomInt(0, options.length - 1)];
          rune.subStats.push({ type, value: this.getSubStatValue(type, rune.stars) });
        }
      } else {
        // Upgrade random existing sub
        const idx = randomInt(0, rune.subStats.length - 1);
        rune.subStats[idx].value += this.getSubStatValue(rune.subStats[idx].type, rune.stars);
      }
    }
  }
}

// Singleton
export const gameStore = new GameStore();
