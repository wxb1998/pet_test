import type { BattleUnit, BattleState, Skill, SkillEffect, StatusEffect, BuffType, DebuffType } from '../types';

export interface SkillContext {
  source: BattleUnit;
  targets: BattleUnit[];
  skill: Skill;
  effect: SkillEffect;
  battle: BattleState;
}

export interface SkillResult {
  damage?: number;
  healing?: number;
  buffsApplied?: StatusEffect[];
  debuffsApplied?: StatusEffect[];
  targetsAffected?: BattleUnit[];
  additionalEffects?: string[];
}

export interface SkillProcessor {
  process(context: SkillContext): SkillResult;
  canProcess(effectType: string): boolean;
}

// Default damage skill processor
export class DamageSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'damage';
  }

  process(context: SkillContext): SkillResult {
    const { source, targets, effect } = context;
    const result: SkillResult = {
      damage: 0,
      targetsAffected: [],
    };

    for (const target of targets) {
      if (!target.alive) continue;

      // Check invincibility
      if (this.hasBuff(target, 'invincibility')) {
        continue;
      }

      const hits = effect.hits || 1;
      let totalDamage = 0;

      for (let i = 0; i < hits; i++) {
        if (!target.alive) break;

        // Calculate base damage
        let atk = source.stats.atk;
        if (this.hasBuff(source, 'attack_buff')) atk = Math.floor(atk * 1.5);
        if (this.hasDebuff(source, 'attack_break')) atk = Math.floor(atk * 0.5);

        let def = target.stats.def;
        if (this.hasBuff(target, 'defense_buff')) def = Math.floor(def * 1.7);
        if (this.hasDebuff(target, 'defense_break')) def = Math.floor(def * 0.3);

        const multiplier = context.skill.multiplier || 1.0;

        let scalingBonus = 0;
        if (effect.scaling) {
          for (const scale of effect.scaling) {
            switch (scale.stat) {
              case 'atk':
                scalingBonus += atk * scale.ratio;
                break;
              case 'def':
                scalingBonus += source.stats.def * scale.ratio;
                break;
              case 'hp':
                scalingBonus += source.stats.hp * scale.ratio;
                break;
              case 'spd':
                scalingBonus += source.stats.spd * scale.ratio;
                break;
              case 'target_max_hp':
                scalingBonus += target.maxHp * scale.ratio;
                break;
              case 'target_current_hp':
                scalingBonus += target.currentHp * scale.ratio;
                break;
            }
          }
        }

        let damage = (atk * multiplier + scalingBonus) * 100 / (def + 100);

        // Element advantage (15% bonus or penalty)
        const elementBonus = this.getElementModifier(source.element, target.element);
        damage *= elementBonus;

        // Critical hit check
        let critRate = source.stats.critRate;
        if (this.hasBuff(source, 'crit_rate_buff')) critRate += 30;
        const isCrit = Math.random() < critRate / 100;
        if (isCrit) {
          damage *= source.stats.critDmg / 100;
        }

        // Glancing hit check
        if (this.hasDebuff(source, 'glancing') || (elementBonus < 1 && Math.random() < 0.5)) {
          damage *= 0.7;
        }

        // Random variance (±5%)
        damage *= 0.95 + Math.random() * 0.1;

        damage = Math.max(1, Math.floor(damage));
        totalDamage += damage;

        // Apply damage
        target.currentHp -= damage;

        // Vampire rune check
        if (this.hasBuff(source, 'vampire')) {
          const heal = Math.floor(damage * 0.35);
          source.currentHp = Math.min(source.maxHp, source.currentHp + heal);
        }
      }

      if (totalDamage > 0) {
        result.damage = (result.damage || 0) + totalDamage;
        result.targetsAffected?.push(target);
      }
    }

    return result;
  }

  private getElementModifier(attacker: string, defender: string): number {
    // Simplified element advantage (would use ELEMENT_ADVANTAGE constant in real usage)
    const advantages: Record<string, string> = {
      fire: 'wind',
      water: 'fire',
      wind: 'water',
      light: 'dark',
      dark: 'light',
    };

    if (advantages[attacker] === defender) return 1.15; // advantage
    if (advantages[defender] === attacker) return 0.85; // disadvantage
    return 1.0;
  }

  private hasBuff(unit: BattleUnit, buffType: BuffType): boolean {
    return unit.buffs.some(b => b.type === buffType);
  }

  private hasDebuff(unit: BattleUnit, debuffType: DebuffType): boolean {
    return unit.debuffs.some(d => d.type === debuffType);
  }
}

// Default heal skill processor
export class HealSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'heal';
  }

  process(context: SkillContext): SkillResult {
    const { source, targets, effect } = context;
    const result: SkillResult = {
      healing: 0,
      targetsAffected: [],
    };

    for (const target of targets) {
      if (!target.alive) continue;

      // Heal block check
      if (this.hasDebuff(target, 'heal_block')) continue;

      let healAmount = Math.floor(source.stats.atk * (effect.value || 0.3));
      if (effect.scaling) {
        for (const scale of effect.scaling) {
          if (scale.stat === 'hp') healAmount = Math.floor(source.maxHp * scale.ratio);
          if (scale.stat === 'atk') healAmount = Math.floor(source.stats.atk * scale.ratio);
        }
      }

      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
      result.healing = (result.healing || 0) + healAmount;
      result.targetsAffected?.push(target);
    }

    return result;
  }

  private hasDebuff(unit: BattleUnit, debuffType: DebuffType): boolean {
    return unit.debuffs.some(d => d.type === debuffType);
  }
}

// Default heal percent skill processor
export class HealPercentSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'heal_percent';
  }

  process(context: SkillContext): SkillResult {
    const { targets, effect } = context;
    const result: SkillResult = {
      healing: 0,
      targetsAffected: [],
    };

    for (const target of targets) {
      if (!target.alive) continue;

      // Heal block check
      if (this.hasDebuff(target, 'heal_block')) continue;

      const healAmount = Math.floor(target.maxHp * (effect.value || 0.3));
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
      result.healing = (result.healing || 0) + healAmount;
      result.targetsAffected?.push(target);
    }

    return result;
  }

  private hasDebuff(unit: BattleUnit, debuffType: DebuffType): boolean {
    return unit.debuffs.some(d => d.type === debuffType);
  }
}

// Default buff skill processor
export class BuffSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'buff';
  }

  process(context: SkillContext): SkillResult {
    const { targets, effect } = context;
    const result: SkillResult = {
      buffsApplied: [],
      targetsAffected: [],
    };

    if (!effect.buff) return result;

    for (const target of targets) {
      if (!target.alive) continue;

      // Check chance
      if (effect.chance && Math.random() > effect.chance) continue;

      // Don't stack same buff, refresh duration
      const existing = target.buffs.find(b => b.type === effect.buff);
      const duration = effect.duration || 2;

      if (existing) {
        existing.turns = Math.max(existing.turns, duration);
      } else {
        // Max 10 buffs
        if (target.buffs.length < 10) {
          const buff: StatusEffect = {
            type: effect.buff,
            turns: duration,
            value: effect.value,
          };
          target.buffs.push(buff);
          result.buffsApplied?.push(buff);
          result.targetsAffected?.push(target);
        }
      }
    }

    return result;
  }
}

// Default debuff skill processor
export class DebuffSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'debuff';
  }

  process(context: SkillContext): SkillResult {
    const { source, targets, effect } = context;
    const result: SkillResult = {
      debuffsApplied: [],
      targetsAffected: [],
    };

    if (!effect.debuff) return result;

    for (const target of targets) {
      if (!target.alive) continue;

      // Immunity check
      if (this.hasBuff(target, 'immunity')) continue;

      // Accuracy vs Resistance check
      if (!this.accuracyCheck(source, target)) continue;

      // Check chance
      if (effect.chance && Math.random() > effect.chance) continue;

      const duration = effect.duration || 2;

      // DOTs can stack
      if (effect.debuff === 'dot' || effect.debuff === 'bomb') {
        if (target.debuffs.length < 10) {
          const debuff: StatusEffect = {
            type: effect.debuff,
            turns: duration,
            value: effect.value,
          };
          target.debuffs.push(debuff);
          result.debuffsApplied?.push(debuff);
          result.targetsAffected?.push(target);
        }
      } else {
        // Don't stack, refresh
        const existing = target.debuffs.find(d => d.type === effect.debuff);
        if (existing) {
          existing.turns = Math.max(existing.turns, duration);
        } else {
          if (target.debuffs.length < 10) {
            const debuff: StatusEffect = {
              type: effect.debuff,
              turns: duration,
              value: effect.value,
            };
            target.debuffs.push(debuff);
            result.debuffsApplied?.push(debuff);
            result.targetsAffected?.push(target);
          }
        }
      }
    }

    return result;
  }

  private accuracyCheck(source: BattleUnit, target: BattleUnit): boolean {
    const acc = source.stats.accuracy;
    const res = target.stats.resistance;
    const successRate = Math.max(15, 100 - (res - acc)); // minimum 15% resist chance
    return Math.random() < successRate / 100;
  }

  private hasBuff(unit: BattleUnit, buffType: BuffType): boolean {
    return unit.buffs.some(b => b.type === buffType);
  }
}

// Shield skill processor
export class ShieldSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'shield';
  }

  process(context: SkillContext): SkillResult {
    const { source, targets, effect } = context;
    const result: SkillResult = {
      buffsApplied: [],
      targetsAffected: [],
    };

    const duration = effect.duration || 3;
    const shieldValue = Math.floor(source.maxHp * (effect.value || 0.15));

    for (const target of targets) {
      if (!target.alive) continue;

      if (target.buffs.length < 10) {
        const shield: StatusEffect = {
          type: 'shield',
          turns: duration,
          value: shieldValue,
        };
        target.buffs.push(shield);
        result.buffsApplied?.push(shield);
        result.targetsAffected?.push(target);
      }
    }

    return result;
  }
}

// ATB increase skill processor
export class ATBIncreaseSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'atb_increase';
  }

  process(context: SkillContext): SkillResult {
    const { targets, effect } = context;
    const result: SkillResult = {
      targetsAffected: [],
      additionalEffects: [],
    };

    const atbIncrease = effect.value || 30;

    for (const target of targets) {
      if (!target.alive) continue;
      target.attackBar += atbIncrease;
      result.targetsAffected?.push(target);
      result.additionalEffects?.push(`ATB +${atbIncrease}%`);
    }

    return result;
  }
}

// ATB decrease skill processor
export class ATBDecreaseSkillProcessor implements SkillProcessor {
  canProcess(effectType: string): boolean {
    return effectType === 'atb_decrease';
  }

  process(context: SkillContext): SkillResult {
    const { source, targets, effect } = context;
    const result: SkillResult = {
      targetsAffected: [],
      additionalEffects: [],
    };

    const atbDecrease = effect.value || 30;

    for (const target of targets) {
      if (!target.alive) continue;

      // Accuracy check
      const acc = source.stats.accuracy;
      const res = target.stats.resistance;
      const successRate = Math.max(15, 100 - (res - acc));
      if (Math.random() < successRate / 100) {
        target.attackBar = Math.max(0, target.attackBar - atbDecrease);
        result.targetsAffected?.push(target);
        result.additionalEffects?.push(`ATB -${atbDecrease}%`);
      }
    }

    return result;
  }
}
