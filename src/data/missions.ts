import type { Mission } from '../types';

export const DAILY_MISSIONS: Mission[] = [
  {
    id: 'daily_dungeon_3',
    nameZh: '副本探索者',
    descriptionZh: '完成3次副本战斗',
    type: 'daily',
    requirement: { action: 'battle_dungeon', count: 3 },
    rewards: { energy: 30, mana: 5000 },
  },
  {
    id: 'daily_scenario_5',
    nameZh: '场景征服者',
    descriptionZh: '完成5次场景战斗',
    type: 'daily',
    requirement: { action: 'battle_scenario', count: 5 },
    rewards: { energy: 20, mana: 3000 },
  },
  {
    id: 'daily_arena_3',
    nameZh: '竞技场斗士',
    descriptionZh: '完成3次竞技场攻击',
    type: 'daily',
    requirement: { action: 'battle_arena', count: 3 },
    rewards: { crystals: 20 },
  },
  {
    id: 'daily_summon_1',
    nameZh: '召唤术师',
    descriptionZh: '进行1次召唤',
    type: 'daily',
    requirement: { action: 'summon', count: 1 },
    rewards: { mysticalScrolls: 1, mana: 2000 },
  },
  {
    id: 'daily_rune_3',
    nameZh: '符文强化师',
    descriptionZh: '强化符文3次',
    type: 'daily',
    requirement: { action: 'upgrade_rune', count: 3 },
    rewards: { mana: 10000 },
  },
  {
    id: 'daily_level_1',
    nameZh: '训练师',
    descriptionZh: '提升1只怪物等级',
    type: 'daily',
    requirement: { action: 'level_monster', count: 1 },
    rewards: { energy: 10, crystals: 5 },
  },
];

export const ACHIEVEMENT_MISSIONS: Mission[] = [
  {
    id: 'ach_dungeon_50',
    nameZh: '副本大师',
    descriptionZh: '累计完成50次副本战斗',
    type: 'achievement',
    requirement: { action: 'battle_dungeon', count: 50 },
    rewards: { crystals: 100, mysticalScrolls: 3 },
  },
  {
    id: 'ach_summon_30',
    nameZh: '召唤达人',
    descriptionZh: '累计召唤30次',
    type: 'achievement',
    requirement: { action: 'summon', count: 30 },
    rewards: { crystals: 150, mysticalScrolls: 5 },
  },
  {
    id: 'ach_evolve_5',
    nameZh: '进化专家',
    descriptionZh: '累计进化5只怪物',
    type: 'achievement',
    requirement: { action: 'evolve_monster', count: 5 },
    rewards: { crystals: 80, energy: 50 },
  },
  {
    id: 'ach_awaken_3',
    nameZh: '觉醒之光',
    descriptionZh: '累计觉醒3只怪物',
    type: 'achievement',
    requirement: { action: 'awaken_monster', count: 3 },
    rewards: { mysticalScrolls: 3, mana: 30000 },
  },
  {
    id: 'ach_rune_50',
    nameZh: '符文大师',
    descriptionZh: '累计强化符文50次',
    type: 'achievement',
    requirement: { action: 'upgrade_rune', count: 50 },
    rewards: { crystals: 100, mana: 50000 },
  },
  {
    id: 'ach_arena_30',
    nameZh: '角斗士',
    descriptionZh: '累计竞技场攻击30次',
    type: 'achievement',
    requirement: { action: 'battle_arena', count: 30 },
    rewards: { crystals: 200, mysticalScrolls: 5 },
  },
  {
    id: 'ach_scenario_100',
    nameZh: '场景霸主',
    descriptionZh: '累计完成100次场景战斗',
    type: 'achievement',
    requirement: { action: 'battle_scenario', count: 100 },
    rewards: { crystals: 150, energy: 100 },
  },
];

export const ALL_MISSIONS = [...DAILY_MISSIONS, ...ACHIEVEMENT_MISSIONS];
