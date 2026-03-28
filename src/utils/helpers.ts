import type { BaseStats, MonsterInstance, MonsterTemplate, Rune, RuneSlot, RuneSet } from '../types';
import { RUNE_SET_BONUSES } from '../types';
import { MONSTER_TEMPLATES } from '../data/monsters';

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Get monster template by ID
export function getTemplate(templateId: string): MonsterTemplate | undefined {
  return MONSTER_TEMPLATES.find(m => m.id === templateId);
}

// Calculate level multiplier for stats
export function getLevelMultiplier(level: number, _maxLevel: number = 40): number {
  return 1 + (level - 1) * 0.05;
}

// Calculate star multiplier
export function getStarMultiplier(stars: number): number {
  const multipliers: Record<number, number> = { 1: 0.5, 2: 0.65, 3: 0.8, 4: 0.9, 5: 1.0, 6: 1.15 };
  return multipliers[stars] || 1;
}

// Get rune set counts for a monster
export function getRuneSetCounts(runes: { [slot in RuneSlot]?: Rune }): Record<RuneSet, number> {
  const counts = {} as Record<RuneSet, number>;
  for (const slot of [1, 2, 3, 4, 5, 6] as RuneSlot[]) {
    const rune = runes[slot];
    if (rune) {
      counts[rune.set] = (counts[rune.set] || 0) + 1;
    }
  }
  return counts;
}

// Calculate computed stats for a monster instance
export function computeStats(instance: MonsterInstance): BaseStats {
  const template = getTemplate(instance.templateId);
  if (!template) {
    return { hp: 0, atk: 0, def: 0, spd: 0, critRate: 15, critDmg: 50, resistance: 15, accuracy: 0 };
  }

  const base = { ...template.baseStats };
  const levelMult = getLevelMultiplier(instance.level);
  const starMult = getStarMultiplier(instance.stars);

  // Base stats with level and star scaling
  let hp = Math.floor(base.hp * levelMult * starMult);
  let atk = Math.floor(base.atk * levelMult * starMult);
  let def = Math.floor(base.def * levelMult * starMult);
  let spd = base.spd;
  let critRate = base.critRate;
  let critDmg = base.critDmg;
  let resistance = base.resistance;
  let accuracy = base.accuracy;

  // Awakening bonus: 10% HP, 10% ATK, 10% DEF, 5 SPD
  if (instance.awakened) {
    hp = Math.floor(hp * 1.1);
    atk = Math.floor(atk * 1.1);
    def = Math.floor(def * 1.1);
    spd += 5;
  }

  // Add rune stats
  let hpPercent = 0, atkPercent = 0, defPercent = 0;
  let hpFlat = 0, atkFlat = 0, defFlat = 0;

  for (const slot of [1, 2, 3, 4, 5, 6] as RuneSlot[]) {
    const rune = instance.runes[slot];
    if (!rune) continue;

    // Add main stat
    addRuneStat(rune.mainStat.type, rune.mainStat.value);

    // Add sub stats
    for (const sub of rune.subStats) {
      addRuneStat(sub.type, sub.value + (sub.grindValue || 0));
    }
  }

  function addRuneStat(type: string, value: number) {
    switch (type) {
      case 'hp_flat': hpFlat += value; break;
      case 'hp_percent': hpPercent += value; break;
      case 'atk_flat': atkFlat += value; break;
      case 'atk_percent': atkPercent += value; break;
      case 'def_flat': defFlat += value; break;
      case 'def_percent': defPercent += value; break;
      case 'spd': spd += value; break;
      case 'crit_rate': critRate += value; break;
      case 'crit_dmg': critDmg += value; break;
      case 'resistance': resistance += value; break;
      case 'accuracy': accuracy += value; break;
    }
  }

  // Apply rune set bonuses
  const setCounts = getRuneSetCounts(instance.runes);
  for (const [setName, count] of Object.entries(setCounts)) {
    const bonus = RUNE_SET_BONUSES[setName as RuneSet];
    if (bonus && count >= bonus.count) {
      const activeSets = Math.floor(count / bonus.count);
      for (let i = 0; i < activeSets; i++) {
        switch (bonus.stat) {
          case 'hp_percent': hpPercent += bonus.value; break;
          case 'atk_percent': atkPercent += bonus.value; break;
          case 'def_percent': defPercent += bonus.value; break;
          case 'spd_percent': spd += Math.floor(base.spd * bonus.value / 100); break;
          case 'crit_rate': critRate += bonus.value; break;
          case 'crit_dmg': critDmg += bonus.value; break;
          case 'resistance': resistance += bonus.value; break;
          case 'accuracy': accuracy += bonus.value; break;
        }
      }
    }
  }

  // Apply percentage bonuses
  hp = Math.floor(hp * (1 + hpPercent / 100)) + hpFlat;
  atk = Math.floor(atk * (1 + atkPercent / 100)) + atkFlat;
  def = Math.floor(def * (1 + defPercent / 100)) + defFlat;

  return {
    hp: Math.max(1, hp),
    atk: Math.max(1, atk),
    def: Math.max(1, def),
    spd: Math.max(1, spd),
    critRate: Math.min(100, Math.max(0, critRate)),
    critDmg: Math.max(50, critDmg),
    resistance: Math.min(100, Math.max(0, resistance)),
    accuracy: Math.min(100, Math.max(0, accuracy)),
  };
}

// Create a new monster instance from template
export function createMonsterInstance(templateId: string, level: number = 1, stars?: number): MonsterInstance {
  const template = getTemplate(templateId);
  const instance: MonsterInstance = {
    id: generateId(),
    templateId,
    level,
    stars: stars || template?.naturalStars || 3,
    awakened: false,
    runes: {},
    skillLevels: template ? template.skills.map(() => 1) : [],
    experience: 0,
  };
  instance.computedStats = computeStats(instance);
  return instance;
}

// Experience required for level
export function expForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 2.2));
}

// Mana cost to upgrade rune
export function runeUpgradeCost(level: number, stars: number): number {
  const baseCost = [0, 500, 1000, 2000, 4000, 6000, 10000, 15000, 20000, 30000, 40000, 55000, 70000, 90000, 120000, 150000];
  return Math.floor((baseCost[level] || 150000) * (1 + stars * 0.2));
}

// Random number helpers
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function chance(probability: number): boolean {
  return Math.random() < probability;
}

// Format large numbers
export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Star display
export function starDisplay(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(Math.max(0, 6 - count));
}
