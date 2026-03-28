import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState, useDispatch, useGameStore } from '../store/useGameStore';
import { BattleEngine, createBattleUnit, createEnemyUnit } from '../engine/BattleEngine';
import type { BattleState, BattleUnit, DungeonType, Element } from '../types';
import { getDungeonFloor } from '../data/dungeons';
import { getScenarioStage } from '../data/scenarios';
import type { Difficulty } from '../data/scenarios';
import type { BattleSetup } from '../App';
import { drawMonsterSprite } from './PixelSprite';

// ========== TYPES ==========
interface BattleSprite {
  unit: BattleUnit;
  x: number; y: number; baseX: number; baseY: number;
  size: number; flipX: boolean; anim: SpriteAnim;
  hp: number; maxHp: number;
}

type SpriteAnim =
  | { type: 'idle' }
  | { type: 'rush'; targetX: number; targetY: number; startTime: number; duration: number }
  | { type: 'return'; startX: number; startY: number; startTime: number; duration: number }
  | { type: 'hit'; startTime: number; duration: number }
  | { type: 'cast'; startTime: number; duration: number }
  | { type: 'death'; startTime: number; duration: number };

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
  type: 'spark' | 'circle' | 'ring' | 'heal' | 'star' | 'slash';
}

interface FloatingText {
  x: number; y: number; text: string; color: string;
  startTime: number; duration: number; fontSize: number;
}

interface SkillBanner {
  text: string; color: string; startTime: number; duration: number;
}

// ========== CONSTANTS ==========
// Portrait canvas matching SW layout (enemies top, allies bottom)
const CANVAS_W = 480;
const CANVAS_H = 640;
const SPRITE_SIZE = 72;

// Y zones - enemies in top area, allies in bottom area
const ENEMY_ZONE_Y = 80;
const ALLY_ZONE_Y = 400;

const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#FF4422', water: '#44AAFF', wind: '#44DD44', light: '#FFDD44', dark: '#CC66FF',
};

// ========== DRAWING HELPERS ==========
function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size + 3, size * 0.35, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
}

function createParticles(x: number, y: number, count: number, color: string, type: Particle['type'] = 'spark', spread = 3): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = Math.random() * spread + 1;
    particles.push({
      x, y, vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'heal' ? 2 : 0),
      life: 1, maxLife: 1, color,
      size: type === 'ring' ? 14 : type === 'slash' ? 20 : (Math.random() * 5 + 3),
      type,
    });
  }
  return particles;
}

function createSkillParticles(element: Element, x: number, y: number, skillType: string): Particle[] {
  const color = ELEMENT_COLORS[element];
  switch (skillType) {
    case 'damage':
      return [...createParticles(x, y, 16, color, 'spark', 5), ...createParticles(x, y, 4, '#FFF', 'slash', 3)];
    case 'heal': case 'heal_percent':
      return createParticles(x, y - 16, 10, '#44FF88', 'heal', 2);
    case 'buff':
      return createParticles(x, y - 8, 8, '#44AAFF', 'star', 2);
    case 'debuff':
      return createParticles(x, y, 10, '#FF6600', 'circle', 3);
    default:
      return createParticles(x, y, 10, color, 'spark', 4);
  }
}

// ========== BACKGROUND (SW-style arena) ==========
function drawBackground(ctx: CanvasRenderingContext2D, time: number) {
  // Sky (top half)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H * 0.55);
  skyGrad.addColorStop(0, '#0a0a2a');
  skyGrad.addColorStop(0.4, '#1a1a4e');
  skyGrad.addColorStop(1, '#2a2a5e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H * 0.55);

  // Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 30; i++) {
    const sx = (i * 73 + 17) % CANVAS_W;
    const sy = (i * 41 + 5) % (CANVAS_H * 0.4);
    ctx.globalAlpha = (Math.sin(time / 1000 + i * 1.7) * 0.5 + 0.5) * 0.6;
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, 1);
  }
  ctx.globalAlpha = 1;

  // Ground (bottom half)
  const groundGrad = ctx.createLinearGradient(0, CANVAS_H * 0.45, 0, CANVAS_H);
  groundGrad.addColorStop(0, '#3a6a3a');
  groundGrad.addColorStop(0.3, '#2d5a2d');
  groundGrad.addColorStop(1, '#1a3a1a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, CANVAS_H * 0.45, CANVAS_W, CANVAS_H * 0.55);

  // Ground texture
  ctx.fillStyle = 'rgba(90,140,90,0.3)';
  for (let i = 0; i < 60; i++) {
    const gx = (i * 53 + 11) % CANVAS_W;
    const gy = CANVAS_H * 0.5 + (i * 31) % (CANVAS_H * 0.4);
    ctx.fillRect(gx, gy, 2, 1);
  }
}

// ========== HP BAR ==========
function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, current: number, max: number) {
  const ratio = Math.max(0, current / max);
  const barH = 6; const r = 2;

  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.roundRect(x, y, w, barH, r); ctx.fill();

  if (ratio > 0) {
    ctx.fillStyle = ratio > 0.5 ? '#44DD44' : ratio > 0.25 ? '#DDDD44' : '#DD4444';
    ctx.beginPath(); ctx.roundRect(x, y, Math.max(r * 2, w * ratio), barH, r); ctx.fill();
  }

  ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, barH, r); ctx.stroke();

  ctx.fillStyle = '#FFF'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(current)}`, x + w / 2, y + barH - 1);
}

function drawAtbBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, atb: number) {
  const ratio = Math.min(1, atb / 100);
  ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = ratio >= 1 ? '#FFD700' : '#6666CC';
  ctx.fillRect(x, y, w * ratio, 3);
}

// ========== BUFF/DEBUFF ==========
function drawEffects(ctx: CanvasRenderingContext2D, unit: BattleUnit, x: number, y: number) {
  const allEffects = [
    ...unit.buffs.map(b => ({ ...b, isBuff: true })),
    ...unit.debuffs.map(d => ({ ...d, isBuff: false })),
  ];
  if (!allEffects.length) return;

  const shown = allEffects.slice(0, 6);
  const iconW = 14; const gap = 1;
  const totalW = shown.length * (iconW + gap) - gap;
  const startX = x - totalW / 2;

  shown.forEach((effect, i) => {
    const ix = startX + i * (iconW + gap);
    ctx.fillStyle = effect.isBuff ? 'rgba(0,80,200,0.7)' : 'rgba(200,40,0,0.7)';
    ctx.beginPath(); ctx.roundRect(ix, y, iconW, 12, 2); ctx.fill();
    ctx.fillStyle = effect.isBuff ? '#88CCFF' : '#FF8866';
    ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
    ctx.fillText(effect.isBuff ? '↑' : '↓', ix + iconW / 2, y + 10);
    if (effect.turns > 0) {
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'right';
      ctx.fillText(`${effect.turns}`, ix + iconW - 1, y + 7);
    }
  });
}

// ========== MAIN COMPONENT ==========
interface Props { setup: BattleSetup; onEnd: () => void; }

export function BattlePage({ setup, onEnd }: Props) {
  const gameState = useGameState();
  const dispatch = useDispatch();
  const store = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [speed, setSpeed] = useState(1);
  const engineRef = useRef<BattleEngine | null>(null);

  const spritesRef = useRef<BattleSprite[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatingText[]>([]);
  const bannerRef = useRef<SkillBanner | null>(null);
  const prevLogLenRef = useRef(0);
  const animFrameRef = useRef(0);

  // SW-style: enemies top, allies bottom
  const layoutSprites = useCallback((state: BattleState): BattleSprite[] => {
    const sprites: BattleSprite[] = [];

    // Enemies top - always single row
    const ec = state.enemies.length;
    const eSp = Math.min(110, (CANVAS_W - 20) / Math.max(ec, 1));
    const eSx = (CANVAS_W - (ec - 1) * eSp - SPRITE_SIZE) / 2;
    state.enemies.forEach((unit, i) => {
      sprites.push({
        unit, x: eSx + i * eSp, y: ENEMY_ZONE_Y, baseX: eSx + i * eSp, baseY: ENEMY_ZONE_Y,
        size: SPRITE_SIZE, flipX: false, anim: { type: 'idle' }, hp: unit.currentHp, maxHp: unit.maxHp,
      });
    });

    // Allies bottom - always single row
    const ac = state.allies.length;
    const aSp = Math.min(110, (CANVAS_W - 20) / Math.max(ac, 1));
    const aSx = (CANVAS_W - (ac - 1) * aSp - SPRITE_SIZE) / 2;
    state.allies.forEach((unit, i) => {
      sprites.push({
        unit, x: aSx + i * aSp, y: ALLY_ZONE_Y, baseX: aSx + i * aSp, baseY: ALLY_ZONE_Y,
        size: SPRITE_SIZE, flipX: false, anim: { type: 'idle' }, hp: unit.currentHp, maxHp: unit.maxHp,
      });
    });

    return sprites;
  }, []);

  // Init battle
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
      if (stageData) enemies = stageData.enemies.map(e => createEnemyUnit(e.templateId, e.level, e.stars));
    } else if (setup.mode === 'arena') {
      enemies = [
        createEnemyUnit('lushen_wind', 40, 6), createEnemyUnit('galleon_water', 40, 6),
        createEnemyUnit('verdehile_fire', 40, 6), createEnemyUnit('belladeon_light', 40, 6),
      ];
    }
    if (enemies.length === 0) enemies = [createEnemyUnit('shannon_wind', 20, 4)];

    const engine = new BattleEngine(allies, enemies);
    engineRef.current = engine;
    const initialState = { ...engine.state };
    setBattleState(initialState);
    spritesRef.current = layoutSprites(initialState);
    prevLogLenRef.current = 0;
  }, []);

  // Process log -> animations
  const processNewLogs = useCallback((state: BattleState) => {
    const prevLen = prevLogLenRef.current;
    const newEntries = state.log.slice(prevLen);
    prevLogLenRef.current = state.log.length;
    const now = Date.now();
    const sprites = spritesRef.current;

    for (const entry of newEntries) {
      const actorSprite = sprites.find(s => s.unit.instanceId === entry.actorId);
      if (!actorSprite) continue;
      const targetSprite = entry.targets.length > 0 ? sprites.find(s => s.unit.instanceId === entry.targets[0]) : undefined;
      const isDamage = !!entry.damage && entry.damage > 0;
      const isHeal = !!entry.heal && entry.heal > 0;

      if (isDamage && targetSprite) {
        actorSprite.anim = {
          type: 'rush',
          targetX: targetSprite.x,
          targetY: targetSprite.y + (actorSprite.baseY < targetSprite.baseY ? -SPRITE_SIZE - 10 : SPRITE_SIZE + 10),
          startTime: now, duration: 300,
        };
        setTimeout(() => {
          if (targetSprite) {
            targetSprite.anim = { type: 'hit', startTime: Date.now(), duration: 400 };
            particlesRef.current.push(...createSkillParticles(
              actorSprite.unit.element, targetSprite.x + SPRITE_SIZE / 2, targetSprite.y + SPRITE_SIZE / 2, 'damage'));
            floatsRef.current.push({
              x: targetSprite.x + SPRITE_SIZE / 2, y: targetSprite.y - 8,
              text: `-${entry.damage}`, color: '#FF4444', startTime: Date.now(), duration: 1200,
              fontSize: entry.damage! > 5000 ? 20 : entry.damage! > 1000 ? 16 : 13,
            });
          }
        }, 280);
        setTimeout(() => {
          actorSprite.anim = { type: 'return', startX: actorSprite.x, startY: actorSprite.y, startTime: Date.now(), duration: 250 };
          setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 250);
        }, 550);
      } else if (isHeal && targetSprite) {
        actorSprite.anim = { type: 'cast', startTime: now, duration: 500 };
        setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 500);
        particlesRef.current.push(...createSkillParticles(
          actorSprite.unit.element, targetSprite.x + SPRITE_SIZE / 2, targetSprite.y + SPRITE_SIZE / 2, 'heal'));
        floatsRef.current.push({
          x: targetSprite.x + SPRITE_SIZE / 2, y: targetSprite.y - 8,
          text: `+${entry.heal}`, color: '#44FF88', startTime: now, duration: 1000, fontSize: 14,
        });
      } else if (entry.effects?.length) {
        actorSprite.anim = { type: 'cast', startTime: now, duration: 400 };
        setTimeout(() => { actorSprite.anim = { type: 'idle' }; }, 400);
        if (targetSprite) {
          const pType = entry.action.includes('强化') || entry.action.includes('增益') ? 'buff' : 'debuff';
          particlesRef.current.push(...createSkillParticles(
            actorSprite.unit.element, targetSprite.x + SPRITE_SIZE / 2, targetSprite.y + SPRITE_SIZE / 2, pType));
        }
      }

      if (entry.action && !entry.action.includes('倒下')) {
        bannerRef.current = { text: `${entry.actorName}: ${entry.action}`, color: ELEMENT_COLORS[actorSprite.unit.element], startTime: now, duration: 1000 };
      }
    }

    const allUnits = [...state.allies, ...state.enemies];
    for (const sprite of sprites) {
      const updated = allUnits.find(u => u.instanceId === sprite.unit.instanceId);
      if (updated) {
        sprite.hp = updated.currentHp; sprite.unit = updated;
        if (!updated.alive && sprite.anim.type !== 'death')
          sprite.anim = { type: 'death', startTime: now, duration: 500 };
      }
    }
  }, []);

  // Engine tick
  useEffect(() => {
    if (!engineRef.current || !battleState) return;
    if (battleState.status === 'victory' || battleState.status === 'defeat') return;
    const interval = setInterval(() => {
      if (!engineRef.current) return;
      const ticks = speed === 3 ? 8 : speed === 2 ? 3 : 1;
      const newState = engineRef.current.runTicks(ticks);
      processNewLogs(newState);
      setBattleState({ ...newState });
    }, speed === 3 ? 80 : speed === 2 ? 150 : 250);
    return () => clearInterval(interval);
  }, [battleState?.status, speed, processNewLogs]);

  // Canvas render
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
      drawBackground(ctx, now);

      // Draw all sprites (enemies first = behind, allies in front)
      const enemies = spritesRef.current.filter(s => !s.unit.isAlly);
      const allies = spritesRef.current.filter(s => s.unit.isAlly);

      for (const group of [enemies, allies]) {
        for (const sprite of group) {
          const { unit, size, anim } = sprite;
          let drawX = sprite.baseX, drawY = sprite.baseY;
          let alpha = 1, tint: string | undefined, scaleY = 1;
          const bounce = Math.sin(now / 500 + sprite.baseX * 0.1) * 3;

          switch (anim.type) {
            case 'idle': drawY += bounce; break;
            case 'rush': {
              const t = Math.min(1, (now - anim.startTime) / anim.duration);
              const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              drawX = sprite.baseX + (anim.targetX - sprite.baseX) * e;
              drawY = sprite.baseY + (anim.targetY - sprite.baseY) * e;
              sprite.x = drawX; sprite.y = drawY; break;
            }
            case 'return': {
              const t = Math.min(1, (now - anim.startTime) / anim.duration);
              drawX = anim.startX + (sprite.baseX - anim.startX) * t;
              drawY = anim.startY + (sprite.baseY - anim.startY) * t;
              sprite.x = drawX; sprite.y = drawY; break;
            }
            case 'hit': {
              const t = (now - anim.startTime) / anim.duration;
              drawX = sprite.baseX + Math.sin(t * Math.PI * 6) * 6;
              drawY = sprite.baseY + bounce;
              tint = t < 0.3 ? '#FF4444' : undefined;
              if (t >= 1) sprite.anim = { type: 'idle' }; break;
            }
            case 'cast': {
              const t = (now - anim.startTime) / anim.duration;
              drawY = sprite.baseY - Math.sin(t * Math.PI) * 12;
              scaleY = 1 + Math.sin(t * Math.PI) * 0.08;
              if (t >= 1) sprite.anim = { type: 'idle' }; break;
            }
            case 'death': {
              const t = Math.min(1, (now - anim.startTime) / anim.duration);
              alpha = 1 - t * 0.7; drawY = sprite.baseY + t * 15; scaleY = 1 - t * 0.3; break;
            }
          }

          if (!unit.alive && anim.type !== 'death') { alpha = 0.25; drawY = sprite.baseY + 15; }

          drawShadow(ctx, sprite.baseX, sprite.baseY, size);
          drawMonsterSprite(ctx, unit.family, unit.element, drawX, drawY, size, sprite.flipX, alpha, tint, scaleY);

          // Name
          ctx.fillStyle = unit.isAlly ? '#88FF88' : '#FF8888';
          ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
          ctx.fillText(unit.nameZh, sprite.baseX + size / 2, sprite.baseY - 22);

          // HP + ATB
          drawHpBar(ctx, sprite.baseX - 2, sprite.baseY - 16, size + 4, sprite.hp, sprite.maxHp);
          drawAtbBar(ctx, sprite.baseX - 2, sprite.baseY - 9, size + 4, unit.attackBar);

          // Effects
          if (unit.alive) drawEffects(ctx, unit, sprite.baseX + size / 2, sprite.baseY + size + 6);

          // Turn glow
          if (battleState?.currentTurn === unit.instanceId && unit.alive) {
            ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
            ctx.strokeRect(sprite.baseX - 4, sprite.baseY - 26, size + 8, size + 40);
            ctx.setLineDash([]);
          }
        }
      }

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= 1 / 30; if (p.life <= 0) return false;
        p.x += p.vx; p.y += p.vy; p.vy += 0.15;
        if (p.type === 'heal') p.vy -= 0.35;
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        switch (p.type) {
          case 'spark': ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); break;
          case 'circle': ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); break;
          case 'ring': ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - p.life + 0.5), 0, Math.PI * 2); ctx.stroke(); break;
          case 'heal': ctx.font = '14px monospace'; ctx.fillText('✦', p.x, p.y); break;
          case 'star': ctx.font = '11px monospace'; ctx.fillText('★', p.x, p.y); break;
          case 'slash': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillRect(-p.size / 2, -1, p.size, 2); ctx.restore(); break;
        }
        ctx.globalAlpha = 1; return true;
      });

      // Floating text
      floatsRef.current = floatsRef.current.filter(ft => {
        const t = (now - ft.startTime) / ft.duration; if (t >= 1) return false;
        const y = ft.y - t * 40;
        const a = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
        ctx.save(); ctx.globalAlpha = a;
        ctx.translate(ft.x, y); ctx.scale(t < 0.1 ? 0.5 + t * 5 : 1, t < 0.1 ? 0.5 + t * 5 : 1);
        ctx.font = `bold ${ft.fontSize}px monospace`; ctx.textAlign = 'center';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.strokeText(ft.text, 0, 0);
        ctx.fillStyle = ft.color; ctx.fillText(ft.text, 0, 0); ctx.restore();
        return true;
      });

      // Skill banner
      const banner = bannerRef.current;
      if (banner) {
        const bt = (now - banner.startTime) / banner.duration;
        if (bt < 1) {
          const a = bt < 0.15 ? bt / 0.15 : bt > 0.7 ? (1 - bt) / 0.3 : 1;
          ctx.save(); ctx.globalAlpha = a * 0.8; ctx.fillStyle = '#000';
          ctx.fillRect(0, CANVAS_H / 2 - 16, CANVAS_W, 32);
          ctx.globalAlpha = a; ctx.fillStyle = banner.color;
          ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
          ctx.fillText(banner.text, CANVAS_W / 2, CANVAS_H / 2 + 4); ctx.restore();
        } else bannerRef.current = null;
      }

      // Status overlay
      if (battleState?.status === 'victory') {
        ctx.fillStyle = 'rgba(0,80,0,0.35)'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        ctx.strokeText('✦ 胜利 ✦', CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText('✦ 胜利 ✦', CANVAS_W / 2, CANVAS_H / 2);
      } else if (battleState?.status === 'defeat') {
        ctx.fillStyle = 'rgba(80,0,0,0.35)'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FF4444'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        ctx.strokeText('✗ 失败 ✗', CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText('✗ 失败 ✗', CANVAS_W / 2, CANVAS_H / 2);
      }

      // Wave bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, CANVAS_W, 20);
      if (battleState) {
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left'; ctx.fillText(`波次 ${battleState.wave}/${battleState.totalWaves}`, 8, 14);
        ctx.textAlign = 'right'; ctx.fillText(`x${speed}`, CANVAS_W - 8, 14);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, [battleState?.status, battleState?.currentTurn, speed]);

  const handleEnd = () => {
    if (battleState && setup.mode === 'dungeon' && setup.dungeon && setup.floor) {
      const result = store.runDungeonBattle(setup.team, setup.dungeon as DungeonType, setup.floor);
      dispatch({
        type: 'COMPLETE_DUNGEON_RUN', dungeon: setup.dungeon as DungeonType,
        floor: setup.floor, victory: battleState.status === 'victory',
        mana: result.rewards.mana, rune: result.rewards.rune,
      });
    } else if (battleState && setup.mode === 'scenario' && setup.scenarioRegion && setup.scenarioStage && setup.scenarioDifficulty) {
      dispatch({
        type: 'SCENARIO_BATTLE', regionId: setup.scenarioRegion,
        stage: setup.scenarioStage, difficulty: setup.scenarioDifficulty as Difficulty, team: setup.team,
      });
    }
    onEnd();
  };

  if (!battleState) return <div className="panel">加载中...</div>;

  return (
    <div>
      <div style={{ padding: '2px' }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
          style={{
            width: '100%', height: 'auto', border: '2px solid var(--border)',
            borderRadius: '6px', background: '#000', display: 'block', touchAction: 'none',
          }}
        />
      </div>

      <div className="battle-controls">
        {([1, 2, 3] as const).map(s => (
          <button key={s} className={`pixel-btn ${speed === s ? 'primary' : 'secondary'} small`}
            onClick={() => setSpeed(s)}>x{s}</button>
        ))}
        {(battleState.status === 'victory' || battleState.status === 'defeat') && (
          <button className="pixel-btn gold" onClick={handleEnd}>
            {battleState.status === 'victory' ? '🎉 领取奖励' : '返回'}
          </button>
        )}
      </div>

      <div className="panel" style={{ maxHeight: '60px', overflowY: 'auto', padding: '4px' }}>
        <div className="battle-log" style={{ border: 'none', marginTop: 0, padding: 0, maxHeight: 'none' }}>
          {battleState.log.slice(-10).map((entry, i) => (
            <div key={i} className="log-entry" style={{ fontSize: '7px', lineHeight: '1.3' }}>
              <span className="name">{entry.actorName}</span>{' '}{entry.action}
              {entry.damage ? <span className="damage"> -{entry.damage}</span> : null}
              {entry.heal ? <span className="heal"> +{entry.heal}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
