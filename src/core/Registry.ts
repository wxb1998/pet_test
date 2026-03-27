import type { MonsterTemplate, Element } from '../types';
import { EventBus, type GameEventType, type GameEventData } from './EventBus';
import type { SkillProcessor, SkillContext, SkillResult } from './SkillProcessor';
import {
  DamageSkillProcessor,
  HealSkillProcessor,
  HealPercentSkillProcessor,
  BuffSkillProcessor,
  DebuffSkillProcessor,
  ShieldSkillProcessor,
  ATBIncreaseSkillProcessor,
  ATBDecreaseSkillProcessor,
} from './SkillProcessor';
import type { EventHandler } from './EventBus';

export class GameRegistry {
  private monsterTemplates: Map<string, MonsterTemplate> = new Map();
  private monstersByFamily: Map<string, MonsterTemplate[]> = new Map();
  private monstersByElement: Map<Element, MonsterTemplate[]> = new Map();
  private skillProcessors: Map<string, SkillProcessor> = new Map();
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
    this.initializeDefaultSkillProcessors();
    this.initializeElementMap();
  }

  // ============ Monster Template Management ============

  registerMonster(template: MonsterTemplate): void {
    this.monsterTemplates.set(template.id, template);

    // Index by family
    if (!this.monstersByFamily.has(template.family)) {
      this.monstersByFamily.set(template.family, []);
    }
    this.monstersByFamily.get(template.family)!.push(template);

    // Index by element
    if (!this.monstersByElement.has(template.element)) {
      this.monstersByElement.set(template.element, []);
    }
    this.monstersByElement.get(template.element)!.push(template);
  }

  registerMonsters(templates: MonsterTemplate[]): void {
    templates.forEach(template => this.registerMonster(template));
  }

  getMonster(id: string): MonsterTemplate | undefined {
    return this.monsterTemplates.get(id);
  }

  getMonstersByFamily(family: string): MonsterTemplate[] {
    return this.monstersByFamily.get(family) || [];
  }

  getMonstersByElement(element: Element): MonsterTemplate[] {
    return this.monstersByElement.get(element) || [];
  }

  getMonstersByFamilyAndElement(family: string, element: Element): MonsterTemplate[] {
    const byFamily = this.getMonstersByFamily(family);
    return byFamily.filter(m => m.element === element);
  }

  getAllMonsters(): MonsterTemplate[] {
    return Array.from(this.monsterTemplates.values());
  }

  getAllFamilies(): string[] {
    return Array.from(this.monstersByFamily.keys());
  }

  getMonsterCount(): number {
    return this.monsterTemplates.size;
  }

  // ============ Skill Processor Management ============

  registerSkillProcessor(type: string, processor: SkillProcessor): void {
    this.skillProcessors.set(type, processor);
  }

  getSkillProcessor(type: string): SkillProcessor | undefined {
    return this.skillProcessors.get(type);
  }

  processSkill(type: string, context: SkillContext): SkillResult {
    const processor = this.skillProcessors.get(type);
    if (!processor) {
      console.warn(`No skill processor registered for type: ${type}`);
      return {};
    }
    return processor.process(context);
  }

  hasSkillProcessor(type: string): boolean {
    return this.skillProcessors.has(type);
  }

  getAllSkillProcessorTypes(): string[] {
    return Array.from(this.skillProcessors.keys());
  }

  // ============ Event Bus Management ============

  on<T extends GameEventType>(event: T, handler: EventHandler): () => void {
    return this.eventBus.on(event, handler);
  }

  emit<T extends GameEventType>(event: T, data: GameEventData): void {
    this.eventBus.emit(event, data);
  }

  once<T extends GameEventType>(event: T, handler: EventHandler): () => void {
    return this.eventBus.once(event, handler);
  }

  clearEventListeners(event?: GameEventType): void {
    this.eventBus.clear(event);
  }

  getEventListenerCount(event: GameEventType): number {
    return this.eventBus.listenerCount(event);
  }

  // ============ Initialization ============

  private initializeDefaultSkillProcessors(): void {
    this.registerSkillProcessor('damage', new DamageSkillProcessor());
    this.registerSkillProcessor('heal', new HealSkillProcessor());
    this.registerSkillProcessor('heal_percent', new HealPercentSkillProcessor());
    this.registerSkillProcessor('buff', new BuffSkillProcessor());
    this.registerSkillProcessor('debuff', new DebuffSkillProcessor());
    this.registerSkillProcessor('shield', new ShieldSkillProcessor());
    this.registerSkillProcessor('atb_increase', new ATBIncreaseSkillProcessor());
    this.registerSkillProcessor('atb_decrease', new ATBDecreaseSkillProcessor());
  }

  private initializeElementMap(): void {
    const elements: Element[] = ['fire', 'water', 'wind', 'light', 'dark'];
    elements.forEach(element => {
      this.monstersByElement.set(element, []);
    });
  }
}

// Global singleton instance
export const registry = new GameRegistry();
