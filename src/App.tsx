import { useState } from 'react';
import { useGameState, useDispatch } from './store/useGameStore';
import { MonsterPage } from './components/MonsterPage';
import { SummonPage } from './components/SummonPage';
import { DungeonPage } from './components/DungeonPage';
import { RunePage } from './components/RunePage';
import { ArenaPage } from './components/ArenaPage';
import { ScenarioPage } from './components/ScenarioPage';
import { BattlePage } from './components/BattlePage';
import { MissionPage } from './components/MissionPage';
import { formatNumber } from './utils/helpers';

type Page = 'monsters' | 'summon' | 'scenario' | 'dungeon' | 'runes' | 'arena' | 'mission' | 'battle';

export interface BattleSetup {
  team: string[];
  dungeon?: string;
  floor?: number;
  mode: 'dungeon' | 'arena' | 'scenario';
  scenarioRegion?: string;
  scenarioStage?: number;
  scenarioDifficulty?: string;
}

function App() {
  const state = useGameState();
  const dispatch = useDispatch();
  const [page, setPage] = useState<Page>('monsters');
  const [battleSetup, setBattleSetup] = useState<BattleSetup | null>(null);

  const startBattle = (setup: BattleSetup) => {
    setBattleSetup(setup);
    setPage('battle');
  };

  const endBattle = () => {
    const prev = battleSetup?.mode === 'scenario' ? 'scenario' : 'dungeon';
    setBattleSetup(null);
    setPage(prev as Page);
  };

  return (
    <div className="game-container">
      <div className="top-bar">
        <div style={{ fontSize: '10px', color: 'var(--gold)' }}>
          ⚔ 魔灵召唤 · 挂机版
        </div>
        <div className="resources">
          <div className="resource-item mana">
            <span className="icon">💎</span>
            <span>{formatNumber(state.player.mana)}</span>
          </div>
          <div className="resource-item crystal">
            <span className="icon">🔮</span>
            <span>{state.player.crystals}</span>
          </div>
          <div className="resource-item energy">
            <span className="icon">⚡</span>
            <span>{state.player.energy}/{state.player.maxEnergy}</span>
          </div>
        </div>
      </div>

      <div className="nav-bar">
        {([
          ['monsters', '🐉 魔灵'],
          ['summon', '📜 召唤'],
          ['scenario', '🗺 场景'],
          ['dungeon', '🏰 副本'],
          ['runes', '💠 符文'],
          ['arena', '⚔ 竞技场'],
          ['mission', '📋 任务'],
        ] as [Page, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`nav-btn ${page === key ? 'active' : ''}`}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
        <button
          className="nav-btn"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
              dispatch({ type: 'RESET_GAME' });
            }
          }}
        >
          🔄 重置
        </button>
      </div>

      {page === 'monsters' && <MonsterPage />}
      {page === 'summon' && <SummonPage />}
      {page === 'scenario' && <ScenarioPage onStartBattle={startBattle} />}
      {page === 'dungeon' && <DungeonPage onStartBattle={startBattle} />}
      {page === 'runes' && <RunePage />}
      {page === 'arena' && <ArenaPage onStartBattle={startBattle} />}
      {page === 'mission' && <MissionPage />}
      {page === 'battle' && battleSetup && (
        <BattlePage setup={battleSetup} onEnd={endBattle} />
      )}

      {state.idleProgress.currentDungeon && page !== 'battle' && (
        <div className="idle-status">
          <div style={{ fontSize: '9px', marginBottom: '6px' }}>
            🔄 挂机中: {getDungeonNameZh(state.idleProgress.currentDungeon)} B{state.idleProgress.currentFloor}
          </div>
          <div className="idle-stats">
            <div className="idle-stat">
              <div className="value">{state.idleProgress.runsCompleted}</div>
              <div className="label">通关次数</div>
            </div>
            <div className="idle-stat">
              <div className="value">{formatNumber(state.idleProgress.totalManaEarned)}</div>
              <div className="label">获得玛那</div>
            </div>
            <div className="idle-stat">
              <div className="value">{state.idleProgress.runesDropped}</div>
              <div className="label">符文掉落</div>
            </div>
          </div>
          <button
            className="pixel-btn primary small"
            style={{ marginTop: '8px' }}
            onClick={() => dispatch({ type: 'STOP_IDLE' })}
          >
            停止挂机
          </button>
        </div>
      )}
    </div>
  );
}

function getDungeonNameZh(type: string): string {
  const names: Record<string, string> = {
    giants: '巨人地下城', dragons: '龙之地下城', necropolis: '死亡地下城',
    steel_fortress: '钢铁要塞', punishers_crypt: '惩罚者墓穴',
    fire_dungeon: '火之地下城', water_dungeon: '水之地下城', wind_dungeon: '风之地下城',
    light_dungeon: '光之地下城', dark_dungeon: '暗之地下城',
    toa: '试炼之塔', toa_hard: '试炼之塔(困难)',
  };
  return names[type] || type;
}

export default App;
