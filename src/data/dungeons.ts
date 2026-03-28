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

// ============ ELEMENTAL DUNGEONS (10 floors each) ============
function makeElementalDungeon(element: 'fire' | 'water' | 'wind' | 'light' | 'dark'): DungeonFloor[] {
  const monMap: Record<string, string> = {
    fire: 'inugami_fire', water: 'mystic_witch_water', wind: 'griffon_wind',
    light: 'fairy_queen_light', dark: 'vagabond_dark',
  };
  const bossMap: Record<string, string> = {
    fire: 'phoenix_fire', water: 'phoenix_water', wind: 'phoenix_water',
    light: 'archangel_light', dark: 'archangel_light',
  };
  const essenceElement = element;
  const floors: DungeonFloor[] = [];
  for (let i = 1; i <= 10; i++) {
    const lvl = 5 + i * 4;
    const enemyStars = Math.min(Math.floor(i / 3) + 2, 5) as 1|2|3|4|5;
    const bossStars = Math.min(Math.floor(i / 2) + 2, 6) as 1|2|3|4|5;
    const enemies = [];
    const count = Math.min(2 + Math.floor(i / 4), 4);
    for (let j = 0; j < count; j++) {
      enemies.push({ templateId: monMap[essenceElement], level: lvl, stars: enemyStars });
    }
    floors.push({
      level: i,
      enemies,
      boss: { templateId: bossMap[essenceElement], level: lvl + 5, stars: bossStars },
      rewards: {
        mana: [800 * i, 1200 * i],
        runeStars: [Math.min(Math.floor(i / 3) + 2, 5)],
        runeSets: ['energy'], // Elemental dungeons drop essences, not runes mainly
        expPerMon: 300 * i,
      },
    });
  }
  return floors;
}

const FIRE_DUNGEON_FLOORS = makeElementalDungeon('fire');
const WATER_DUNGEON_FLOORS = makeElementalDungeon('water');
const WIND_DUNGEON_FLOORS = makeElementalDungeon('wind');
const LIGHT_DUNGEON_FLOORS = makeElementalDungeon('light');
const DARK_DUNGEON_FLOORS = makeElementalDungeon('dark');

// ============ TRIAL OF ASCENSION (100 floors) ============
function makeToaFloors(hard: boolean): DungeonFloor[] {
  const mult = hard ? 1.5 : 1;
  const monPool = [
    'inugami_fire', 'griffon_wind', 'mystic_witch_water', 'harpu_fire',
    'vagabond_dark', 'pixie_wind', 'cowgirl_fire', 'garuda_water',
  ];
  const bossPool = [
    'ifrit_fire', 'phoenix_fire', 'dragon_knight_water', 'valkyrja_wind',
    'oracle_fire', 'archangel_light',
  ];
  const floors: DungeonFloor[] = [];
  for (let i = 1; i <= 100; i++) {
    const lvl = Math.floor(10 + i * 0.5 * mult);
    const starBase = Math.min(Math.floor(i / 20) + 2, 5);
    const enemies = [];
    const count = i <= 50 ? 3 : 4;
    for (let j = 0; j < count; j++) {
      enemies.push({
        templateId: monPool[(i + j) % monPool.length],
        level: lvl,
        stars: starBase as 1|2|3|4|5,
      });
    }
    // Every 10th floor is a boss floor with better rewards
    const isBoss = i % 10 === 0;
    const bossTemplate = isBoss ? bossPool[Math.floor(i / 10) % bossPool.length] : monPool[i % monPool.length];
    const bossStars = isBoss ? Math.min(starBase + 1, 6) : starBase;
    floors.push({
      level: i,
      enemies,
      boss: { templateId: bossTemplate, level: lvl + (isBoss ? 10 : 3), stars: bossStars as 1|2|3|4|5 },
      rewards: {
        mana: [1000 * Math.ceil(i / 10), 2000 * Math.ceil(i / 10)],
        runeStars: isBoss ? [5, 6] : [Math.min(Math.floor(i / 20) + 3, 5)],
        runeSets: isBoss ? ['violent', 'will', 'swift', 'rage'] : ['energy'],
        expPerMon: 500 + i * 50,
      },
    });
  }
  return floors;
}

const TOA_FLOORS = makeToaFloors(false);
const TOA_HARD_FLOORS = makeToaFloors(true);

// Dungeon database
export const DUNGEONS: Record<DungeonType, DungeonFloor[]> = {
  giants: GIANTS_FLOORS,
  dragons: DRAGONS_FLOORS,
  necropolis: NECROPOLIS_FLOORS,
  steel_fortress: GIANTS_FLOORS,
  punishers_crypt: NECROPOLIS_FLOORS,
  fire_dungeon: FIRE_DUNGEON_FLOORS,
  water_dungeon: WATER_DUNGEON_FLOORS,
  wind_dungeon: WIND_DUNGEON_FLOORS,
  light_dungeon: LIGHT_DUNGEON_FLOORS,
  dark_dungeon: DARK_DUNGEON_FLOORS,
  toa: TOA_FLOORS,
  toa_hard: TOA_HARD_FLOORS,
};

// ToA reward tiers (every 10 floors gives special rewards)
export function getToaRewards(floor: number, hard: boolean): { crystals: number; mysticalScrolls: number; mana: number; energy: number } {
  const base = hard ? 2 : 1;
  if (floor % 10 !== 0) return { crystals: 0, mysticalScrolls: 0, mana: 1000 * base, energy: 0 };
  const tier = floor / 10;
  return {
    crystals: tier * 10 * base,
    mysticalScrolls: tier >= 5 ? Math.floor(tier / 3) * base : 0,
    mana: tier * 5000 * base,
    energy: tier >= 3 ? 20 : 0,
  };
}

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
