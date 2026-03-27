// Scenario (Campaign) system - main XP farming content
// Modeled after Summoners War's scenario regions

import type { Element } from '../types/index';

export type Difficulty = 'normal' | 'hard' | 'hell';

export interface ScenarioStage {
  id: string;
  name: string;
  nameZh: string;
  region: string;
  regionZh: string;
  stage: number; // 1-7 stages per region
  element: Element;
  difficulty: Difficulty;
  energyCost: number;
  recommendedLevel: number;
  enemies: { templateId: string; level: number; stars: number }[];
  rewards: {
    expBase: number;      // base XP per monster in team
    manaBase: number;     // mana reward
    runeDropChance: number; // 0-1
    runeStars: number;    // max rune stars that can drop
    scrollDropChance: number; // rare scroll drop
  };
}

export interface ScenarioRegion {
  id: string;
  name: string;
  nameZh: string;
  element: Element;
  icon: string;
  stages: number; // number of stages
  description: string;
}

// 7 Scenario regions, similar to SW
export const SCENARIO_REGIONS: ScenarioRegion[] = [
  {
    id: 'garen_forest',
    name: 'Garen Forest',
    nameZh: '加伦森林',
    element: 'wind',
    icon: '🌲',
    stages: 7,
    description: '新手冒险的起点，风属性魔灵出没的森林。',
  },
  {
    id: 'siz_mountains',
    name: 'Mt. Siz',
    nameZh: '希兹山',
    element: 'water',
    icon: '🏔️',
    stages: 7,
    description: '寒冷的山脉，水属性魔灵的栖息地。',
  },
  {
    id: 'kabir_ruins',
    name: 'Kabir Ruins',
    nameZh: '卡比尔遗迹',
    element: 'fire',
    icon: '🏛️',
    stages: 7,
    description: '古老的废墟中，火属性魔灵在此守护。',
  },
  {
    id: 'telain_forest',
    name: 'Telain Forest',
    nameZh: '塔莲森林',
    element: 'wind',
    icon: '🌿',
    stages: 7,
    description: '比加伦森林更深处的神秘森林。',
  },
  {
    id: 'tamor_desert',
    name: 'Tamor Desert',
    nameZh: '塔摩尔沙漠',
    element: 'fire',
    icon: '🏜️',
    stages: 7,
    description: '炎热的沙漠，火属性魔灵横行。经验丰富的训练场。',
  },
  {
    id: 'faimon_volcano',
    name: 'Faimon Volcano',
    nameZh: '法伊蒙火山',
    element: 'fire',
    icon: '🌋',
    stages: 7,
    description: '最受欢迎的经验刷取圣地！火属性犬神大量出没，经验和玛那回报极高。',
  },
  {
    id: 'aiden_forest',
    name: 'Aiden Forest',
    nameZh: '爱登森林',
    element: 'wind',
    icon: '🌳',
    stages: 7,
    description: '终极经验刷取地，风属性魔灵等级最高，经验奖励最丰厚。',
  },
];

// Difficulty multipliers
const DIFFICULTY_CONFIG: Record<Difficulty, {
  levelMult: number;
  starAdd: number;
  expMult: number;
  manaMult: number;
  runeMult: number;
  runeStarsAdd: number;
  energyAdd: number;
}> = {
  normal: { levelMult: 1.0, starAdd: 0, expMult: 1.0, manaMult: 1.0, runeMult: 1.0, runeStarsAdd: 0, energyAdd: 0 },
  hard:   { levelMult: 1.5, starAdd: 1, expMult: 1.8, manaMult: 1.5, runeMult: 1.3, runeStarsAdd: 1, energyAdd: 1 },
  hell:   { levelMult: 2.0, starAdd: 2, expMult: 3.0, manaMult: 2.5, runeMult: 1.6, runeStarsAdd: 2, energyAdd: 2 },
};

// Enemy templates for each region (uses existing monster IDs)
const REGION_ENEMIES: Record<string, string[]> = {
  garen_forest:   ['shannon_wind', 'bernard_wind', 'ramahan_wind', 'lindermen_wind', 'seal_wind'],
  siz_mountains:  ['konamiya_water', 'kacey_water', 'kahn_water', 'icaru_water', 'sia_water'],
  kabir_ruins:    ['raoq_fire', 'tatu_fire', 'colleen_fire', 'spectra_fire', 'cahule_fire'],
  telain_forest:  ['shannon_wind', 'bernard_wind', 'silia_wind', 'roid_wind', 'hannah_wind'],
  tamor_desert:   ['raoq_fire', 'spectra_fire', 'gina_fire', 'cassie_fire', 'tatu_fire'],
  faimon_volcano: ['raoq_fire', 'tatu_fire', 'colleen_fire', 'cahule_fire', 'gina_fire'],
  aiden_forest:   ['bernard_wind', 'shannon_wind', 'roid_wind', 'hannah_wind', 'seal_wind'],
};

// Base levels per region
const REGION_BASE_LEVELS: Record<string, number> = {
  garen_forest: 5,
  siz_mountains: 10,
  kabir_ruins: 15,
  telain_forest: 20,
  tamor_desert: 25,
  faimon_volcano: 30,
  aiden_forest: 35,
};

// Base XP per region
const REGION_BASE_EXP: Record<string, number> = {
  garen_forest: 300,
  siz_mountains: 500,
  kabir_ruins: 700,
  telain_forest: 1000,
  tamor_desert: 1400,
  faimon_volcano: 1950,  // Faimon is the sweet spot!
  aiden_forest: 2400,
};

// Base mana per region
const REGION_BASE_MANA: Record<string, number> = {
  garen_forest: 500,
  siz_mountains: 800,
  kabir_ruins: 1200,
  telain_forest: 1600,
  tamor_desert: 2200,
  faimon_volcano: 3200,  // Faimon also best for mana
  aiden_forest: 3800,
};

/**
 * Generate a scenario stage configuration
 */
export function getScenarioStage(regionId: string, stage: number, difficulty: Difficulty): ScenarioStage | null {
  const region = SCENARIO_REGIONS.find(r => r.id === regionId);
  if (!region) return null;
  if (stage < 1 || stage > region.stages) return null;

  const config = DIFFICULTY_CONFIG[difficulty];
  const baseLevel = REGION_BASE_LEVELS[regionId] || 10;
  const baseExp = REGION_BASE_EXP[regionId] || 500;
  const baseMana = REGION_BASE_MANA[regionId] || 500;
  const enemyPool = REGION_ENEMIES[regionId] || ['shannon_wind'];

  const level = Math.floor((baseLevel + stage * 2) * config.levelMult);
  const stars = Math.min(6, Math.max(1, Math.floor(baseLevel / 10) + 1 + config.starAdd));

  // Pick 3-4 enemies from pool
  const numEnemies = 3 + (stage >= 5 ? 1 : 0);
  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    enemies.push({
      templateId: enemyPool[i % enemyPool.length],
      level: level + Math.floor(Math.random() * 3),
      stars,
    });
  }

  const expReward = Math.floor(baseExp * (1 + (stage - 1) * 0.15) * config.expMult);
  const manaReward = Math.floor(baseMana * (1 + (stage - 1) * 0.1) * config.manaMult);
  const runeChance = Math.min(0.8, 0.15 + stage * 0.05) * config.runeMult;
  const maxRuneStars = Math.min(6, Math.floor(baseLevel / 8) + 1 + config.runeStarsAdd);

  const diffZh: Record<Difficulty, string> = { normal: '普通', hard: '困难', hell: '地狱' };

  return {
    id: `${regionId}_${stage}_${difficulty}`,
    name: `${region.name} ${stage} (${difficulty})`,
    nameZh: `${region.nameZh} ${stage} (${diffZh[difficulty]})`,
    region: regionId,
    regionZh: region.nameZh,
    stage,
    element: region.element,
    difficulty,
    energyCost: 3 + Math.floor(stage / 3) + config.energyAdd,
    recommendedLevel: level,
    enemies,
    rewards: {
      expBase: expReward,
      manaBase: manaReward,
      runeDropChance: runeChance,
      runeStars: maxRuneStars,
      scrollDropChance: difficulty === 'hell' ? 0.005 : 0,
    },
  };
}

/**
 * Calculate XP distribution for a team after a scenario battle
 * In SW, XP is split among all surviving monsters
 * Maxed-level monsters don't absorb XP (it goes to others)
 */
export function calculateExpDistribution(
  totalExp: number,
  teamMembers: { id: string; level: number; maxLevel: number }[]
): { id: string; exp: number }[] {
  // Filter out max level monsters - they don't take XP
  const eligibleMembers = teamMembers.filter(m => m.level < m.maxLevel);

  if (eligibleMembers.length === 0) {
    return teamMembers.map(m => ({ id: m.id, exp: 0 }));
  }

  // XP split equally among eligible members
  // Fewer eligible = more XP per monster (this is why you use 1 farmer + 3 fodder)
  const expPerMon = Math.floor(totalExp / eligibleMembers.length);

  return teamMembers.map(m => ({
    id: m.id,
    exp: m.level < m.maxLevel ? expPerMon : 0,
  }));
}

/**
 * Get the difficulty name in Chinese
 */
export function getDifficultyZh(diff: Difficulty): string {
  const map: Record<Difficulty, string> = { normal: '普通', hard: '困难', hell: '地狱' };
  return map[diff];
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(diff: Difficulty): string {
  const map: Record<Difficulty, string> = { normal: '#88CC88', hard: '#CCAA44', hell: '#FF4444' };
  return map[diff];
}
