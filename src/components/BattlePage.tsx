import { useState, useEffect, useRef } from 'react';
import { useGameState, useDispatch, useGameStore } from '../store/useGameStore';
import { BattleEngine, createBattleUnit, createEnemyUnit } from '../engine/BattleEngine';
import type { BattleState, BattleUnit, DungeonType, Element } from '../types';
import { getDungeonFloor } from '../data/dungeons';
import type { BattleSetup } from '../App';
import { MiniSprite } from './PixelSprite';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

interface Props {
  setup: BattleSetup;
  onEnd: () => void;
}

export function BattlePage({ setup, onEnd }: Props) {
  const gameState = useGameState();
  const dispatch = useDispatch();
  const store = useGameStore();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [speed, setSpeed] = useState(1);
  const engineRef = useRef<BattleEngine | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

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
    } else if (setup.mode === 'arena') {
      // Generate random arena opponent
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
    setBattleState({ ...engine.state });
  }, []);

  // Auto tick
  useEffect(() => {
    if (!engineRef.current || !battleState) return;
    if (battleState.status === 'victory' || battleState.status === 'defeat') return;

    const interval = setInterval(() => {
      if (!engineRef.current) return;
      const ticksPerFrame = speed === 3 ? 10 : speed === 2 ? 5 : 2;
      const newState = engineRef.current.runTicks(ticksPerFrame);
      setBattleState({ ...newState });
    }, 100);

    return () => clearInterval(interval);
  }, [battleState?.status, speed]);

  // Auto scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleState?.log.length]);

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
    }
    onEnd();
  };

  if (!battleState) return <div className="panel">加载中...</div>;

  return (
    <div>
      <div className="battle-area">
        {/* Battle status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '8px' }}>
          <span>波次: {battleState.wave}/{battleState.totalWaves}</span>
          <span style={{
            color: battleState.status === 'victory' ? 'var(--hp-bar)' :
              battleState.status === 'defeat' ? 'var(--accent)' : 'var(--gold)'
          }}>
            {battleState.status === 'victory' ? '✅ 胜利！' :
              battleState.status === 'defeat' ? '❌ 失败' : '⚔ 战斗中...'}
          </span>
        </div>

        {/* Battle field */}
        <div className="battle-field">
          <div className="team-side">
            <div style={{ fontSize: '7px', color: 'var(--accent2)', marginBottom: '4px' }}>我方</div>
            {battleState.allies.map(unit => (
              <UnitDisplay
                key={unit.instanceId}
                unit={unit}
                isActive={battleState.currentTurn === unit.instanceId}
              />
            ))}
          </div>

          <div className="vs-indicator">VS</div>

          <div className="team-side">
            <div style={{ fontSize: '7px', color: 'var(--accent)', marginBottom: '4px', textAlign: 'right' }}>敌方</div>
            {battleState.enemies.map(unit => (
              <UnitDisplay
                key={unit.instanceId}
                unit={unit}
                isActive={battleState.currentTurn === unit.instanceId}
              />
            ))}
          </div>
        </div>

        {/* Battle log */}
        <div className="battle-log">
          {battleState.log.slice(-30).map((entry, i) => (
            <div key={i} className="log-entry">
              <span className="name">{entry.actorName}</span>
              {' '}{entry.action}
              {entry.damage ? <span className="damage"> -{entry.damage}</span> : null}
              {entry.heal ? <span className="heal"> +{entry.heal}</span> : null}
            </div>
          ))}
          <div ref={logEndRef} />
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

function UnitDisplay({ unit, isActive }: { unit: BattleUnit; isActive: boolean }) {
  const hpPercent = Math.max(0, (unit.currentHp / unit.maxHp) * 100);
  const atbPercent = Math.min(100, unit.attackBar);
  const hpClass = hpPercent < 25 ? 'danger' : hpPercent < 50 ? 'warning' : '';

  return (
    <div className={`battle-unit ${isActive ? 'acting' : ''} ${!unit.alive ? 'dead' : ''}`}>
      <div className="sprite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MiniSprite family={unit.family} element={unit.element} size={28} />
      </div>
      <div className="info">
        <div className="unit-name">
          <span className={`element-${unit.element}`} style={{ marginRight: '2px' }}>
            {ELEMENT_ICONS[unit.element]}
          </span>
          {unit.nameZh}
        </div>
        <div className="hp-bar-container">
          <div className={`hp-bar ${hpClass}`} style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="atb-bar-container">
          <div className="atb-bar" style={{ width: `${atbPercent}%` }} />
        </div>
        <div style={{ fontSize: '6px', color: 'var(--text-dim)' }}>
          {unit.currentHp}/{unit.maxHp}
        </div>
        {(unit.buffs.length > 0 || unit.debuffs.length > 0) && (
          <div className="effects-row">
            {unit.buffs.map((b, i) => (
              <span key={`b${i}`} className="effect-icon buff" title={b.type}>
                {getEffectIcon(b.type, true)}{b.turns}
              </span>
            ))}
            {unit.debuffs.map((d, i) => (
              <span key={`d${i}`} className="effect-icon debuff" title={d.type}>
                {getEffectIcon(d.type, false)}{d.turns}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getEffectIcon(type: string, isBuff: boolean): string {
  const icons: Record<string, string> = {
    attack_buff: '⬆', defense_buff: '🛡', speed_buff: '💨', crit_rate_buff: '🎯',
    immunity: '🛡', invincibility: '✨', endure: '💪', shield: '🔰', regen: '💚',
    counter_attack: '↩', reflect_damage: '🪞', soul_protect: '👻',
    attack_break: '⬇', defense_break: '💔', slow: '🐌', glancing: '👁',
    dot: '🔥', bomb: '💣', stun: '💫', freeze: '❄', sleep: '💤', silence: '🤐',
    provoke: '😤', oblivion: '🚫', inability: '⛔', heal_block: '🚫', brand: '🎯',
  };
  return icons[type] || (isBuff ? '▲' : '▼');
}
