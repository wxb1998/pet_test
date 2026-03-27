import type {
  BattleState, BattleUnit,
  MonsterInstance, Skill, SkillEffect, Element,
  BuffType, DebuffType,
} from '../types';
import { ELEMENT_ADVANTAGE } from '../types';
import { getTemplate, computeStats, chance, randomInt, generateId } from '../utils/helpers';

// Create a BattleUnit from a MonsterInstance
export function createBattleUnit(instance: MonsterInstance, isAlly: boolean): BattleUnit {
  const template = getTemplate(instance.templateId);
  if (!template) throw new Error(`Template not found: ${instance.templateId}`);
  const stats = instance.computedStats || computeStats(instance);
  return {
    instanceId: instance.id,
    templateId: instance.templateId,
    name: template.name,
    nameZh: template.nameZh,
    element: template.element,
    isAlly,
    currentHp: stats.hp,
    maxHp: stats.hp,
    stats: { ...stats },
    attackBar: Math.random() * 30, // slight randomization at start
    buffs: [],
    debuffs: [],
    skills: template.skills.map(s => ({ ...s, currentCooldown: 0 })),
    alive: true,
    pixelArt: template.pixelArt,
  };
}

// Create enemy BattleUnit from dungeon definition
export function createEnemyUnit(templateId: string, level: number, stars: number): BattleUnit {
  const template = getTemplate(templateId);
  if (!template) {
    // Create a generic enemy if template not found
    return {
      instanceId: generateId(),
      templateId,
      name: 'Unknown',
      nameZh: '未知',
      element: 'fire',
      isAlly: false,
      currentHp: 5000,
      maxHp: 5000,
      stats: { hp: 5000, atk: 300, def: 200, spd: 100, critRate: 15, critDmg: 50, resistance: 15, accuracy: 0 },
      attackBar: Math.random() * 30,
      buffs: [],
      debuffs: [],
      skills: [],
      alive: true,
      pixelArt: '👾',
    };
  }

  const levelMult = 1 + (level - 1) * 0.08;
  const starMult = stars >= 5 ? 1.2 : stars >= 4 ? 1.0 : 0.8;
  const mult = levelMult * starMult;

  return {
    instanceId: generateId(),
    templateId,
    name: template.name,
    nameZh: template.nameZh,
    element: template.element,
    isAlly: false,
    currentHp: Math.floor(template.baseStats.hp * mult),
    maxHp: Math.floor(template.baseStats.hp * mult),
    stats: {
      hp: Math.floor(template.baseStats.hp * mult),
      atk: Math.floor(template.baseStats.atk * mult),
      def: Math.floor(template.baseStats.def * mult),
      spd: template.baseStats.spd,
      critRate: template.baseStats.critRate,
      critDmg: template.baseStats.critDmg,
      resistance: template.baseStats.resistance,
      accuracy: template.baseStats.accuracy,
    },
    attackBar: Math.random() * 30,
    buffs: [],
    debuffs: [],
    skills: template.skills.map(s => ({ ...s, currentCooldown: 0 })),
    alive: true,
    pixelArt: template.pixelArt,
  };
}

export class BattleEngine {
  state: BattleState;
  private tickCount: number = 0;
  private maxTicks: number = 2000; // prevent infinite battles

  constructor(allies: BattleUnit[], enemies: BattleUnit[], totalWaves: number = 1) {
    this.state = {
      allies,
      enemies,
      turnOrder: [],
      log: [],
      wave: 1,
      totalWaves,
      status: 'preparing',
      autoPlay: true,
      speed: 1,
    };
  }

  // Get all living units
  private getAllUnits(): BattleUnit[] {
    return [...this.state.allies, ...this.state.enemies].filter(u => u.alive);
  }

  private addLog(actorId: string, actorName: string, action: string, targets: string[] = [], damage?: number, heal?: number, effects?: string[]) {
    this.state.log.push({
      timestamp: Date.now(),
      actorId,
      actorName,
      action,
      targets,
      damage,
      heal,
      effects,
    });
    // Keep log trimmed
    if (this.state.log.length > 200) {
      this.state.log = this.state.log.slice(-100);
    }
  }

  // Main tick - advance attack bars
  tick(): BattleState {
    if (this.state.status !== 'running') {
      this.state.status = 'running';
    }

    this.tickCount++;
    if (this.tickCount > this.maxTicks) {
      this.state.status = 'defeat';
      return this.state;
    }

    // Advance attack bars based on speed
    const units = this.getAllUnits();
    const maxSpd = Math.max(...units.map(u => this.getEffectiveSpeed(u)));
    const tickSize = 100 / maxSpd * 3; // normalize tick speed

    for (const unit of units) {
      if (!this.isStunned(unit)) {
        unit.attackBar += this.getEffectiveSpeed(unit) * tickSize / 100;
      } else {
        // Stunned units still gain ATB but slower
        unit.attackBar += this.getEffectiveSpeed(unit) * tickSize / 300;
      }
    }

    // Find unit with highest ATB >= 100
    const ready = units
      .filter(u => u.attackBar >= 100)
      .sort((a, b) => b.attackBar - a.attackBar || b.stats.spd - a.stats.spd);

    if (ready.length > 0) {
      const actor = ready[0];
      actor.attackBar = 0;
      this.state.currentTurn = actor.instanceId;
      this.executeTurn(actor);
    }

    // Check win/lose conditions
    this.checkBattleEnd();

    return this.state;
  }

  // Run the full battle to completion
  runFullBattle(): BattleState {
    this.state.status = 'running';
    while (this.state.status === 'running') {
      this.tick();
    }
    return this.state;
  }

  // Run N ticks and return state
  runTicks(n: number): BattleState {
    this.state.status = 'running';
    for (let i = 0; i < n && this.state.status === 'running'; i++) {
      this.tick();
    }
    return this.state;
  }

  private getEffectiveSpeed(unit: BattleUnit): number {
    let spd = unit.stats.spd;
    if (unit.buffs.some(b => b.type === 'speed_buff')) spd = Math.floor(spd * 1.3);
    if (unit.debuffs.some(d => d.type === 'slow')) spd = Math.floor(spd * 0.7);
    return Math.max(1, spd);
  }

  private isStunned(unit: BattleUnit): boolean {
    return unit.debuffs.some(d =>
      d.type === 'stun' || d.type === 'freeze' || d.type === 'sleep'
    );
  }

  private hasDebuff(unit: BattleUnit, type: DebuffType): boolean {
    return unit.debuffs.some(d => d.type === type);
  }

  private hasBuff(unit: BattleUnit, type: BuffType): boolean {
    return unit.buffs.some(b => b.type === type);
  }

  // Execute a unit's turn
  private executeTurn(actor: BattleUnit) {
    // Process DOTs at start of turn
    this.processDots(actor);
    if (!actor.alive) return;

    // Check if stunned
    if (this.isStunned(actor)) {
      this.addLog(actor.instanceId, actor.nameZh, '被控制，无法行动');
      this.processEndOfTurn(actor);
      return;
    }

    // Choose and use skill (AI)
    const skill = this.chooseSkill(actor);
    this.useSkill(actor, skill);

    // Process end of turn
    this.processEndOfTurn(actor);

    // Violent proc check
    this.checkViolentProc(actor);
  }

  private processDots(unit: BattleUnit) {
    const dots = unit.debuffs.filter(d => d.type === 'dot');
    for (const _dot of dots) {
      const damage = Math.floor(unit.maxHp * 0.05);
      unit.currentHp -= damage;
      this.addLog(unit.instanceId, unit.nameZh, '受到持续伤害', [], damage);
    }

    // Bombs explode at start of turn
    const bombs = unit.debuffs.filter(d => d.type === 'bomb' && d.turns <= 1);
    for (const bomb of bombs) {
      const damage = bomb.value || Math.floor(unit.maxHp * 0.3);
      unit.currentHp -= damage;
      this.addLog(unit.instanceId, unit.nameZh, '炸弹爆炸！', [], damage);
    }

    if (unit.currentHp <= 0) {
      this.handleDeath(unit);
    }
  }

  private processEndOfTurn(unit: BattleUnit) {
    // Tick down buffs
    unit.buffs = unit.buffs
      .map(b => ({ ...b, turns: b.turns - 1 }))
      .filter(b => b.turns > 0);

    // Tick down debuffs
    unit.debuffs = unit.debuffs
      .map(d => ({ ...d, turns: d.turns - 1 }))
      .filter(d => d.turns > 0);

    // Reduce cooldowns
    for (const skill of unit.skills) {
      if (skill.currentCooldown && skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    }

    // Regen buff
    if (this.hasBuff(unit, 'regen')) {
      const heal = Math.floor(unit.maxHp * 0.15);
      unit.currentHp = Math.min(unit.maxHp, unit.currentHp + heal);
      this.addLog(unit.instanceId, unit.nameZh, '恢复效果回复', [], undefined, heal);
    }
  }

  // AI Skill selection
  private chooseSkill(actor: BattleUnit): Skill {
    const availableSkills = actor.skills.filter(s =>
      !s.isPassive && (!s.currentCooldown || s.currentCooldown <= 0)
    );

    if (availableSkills.length === 0) {
      return actor.skills[0]; // fallback to skill 1
    }

    // Prioritize: highest cooldown skill first (usually the strongest)
    const sorted = [...availableSkills].sort((a, b) => b.cooldown - a.cooldown);

    // Check if healing is needed
    const allies = actor.isAlly ? this.state.allies : this.state.enemies;
    const needsHeal = allies.some(a => a.alive && a.currentHp / a.maxHp < 0.5);

    for (const skill of sorted) {
      const hasHeal = skill.effects.some(e => e.type === 'heal' || e.type === 'heal_percent');
      if (needsHeal && hasHeal) return skill;
    }

    // Use strongest available skill
    return sorted[0];
  }

  // Use a skill
  private useSkill(actor: BattleUnit, skill: Skill) {
    // Set cooldown
    if (skill.cooldown > 0) {
      skill.currentCooldown = skill.cooldown;
    }

    const enemies = actor.isAlly ? this.state.enemies.filter(e => e.alive) : this.state.allies.filter(a => a.alive);
    const allies = actor.isAlly ? this.state.allies.filter(a => a.alive) : this.state.enemies.filter(e => e.alive);

    if (enemies.length === 0) return;

    this.addLog(actor.instanceId, actor.nameZh, `使用 ${skill.nameZh}`);

    for (const effect of skill.effects) {
      if (effect.type === 'passive') continue;

      const targets = this.resolveTargets(actor, effect, enemies, allies);

      for (const target of targets) {
        this.applyEffect(actor, target, skill, effect);
      }
    }
  }

  private resolveTargets(actor: BattleUnit, effect: SkillEffect, enemies: BattleUnit[], allies: BattleUnit[]): BattleUnit[] {
    switch (effect.target) {
      case 'enemy':
        // Target weakest or random
        return [this.selectTarget(actor, enemies)];
      case 'all_enemies':
        return [...enemies];
      case 'ally':
        // Target lowest HP ally
        return [allies.reduce((min, a) => a.currentHp / a.maxHp < min.currentHp / min.maxHp ? a : min, allies[0])];
      case 'all_allies':
        return [...allies];
      case 'self':
        return [actor];
      case 'random_enemy':
        return [enemies[randomInt(0, enemies.length - 1)]];
      default:
        return [enemies[0]];
    }
  }

  private selectTarget(actor: BattleUnit, enemies: BattleUnit[]): BattleUnit {
    // Prefer elemental advantage targets
    const advantaged = enemies.filter(e => ELEMENT_ADVANTAGE[actor.element] === e.element);
    if (advantaged.length > 0 && chance(0.5)) {
      return advantaged[randomInt(0, advantaged.length - 1)];
    }
    // Otherwise random
    return enemies[randomInt(0, enemies.length - 1)];
  }

  private applyEffect(actor: BattleUnit, target: BattleUnit, skill: Skill, effect: SkillEffect) {
    if (!target.alive) return;

    switch (effect.type) {
      case 'damage':
        this.applyDamage(actor, target, skill, effect);
        break;
      case 'heal':
        this.applyHeal(actor, target, effect);
        break;
      case 'heal_percent':
        this.applyPercentHeal(actor, target, effect);
        break;
      case 'buff':
        if (effect.buff && (!effect.chance || chance(effect.chance))) {
          this.applyBuff(target, effect.buff, effect.duration || 2);
        }
        break;
      case 'debuff':
        if (effect.debuff && (!effect.chance || chance(effect.chance))) {
          this.applyDebuff(actor, target, effect.debuff, effect.duration || 2);
        }
        break;
      case 'strip':
        this.stripBuffs(target, effect.value || 1);
        break;
      case 'cleanse':
        this.cleanse(target, effect.value || 1);
        break;
      case 'atb_increase':
        target.attackBar += (effect.value || 30);
        this.addLog(target.instanceId, target.nameZh, `攻击条增加${effect.value || 30}%`);
        break;
      case 'atb_decrease':
        if (this.accuracyCheck(actor, target)) {
          target.attackBar = Math.max(0, target.attackBar - (effect.value || 30));
          this.addLog(target.instanceId, target.nameZh, `攻击条减少${effect.value || 30}%`);
        }
        break;
      case 'revive':
        this.reviveUnit(actor, target, effect.value || 0.3);
        break;
      case 'shield':
        this.applyBuff(target, 'shield', effect.duration || 3, Math.floor(actor.maxHp * (effect.value || 0.15)));
        break;
    }
  }

  // Core damage calculation - faithful to SW mechanics
  private applyDamage(actor: BattleUnit, target: BattleUnit, skill: Skill, effect: SkillEffect) {
    if (!target.alive) return;

    // Check invincibility
    if (this.hasBuff(target, 'invincibility')) {
      this.addLog(target.instanceId, target.nameZh, '无敌状态免疫伤害');
      return;
    }

    const hits = effect.hits || 1;
    let totalDamage = 0;

    for (let i = 0; i < hits; i++) {
      if (!target.alive) break;

      // Calculate base damage
      let atk = actor.stats.atk;
      if (this.hasBuff(actor, 'attack_buff')) atk = Math.floor(atk * 1.5);
      if (this.hasDebuff(actor, 'attack_break')) atk = Math.floor(atk * 0.5);

      let def = target.stats.def;
      if (this.hasBuff(target, 'defense_buff')) def = Math.floor(def * 1.7);
      if (this.hasDebuff(target, 'defense_break')) def = Math.floor(def * 0.3);

      // Multiplier from skill
      const multiplier = skill.multiplier || 1.0;

      // Scaling based on other stats
      let scalingBonus = 0;
      if (effect.scaling) {
        for (const scale of effect.scaling) {
          switch (scale.stat) {
            case 'atk': scalingBonus += atk * scale.ratio; break;
            case 'def': scalingBonus += actor.stats.def * scale.ratio; break;
            case 'hp': scalingBonus += actor.stats.hp * scale.ratio; break;
            case 'spd': scalingBonus += actor.stats.spd * scale.ratio; break;
            case 'target_max_hp': scalingBonus += target.maxHp * scale.ratio; break;
            case 'target_current_hp': scalingBonus += target.currentHp * scale.ratio; break;
          }
        }
      }

      // Damage formula (simplified SW formula)
      // DMG = ATK * Multiplier * (100 + ScalingBonus) / (DEF + 100)
      let damage = (atk * multiplier + scalingBonus) * 100 / (def + 100);

      // Element advantage (15% bonus or penalty)
      const elementBonus = this.getElementModifier(actor.element, target.element);
      damage *= elementBonus;

      // Critical hit check
      let critRate = actor.stats.critRate;
      if (this.hasBuff(actor, 'crit_rate_buff')) critRate += 30;
      if (chance(critRate / 100)) {
        damage *= actor.stats.critDmg / 100;
      }

      // Glancing hit check
      if (this.hasDebuff(actor, 'glancing') || (elementBonus < 1 && chance(0.5))) {
        damage *= 0.7;
      }

      // Random variance (±5%)
      damage *= 0.95 + Math.random() * 0.1;

      damage = Math.max(1, Math.floor(damage));
      totalDamage += damage;

      // Apply damage
      target.currentHp -= damage;

      // Vampire rune check
      if (this.hasBuff(actor, 'vampire')) {
        const heal = Math.floor(damage * 0.35);
        actor.currentHp = Math.min(actor.maxHp, actor.currentHp + heal);
      }

      // Check death
      if (target.currentHp <= 0) {
        this.handleDeath(target);
        break;
      }
    }

    if (totalDamage > 0) {
      this.addLog(actor.instanceId, actor.nameZh, `对 ${target.nameZh} 造成`, [target.instanceId], totalDamage);
    }
  }

  private applyHeal(actor: BattleUnit, target: BattleUnit, effect: SkillEffect) {
    if (!target.alive) return;
    if (this.hasDebuff(target, 'heal_block')) {
      this.addLog(target.instanceId, target.nameZh, '被回复阻止');
      return;
    }

    let healAmount = Math.floor(actor.stats.atk * (effect.value || 0.3));
    if (effect.scaling) {
      for (const scale of effect.scaling) {
        if (scale.stat === 'hp') healAmount = Math.floor(actor.maxHp * scale.ratio);
        if (scale.stat === 'atk') healAmount = Math.floor(actor.stats.atk * scale.ratio);
      }
    }

    target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
    this.addLog(actor.instanceId, actor.nameZh, `治疗 ${target.nameZh}`, [target.instanceId], undefined, healAmount);
  }

  private applyPercentHeal(_actor: BattleUnit, target: BattleUnit, effect: SkillEffect) {
    if (!target.alive) return;
    if (this.hasDebuff(target, 'heal_block')) return;

    const healAmount = Math.floor(target.maxHp * (effect.value || 0.3));
    target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
    this.addLog(target.instanceId, target.nameZh, '回复体力', [], undefined, healAmount);
  }

  private applyBuff(target: BattleUnit, buff: BuffType, duration: number, value?: number) {
    if (!target.alive) return;
    // Check immunity for debuffs (handled elsewhere)
    // Max 10 buffs
    if (target.buffs.length >= 10) return;

    // Don't stack same buff, refresh duration
    const existing = target.buffs.find(b => b.type === buff);
    if (existing) {
      existing.turns = Math.max(existing.turns, duration);
      return;
    }

    target.buffs.push({ type: buff, turns: duration, value });
    this.addLog(target.instanceId, target.nameZh, `获得 ${this.buffNameZh(buff)}`);
  }

  private applyDebuff(actor: BattleUnit, target: BattleUnit, debuff: DebuffType, duration: number) {
    if (!target.alive) return;

    // Immunity check
    if (this.hasBuff(target, 'immunity')) {
      this.addLog(target.instanceId, target.nameZh, '免疫状态抵挡了效果');
      return;
    }

    // Accuracy vs Resistance check
    if (!this.accuracyCheck(actor, target)) {
      this.addLog(target.instanceId, target.nameZh, '抵抗了效果');
      return;
    }

    // Max 10 debuffs
    if (target.debuffs.length >= 10) return;

    // DOTs can stack
    if (debuff === 'dot' || debuff === 'bomb') {
      target.debuffs.push({ type: debuff, turns: duration });
    } else {
      // Don't stack, refresh
      const existing = target.debuffs.find(d => d.type === debuff);
      if (existing) {
        existing.turns = Math.max(existing.turns, duration);
        return;
      }
      target.debuffs.push({ type: debuff, turns: duration });
    }

    this.addLog(target.instanceId, target.nameZh, `被施加 ${this.debuffNameZh(debuff)}`);
  }

  // Accuracy vs Resistance check (SW formula)
  private accuracyCheck(actor: BattleUnit, target: BattleUnit): boolean {
    const acc = actor.stats.accuracy;
    const res = target.stats.resistance;
    const successRate = Math.max(15, 100 - (res - acc)); // minimum 15% resist chance
    return chance(successRate / 100);
  }

  private stripBuffs(target: BattleUnit, count: number = 1) {
    for (let i = 0; i < count && target.buffs.length > 0; i++) {
      const removed = target.buffs.pop();
      if (removed) {
        this.addLog(target.instanceId, target.nameZh, `${this.buffNameZh(removed.type as BuffType)} 被移除`);
      }
    }
  }

  private cleanse(target: BattleUnit, count: number = 1) {
    for (let i = 0; i < count && target.debuffs.length > 0; i++) {
      target.debuffs.pop();
    }
    this.addLog(target.instanceId, target.nameZh, '负面效果被净化');
  }

  private reviveUnit(actor: BattleUnit, _target: BattleUnit, hpPercent: number) {
    const deadAllies = actor.isAlly
      ? this.state.allies.filter(a => !a.alive)
      : this.state.enemies.filter(e => !e.alive);

    if (deadAllies.length === 0) return;

    const revived = deadAllies[0];
    revived.alive = true;
    revived.currentHp = Math.floor(revived.maxHp * hpPercent);
    revived.buffs = [];
    revived.debuffs = [];
    revived.attackBar = 0;
    this.addLog(actor.instanceId, actor.nameZh, `复活了 ${revived.nameZh}`, [revived.instanceId], undefined, revived.currentHp);
  }

  private handleDeath(unit: BattleUnit) {
    unit.alive = false;
    unit.currentHp = 0;
    unit.buffs = [];
    unit.debuffs = [];
    unit.attackBar = 0;

    // Check passive resurrection (e.g., Perna)
    const resurSkill = unit.skills.find(s => s.isPassive && s.effects.some(e => e.type === 'revive'));
    if (resurSkill && chance(0.5)) { // Perna-like passive
      unit.alive = true;
      unit.currentHp = unit.maxHp;
      this.addLog(unit.instanceId, unit.nameZh, '被动复活！');
      return;
    }

    this.addLog(unit.instanceId, unit.nameZh, '被击倒');
  }

  private checkViolentProc(actor: BattleUnit) {
    // Simplified violent proc - just check if unit should get extra turn
    if (actor.alive && chance(0.22)) { // 22% violent proc rate
      this.addLog(actor.instanceId, actor.nameZh, '暴走追加回合！');
      actor.attackBar = 100;
    }
  }

  private getElementModifier(attacker: Element, defender: Element): number {
    if (ELEMENT_ADVANTAGE[attacker] === defender) return 1.15; // advantage
    if (ELEMENT_ADVANTAGE[defender] === attacker) return 0.85; // disadvantage
    return 1.0;
  }

  private checkBattleEnd() {
    const alliesAlive = this.state.allies.some(a => a.alive);
    const enemiesAlive = this.state.enemies.some(e => e.alive);

    if (!alliesAlive) {
      this.state.status = 'defeat';
      this.addLog('system', '系统', '战斗失败...');
    } else if (!enemiesAlive) {
      if (this.state.wave < this.state.totalWaves) {
        this.state.wave++;
        this.addLog('system', '系统', `第${this.state.wave}波敌人出现！`);
        // New wave would need enemy spawning logic
      } else {
        this.state.status = 'victory';
        this.addLog('system', '系统', '战斗胜利！');
      }
    }
  }

  // Chinese names for effects
  private buffNameZh(buff: BuffType): string {
    const names: Record<BuffType, string> = {
      attack_buff: '攻击增益', defense_buff: '防御增益', speed_buff: '速度增益',
      crit_rate_buff: '暴击率增益', immunity: '免疫', invincibility: '无敌',
      endure: '忍耐', shield: '护盾', regen: '恢复',
      counter_attack: '反击', reflect_damage: '反伤', soul_protect: '灵魂保护',
      vampire: '吸血', brand: '烙印', threat: '挑衅状态',
    };
    return names[buff] || buff;
  }

  private debuffNameZh(debuff: DebuffType): string {
    const names: Record<DebuffType, string> = {
      attack_break: '攻击弱化', defense_break: '防御弱化', slow: '速度降低',
      glancing: '暴击率降低', dot: '持续伤害', bomb: '炸弹',
      stun: '眩晕', freeze: '冰冻', sleep: '沉睡', silence: '沉默',
      provoke: '挑衅', oblivion: '遗忘', inability: '无力',
      heal_block: '回复阻止', brand: '烙印', unrecoverable: '不可恢复',
      strip: '剥离',
    };
    return names[debuff] || debuff;
  }
}
