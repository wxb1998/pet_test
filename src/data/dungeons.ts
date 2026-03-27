import type { DungeonFloor, DungeonType } from '../types/index';

// ============ GIANTS DUNGEON B1-B12 ============
export const GIANTS_FLOORS: DungeonFloor[] = [
  {
    level: 1,
    enemies: [
      { templateId: 'giant_wind', level: 10, stars: 2 },
      { templateId: 'giant_wind', level: 10, stars: 2 },
    ],
    boss: { templateId: 'giant_wind', level: 12, stars: 3 },
    rewards: {
      mana: [1000, 1500],
      runeStars: [2],
      runeSets: ['energy', 'guard'],
      expPerMon: 500,
    },
  },
  {
    level: 2,
    enemies: [
      { templateId: 'giant_wind', level: 15, stars: 2 },
      { templateId: 'giant_wind', level: 15, stars: 2 },
      { templateId: 'giant_wind', level: 15, stars: 2 },
    ],
    boss: { templateId: 'giant_wind', level: 18, stars: 3 },
    rewards: {
      mana: [1500, 2000],
      runeStars: [2, 3],
      runeSets: ['energy', 'guard', 'swift'],
      expPerMon: 800,
    },
  },
  {
    level: 3,
    enemies: [
      { templateId: 'giant_wind', level: 20, stars: 2 },
      { templateId: 'giant_wind', level: 20, stars: 3 },
    ],
    boss: { templateId: 'giant_wind', level: 23, stars: 3 },
    rewards: {
      mana: [2000, 2500],
      runeStars: [2, 3],
      runeSets: ['energy', 'guard', 'swift', 'blade'],
      expPerMon: 1200,
    },
  },
  {
    level: 4,
    enemies: [
      { templateId: 'giant_wind', level: 25, stars: 3 },
      { templateId: 'giant_wind', level: 25, stars: 3 },
    ],
    boss: { templateId: 'giant_wind', level: 28, stars: 4 },
    rewards: {
      mana: [2500, 3500],
      runeStars: [3, 4],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage'],
      expPerMon: 1800,
    },
  },
  {
    level: 5,
    enemies: [
      { templateId: 'giant_wind', level: 30, stars: 3 },
      { templateId: 'giant_wind', level: 30, stars: 3 },
      { templateId: 'giant_wind', level: 30, stars: 3 },
    ],
    boss: { templateId: 'giant_wind', level: 33, stars: 4 },
    rewards: {
      mana: [3000, 4000],
      runeStars: [3, 4],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus'],
      expPerMon: 2200,
    },
  },
  {
    level: 6,
    enemies: [
      { templateId: 'giant_wind', level: 35, stars: 3 },
      { templateId: 'giant_wind', level: 35, stars: 4 },
    ],
    boss: { templateId: 'giant_wind', level: 38, stars: 4 },
    rewards: {
      mana: [3500, 4500],
      runeStars: [3, 4],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure'],
      expPerMon: 2600,
    },
  },
  {
    level: 7,
    enemies: [
      { templateId: 'giant_wind', level: 40, stars: 3 },
      { templateId: 'giant_wind', level: 40, stars: 4 },
    ],
    boss: { templateId: 'giant_wind', level: 43, stars: 4 },
    rewards: {
      mana: [4000, 5000],
      runeStars: [3, 4, 5],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield'],
      expPerMon: 3000,
    },
  },
  {
    level: 8,
    enemies: [
      { templateId: 'giant_wind', level: 45, stars: 4 },
      { templateId: 'giant_wind', level: 45, stars: 4 },
    ],
    boss: { templateId: 'giant_wind', level: 48, stars: 5 },
    rewards: {
      mana: [4500, 5500],
      runeStars: [4, 5],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield', 'revenge'],
      expPerMon: 3400,
    },
  },
  {
    level: 9,
    enemies: [
      { templateId: 'giant_wind', level: 50, stars: 4 },
      { templateId: 'giant_wind', level: 50, stars: 4 },
      { templateId: 'giant_wind', level: 50, stars: 4 },
    ],
    boss: { templateId: 'giant_wind', level: 53, stars: 5 },
    rewards: {
      mana: [5000, 6000],
      runeStars: [4, 5],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield', 'revenge', 'will'],
      expPerMon: 3800,
    },
  },
  {
    level: 10,
    enemies: [
      { templateId: 'giant_wind', level: 55, stars: 4 },
      { templateId: 'giant_wind', level: 55, stars: 5 },
    ],
    boss: { templateId: 'giant_wind', level: 58, stars: 5 },
    rewards: {
      mana: [5500, 6500],
      runeStars: [4, 5, 6],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield', 'revenge', 'will', 'nemesis'],
      expPerMon: 4200,
    },
  },
  {
    level: 11,
    enemies: [
      { templateId: 'giant_wind', level: 58, stars: 5 },
      { templateId: 'giant_wind', level: 58, stars: 5 },
    ],
    boss: { templateId: 'giant_wind', level: 60, stars: 5 },
    rewards: {
      mana: [6000, 7000],
      runeStars: [4, 5, 6],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield', 'revenge', 'will', 'nemesis', 'vampire'],
      expPerMon: 4600,
    },
  },
  {
    level: 12,
    enemies: [
      { templateId: 'giant_wind', level: 60, stars: 5 },
      { templateId: 'giant_wind', level: 60, stars: 5 },
      { templateId: 'giant_wind', level: 60, stars: 5 },
    ],
    boss: { templateId: 'giant_wind', level: 60, stars: 6 },
    rewards: {
      mana: [6500, 7500],
      runeStars: [5, 6],
      runeSets: ['energy', 'guard', 'swift', 'blade', 'rage', 'focus', 'endure', 'shield', 'revenge', 'will', 'nemesis', 'vampire', 'destroy'],
      expPerMon: 5000,
    },
  },
];

// ============ DRAGONS DUNGEON B1-B12 ============
export const DRAGONS_FLOORS: DungeonFloor[] = [
  {
    level: 1,
    enemies: [
      { templateId: 'dragon_fire', level: 10, stars: 2 },
      { templateId: 'dragon_fire', level: 10, stars: 2 },
    ],
    boss: { templateId: 'dragon_fire', level: 12, stars: 3 },
    rewards: {
      mana: [1000, 1500],
      runeStars: [2],
      runeSets: ['despair', 'violent'],
      expPerMon: 500,
    },
  },
  {
    level: 2,
    enemies: [
      { templateId: 'dragon_fire', level: 15, stars: 2 },
      { templateId: 'dragon_fire', level: 15, stars: 2 },
      { templateId: 'dragon_fire', level: 15, stars: 2 },
    ],
    boss: { templateId: 'dragon_fire', level: 18, stars: 3 },
    rewards: {
      mana: [1500, 2000],
      runeStars: [2, 3],
      runeSets: ['despair', 'violent', 'fatal'],
      expPerMon: 800,
    },
  },
  {
    level: 3,
    enemies: [
      { templateId: 'dragon_fire', level: 20, stars: 2 },
      { templateId: 'dragon_fire', level: 20, stars: 3 },
    ],
    boss: { templateId: 'dragon_fire', level: 23, stars: 3 },
    rewards: {
      mana: [2000, 2500],
      runeStars: [2, 3],
      runeSets: ['despair', 'violent', 'fatal', 'phantom'],
      expPerMon: 1200,
    },
  },
  {
    level: 4,
    enemies: [
      { templateId: 'dragon_fire', level: 25, stars: 3 },
      { templateId: 'dragon_fire', level: 25, stars: 3 },
    ],
    boss: { templateId: 'dragon_fire', level: 28, stars: 4 },
    rewards: {
      mana: [2500, 3500],
      runeStars: [3, 4],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance'],
      expPerMon: 1800,
    },
  },
  {
    level: 5,
    enemies: [
      { templateId: 'dragon_fire', level: 30, stars: 3 },
      { templateId: 'dragon_fire', level: 30, stars: 3 },
      { templateId: 'dragon_fire', level: 30, stars: 3 },
    ],
    boss: { templateId: 'dragon_fire', level: 33, stars: 4 },
    rewards: {
      mana: [3000, 4000],
      runeStars: [3, 4],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight'],
      expPerMon: 2200,
    },
  },
  {
    level: 6,
    enemies: [
      { templateId: 'dragon_fire', level: 35, stars: 3 },
      { templateId: 'dragon_fire', level: 35, stars: 4 },
    ],
    boss: { templateId: 'dragon_fire', level: 38, stars: 4 },
    rewards: {
      mana: [3500, 4500],
      runeStars: [3, 4],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination'],
      expPerMon: 2600,
    },
  },
  {
    level: 7,
    enemies: [
      { templateId: 'dragon_fire', level: 40, stars: 3 },
      { templateId: 'dragon_fire', level: 40, stars: 4 },
    ],
    boss: { templateId: 'dragon_fire', level: 43, stars: 4 },
    rewards: {
      mana: [4000, 5000],
      runeStars: [3, 4, 5],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance'],
      expPerMon: 3000,
    },
  },
  {
    level: 8,
    enemies: [
      { templateId: 'dragon_fire', level: 45, stars: 4 },
      { templateId: 'dragon_fire', level: 45, stars: 4 },
    ],
    boss: { templateId: 'dragon_fire', level: 48, stars: 5 },
    rewards: {
      mana: [4500, 5500],
      runeStars: [4, 5],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance', 'accuracy'],
      expPerMon: 3400,
    },
  },
  {
    level: 9,
    enemies: [
      { templateId: 'dragon_fire', level: 50, stars: 4 },
      { templateId: 'dragon_fire', level: 50, stars: 4 },
      { templateId: 'dragon_fire', level: 50, stars: 4 },
    ],
    boss: { templateId: 'dragon_fire', level: 53, stars: 5 },
    rewards: {
      mana: [5000, 6000],
      runeStars: [4, 5],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance', 'accuracy'],
      expPerMon: 3800,
    },
  },
  {
    level: 10,
    enemies: [
      { templateId: 'dragon_fire', level: 55, stars: 4 },
      { templateId: 'dragon_fire', level: 55, stars: 5 },
    ],
    boss: { templateId: 'dragon_fire', level: 58, stars: 5 },
    rewards: {
      mana: [5500, 6500],
      runeStars: [4, 5, 6],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance', 'accuracy'],
      expPerMon: 4200,
    },
  },
  {
    level: 11,
    enemies: [
      { templateId: 'dragon_fire', level: 58, stars: 5 },
      { templateId: 'dragon_fire', level: 58, stars: 5 },
    ],
    boss: { templateId: 'dragon_fire', level: 60, stars: 5 },
    rewards: {
      mana: [6000, 7000],
      runeStars: [4, 5, 6],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance', 'accuracy'],
      expPerMon: 4600,
    },
  },
  {
    level: 12,
    enemies: [
      { templateId: 'dragon_fire', level: 60, stars: 5 },
      { templateId: 'dragon_fire', level: 60, stars: 5 },
      { templateId: 'dragon_fire', level: 60, stars: 5 },
    ],
    boss: { templateId: 'dragon_fire', level: 60, stars: 6 },
    rewards: {
      mana: [6500, 7500],
      runeStars: [5, 6],
      runeSets: ['despair', 'violent', 'fatal', 'phantom', 'tolerance', 'fight', 'determination', 'enhance', 'accuracy'],
      expPerMon: 5000,
    },
  },
];

// ============ NECROPOLIS DUNGEON B1-B12 ============
export const NECROPOLIS_FLOORS: DungeonFloor[] = [
  {
    level: 1,
    enemies: [
      { templateId: 'necro_dark', level: 10, stars: 2 },
      { templateId: 'necro_dark', level: 10, stars: 2 },
    ],
    boss: { templateId: 'necro_dark', level: 12, stars: 3 },
    rewards: {
      mana: [1000, 1500],
      runeStars: [2],
      runeSets: ['destroy', 'vampire'],
      expPerMon: 500,
    },
  },
  {
    level: 2,
    enemies: [
      { templateId: 'necro_dark', level: 15, stars: 2 },
      { templateId: 'necro_dark', level: 15, stars: 2 },
      { templateId: 'necro_dark', level: 15, stars: 2 },
    ],
    boss: { templateId: 'necro_dark', level: 18, stars: 3 },
    rewards: {
      mana: [1500, 2000],
      runeStars: [2, 3],
      runeSets: ['destroy', 'vampire', 'will'],
      expPerMon: 800,
    },
  },
  {
    level: 3,
    enemies: [
      { templateId: 'necro_dark', level: 20, stars: 2 },
      { templateId: 'necro_dark', level: 20, stars: 3 },
    ],
    boss: { templateId: 'necro_dark', level: 23, stars: 3 },
    rewards: {
      mana: [2000, 2500],
      runeStars: [2, 3],
      runeSets: ['destroy', 'vampire', 'will', 'shield'],
      expPerMon: 1200,
    },
  },
  {
    level: 4,
    enemies: [
      { templateId: 'necro_dark', level: 25, stars: 3 },
      { templateId: 'necro_dark', level: 25, stars: 3 },
    ],
    boss: { templateId: 'necro_dark', level: 28, stars: 4 },
    rewards: {
      mana: [2500, 3500],
      runeStars: [3, 4],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure'],
      expPerMon: 1800,
    },
  },
  {
    level: 5,
    enemies: [
      { templateId: 'necro_dark', level: 30, stars: 3 },
      { templateId: 'necro_dark', level: 30, stars: 3 },
      { templateId: 'necro_dark', level: 30, stars: 3 },
    ],
    boss: { templateId: 'necro_dark', level: 33, stars: 4 },
    rewards: {
      mana: [3000, 4000],
      runeStars: [3, 4],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge'],
      expPerMon: 2200,
    },
  },
  {
    level: 6,
    enemies: [
      { templateId: 'necro_dark', level: 35, stars: 3 },
      { templateId: 'necro_dark', level: 35, stars: 4 },
    ],
    boss: { templateId: 'necro_dark', level: 38, stars: 4 },
    rewards: {
      mana: [3500, 4500],
      runeStars: [3, 4],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis'],
      expPerMon: 2600,
    },
  },
  {
    level: 7,
    enemies: [
      { templateId: 'necro_dark', level: 40, stars: 3 },
      { templateId: 'necro_dark', level: 40, stars: 4 },
    ],
    boss: { templateId: 'necro_dark', level: 43, stars: 4 },
    rewards: {
      mana: [4000, 5000],
      runeStars: [3, 4, 5],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus'],
      expPerMon: 3000,
    },
  },
  {
    level: 8,
    enemies: [
      { templateId: 'necro_dark', level: 45, stars: 4 },
      { templateId: 'necro_dark', level: 45, stars: 4 },
    ],
    boss: { templateId: 'necro_dark', level: 48, stars: 5 },
    rewards: {
      mana: [4500, 5500],
      runeStars: [4, 5],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus', 'accuracy'],
      expPerMon: 3400,
    },
  },
  {
    level: 9,
    enemies: [
      { templateId: 'necro_dark', level: 50, stars: 4 },
      { templateId: 'necro_dark', level: 50, stars: 4 },
      { templateId: 'necro_dark', level: 50, stars: 4 },
    ],
    boss: { templateId: 'necro_dark', level: 53, stars: 5 },
    rewards: {
      mana: [5000, 6000],
      runeStars: [4, 5],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus', 'accuracy'],
      expPerMon: 3800,
    },
  },
  {
    level: 10,
    enemies: [
      { templateId: 'necro_dark', level: 55, stars: 4 },
      { templateId: 'necro_dark', level: 55, stars: 5 },
    ],
    boss: { templateId: 'necro_dark', level: 58, stars: 5 },
    rewards: {
      mana: [5500, 6500],
      runeStars: [4, 5, 6],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus', 'accuracy'],
      expPerMon: 4200,
    },
  },
  {
    level: 11,
    enemies: [
      { templateId: 'necro_dark', level: 58, stars: 5 },
      { templateId: 'necro_dark', level: 58, stars: 5 },
    ],
    boss: { templateId: 'necro_dark', level: 60, stars: 5 },
    rewards: {
      mana: [6000, 7000],
      runeStars: [4, 5, 6],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus', 'accuracy'],
      expPerMon: 4600,
    },
  },
  {
    level: 12,
    enemies: [
      { templateId: 'necro_dark', level: 60, stars: 5 },
      { templateId: 'necro_dark', level: 60, stars: 5 },
      { templateId: 'necro_dark', level: 60, stars: 5 },
    ],
    boss: { templateId: 'necro_dark', level: 60, stars: 6 },
    rewards: {
      mana: [6500, 7500],
      runeStars: [5, 6],
      runeSets: ['destroy', 'vampire', 'will', 'shield', 'endure', 'revenge', 'nemesis', 'focus', 'accuracy'],
      expPerMon: 5000,
    },
  },
];

// Dungeon database
export const DUNGEONS: Record<DungeonType, DungeonFloor[]> = {
  giants: GIANTS_FLOORS,
  dragons: DRAGONS_FLOORS,
  necropolis: NECROPOLIS_FLOORS,
  steel_fortress: GIANTS_FLOORS, // Placeholder - same as Giants for now
  punishers_crypt: NECROPOLIS_FLOORS, // Placeholder - same as Necropolis for now
};

// Helper function to get dungeon floor by type and level
export function getDungeonFloor(dungeonType: DungeonType, level: number): DungeonFloor | undefined {
  const floors = DUNGEONS[dungeonType];
  return floors.find(f => f.level === level);
}

// Helper function to check if a dungeon floor exists
export function isDungeonFloorAvailable(dungeonType: DungeonType, level: number): boolean {
  return getDungeonFloor(dungeonType, level) !== undefined;
}

// Helper function to get max floor for a dungeon
export function getMaxDungeonFloor(dungeonType: DungeonType): number {
  const floors = DUNGEONS[dungeonType];
  return floors.length > 0 ? Math.max(...floors.map(f => f.level)) : 0;
}
