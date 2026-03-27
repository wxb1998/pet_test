// Element types
export type Element = 'fire' | 'water' | 'wind' | 'light' | 'dark';

// Monster natural star rating
export type NaturalStars = 1 | 2 | 3 | 4 | 5;

// Buff/Debuff types matching Summoners War
export type BuffType =
  | 'attack_buff' | 'defense_buff' | 'speed_buff' | 'crit_rate_buff'
  | 'immunity' | 'invincibility' | 'endure' | 'shield' | 'regen'
  | 'counter_attack' | 'reflect_damage' | 'soul_protect'
  | 'vampire' | 'brand' | 'threat';

export type DebuffType =
  | 'attack_break' | 'defense_break' | 'slow' | 'glancing'
  | 'dot' | 'bomb' | 'stun' | 'freeze' | 'sleep' | 'silence'
  | 'provoke' | 'oblivion' | 'inability' | 'heal_block'
  | 'brand' | 'unrecoverable' | 'strip';

export interface StatusEffect {
  type: BuffType | DebuffType;
  turns: number;
  value?: number; // for shield amount, dot damage, etc.
  sourceId?: string;
}

// Skill effect types
export type SkillEffectType =
  | 'damage' | 'heal' | 'heal_percent' | 'shield'
  | 'buff' | 'debuff' | 'strip' | 'cleanse'
  | 'atb_increase' | 'atb_decrease' | 'atb_absorb'
  | 'revive' | 'passive' | 'transform'
  | 'balance_hp' | 'steal_buff' | 'transfer_debuff'
  | 'ignore_defense' | 'destroy_hp' | 'reflect';

export type TargetType = 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies' | 'all' | 'random_enemy';

export type ScalingType = 'atk' | 'def' | 'hp' | 'spd' | 'target_max_hp' | 'target_current_hp' | 'lost_hp';

export interface SkillEffect {
  type: SkillEffectType;
  target: TargetType;
  hits?: number; // number of hits (for multi-hit skills)
  scaling?: { stat: ScalingType; ratio: number }[];
  value?: number; // flat value or percentage
  chance?: number; // activation rate (0-1)
  buff?: BuffType;
  debuff?: DebuffType;
  duration?: number; // turns for buff/debuff
  condition?: string; // special condition description
}

export interface Skill {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  cooldown: number; // 0 for basic attacks
  currentCooldown?: number;
  effects: SkillEffect[];
  multiplier?: number; // damage multiplier
  isPassive?: boolean;
  awakened?: boolean; // only available after awakening
}

// Monster base stats
export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number; // 0-100
  critDmg: number; // percentage, e.g. 150 = 150%
  resistance: number; // 0-100
  accuracy: number; // 0-100
}

// Monster template (definition)
export interface MonsterTemplate {
  id: string;
  name: string;
  nameZh: string;
  family: string;
  familyZh: string;
  element: Element;
  naturalStars: NaturalStars;
  baseStats: BaseStats;
  skills: Skill[];
  leaderSkill?: {
    stat: keyof BaseStats;
    amount: number; // percentage
    area?: 'general' | 'dungeon' | 'arena' | 'guild';
    description: string;
    descriptionZh: string;
  };
  awakened: boolean;
  awakenedName?: string;
  awakenedNameZh?: string;
  pixelArt: string; // CSS class or emoji placeholder
}

// Rune types
export type RuneSet =
  | 'energy' | 'guard' | 'swift' | 'blade' | 'rage' | 'focus'
  | 'endure' | 'shield' | 'revenge' | 'will' | 'nemesis' | 'vampire'
  | 'destroy' | 'despair' | 'violent' | 'fatal' | 'phantom'
  | 'tolerance' | 'fight' | 'determination' | 'enhance' | 'accuracy';

export type RuneSlot = 1 | 2 | 3 | 4 | 5 | 6;

export type RuneMainStat =
  | 'hp_flat' | 'hp_percent' | 'atk_flat' | 'atk_percent'
  | 'def_flat' | 'def_percent' | 'spd'
  | 'crit_rate' | 'crit_dmg' | 'resistance' | 'accuracy';

export interface RuneSubStat {
  type: RuneMainStat;
  value: number;
  grindValue?: number;
  enchanted?: boolean;
}

export interface Rune {
  id: string;
  set: RuneSet;
  slot: RuneSlot;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  level: number; // 0-15
  mainStat: { type: RuneMainStat; value: number };
  subStats: RuneSubStat[];
  equippedTo?: string; // monster instance id
}

// Monster instance (player owned)
export interface MonsterInstance {
  id: string;
  templateId: string;
  level: number;
  stars: number; // current star level (can be awakened beyond natural)
  awakened: boolean;
  runes: { [slot in RuneSlot]?: Rune };
  skillLevels: number[]; // skill-up levels for each skill
  experience: number;
  // Computed stats (calculated from base + runes)
  computedStats?: BaseStats;
}

// Dungeon types
export type DungeonType = 'giants' | 'dragons' | 'necropolis' | 'steel_fortress' | 'punishers_crypt';

export interface DungeonFloor {
  level: number;
  enemies: { templateId: string; level: number; stars: number }[];
  boss: { templateId: string; level: number; stars: number };
  rewards: {
    mana: [number, number]; // min-max
    runeStars: number[];
    runeSets: RuneSet[];
    expPerMon: number;
  };
}

// Battle state
export interface BattleUnit {
  instanceId: string;
  templateId: string;
  name: string;
  nameZh: string;
  element: Element;
  isAlly: boolean;
  currentHp: number;
  maxHp: number;
  stats: BaseStats;
  attackBar: number; // 0-100, moves at 100
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  skills: Skill[];
  alive: boolean;
  pixelArt: string;
}

export interface BattleState {
  allies: BattleUnit[];
  enemies: BattleUnit[];
  turnOrder: string[]; // unit instanceIds
  currentTurn?: string;
  log: BattleLogEntry[];
  wave: number;
  totalWaves: number;
  status: 'preparing' | 'running' | 'victory' | 'defeat';
  autoPlay: boolean;
  speed: 1 | 2 | 3;
}

export interface BattleLogEntry {
  timestamp: number;
  actorId: string;
  actorName: string;
  action: string;
  targets: string[];
  damage?: number;
  heal?: number;
  effects?: string[];
}

// Game state
export interface GameState {
  player: {
    name: string;
    level: number;
    experience: number;
    mana: number;
    crystals: number;
    energy: number;
    maxEnergy: number;
    arenaScore: number;
    lastEnergyRefresh: number;
  };
  monsters: MonsterInstance[];
  runes: Rune[];
  inventory: {
    mysticalScrolls: number;
    elementalScrolls: { fire: number; water: number; wind: number };
    legendaryScrolls: number;
    devilmons: number;
    angelmons: { [key in Element]: number };
  };
  dungeonProgress: { [key in DungeonType]?: number }; // highest cleared floor
  arenaDefense: string[]; // monster instance ids
  idleProgress: {
    currentDungeon?: DungeonType;
    currentFloor?: number;
    runsCompleted: number;
    totalManaEarned: number;
    runesDropped: number;
    startTime?: number;
  };
  settings: {
    language: 'zh' | 'en';
    battleSpeed: 1 | 2 | 3;
    autoSell: {
      enabled: boolean;
      minStars: number;
    };
  };
}

// Rune set bonuses
export const RUNE_SET_BONUSES: Record<RuneSet, { count: number; stat: string; value: number; description: string; descriptionZh: string }> = {
  energy: { count: 2, stat: 'hp_percent', value: 15, description: 'HP +15%', descriptionZh: '体力+15%' },
  guard: { count: 2, stat: 'def_percent', value: 15, description: 'DEF +15%', descriptionZh: '防御力+15%' },
  swift: { count: 4, stat: 'spd_percent', value: 25, description: 'SPD +25%', descriptionZh: '速度+25%' },
  blade: { count: 2, stat: 'crit_rate', value: 12, description: 'CRI Rate +12%', descriptionZh: '暴击率+12%' },
  rage: { count: 4, stat: 'crit_dmg', value: 40, description: 'CRI Dmg +40%', descriptionZh: '暴击伤害+40%' },
  focus: { count: 2, stat: 'accuracy', value: 20, description: 'Accuracy +20%', descriptionZh: '效果命中+20%' },
  endure: { count: 2, stat: 'resistance', value: 20, description: 'Resistance +20%', descriptionZh: '效果抵抗+20%' },
  shield: { count: 2, stat: 'shield', value: 15, description: 'Shield 15% HP 3 turns', descriptionZh: '护盾15%体力3回合' },
  revenge: { count: 2, stat: 'counter', value: 15, description: '15% Counter chance', descriptionZh: '15%反击概率' },
  will: { count: 2, stat: 'immunity', value: 1, description: 'Immunity 1 turn', descriptionZh: '免疫1回合' },
  nemesis: { count: 2, stat: 'atb_gain', value: 4, description: 'ATB +4% per 7% HP lost', descriptionZh: '每损失7%体力攻击条+4%' },
  vampire: { count: 4, stat: 'lifesteal', value: 35, description: 'Heal 35% of damage', descriptionZh: '造成伤害的35%回复' },
  destroy: { count: 2, stat: 'destroy_hp', value: 30, description: 'Destroy 30% of damage as max HP', descriptionZh: '造成伤害的30%破坏最大体力' },
  despair: { count: 4, stat: 'stun_chance', value: 25, description: '25% Stun on Skill 1', descriptionZh: '攻击25%概率眩晕' },
  violent: { count: 4, stat: 'extra_turn', value: 22, description: '22% Extra turn', descriptionZh: '22%追加回合' },
  fatal: { count: 4, stat: 'atk_percent', value: 35, description: 'ATK +35%', descriptionZh: '攻击力+35%' },
  phantom: { count: 2, stat: 'spd_percent', value: 0, description: 'Bypass damage reduction', descriptionZh: '无视伤害减免' },
  tolerance: { count: 2, stat: 'resistance_all', value: 10, description: 'Team Resistance +10%', descriptionZh: '全队效果抵抗+10%' },
  fight: { count: 2, stat: 'atk_all', value: 8, description: 'Team ATK +8%', descriptionZh: '全队攻击力+8%' },
  determination: { count: 2, stat: 'def_all', value: 8, description: 'Team DEF +8%', descriptionZh: '全队防御力+8%' },
  enhance: { count: 2, stat: 'hp_all', value: 8, description: 'Team HP +8%', descriptionZh: '全队体力+8%' },
  accuracy: { count: 2, stat: 'accuracy_all', value: 10, description: 'Team Accuracy +10%', descriptionZh: '全队效果命中+10%' },
};

// Element advantage system
export const ELEMENT_ADVANTAGE: Record<Element, Element> = {
  fire: 'wind',
  water: 'fire',
  wind: 'water',
  light: 'dark',
  dark: 'light',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ff4444',
  water: '#4488ff',
  wind: '#ffcc00',
  light: '#ffffff',
  dark: '#aa44ff',
};

export const ELEMENT_NAMES_ZH: Record<Element, string> = {
  fire: '火',
  water: '水',
  wind: '风',
  light: '光',
  dark: '暗',
};
