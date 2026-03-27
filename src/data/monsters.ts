// Central monster registry - imports all monster data from split files
import { NAT5_MONSTERS } from './monsters_nat5';
import { NAT4_MONSTERS } from './monsters_nat4';
import { NAT3_MONSTERS } from './monsters_nat3';
import type { MonsterTemplate } from '../types/index';

// Combine all monsters into a single export
export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  ...NAT5_MONSTERS,
  ...NAT4_MONSTERS,
  ...NAT3_MONSTERS,
];

// Quick lookup by ID
const templateMap = new Map<string, MonsterTemplate>();
MONSTER_TEMPLATES.forEach(t => templateMap.set(t.id, t));

export function getTemplateById(id: string): MonsterTemplate | undefined {
  return templateMap.get(id);
}

// Filter helpers
export function getTemplatesByFamily(family: string): MonsterTemplate[] {
  return MONSTER_TEMPLATES.filter(t => t.family === family);
}

export function getTemplatesByElement(element: string): MonsterTemplate[] {
  return MONSTER_TEMPLATES.filter(t => t.element === element);
}

export function getTemplatesByStars(stars: number): MonsterTemplate[] {
  return MONSTER_TEMPLATES.filter(t => t.naturalStars === stars);
}

export function getAllFamilies(): string[] {
  const families = new Set(MONSTER_TEMPLATES.filter(t => !t.id.startsWith('boss_')).map(t => t.family));
  return Array.from(families);
}
