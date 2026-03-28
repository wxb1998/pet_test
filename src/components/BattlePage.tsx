import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState, useDispatch, useGameStore } from '../store/useGameStore';
import { BattleEngine, createBattleUnit, createEnemyUnit } from '../engine/BattleEngine';
import type { BattleState, BattleUnit, DungeonType, Element } from '../types';
import { getDungeonFloor } from '../data/dungeons';
import { getScenarioStage } from '../data/scenarios';
import type { Difficulty } from '../data/scenarios';
import type { BattleSetup } from '../App';
import { ELEMENT_PALETTES, MONSTER_SPRITES } from './PixelSprite';

// ========== TYPES ==========
type PixelGrid = number[][];

interface BattleSprite {
  unit: BattleUnit;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  flipX: boolean; // enemies face left
  anim: SpriteAnim;
  hp: number;
  maxHp: number;
}

type SpriteAnim =
  | { type: 'idle' }
  | { type: 'rush'; targetX: number; targetY: number; startTime: number; duration: number }
  | { type: 'return'; startX: number; startY: number; startTime: number; duration: number }
  | { type: 'hit'; startTime: number; duration: number }
  | { type: 'cast'; startTime: number; duration: number }
  | { type: 'death'; startTime: number; duration: number };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'circle' | 'ring' | 'heal' | 'star' | 'slash';
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  startTime: number;
  duration: number;
  fontSize: number;
}

interface SkillBanner {
  text: string;
  color: string;
  startTime: number;
  duration: number;
}

// ========== CONSTANTS ==========
const CANVAS_W = 400;
const CANVAS_H = 240;
const SPRITE_SIZE = 40; // pixels on canvas
const GROUND_Y = 170;

const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#FF4422', water: '#44AAFF', wind: '#44DD44', light: '#FFDD44', dark: '#CC66FF',
};

// Skill effect colors (used by particle system)
const _SKILL_COLORS: Record<string, string> = {
  damage: '#FF4444', heal: '#44FF44', buff: '#44AAFF', debuff: '#FF8800',
  strip: '#CC66FF', stun: '#FFFF00', freeze: '#88DDFF',
};
void _SKILL_COLORS;

// ========== SPRITE DRAWING UTILITY ==========
function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  family: string,
  element: Element,
  x: number, y: number,
  size: number,
  flipX: boolean,
  alpha: number = 1,
  tint?: string,
  scaleY: number = 1,
) {
  const palette = ELEMENT_PALETTES[element];
  const sprite: PixelGrid = MONSTER_SPRITES[family] || MONSTER_SPRITES['Pixie'];
  const pixelSize = size / 16;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);
  if (flipX) ctx.scale(-1, 1);
  ctx.scale(1, scaleY);
  ctx.translate(-size / 2, -size / 2);

  const colorMap: Record<number, string> = {
    1: tint || palette.outline,
    2: tint || palette.primary,
    3: tint || palette.secondary,
    4: tint || palette.accent,
    5: '#FFFFFF',
  };

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const val = sprite[row]?.[col] ?? 0;
      if (val === 0) continue;
      ctx.fillStyle = colorMap[val] || palette.primary;
      ctx.fillRect(
        Math.floor(col * pixelSize),
        Math.floor(row * pixelSize),
        Math.ceil(pixelSize),
        Math.ceil(pixelSize),
      );
    }
  }
  ctx.restore();
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size + 2, size * 0.35, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ========== PARTICLE SYSTEM ==========
function createParticles(
  x: number, y: number,
  count: number, color: string,
  type: Particle['type'] = 'spark',
  spread: number = 3,
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = (Math.random() * spread + 1);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'heal' ? 2 : 0),
      life: 1,
      maxLife: 1,
      color,
      size: type === 'ring' ? 8 : type === 'slash' ? 12 : (Math.random() * 3 + 2),
      type,
    });
  }
  return particles;
}

function createSkillParticles(element: Element, x: number, y: number, skillType: string): Particle[] {
  const color = ELEMENT_COLORS[element];
  switch (skillType) {
    case 'damage':
      return [
        ...createParticles(x, y, 12, color, 'spark', 4),
        ...createParticles(x, y, 3, '#FFFFFF', 'slash', 2),
      ];
    case 'heal':
    case 'heal_percent':
      return createParticles(x, y - 10, 8, '#44FF88', 'heal', 1.5);
    case 'buff':
      return createParticles(x, y - 5, 6, '#44AAFF', 'star', 1.5);
    case 'debuff':
      return createParticles(x, y, 8, '#FF6600', 'circle', 2);
    case 'strip':
      return createParticles(x, y, 6, '#CC66FF', 'ring', 2);
    default:
      return createParticles(x, y, 8, color, 'spark', 3);
  }
}

// ========== BACKGROUND ==========
function drawBackground(ctx: CanvasRenderingContext2D, time: number) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(0.5, '#2a2a5e');
  grad.addColorStop(1, '#3a3a6e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

  // Twinkling stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 20; i++) {
    const sx = (i * 73 + 17) % CANVAS_W;
    const sy = (i * 41 + 5) % (GROUND_Y - 30);
    const twinkle = Math.sin(time / 1000 + i * 1.7) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.6;
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Ground
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
  groundGrad.addColorStop(0, '#4a6a4a');
  groundGrad.addColorStop(0.3, '#3a5a3a');
  groundGrad.addColorStop(1, '#2a4a2a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

  // Ground texture (pixel dots)
  ctx.fillStyle = '#5a7a5a';
  for (let i = 0; i < 40; i++) {
    const gx = (i * 53 + 11) % CANVAS_W;
    const gy = GROUND_Y + 5 + (i * 31) % (CANVAS_H - GROUND_Y - 10);
    ctx.fillRect(gx, gy, 2, 1);
  }

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2, GROUND_Y + 5);
  ctx.lineTo(CANVAS_W / 2, CANVAS_H);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ========== HP BAR ==========
function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, current: number, max: number, _element: Element) {
  const ratio = Math.max(0, current / max);
  const barH = 4;

  // BG
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x, y, w, barH);

  // HP bar
  const hpColor = ratio > 0.5 ? '#44DD44' : ratio > 0.25 ? '#DDDD44' : '#DD4444';
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, w * ratio, barH);

  // Border
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, w, barH);
}

function drawAtbBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, atb: number) {
  const ratio = Math.min(1, atb / 100);
  const barH = 2;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x, y, w, barH);
  ctx.fillStyle = ratio >= 1 ? '#FFD700' : '#8888FF';
  ctx.fillRect(x, y, w * ratio, barH);
}

// ========== BUFF/DEBUFF ICONS ==========
const BUFF_ICONS: Record<string, { symbol: string; color: string }> = {
  atkUp:       { symbol: '⚔↑', color: '#FF6644' },
  defUp:       { symbol: '🛡↑', color: '#44AAFF' },
  spdUp:       { symbol: '⚡↑', color: '#FFDD44' },
  critUp:      { symbol: '💥↑', color: '#FF4488' },
  immunity:    { symbol: '✦',   color: '#FFD700' },
  invincible:  { symbol: '🔰',  color: '#FFD700' },
  shield:      { symbol: '◇',   color: '#88DDFF' },
  regen:       { symbol: '♥',   color: '#44FF88' },
  reflect:     { symbol: '↺',   color: '#CC88FF' },
  counter:     { symbol: '⚔↺',  color: '#FF8844' },
  endure:      { symbol: '♦',   color: '#FFAA44' },
};
const DEBUFF_ICONS: Record<string, { symbol: string; color: string }> = {
  atkDown:     { symbol: '⚔↓', color: '#FF4444' },
  defDown:     { symbol: '🛡↓', color: '#FF4444' },
  spdDown:     { symbol: '⚡↓', color: '#FF8844' },
  glancing:    { symbol: '✗',   color: '#CC6644' },
  stun:        { symbol: '★',   color: '#FFFF00' },
  freeze:      { symbol: '❄',   color: '#88DDFF' },
  sleep:       { symbol: '💤',  color: '#AAAACC' },
  silence:     { symbol: '🔇',  color: '#CC44CC' },
  dot:         { symbol: '🔥',  color: '#FF4400' },
  healBlock:   { symbol: '♥✗',  color: '#CC0044' },
  brandMark:   { symbol: '◎',   color: '#FF6600' },
  oblivion:    { symbol: '∅',   color: '#888888' },
  provoke:     { symbol: '!',   color: '#FF2222' },
  bomb:        { symbol: '💣',  color: '#FF4444' },
  strip:       { symbol: '↯',   color: '#CC66FF' },
};

function drawEffects(ctx: CanvasRenderingContext2D, unit: BattleUnit, x: number, y: number) {
  const allEffects = [
    ...unit.buffs.map(b => ({ ...b, isBuff: true })),
    ...unit.debuffs.map(d => ({ ...d, isBuff: false })),
  ];
  if (allEffects.length === 0) return;

  const maxShow = 8;
  const shown = allEffects.slice(0, maxShow);
  const iconW = 10;
  const iconH = 9;
  const gap = 1;
  const totalW = shown.length * (iconW + gap) - gap;
  const startX = x - totalW / 2;

  shown.forEach((effect, i) => {
    const ix = startX + i * (iconW + gap);
    const iy = y;

    // Background box
    const bgColor = effect.isBuff ? 'rgba(0,80,200,0.7)' : 'rgba(200,40,0,0.7)';
    ctx.fillStyle = bgColor;
    ctx.fillRect(ix, iy, iconW, iconH);

    // Border
    ctx.strokeStyle = effect.isBuff ? '#44AAFF' : '#FF6644';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(ix, iy, iconW, iconH);

    // Icon/text
    const icons = effect.isBuff ? BUFF_ICONS : DEBUFF_ICONS;
    const iconInfo = icons[effect.type] || { symbol: effect.isBuff ? '↑' : '↓', color: effect.isBuff ? '#88CCFF' : '#FF8866' };
    ctx.fillStyle = iconInfo.color;
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(iconInfo.symbol.charAt(0), ix + iconW / 2, iy + iconH - 2);

    // Duration indicator (turns left)
    if (effect.turns > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '5px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${effect.turns}`, ix + iconW - 1, iy + 5);
    }
  });
}

// ========== MAIN COMPONENT ==========
interface Props {
  setup: BattleSetup;
  onEnd: () => void;
}

export function BattlePage({ setup, onEnd }: Props) {
  const gameState = useGameState();
  const dispatch = useDispatch();
  const store = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [speed, setSpeed] = useState(1);
  const engineRef = useRef<BattleEngine | null>(null);

  // Animation state refs (mutable, no re-render needed)
  const spritesRef = useRef<BattleSprite[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatingText[]>([]);
  const bannerRef = useRef<SkillBanner | null>(null);
  const prevLogLenRef = useRef(0);
  const animFrameRef = useRef(0);

  // Layout sprites on the battle field
  const layoutSprites = useCallback((state: BattleState): BattleSprite[] => {
    const sprites: BattleSprite[] = [];
    const allyCount = state.allies.length;
    const enemyCount = state.enemies.length;

    // Allies on left side
    state.allies.forEach((unit, i) => {
      const x = 30 + (i % 2) * 30;
      const y = GROUND_Y - SPRITE_SIZE - 20 + i * (SPRITE_SIZE + 12) - (allyCount * 10);
      const baseY = Math.min(GROUND_Y - SPRITE_SIZE - 5, Math.max(GROUND_Y - SPRITE_SIZE * 2.5, y));
      sprites.push({
        unit, x, y: baseY, baseX: x, baseY: baseY,
        size: SPRITE_SIZE, flipX: false,
        anim: { type: 'idle' },
        hp: unit.currentHp, maxHp: unit.maxHp,
      });
    });

    // Enemies on right side
    state.enemies.forEach((unit, i) => {
      const x = CANVAS_W - 30 - SPRITE_SIZE - (i % 2) * 30;
      const y = GROUND_Y - SPRITE_SIZE - 20 + i * (SPRITE_SIZE + 12) - (enemyCount * 10);
      const baseY = Math.min(GROUND_Y - SPRITE_SIZE - 5, Math.max(GROUND_Y - SPRITE_SIZE * 2.5, y));
      sprites.push({
        unit, x, y: baseY, baseX: x, baseY: baseY,
        size: SPRITE_SIZE, flipX: true,
        anim: { type: 'idle' },
        hp: unit.currentHp, maxHp: unit.maxHp,
      });
    });
    return sprites;
  }, []);

  // Initialize battle
  useEffect(() => {
    const allies = setup.team
      .map(id => gameState.monsters.find(m => m.id === id))
      .filter(Boolean)
      .map(m => createBattleUnit(m!, true));

    let enemies: BattleUnit[] = [];
    if (setup.mode === 'dungeon' && setup.dungeon && setup.floor) {
      const floorData = getDungeonFloor(setup.dungeon as DungeonType, setup.floor);
      if (floorData) {
        enemies = [
          ...floorData.enemies.map(e => createEnemyUnit(e.templateId, e.level, e.stars)),
          createEnemyUnit(floorData.boss.templateId, floorData.boss.level, floorData.boss.stars),
        ];
      }
    } else if (setup.mode === 'scenario' && setup.scenarioRegion && setup.scenarioStage && setup.scenarioDifficulty) {
      const stageData = getScenarioStage(setup.scenarioRegion, setup.scenarioStage, setup.scenarioDifficulty as Difficulty);
      if (stageData) {
        enemies = stageData.enemies.map(e => createEnemyUnit(e.templateId, e.level, e.stars));
      }
    } else if (setup.mode === 'arena') {
      enemies = [
        createEnemyUnit('lushen_wind', 40, 6),
        createEnemyUnit('galleon_water', 40, 6),
        createEnemyUnit('verdehile_fire', 40, 6),
        createEnemyUnit('belladeon_light', 40, 6),
      ];
    }
    if (enemies.length === 0) {
      enemies = [createEnemyUnit('shannon_wind', 20, 4)];
    }

    const engine = new BattleEngine(allies, enemies);
    engineRef.current = engine;
    const initialState = { ...engine.state };
    setBattleState(initialState);
    spritesRef.current = layoutSprites(initialState);
    prevLogLenRef.current = 0;
  }, []);

  // Process new log entries into animations
  const processNewLogs = useCallback((state: BattleState) => {
    const prevLen = prevLogLenRef.current;
    const newEntries = state.log.slice(prevLen);
    prevLogLenRef.current = state.log.length;

    const now = Date.now();
    const sprites = spritesRef.current;

    for (const entry of newEntries) {
      const actorSprite = sprites.find(s => s.unit.instanceId === entry.actorId);
      if (!actorSprite) continue;

      // Find first target sprite
      const targetSprite = entry.targets.length > 0
        ? sprites.find(s => s.unit.instanceId === entry.targets[0])
        : undefined;

      // Determine action type from log
      const isDamage = !!entry.damage && entry.damage > 0;
      const isHeal = !!entry.heal && entry.heal > 0;

      if (isDamage && targetSprite) {
        // Attacker rushes to target
        actorSprite.anim = {
          type: 'rush',
          targetX: targetSprite.x + (actorSprite.flipX ? SPRITE_SIZE + 10 : -SPRITE_SIZE - 10),
          targetY: targetSprite.y,
          startTime: now,
          duration: 200,
        };

        // Target gets hit after delay
        setTimeout(() => {
          if (targetSprite) {
            targetSprite.anim = { type: 'hit', startTime: Date.now(), duration: 300 };
            // Damage particles
            particlesRef.current.push(
              ...createSkillParticles(
                actorSprite.unit.element,
                targetSprite.x + SPRITE_SIZE / 2,
                targetSprite.y + SPRITE_SIZE / 2,
                'damage',
              )
            );
            // Damage number
            floatsRef.current.push({
              x: targetSprite.x + SPRITE_SIZE / 2,
              y: targetSprite.y - 5,
              text: `-${entry.damage}`,
              color: '#FF4444',
              startTime: Date.now(),
              duration: 1200,
              fontSize: entry.damage! > 5000 ? 14 : entry.damage! > 1000 ? 12 : 10,
            });
          }
        }, 180);

        // Attacker returns after hit
        setTimeout(() => {
          actorSprite.anim = {
            type: 'return',
            startX: actorSprite.x,
            startY: actorSprite.y,
            startTime: Date.now(),
            duration: 200,
          };
          setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 200);
        }, 400);

      } else if (isHeal && targetSprite) {
        // Cast animation
        actorSprite.anim = { type: 'cast', startTime: now, duration: 400 };
        setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 400);

        // Heal particles on target
        particlesRef.current.push(
          ...createSkillParticles(actorSprite.unit.element, targetSprite.x + SPRITE_SIZE / 2, targetSprite.y + SPRITE_SIZE / 2, 'heal')
        );
        floatsRef.current.push({
          x: targetSprite.x + SPRITE_SIZE / 2,
          y: targetSprite.y - 5,
          text: `+${entry.heal}`,
          color: '#44FF88',
          startTime: now,
          duration: 1000,
          fontSize: 10,
        });
      } else if (entry.effects && entry.effects.length > 0) {
        // Buff/debuff
        actorSprite.anim = { type: 'cast', startTime: now, duration: 300 };
        setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 300);

        if (targetSprite) {
          const pType = entry.action.includes('强化') || entry.action.includes('增益') ? 'buff' : 'debuff';
          particlesRef.current.push(
            ...createSkillParticles(actorSprite.unit.element, targetSprite.x + SPRITE_SIZE / 2, targetSprite.y + SPRITE_SIZE / 2, pType)
          );
        }
      }

      // Skill name banner
      if (entry.action && !entry.action.includes('倒下')) {
        bannerRef.current = {
          text: `${entry.actorName}: ${entry.action}`,
          color: ELEMENT_COLORS[actorSprite.unit.element],
          startTime: now,
          duration: 800,
        };
      }
    }

    // Update unit HP and death anims
    const allUnits = [...state.allies, ...state.enemies];
    for (const sprite of sprites) {
      const updated = allUnits.find(u => u.instanceId === sprite.unit.instanceId);
      if (updated) {
        sprite.hp = updated.currentHp;
        sprite.unit = updated;
        if (!updated.alive && sprite.anim.type !== 'death') {
          sprite.anim = { type: 'death', startTime: now, duration: 600 };
        }
      }
    }
  }, []);

  // Auto tick engine
  useEffect(() => {
    if (!engineRef.current || !battleState) return;
    if (battleState.status === 'victory' || battleState.status === 'defeat') return;

    const interval = setInterval(() => {
      if (!engineRef.current) return;
      const ticksPerFrame = speed === 3 ? 10 : speed === 2 ? 5 : 2;
      const newState = engineRef.current.runTicks(ticksPerFrame);
      processNewLogs(newState);
      setBattleState({ ...newState });
    }, speed === 3 ? 60 : speed === 2 ? 80 : 120);

    return () => clearInterval(interval);
  }, [battleState?.status, speed, processNewLogs]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const now = Date.now();
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background
      drawBackground(ctx, now);

      // Sprites
      for (const sprite of spritesRef.current) {
        const { unit, size, flipX, anim } = sprite;
        let drawX = sprite.baseX;
        let drawY = sprite.baseY;
        let alpha = 1;
        let tint: string | undefined;
        let scaleY = 1;

        // Idle bounce
        const idleBounce = Math.sin(now / 400 + sprite.baseX) * 2;

        switch (anim.type) {
          case 'idle':
            drawY += idleBounce;
            break;
          case 'rush': {
            const t = Math.min(1, (now - anim.startTime) / anim.duration);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            drawX = sprite.baseX + (anim.targetX - sprite.baseX) * ease;
            drawY = sprite.baseY + (anim.targetY - sprite.baseY) * ease;
            sprite.x = drawX;
            sprite.y = drawY;
            break;
          }
          case 'return': {
            const t = Math.min(1, (now - anim.startTime) / anim.duration);
            drawX = anim.startX + (sprite.baseX - anim.startX) * t;
            drawY = anim.startY + (sprite.baseY - anim.startY) * t;
            sprite.x = drawX;
            sprite.y = drawY;
            break;
          }
          case 'hit': {
            const t = (now - anim.startTime) / anim.duration;
            drawX = sprite.baseX + Math.sin(t * Math.PI * 6) * 4;
            drawY = sprite.baseY + idleBounce;
            tint = t < 0.3 ? '#FF4444' : undefined;
            if (t >= 1) sprite.anim = { type: 'idle' };
            break;
          }
          case 'cast': {
            const t = (now - anim.startTime) / anim.duration;
            drawY = sprite.baseY - Math.sin(t * Math.PI) * 8;
            scaleY = 1 + Math.sin(t * Math.PI) * 0.1;
            if (t >= 1) sprite.anim = { type: 'idle' };
            break;
          }
          case 'death': {
            const t = Math.min(1, (now - anim.startTime) / anim.duration);
            alpha = 1 - t * 0.7;
            drawY = sprite.baseY + t * 10;
            scaleY = 1 - t * 0.3;
            break;
          }
        }

        if (!unit.alive && anim.type !== 'death') {
          alpha = 0.3;
          drawY = sprite.baseY + 10;
        }

        // Shadow
        drawShadow(ctx, sprite.baseX, sprite.baseY, size);

        // Sprite
        drawPixelSprite(ctx, unit.family, unit.element, drawX, drawY, size, flipX, alpha, tint, scaleY);

        // Name
        ctx.fillStyle = unit.isAlly ? '#88FF88' : '#FF8888';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(unit.nameZh, sprite.baseX + size / 2, sprite.baseY - 16);

        // HP bar
        drawHpBar(ctx, sprite.baseX - 2, sprite.baseY - 12, size + 4, sprite.hp, sprite.maxHp, unit.element);

        // ATB bar
        drawAtbBar(ctx, sprite.baseX - 2, sprite.baseY - 7, size + 4, unit.attackBar);

        // Buff/debuff dots
        if (unit.alive) {
          drawEffects(ctx, unit, sprite.baseX + size / 2, sprite.baseY + size + 6);
        }

        // Active indicator (current turn glow)
        if (battleState?.currentTurn === unit.instanceId && unit.alive) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(sprite.baseX - 3, sprite.baseY - 20, size + 6, size + 30);
          ctx.setLineDash([]);
        }
      }

      // Particles
      const dt = 1 / 60;
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= dt * (1 / (p.maxLife * 0.5));
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        if (p.type === 'heal') p.vy -= 0.3; // float up

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        switch (p.type) {
          case 'spark':
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'ring':
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 - p.life + 0.5), 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'heal': {
            ctx.font = '10px monospace';
            ctx.fillText('✦', p.x, p.y);
            break;
          }
          case 'star': {
            ctx.font = '8px monospace';
            ctx.fillText('★', p.x, p.y);
            break;
          }
          case 'slash': {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.atan2(p.vy, p.vx));
            ctx.fillRect(-p.size / 2, -1, p.size, 2);
            ctx.restore();
            break;
          }
        }
        ctx.globalAlpha = 1;
        return true;
      });

      // Floating text
      floatsRef.current = floatsRef.current.filter(ft => {
        const t = (now - ft.startTime) / ft.duration;
        if (t >= 1) return false;

        const y = ft.y - t * 25;
        const alpha = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
        const scale = t < 0.1 ? 0.5 + t * 5 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(ft.x, y);
        ctx.scale(scale, scale);
        ctx.font = `bold ${ft.fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(ft.text, 0, 0);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();

        return true;
      });

      // Skill banner
      const banner = bannerRef.current;
      if (banner) {
        const bt = (now - banner.startTime) / banner.duration;
        if (bt < 1) {
          const alpha = bt < 0.15 ? bt / 0.15 : bt > 0.7 ? (1 - bt) / 0.3 : 1;
          ctx.save();
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, CANVAS_H / 2 - 12, CANVAS_W, 24);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = banner.color;
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(banner.text, CANVAS_W / 2, CANVAS_H / 2 + 4);
          ctx.restore();
        } else {
          bannerRef.current = null;
        }
      }

      // Status overlay
      if (battleState?.status === 'victory') {
        ctx.fillStyle = 'rgba(0,100,0,0.4)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✦ 胜利 ✦', CANVAS_W / 2, CANVAS_H / 2);
      } else if (battleState?.status === 'defeat') {
        ctx.fillStyle = 'rgba(100,0,0,0.4)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✗ 失败 ✗', CANVAS_W / 2, CANVAS_H / 2);
      }

      // Wave info
      if (battleState) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, CANVAS_W, 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`波次 ${battleState.wave}/${battleState.totalWaves}`, 5, 10);
        ctx.textAlign = 'right';
        ctx.fillText(`x${speed}`, CANVAS_W - 5, 10);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [battleState?.status, battleState?.currentTurn, speed]);

  const handleEnd = () => {
    if (battleState && setup.mode === 'dungeon' && setup.dungeon && setup.floor) {
      const result = store.runDungeonBattle(setup.team, setup.dungeon as DungeonType, setup.floor);
      dispatch({
        type: 'COMPLETE_DUNGEON_RUN',
        dungeon: setup.dungeon as DungeonType,
        floor: setup.floor,
        victory: battleState.status === 'victory',
        mana: result.rewards.mana,
        rune: result.rewards.rune,
      });
    } else if (battleState && setup.mode === 'scenario' && setup.scenarioRegion && setup.scenarioStage && setup.scenarioDifficulty) {
      // Dispatch SCENARIO_BATTLE to award XP, mana, rune drops, and update progress
      dispatch({
        type: 'SCENARIO_BATTLE',
        regionId: setup.scenarioRegion,
        stage: setup.scenarioStage,
        difficulty: setup.scenarioDifficulty as Difficulty,
        team: setup.team,
      });
    }
    onEnd();
  };

  if (!battleState) return <div className="panel">加载中...</div>;

  return (
    <div>
      <div className="panel" style={{ padding: '4px' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            width: '100%',
            maxWidth: CANVAS_W,
            height: 'auto',
            imageRendering: 'pixelated',
            border: '2px solid var(--border)',
            background: '#000',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>

      {/* Battle log (compact) */}
      <div className="panel" style={{ maxHeight: '80px', overflowY: 'auto', padding: '4px' }}>
        <div className="battle-log">
          {battleState.log.slice(-15).map((entry, i) => (
            <div key={i} className="log-entry" style={{ fontSize: '6px' }}>
              <span className="name">{entry.actorName}</span>
              {' '}{entry.action}
              {entry.damage ? <span className="damage"> -{entry.damage}</span> : null}
              {entry.heal ? <span className="heal"> +{entry.heal}</span> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="battle-controls">
        <button
          className={`pixel-btn ${speed === 1 ? 'primary' : 'secondary'} small`}
          onClick={() => setSpeed(1)}
        >
          x1
        </button>
        <button
          className={`pixel-btn ${speed === 2 ? 'primary' : 'secondary'} small`}
          onClick={() => setSpeed(2)}
        >
          x2
        </button>
        <button
          className={`pixel-btn ${speed === 3 ? 'primary' : 'secondary'} small`}
          onClick={() => setSpeed(3)}
        >
          x3
        </button>

        {(battleState.status === 'victory' || battleState.status === 'defeat') && (
          <button className="pixel-btn gold" onClick={handleEnd}>
            {battleState.status === 'victory' ? '🎉 领取奖励' : '返回'}
          </button>
        )}
      </div>
    </div>
  );
}
