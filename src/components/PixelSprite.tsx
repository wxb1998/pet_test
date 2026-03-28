import { useRef, useEffect } from 'react';
import type { Element } from '../types';

// Element color palettes
export const ELEMENT_PALETTES: Record<Element, { primary: string; secondary: string; accent: string; outline: string; bg: string }> = {
  fire:  { primary: '#FF4444', secondary: '#FF8800', accent: '#FFCC00', outline: '#8B0000', bg: '#331100' },
  water: { primary: '#4488FF', secondary: '#22BBFF', accent: '#88DDFF', outline: '#002288', bg: '#001133' },
  wind:  { primary: '#44CC44', secondary: '#88FF44', accent: '#CCFF88', outline: '#006600', bg: '#002200' },
  light: { primary: '#FFDD44', secondary: '#FFFFFF', accent: '#FFFFAA', outline: '#886600', bg: '#332200' },
  dark:  { primary: '#9944CC', secondary: '#CC44FF', accent: '#DD88FF', outline: '#330066', bg: '#110022' },
};

// Extra colors for skin, hair, metal, etc.
export const EXTRA_COLORS = {
  skin: '#FFCC99',
  skinShade: '#E8B080',
  hair: '#553322',
  hairLight: '#774433',
  metal: '#AAAAAA',
  metalDark: '#777777',
  metalLight: '#CCCCCC',
  white: '#FFFFFF',
  black: '#222222',
};

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  outline: string;
  bg: string;
}

type DrawFunction = (ctx: CanvasRenderingContext2D, p: Palette, s: number) => void;

// Helper drawing utilities - all coordinates are 0-1 normalized, scaled by size parameter
function drawHelpers(ctx: CanvasRenderingContext2D, s: number) {
  return {
    rect(x: number, y: number, w: number, h: number, color: string) {
      ctx.fillStyle = color;
      ctx.fillRect(x * s, y * s, w * s, h * s);
    },
    circle(cx: number, cy: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx * s, cy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    },
    ellipse(cx: number, cy: number, rx: number, ry: number, color: string, rotation: number = 0) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx * s, cy * s, rx * s, ry * s, rotation, 0, Math.PI * 2);
      ctx.fill();
    },
    roundRect(x: number, y: number, w: number, h: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x * s, y * s, w * s, h * s, r * s);
      ctx.fill();
    },
    line(x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * s;
      ctx.beginPath();
      ctx.moveTo(x1 * s, y1 * s);
      ctx.lineTo(x2 * s, y2 * s);
      ctx.stroke();
    },
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1 * s, y1 * s);
      ctx.lineTo(x2 * s, y2 * s);
      ctx.lineTo(x3 * s, y3 * s);
      ctx.closePath();
      ctx.fill();
    },
    poly(points: [number, number][], color: string) {
      if (points.length < 2) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(points[0][0] * s, points[0][1] * s);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] * s, points[i][1] * s);
      }
      ctx.closePath();
      ctx.fill();
    },
    stroke(x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1 * s, y1 * s);
      ctx.lineTo(x2 * s, y2 * s);
      ctx.stroke();
    },
  };
}

// Draw functions for all 27 monster families
const drawPhoenix: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Wings back
  h.ellipse(0.2, 0.4, 0.15, 0.25, p.secondary);
  h.ellipse(0.8, 0.4, 0.15, 0.25, p.secondary);
  // Body
  h.circle(0.5, 0.5, 0.12, p.primary);
  h.circle(0.5, 0.35, 0.1, p.primary);
  // Head
  h.circle(0.5, 0.2, 0.08, EXTRA_COLORS.skin);
  // Eyes
  h.circle(0.45, 0.18, 0.02, '#000000');
  h.circle(0.55, 0.18, 0.02, '#000000');
  // Crest
  h.triangle(0.48, 0.08, 0.5, 0.02, 0.52, 0.08, p.accent);
  // Tail feathers
  h.poly([[0.5, 0.65], [0.55, 0.85], [0.5, 0.8], [0.45, 0.85]], p.accent);
  h.poly([[0.5, 0.65], [0.58, 0.75], [0.5, 0.7], [0.42, 0.75]], p.secondary);
};

const drawValkyrja: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Helmet
  h.circle(0.5, 0.2, 0.09, p.secondary);
  h.rect(0.42, 0.18, 0.16, 0.05, p.secondary);
  // Armor shoulders
  h.rect(0.35, 0.35, 0.3, 0.12, p.primary);
  h.circle(0.32, 0.4, 0.07, p.primary);
  h.circle(0.68, 0.4, 0.07, p.primary);
  // Chest plate
  h.rect(0.4, 0.4, 0.2, 0.2, p.secondary);
  // Face
  h.circle(0.5, 0.25, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.23, 0.015, '#000000');
  h.circle(0.54, 0.23, 0.015, '#000000');
  // Hair
  h.ellipse(0.5, 0.15, 0.08, 0.06, EXTRA_COLORS.hair);
  // Skirt/tasset
  h.poly([[0.4, 0.6], [0.35, 0.8], [0.5, 0.75], [0.65, 0.8], [0.6, 0.6]], p.primary);
  // Shield left arm
  h.circle(0.25, 0.45, 0.08, p.accent);
  h.circle(0.25, 0.45, 0.04, p.outline);
  // Spear right hand
  h.rect(0.72, 0.35, 0.03, 0.35, EXTRA_COLORS.metal);
  h.triangle(0.735, 0.32, 0.71, 0.28, 0.76, 0.28, p.accent);
  // Legs
  h.rect(0.42, 0.75, 0.08, 0.2, EXTRA_COLORS.metal);
  h.rect(0.5, 0.75, 0.08, 0.2, EXTRA_COLORS.metal);
};

const drawDragonKnight: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Dragon helmet with horns
  h.circle(0.5, 0.2, 0.1, p.secondary);
  h.triangle(0.45, 0.08, 0.43, 0.02, 0.47, 0.05, p.primary);
  h.triangle(0.55, 0.08, 0.57, 0.02, 0.53, 0.05, p.primary);
  // Helmet details
  h.rect(0.42, 0.25, 0.16, 0.04, p.accent);
  // Shoulder armor (huge)
  h.circle(0.2, 0.38, 0.12, p.primary);
  h.circle(0.8, 0.38, 0.12, p.primary);
  // Chest plate
  h.rect(0.35, 0.35, 0.3, 0.25, p.secondary);
  h.rect(0.38, 0.4, 0.24, 0.15, p.accent);
  // Face
  h.circle(0.5, 0.28, 0.06, EXTRA_COLORS.skin);
  h.circle(0.46, 0.27, 0.012, '#000000');
  h.circle(0.54, 0.27, 0.012, '#000000');
  // Two-handed sword
  h.rect(0.48, 0.08, 0.04, 0.5, EXTRA_COLORS.metal);
  h.rect(0.44, 0.05, 0.12, 0.04, EXTRA_COLORS.metal);
  h.triangle(0.5, 0.08, 0.48, 0.02, 0.52, 0.02, p.primary);
  // Cape
  h.poly([[0.65, 0.4], [0.85, 0.4], [0.75, 0.75]], p.primary);
  h.poly([[0.35, 0.4], [0.15, 0.4], [0.25, 0.75]], p.primary);
  // Legs with armor boots
  h.rect(0.4, 0.65, 0.08, 0.25, EXTRA_COLORS.metal);
  h.rect(0.52, 0.65, 0.08, 0.25, EXTRA_COLORS.metal);
  h.circle(0.44, 0.92, 0.08, EXTRA_COLORS.metalLight);
  h.circle(0.56, 0.92, 0.08, EXTRA_COLORS.metalLight);
};

const drawIfrit: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Two horns
  h.triangle(0.43, 0.12, 0.42, 0.02, 0.45, 0.08, p.primary);
  h.triangle(0.57, 0.12, 0.58, 0.02, 0.55, 0.08, p.primary);
  // Head
  h.circle(0.5, 0.25, 0.08, EXTRA_COLORS.skin);
  // Eyes glowing
  h.circle(0.46, 0.23, 0.018, p.accent);
  h.circle(0.54, 0.23, 0.018, p.accent);
  // Muscular chest with abs
  h.rect(0.35, 0.35, 0.3, 0.25, EXTRA_COLORS.skinShade);
  h.rect(0.42, 0.38, 0.08, 0.18, EXTRA_COLORS.skin);
  h.rect(0.5, 0.38, 0.08, 0.18, EXTRA_COLORS.skin);
  h.stroke(0.46, 0.38, 0.46, 0.55, 0.01, p.outline);
  // Flame lower body
  h.poly([[0.35, 0.6], [0.3, 0.85], [0.5, 0.75], [0.7, 0.85], [0.65, 0.6]], p.primary);
  h.poly([[0.4, 0.65], [0.35, 0.8], [0.5, 0.7], [0.65, 0.8], [0.6, 0.65]], p.secondary);
  // Arms spread
  h.ellipse(0.15, 0.4, 0.08, 0.12, EXTRA_COLORS.skin);
  h.ellipse(0.85, 0.4, 0.08, 0.12, EXTRA_COLORS.skin);
  // Energy aura
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 0.02 * s;
  ctx.beginPath();
  ctx.ellipse(0.5 * s, 0.45 * s, 0.35 * s, 0.35 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

const drawOracle: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Ornate headpiece
  h.circle(0.5, 0.15, 0.1, p.secondary);
  h.circle(0.38, 0.12, 0.05, p.accent);
  h.circle(0.62, 0.12, 0.05, p.accent);
  h.circle(0.5, 0.08, 0.04, p.accent);
  // Face
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.26, 0.015, '#000000');
  h.circle(0.54, 0.26, 0.015, '#000000');
  // Flowing robes
  h.poly([[0.35, 0.35], [0.3, 0.8], [0.5, 0.85], [0.7, 0.8], [0.65, 0.35]], p.primary);
  h.poly([[0.38, 0.4], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.62, 0.4]], p.secondary);
  // Long sleeves
  h.ellipse(0.2, 0.5, 0.06, 0.2, p.primary);
  h.ellipse(0.8, 0.5, 0.06, 0.2, p.primary);
  // Crystal ball floating between hands
  h.circle(0.5, 0.55, 0.08, p.accent);
  h.circle(0.5, 0.55, 0.05, EXTRA_COLORS.white);
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.015 * s;
  ctx.beginPath();
  ctx.arc(0.5 * s, 0.55 * s, 0.08 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

const drawArchangel: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Large wings
  h.poly([[0.15, 0.35], [0.1, 0.55], [0.25, 0.45]], p.secondary);
  h.poly([[0.85, 0.35], [0.9, 0.55], [0.75, 0.45]], p.secondary);
  h.poly([[0.12, 0.35], [0.05, 0.6], [0.2, 0.5]], p.primary);
  h.poly([[0.88, 0.35], [0.95, 0.6], [0.8, 0.5]], p.primary);
  // Halo
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 0.02 * s;
  ctx.beginPath();
  ctx.arc(0.5 * s, 0.15 * s, 0.1 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Head
  h.circle(0.5, 0.2, 0.07, EXTRA_COLORS.skin);
  h.circle(0.47, 0.18, 0.015, '#000000');
  h.circle(0.53, 0.18, 0.015, '#000000');
  // Flowing robes
  h.poly([[0.38, 0.3], [0.3, 0.8], [0.5, 0.85], [0.7, 0.8], [0.62, 0.3]], p.primary);
  h.poly([[0.4, 0.35], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.6, 0.35]], p.secondary);
  // Staff with glow
  h.rect(0.48, 0.15, 0.04, 0.5, EXTRA_COLORS.metal);
  h.circle(0.5, 0.12, 0.06, p.accent);
  h.circle(0.5, 0.12, 0.03, EXTRA_COLORS.white);
};

const drawJoker: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Tri-pointed hat with bells
  h.triangle(0.35, 0.12, 0.5, 0.02, 0.65, 0.12, p.primary);
  h.circle(0.35, 0.13, 0.03, p.accent);
  h.circle(0.5, 0.02, 0.03, p.accent);
  h.circle(0.65, 0.13, 0.03, p.accent);
  // Face grinning
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.26, 0.015, '#000000');
  h.circle(0.54, 0.26, 0.015, '#000000');
  h.rect(0.44, 0.3, 0.12, 0.02, '#000000');
  // Cape with diamonds
  h.poly([[0.3, 0.35], [0.15, 0.75], [0.35, 0.75]], p.primary);
  h.poly([[0.7, 0.35], [0.85, 0.75], [0.65, 0.75]], p.primary);
  h.circle(0.22, 0.5, 0.04, p.accent);
  h.circle(0.78, 0.5, 0.04, p.accent);
  // Body colorful
  h.rect(0.4, 0.35, 0.2, 0.25, p.secondary);
  // Playing cards in hand
  h.rect(0.72, 0.45, 0.08, 0.12, EXTRA_COLORS.white);
  h.rect(0.74, 0.47, 0.06, 0.1, p.outline);
  h.circle(0.77, 0.5, 0.02, p.primary);
  // Pants
  h.rect(0.4, 0.6, 0.08, 0.25, p.accent);
  h.rect(0.52, 0.6, 0.08, 0.25, p.accent);
};

const drawEpikionPriest: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Large ornate hat
  h.circle(0.5, 0.1, 0.1, p.secondary);
  h.rect(0.4, 0.15, 0.2, 0.03, p.accent);
  h.circle(0.42, 0.09, 0.04, p.accent);
  h.circle(0.58, 0.09, 0.04, p.accent);
  // Face
  h.circle(0.5, 0.3, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.28, 0.015, '#000000');
  h.circle(0.54, 0.28, 0.015, '#000000');
  // Long robes
  h.poly([[0.35, 0.38], [0.3, 0.85], [0.5, 0.88], [0.7, 0.85], [0.65, 0.38]], p.primary);
  h.poly([[0.38, 0.42], [0.33, 0.8], [0.5, 0.82], [0.67, 0.8], [0.62, 0.42]], p.secondary);
  // Book in hands
  h.rect(0.42, 0.48, 0.12, 0.15, EXTRA_COLORS.metal);
  h.line(0.48, 0.48, 0.48, 0.63, 0.005, p.outline);
  // Cross symbol
  h.rect(0.47, 0.52, 0.02, 0.08, p.accent);
  h.rect(0.44, 0.54, 0.06, 0.02, p.accent);
  // Gentle pose - sleeves
  h.ellipse(0.2, 0.45, 0.07, 0.18, p.primary);
  h.ellipse(0.8, 0.45, 0.07, 0.18, p.primary);
};

const drawPirateCaptan: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Tricorn hat
  h.poly([[0.35, 0.15], [0.5, 0.05], [0.65, 0.15]], p.primary);
  h.rect(0.35, 0.15, 0.3, 0.03, p.outline);
  h.circle(0.5, 0.08, 0.03, p.accent);
  // Face with scar
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.27, 0.015, '#000000');
  h.circle(0.57, 0.27, 0.015, '#000000');
  h.line(0.6, 0.25, 0.65, 0.3, 0.008, p.outline);
  // Long coat
  h.poly([[0.35, 0.35], [0.25, 0.75], [0.5, 0.8], [0.75, 0.75], [0.65, 0.35]], p.primary);
  h.poly([[0.38, 0.4], [0.3, 0.7], [0.5, 0.73], [0.7, 0.7], [0.62, 0.4]], p.secondary);
  // Gold trim
  h.rect(0.38, 0.35, 0.24, 0.02, p.accent);
  h.circle(0.48, 0.36, 0.015, p.accent);
  h.circle(0.52, 0.36, 0.015, p.accent);
  // Sword
  h.rect(0.72, 0.4, 0.03, 0.35, EXTRA_COLORS.metal);
  h.rect(0.68, 0.38, 0.1, 0.03, EXTRA_COLORS.metal);
  h.triangle(0.73, 0.4, 0.71, 0.35, 0.75, 0.35, p.primary);
  // Boots
  h.rect(0.42, 0.75, 0.07, 0.15, EXTRA_COLORS.metalDark);
  h.rect(0.51, 0.75, 0.07, 0.15, EXTRA_COLORS.metalDark);
};

const drawVampire: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Cape spread wide
  h.poly([[0.25, 0.4], [0.15, 0.75], [0.35, 0.7]], p.primary);
  h.poly([[0.75, 0.4], [0.85, 0.75], [0.65, 0.7]], p.primary);
  h.poly([[0.25, 0.4], [0.18, 0.6], [0.33, 0.5]], p.secondary);
  h.poly([[0.75, 0.4], [0.82, 0.6], [0.67, 0.5]], p.secondary);
  // High collar
  h.poly([[0.42, 0.32], [0.38, 0.42], [0.48, 0.38]], p.primary);
  h.poly([[0.58, 0.32], [0.62, 0.42], [0.52, 0.38]], p.primary);
  // Slicked back hair
  h.ellipse(0.5, 0.18, 0.08, 0.07, EXTRA_COLORS.black);
  // Pale face
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.white);
  // Red eyes
  h.circle(0.46, 0.26, 0.015, '#FF0000');
  h.circle(0.54, 0.26, 0.015, '#FF0000');
  // Fangs
  h.triangle(0.49, 0.32, 0.48, 0.35, 0.5, 0.33, EXTRA_COLORS.white);
  h.triangle(0.51, 0.32, 0.52, 0.35, 0.5, 0.33, EXTRA_COLORS.white);
  // Formal vest
  h.rect(0.4, 0.35, 0.2, 0.25, p.secondary);
  h.rect(0.42, 0.37, 0.16, 0.02, p.accent);
};

const drawSylph: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Ethereal floating form
  h.circle(0.5, 0.25, 0.06, EXTRA_COLORS.skin);
  // Robes with trail
  h.poly([[0.38, 0.32], [0.32, 0.75], [0.5, 0.8], [0.68, 0.75], [0.62, 0.32]], p.primary);
  h.poly([[0.4, 0.37], [0.35, 0.7], [0.5, 0.73], [0.65, 0.7], [0.6, 0.37]], p.secondary);
  // Ribbons flowing
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 0.02 * s;
  ctx.beginPath();
  ctx.moveTo(0.35 * s, 0.4 * s);
  ctx.bezierCurveTo(0.25 * s, 0.5 * s, 0.2 * s, 0.7 * s, 0.3 * s, 0.85 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.65 * s, 0.4 * s);
  ctx.bezierCurveTo(0.75 * s, 0.5 * s, 0.8 * s, 0.7 * s, 0.7 * s, 0.85 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Slim arms
  h.ellipse(0.2, 0.4, 0.05, 0.1, p.secondary);
  h.ellipse(0.8, 0.4, 0.05, 0.1, p.secondary);
};

const drawRakshasa: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Four arms - top pair
  h.ellipse(0.15, 0.35, 0.06, 0.12, EXTRA_COLORS.skin);
  h.ellipse(0.85, 0.35, 0.06, 0.12, EXTRA_COLORS.skin);
  // Four arms - bottom pair
  h.ellipse(0.12, 0.5, 0.06, 0.12, EXTRA_COLORS.skin);
  h.ellipse(0.88, 0.5, 0.06, 0.12, EXTRA_COLORS.skin);
  // Head
  h.circle(0.5, 0.22, 0.08, EXTRA_COLORS.skin);
  // Hair ornaments
  h.circle(0.42, 0.15, 0.04, p.accent);
  h.circle(0.58, 0.15, 0.04, p.accent);
  // Eyes exotic
  h.circle(0.46, 0.2, 0.015, p.primary);
  h.circle(0.54, 0.2, 0.015, p.primary);
  // Body - exotic outfit
  h.rect(0.38, 0.3, 0.24, 0.2, p.primary);
  h.poly([[0.38, 0.5], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.62, 0.5]], p.secondary);
  // Curved blade
  h.rect(0.75, 0.3, 0.04, 0.25, EXTRA_COLORS.metal);
  // Blade curve accent
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 0.015 * s;
  ctx.beginPath();
  ctx.arc(0.77 * s, 0.3 * s, 0.04 * s, 0, Math.PI);
  ctx.stroke();
};

const drawSkyDancer: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Floating graceful pose
  h.circle(0.5, 0.25, 0.06, EXTRA_COLORS.skin);
  // Flower in hair
  h.circle(0.52, 0.15, 0.04, p.accent);
  h.circle(0.48, 0.18, 0.03, p.secondary);
  h.circle(0.56, 0.18, 0.03, p.secondary);
  h.circle(0.5, 0.2, 0.02, EXTRA_COLORS.white);
  // Silk ribbon dress
  h.poly([[0.38, 0.32], [0.3, 0.8], [0.5, 0.85], [0.7, 0.8], [0.62, 0.32]], p.primary);
  h.poly([[0.4, 0.37], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.6, 0.37]], p.secondary);
  // Spiraling ribbons
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.015 * s;
  ctx.beginPath();
  ctx.moveTo(0.35 * s, 0.35 * s);
  ctx.bezierCurveTo(0.3 * s, 0.45 * s, 0.35 * s, 0.6 * s, 0.5 * s, 0.7 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.65 * s, 0.35 * s);
  ctx.bezierCurveTo(0.7 * s, 0.45 * s, 0.65 * s, 0.6 * s, 0.5 * s, 0.7 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Outstretched arms
  h.ellipse(0.18, 0.35, 0.08, 0.1, p.secondary);
  h.ellipse(0.82, 0.35, 0.08, 0.1, p.secondary);
};

const drawPixie: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Large butterfly wings with patterns
  h.ellipse(0.25, 0.35, 0.12, 0.18, p.secondary);
  h.ellipse(0.75, 0.35, 0.12, 0.18, p.secondary);
  // Wing patterns
  h.circle(0.2, 0.28, 0.04, p.accent);
  h.circle(0.2, 0.42, 0.04, p.accent);
  h.circle(0.8, 0.28, 0.04, p.accent);
  h.circle(0.8, 0.42, 0.04, p.accent);
  // Small cute body
  h.circle(0.5, 0.4, 0.06, EXTRA_COLORS.skin);
  // Big head proportions
  h.circle(0.5, 0.25, 0.08, EXTRA_COLORS.skin);
  // Big sparkly eyes
  h.circle(0.46, 0.23, 0.018, p.primary);
  h.circle(0.54, 0.23, 0.018, p.primary);
  h.circle(0.47, 0.22, 0.008, EXTRA_COLORS.white);
  h.circle(0.55, 0.22, 0.008, EXTRA_COLORS.white);
  // Cute smile (small arc)
  ctx.strokeStyle = p.primary;
  ctx.lineWidth = 0.008 * s;
  ctx.beginPath();
  ctx.arc(0.5 * s, 0.27 * s, 0.015 * s, 0, Math.PI);
  ctx.stroke();
  // Short dress
  h.poly([[0.43, 0.45], [0.4, 0.65], [0.5, 0.68], [0.6, 0.65], [0.57, 0.45]], p.primary);
  // Wand with star
  h.rect(0.72, 0.28, 0.02, 0.2, EXTRA_COLORS.metal);
  h.triangle(0.73, 0.25, 0.71, 0.22, 0.75, 0.22, p.accent);
};

const drawGriffon: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Eagle head
  h.circle(0.5, 0.2, 0.08, p.primary);
  h.triangle(0.56, 0.22, 0.62, 0.2, 0.58, 0.18, p.secondary);
  // Fierce eyes
  h.circle(0.46, 0.18, 0.015, '#000000');
  h.circle(0.54, 0.18, 0.015, '#000000');
  // Feathered chest
  h.ellipse(0.5, 0.4, 0.12, 0.15, p.secondary);
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 0.01 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo((0.4 + i * 0.03) * s, 0.35 * s);
    ctx.lineTo((0.4 + i * 0.03) * s, 0.5 * s);
    ctx.stroke();
  }
  // Muscular body
  h.rect(0.35, 0.38, 0.3, 0.25, p.primary);
  // Wing-arms spread
  h.poly([[0.25, 0.35], [0.1, 0.45], [0.2, 0.55]], p.secondary);
  h.poly([[0.75, 0.35], [0.9, 0.45], [0.8, 0.55]], p.secondary);
  // Taloned feet
  h.rect(0.42, 0.65, 0.08, 0.15, p.primary);
  h.rect(0.5, 0.65, 0.08, 0.15, p.primary);
  h.triangle(0.44, 0.8, 0.42, 0.85, 0.46, 0.83, p.accent);
  h.triangle(0.52, 0.8, 0.5, 0.85, 0.54, 0.83, p.accent);
};

const drawInugami: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Wolf head with pointy ears
  h.circle(0.5, 0.22, 0.09, EXTRA_COLORS.hair);
  h.triangle(0.42, 0.08, 0.4, 0.02, 0.44, 0.08, EXTRA_COLORS.hair);
  h.triangle(0.58, 0.08, 0.6, 0.02, 0.56, 0.08, EXTRA_COLORS.hair);
  // Snout
  h.ellipse(0.55, 0.28, 0.05, 0.04, EXTRA_COLORS.skin);
  // Fierce eyes
  h.circle(0.46, 0.2, 0.015, p.primary);
  h.circle(0.54, 0.2, 0.015, p.primary);
  // Tail
  ctx.strokeStyle = EXTRA_COLORS.hair;
  ctx.lineWidth = 0.04 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0.35 * s, 0.5 * s);
  ctx.quadraticCurveTo(0.2 * s, 0.4 * s, 0.25 * s, 0.25 * s);
  ctx.stroke();
  // Light armor
  h.rect(0.35, 0.35, 0.3, 0.15, p.secondary);
  h.circle(0.38, 0.38, 0.04, p.accent);
  h.circle(0.62, 0.38, 0.04, p.accent);
  // Clawed hands
  h.ellipse(0.2, 0.4, 0.06, 0.12, EXTRA_COLORS.skin);
  h.ellipse(0.8, 0.4, 0.06, 0.12, EXTRA_COLORS.skin);
  h.rect(0.18, 0.5, 0.02, 0.08, p.primary);
  h.rect(0.82, 0.5, 0.02, 0.08, p.primary);
  // Legs
  h.rect(0.42, 0.5, 0.08, 0.25, EXTRA_COLORS.hair);
  h.rect(0.5, 0.5, 0.08, 0.25, EXTRA_COLORS.hair);
};

const drawGaruda: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Bird beak face
  h.circle(0.5, 0.22, 0.08, p.primary);
  h.triangle(0.57, 0.22, 0.64, 0.2, 0.58, 0.18, p.secondary);
  // Colorful plumage crest
  h.circle(0.5, 0.08, 0.05, p.accent);
  h.circle(0.45, 0.1, 0.04, p.secondary);
  h.circle(0.55, 0.1, 0.04, p.secondary);
  // Proud eyes
  h.circle(0.46, 0.2, 0.012, '#000000');
  h.circle(0.54, 0.2, 0.012, '#000000');
  // Feathered chest
  h.ellipse(0.5, 0.4, 0.11, 0.12, p.secondary);
  // Wing-arms spread
  h.poly([[0.2, 0.35], [0.05, 0.45], [0.18, 0.5]], p.primary);
  h.poly([[0.8, 0.35], [0.95, 0.45], [0.82, 0.5]], p.primary);
  h.poly([[0.22, 0.35], [0.08, 0.52], [0.2, 0.55]], p.secondary);
  h.poly([[0.78, 0.35], [0.92, 0.52], [0.8, 0.55]], p.secondary);
  // Body
  h.rect(0.38, 0.38, 0.24, 0.2, p.primary);
  // Taloned feet
  h.circle(0.44, 0.75, 0.05, p.primary);
  h.circle(0.56, 0.75, 0.05, p.primary);
  h.triangle(0.42, 0.8, 0.4, 0.85, 0.44, 0.83, p.accent);
  h.triangle(0.58, 0.8, 0.56, 0.85, 0.6, 0.83, p.accent);
};

const drawHarpu: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Small female body
  h.circle(0.5, 0.3, 0.05, EXTRA_COLORS.skin);
  // Wings for arms (feathered)
  h.ellipse(0.2, 0.35, 0.08, 0.12, p.primary);
  h.ellipse(0.8, 0.35, 0.08, 0.12, p.primary);
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 0.008 * s;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo((0.15 + i * 0.03) * s, 0.3 * s);
    ctx.lineTo((0.15 + i * 0.03) * s, 0.45 * s);
    ctx.stroke();
  }
  // Head with messy hair
  h.circle(0.5, 0.18, 0.06, EXTRA_COLORS.skin);
  h.ellipse(0.48, 0.12, 0.06, 0.05, EXTRA_COLORS.hair);
  h.ellipse(0.52, 0.12, 0.06, 0.05, EXTRA_COLORS.hair);
  // Cute fierce eyes
  h.circle(0.47, 0.16, 0.012, p.primary);
  h.circle(0.53, 0.16, 0.012, p.primary);
  // Bird feet
  h.circle(0.45, 0.7, 0.04, p.primary);
  h.circle(0.55, 0.7, 0.04, p.primary);
  h.triangle(0.43, 0.74, 0.41, 0.78, 0.45, 0.76, p.accent);
  h.triangle(0.57, 0.74, 0.59, 0.78, 0.55, 0.76, p.accent);
  // Small skirt
  h.poly([[0.43, 0.35], [0.4, 0.55], [0.5, 0.56], [0.6, 0.55], [0.57, 0.35]], p.secondary);
};

const drawMysticWitch: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Large pointed hat
  h.triangle(0.35, 0.15, 0.5, 0.02, 0.65, 0.15, p.primary);
  h.rect(0.35, 0.15, 0.3, 0.04, p.secondary);
  h.circle(0.5, 0.02, 0.02, p.accent);
  // Face
  h.circle(0.5, 0.3, 0.07, EXTRA_COLORS.skin);
  // Cat-like eyes
  h.triangle(0.46, 0.27, 0.45, 0.25, 0.46, 0.29, p.primary);
  h.triangle(0.54, 0.27, 0.55, 0.25, 0.54, 0.29, p.primary);
  // Smirk (small smile)
  ctx.strokeStyle = p.primary;
  ctx.lineWidth = 0.01 * s;
  ctx.beginPath();
  ctx.arc(0.5 * s, 0.33 * s, 0.018 * s, 0, Math.PI);
  ctx.stroke();
  // Long flowing dress
  h.poly([[0.35, 0.38], [0.25, 0.8], [0.5, 0.85], [0.75, 0.8], [0.65, 0.38]], p.primary);
  h.poly([[0.38, 0.43], [0.3, 0.75], [0.5, 0.78], [0.7, 0.75], [0.62, 0.43]], p.secondary);
  // Broom held diagonally
  h.rect(0.65, 0.3, 0.03, 0.45, EXTRA_COLORS.metal);
  // Broom straw effect
  h.poly([[0.675, 0.75], [0.65, 0.8], [0.675, 0.78], [0.7, 0.8]], p.accent);
  h.poly([[0.675, 0.75], [0.67, 0.8], [0.685, 0.78], [0.69, 0.8]], p.accent);
};

const drawVagabond: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Bandana on head
  h.triangle(0.42, 0.12, 0.5, 0.06, 0.58, 0.12, p.primary);
  h.rect(0.38, 0.15, 0.24, 0.03, p.secondary);
  // Face
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.26, 0.014, '#000000');
  h.circle(0.54, 0.26, 0.014, '#000000');
  // Simple clothes
  h.rect(0.4, 0.35, 0.2, 0.2, p.primary);
  // Belt
  h.rect(0.38, 0.53, 0.24, 0.03, p.accent);
  h.circle(0.5, 0.545, 0.02, EXTRA_COLORS.metal);
  // Sword strapped to back
  h.rect(0.65, 0.2, 0.03, 0.45, EXTRA_COLORS.metal);
  h.rect(0.62, 0.18, 0.09, 0.03, EXTRA_COLORS.metal);
  h.triangle(0.665, 0.2, 0.645, 0.14, 0.685, 0.14, p.primary);
  // Martial stance - legs
  h.rect(0.4, 0.55, 0.08, 0.25, p.secondary);
  h.rect(0.52, 0.55, 0.08, 0.25, p.secondary);
};

const drawCowgirl: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Cowboy hat
  h.circle(0.5, 0.12, 0.08, p.primary);
  h.rect(0.35, 0.15, 0.3, 0.02, p.secondary);
  h.ellipse(0.5, 0.14, 0.1, 0.03, p.accent);
  // Face
  h.circle(0.5, 0.28, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.26, 0.014, '#000000');
  h.circle(0.54, 0.26, 0.014, '#000000');
  // Ponytail
  h.ellipse(0.62, 0.22, 0.05, 0.08, EXTRA_COLORS.hair);
  // Short jacket
  h.rect(0.38, 0.35, 0.24, 0.15, p.primary);
  h.rect(0.4, 0.37, 0.04, 0.12, p.secondary);
  h.rect(0.56, 0.37, 0.04, 0.12, p.secondary);
  // Dual pistols (one per hand)
  h.rect(0.2, 0.4, 0.02, 0.08, EXTRA_COLORS.metal);
  h.rect(0.78, 0.4, 0.02, 0.08, EXTRA_COLORS.metal);
  h.rect(0.19, 0.4, 0.04, 0.02, EXTRA_COLORS.metal);
  h.rect(0.77, 0.4, 0.04, 0.02, EXTRA_COLORS.metal);
  // Pants
  h.rect(0.4, 0.5, 0.08, 0.2, p.secondary);
  h.rect(0.52, 0.5, 0.08, 0.2, p.secondary);
  // Boots with spurs
  h.circle(0.44, 0.7, 0.06, EXTRA_COLORS.metalDark);
  h.circle(0.56, 0.7, 0.06, EXTRA_COLORS.metalDark);
  h.circle(0.42, 0.68, 0.03, p.accent);
  h.circle(0.58, 0.68, 0.03, p.accent);
};

const drawFairyQueen: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Large elaborate butterfly wings
  h.ellipse(0.2, 0.4, 0.15, 0.22, p.secondary);
  h.ellipse(0.8, 0.4, 0.15, 0.22, p.secondary);
  h.ellipse(0.18, 0.25, 0.08, 0.15, p.accent);
  h.ellipse(0.82, 0.25, 0.08, 0.15, p.accent);
  h.circle(0.15, 0.35, 0.05, p.primary);
  h.circle(0.85, 0.35, 0.05, p.primary);
  // Crown
  h.circle(0.5, 0.08, 0.03, p.accent);
  h.triangle(0.45, 0.15, 0.43, 0.08, 0.47, 0.12, p.accent);
  h.triangle(0.55, 0.15, 0.57, 0.08, 0.53, 0.12, p.accent);
  // Face
  h.circle(0.5, 0.28, 0.08, EXTRA_COLORS.skin);
  h.circle(0.46, 0.26, 0.016, p.primary);
  h.circle(0.54, 0.26, 0.016, p.primary);
  // Scepter
  h.rect(0.72, 0.25, 0.02, 0.35, EXTRA_COLORS.metal);
  h.circle(0.73, 0.22, 0.05, p.accent);
  h.circle(0.73, 0.22, 0.025, EXTRA_COLORS.white);
  // Elegant long gown
  h.poly([[0.38, 0.37], [0.3, 0.8], [0.5, 0.85], [0.7, 0.8], [0.62, 0.37]], p.primary);
  h.poly([[0.4, 0.42], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.6, 0.42]], p.secondary);
  // Glowing aura
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 0.025 * s;
  ctx.beginPath();
  ctx.ellipse(0.5 * s, 0.45 * s, 0.38 * s, 0.38 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

const drawGiant: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Massive muscular body
  h.rect(0.3, 0.45, 0.4, 0.3, EXTRA_COLORS.skinShade);
  h.rect(0.35, 0.5, 0.1, 0.25, EXTRA_COLORS.skin);
  h.rect(0.55, 0.5, 0.1, 0.25, EXTRA_COLORS.skin);
  // Rocky/stone texture
  h.circle(0.38, 0.48, 0.03, p.primary);
  h.circle(0.62, 0.48, 0.03, p.primary);
  h.circle(0.45, 0.65, 0.03, p.primary);
  h.circle(0.55, 0.65, 0.03, p.primary);
  // Small head
  h.circle(0.5, 0.25, 0.06, EXTRA_COLORS.skinShade);
  // Fierce eyes
  h.circle(0.47, 0.23, 0.012, p.primary);
  h.circle(0.53, 0.23, 0.012, p.primary);
  // Simple loincloth
  h.poly([[0.4, 0.73], [0.35, 0.88], [0.5, 0.85], [0.65, 0.88], [0.6, 0.73]], p.primary);
  // Huge fists
  h.circle(0.2, 0.5, 0.08, EXTRA_COLORS.skin);
  h.circle(0.8, 0.5, 0.08, EXTRA_COLORS.skin);
  h.circle(0.18, 0.52, 0.04, p.primary);
  h.circle(0.82, 0.52, 0.04, p.primary);
  // Legs
  h.rect(0.38, 0.75, 0.1, 0.2, EXTRA_COLORS.skinShade);
  h.rect(0.52, 0.75, 0.1, 0.2, EXTRA_COLORS.skinShade);
};

const drawDragon: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Dragon on hind legs
  // Wings spread
  h.poly([[0.15, 0.4], [0.05, 0.35], [0.12, 0.55]], p.secondary);
  h.poly([[0.85, 0.4], [0.95, 0.35], [0.88, 0.55]], p.secondary);
  h.poly([[0.12, 0.4], [0.0, 0.38], [0.08, 0.6]], p.primary);
  h.poly([[0.88, 0.4], [1.0, 0.38], [0.92, 0.6]], p.primary);
  // Long neck
  h.ellipse(0.5, 0.3, 0.06, 0.12, p.primary);
  // Horned head
  h.circle(0.5, 0.15, 0.08, p.primary);
  h.triangle(0.44, 0.08, 0.43, 0.02, 0.46, 0.06, p.secondary);
  h.triangle(0.56, 0.08, 0.57, 0.02, 0.54, 0.06, p.secondary);
  // Eyes glowing
  h.circle(0.46, 0.13, 0.015, p.accent);
  h.circle(0.54, 0.13, 0.015, p.accent);
  // Body with scales
  h.ellipse(0.5, 0.5, 0.15, 0.18, p.primary);
  for (let i = 0; i < 6; i++) {
    h.triangle(0.35 + i * 0.05, 0.48, 0.37 + i * 0.05, 0.44, 0.39 + i * 0.05, 0.48, p.secondary);
  }
  // Clawed arms
  h.ellipse(0.2, 0.45, 0.07, 0.1, p.primary);
  h.ellipse(0.8, 0.45, 0.07, 0.1, p.primary);
  h.rect(0.18, 0.54, 0.02, 0.08, p.secondary);
  h.rect(0.82, 0.54, 0.02, 0.08, p.secondary);
  // Tail
  ctx.strokeStyle = p.secondary;
  ctx.lineWidth = 0.05 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0.65 * s, 0.55 * s);
  ctx.quadraticCurveTo(0.85 * s, 0.65 * s, 0.8 * s, 0.85 * s);
  ctx.stroke();
  // Legs
  h.rect(0.4, 0.68, 0.08, 0.18, p.primary);
  h.rect(0.52, 0.68, 0.08, 0.18, p.primary);
};

const drawChakramDancer: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Dynamic spin pose
  // Twin chakram blades
  ctx.strokeStyle = p.primary;
  ctx.lineWidth = 0.025 * s;
  ctx.beginPath();
  ctx.arc(0.2 * s, 0.45 * s, 0.06 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0.8 * s, 0.45 * s, 0.06 * s, 0, Math.PI * 2);
  ctx.stroke();
  h.circle(0.2, 0.45, 0.015, p.secondary);
  h.circle(0.8, 0.45, 0.015, p.secondary);
  // Head
  h.circle(0.5, 0.22, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.2, 0.014, p.primary);
  h.circle(0.54, 0.2, 0.014, p.primary);
  // Light armor
  h.rect(0.38, 0.3, 0.24, 0.18, p.secondary);
  h.circle(0.45, 0.32, 0.04, p.accent);
  h.circle(0.55, 0.32, 0.04, p.accent);
  // Dance outfit
  h.poly([[0.4, 0.48], [0.35, 0.75], [0.5, 0.78], [0.65, 0.75], [0.6, 0.48]], p.primary);
  h.poly([[0.42, 0.52], [0.38, 0.7], [0.5, 0.72], [0.62, 0.7], [0.58, 0.52]], p.secondary);
  // Dynamic legs
  h.rect(0.38, 0.75, 0.1, 0.15, p.secondary);
  h.rect(0.52, 0.75, 0.1, 0.15, p.secondary);
};

const drawBoomerangWarrior: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Boomerang in throwing pose
  h.circle(0.5, 0.35, 0.08, p.primary);
  h.circle(0.5, 0.35, 0.04, EXTRA_COLORS.metal);
  h.rect(0.48, 0.3, 0.04, 0.1, p.accent);
  // Head
  h.circle(0.5, 0.22, 0.07, EXTRA_COLORS.skin);
  h.circle(0.46, 0.2, 0.014, p.primary);
  h.circle(0.54, 0.2, 0.014, p.primary);
  // Short practical outfit
  h.rect(0.38, 0.3, 0.24, 0.15, p.primary);
  h.circle(0.45, 0.32, 0.03, p.accent);
  h.circle(0.55, 0.32, 0.03, p.accent);
  // Action stance legs
  h.rect(0.35, 0.45, 0.1, 0.25, p.secondary);
  h.rect(0.55, 0.45, 0.1, 0.25, p.secondary);
  // Boots
  h.circle(0.4, 0.72, 0.055, EXTRA_COLORS.metalDark);
  h.circle(0.6, 0.72, 0.055, EXTRA_COLORS.metalDark);
  // Action arms
  h.ellipse(0.18, 0.32, 0.07, 0.09, EXTRA_COLORS.skin);
  h.ellipse(0.82, 0.35, 0.07, 0.12, EXTRA_COLORS.skin);
};

const drawLichKing: DrawFunction = (ctx, p, s) => {
  const h = drawHelpers(ctx, s);
  // Skull face
  h.circle(0.5, 0.25, 0.08, EXTRA_COLORS.black);
  h.circle(0.47, 0.23, 0.015, p.accent);
  h.circle(0.53, 0.23, 0.015, p.accent);
  h.rect(0.48, 0.27, 0.04, 0.02, p.accent);
  // Crown/circlet
  h.rect(0.42, 0.15, 0.16, 0.03, EXTRA_COLORS.metal);
  h.triangle(0.45, 0.12, 0.45, 0.06, 0.48, 0.1, p.accent);
  h.triangle(0.52, 0.12, 0.52, 0.06, 0.55, 0.1, p.accent);
  h.circle(0.5, 0.1, 0.02, p.primary);
  // Tattered robe
  h.poly([[0.3, 0.35], [0.2, 0.8], [0.5, 0.85], [0.8, 0.8], [0.7, 0.35]], p.primary);
  h.poly([[0.35, 0.4], [0.25, 0.75], [0.5, 0.78], [0.75, 0.75], [0.65, 0.4]], p.secondary);
  // Tattered edges
  h.poly([[0.25, 0.75], [0.23, 0.82], [0.28, 0.78]], p.primary);
  h.poly([[0.75, 0.75], [0.77, 0.82], [0.72, 0.78]], p.primary);
  // Floating magic orbs
  h.circle(0.15, 0.4, 0.05, p.accent);
  h.circle(0.15, 0.4, 0.025, EXTRA_COLORS.white);
  h.circle(0.85, 0.4, 0.05, p.accent);
  h.circle(0.85, 0.4, 0.025, EXTRA_COLORS.white);
  // Magical aura
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.02 * s;
  ctx.beginPath();
  ctx.ellipse(0.5 * s, 0.5 * s, 0.4 * s, 0.42 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const MONSTER_SPRITES: Record<string, DrawFunction> = {
  Phoenix: drawPhoenix,
  Valkyrja: drawValkyrja,
  'Dragon Knight': drawDragonKnight,
  Ifrit: drawIfrit,
  Oracle: drawOracle,
  Archangel: drawArchangel,
  Joker: drawJoker,
  'Epikion Priest': drawEpikionPriest,
  'Pirate Captain': drawPirateCaptan,
  Vampire: drawVampire,
  Sylph: drawSylph,
  Rakshasa: drawRakshasa,
  'Sky Dancer': drawSkyDancer,
  Pixie: drawPixie,
  Griffon: drawGriffon,
  Inugami: drawInugami,
  Garuda: drawGaruda,
  Harpu: drawHarpu,
  'Mystic Witch': drawMysticWitch,
  Vagabond: drawVagabond,
  Cowgirl: drawCowgirl,
  'Fairy Queen': drawFairyQueen,
  Giant: drawGiant,
  Dragon: drawDragon,
  'Chakram Dancer': drawChakramDancer,
  'Boomerang Warrior': drawBoomerangWarrior,
  'Lich King': drawLichKing,
};

export function drawMonsterSprite(
  ctx: CanvasRenderingContext2D,
  family: string,
  element: Element,
  x: number,
  y: number,
  size: number,
  flipX: boolean,
  alpha: number = 1,
  tint?: string,
  scaleY: number = 1,
) {
  const palette = ELEMENT_PALETTES[element];
  const drawFn = MONSTER_SPRITES[family] || MONSTER_SPRITES['Pixie'];

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + size / 2, y + size / 2);
  if (flipX) ctx.scale(-1, 1);
  ctx.scale(1, scaleY);
  ctx.translate(-size / 2, -size / 2);

  if (tint) {
    const tintPalette: Palette = {
      ...palette,
      primary: tint,
      secondary: tint,
      accent: tint,
      outline: tint,
    };
    drawFn(ctx, tintPalette, size);
  } else {
    drawFn(ctx, palette, size);
  }

  ctx.restore();
}

export type AnimationState = 'idle' | 'attack' | 'hit' | 'cast' | 'death';

interface PixelSpriteProps {
  family: string;
  element: Element;
  size?: number;
  animation?: AnimationState;
  showShadow?: boolean;
}

export function PixelSprite({ family, element, size = 48, animation = 'idle', showShadow = true }: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size, size);

    // Draw shadow
    if (showShadow) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(size / 2, size * 0.85, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Calculate animation offset
    let offsetY = 0;
    if (animation === 'attack') {
      offsetY = -2;
    } else if (animation === 'hit') {
      offsetY = -3;
    } else if (animation === 'cast') {
      offsetY = -1;
    }

    // Draw sprite
    drawMonsterSprite(ctx, family, element, 0, offsetY, size, false, 1);
  }, [family, element, size, animation, showShadow]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />;
}

export function MiniSprite({ family, element, size = 24 }: { family: string; element: Element; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.8, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    drawMonsterSprite(ctx, family, element, 0, 0, size, false, 1);
  }, [family, element, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />;
}

