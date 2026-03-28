import { useState } from 'react';
import { useGameState, useDispatch, useGameStore } from '../store/useGameStore';
import { getTemplate, starDisplay } from '../utils/helpers';
import type { DungeonType, Element } from '../types';
import type { BattleSetup } from '../App';
import { MiniSprite } from './PixelSprite';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

const DUNGEONS: { type: DungeonType; icon: string; name: string; element: string }[] = [
  { type: 'giants', icon: '🗿', name: '巨人地下城', element: '风' },
  { type: 'dragons', icon: '🐲', name: '龙之地下城', element: '火' },
  { type: 'necropolis', icon: '💀', name: '死亡地下城', element: '暗' },
];

interface Props {
  onStartBattle: (setup: BattleSetup) => void;
}

export function DungeonPage({ onStartBattle }: Props) {
  const state = useGameState();
  const dispatch = useDispatch();
  const store = useGameStore();
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [team, setTeam] = useState<string[]>(state.savedTeam?.dungeon || []);
  const [battleResult, setBattleResult] = useState<any>(null);

  const toggleTeamMember = (id: string) => {
    if (team.includes(id)) {
      setTeam(team.filter(t => t !== id));
    } else if (team.length < 5) {
      setTeam([...team, id]);
    }
  };

  const handleStartBattle = () => {
    if (!selectedDungeon || team.length === 0) return;

    // Use energy
    if (state.player.energy < 7) {
      alert('体力不足！');
      return;
    }

    // Save team for later
    dispatch({ type: 'SAVE_TEAM', mode: 'dungeon', team });

    onStartBattle({
      team,
      dungeon: selectedDungeon,
      floor: selectedFloor,
      mode: 'dungeon',
    });
  };

  const handleQuickRun = () => {
    if (!selectedDungeon || team.length === 0) return;
    if (state.player.energy < 7) {
      alert('体力不足！');
      return;
    }

    const result = store.runDungeonBattle(team, selectedDungeon, selectedFloor);
    dispatch({
      type: 'COMPLETE_DUNGEON_RUN',
      dungeon: selectedDungeon,
      floor: selectedFloor,
      victory: result.victory,
      mana: result.rewards.mana,
      rune: result.rewards.rune,
    });
    setBattleResult(result);
  };

  const handleStartIdle = () => {
    if (!selectedDungeon || team.length === 0) return;
    dispatch({ type: 'SAVE_TEAM', mode: 'dungeon', team });
    dispatch({ type: 'START_IDLE', dungeon: selectedDungeon, floor: selectedFloor });

    // Simulate idle runs
    const runIdle = () => {
      if (!state.idleProgress.currentDungeon) return;
      const result = store.runDungeonBattle(team, selectedDungeon, selectedFloor);
      dispatch({
        type: 'COMPLETE_DUNGEON_RUN',
        dungeon: selectedDungeon,
        floor: selectedFloor,
        victory: result.victory,
        mana: result.rewards.mana,
        rune: result.rewards.rune,
      });
    };

    // Run every 3 seconds
    const interval = setInterval(() => {
      const currentState = store.getState();
      if (!currentState.idleProgress.currentDungeon) {
        clearInterval(interval);
        return;
      }
      runIdle();
    }, 3000);
  };

  return (
    <div>
      {/* Dungeon selection */}
      {!selectedDungeon && (
        <div className="panel">
          <div className="panel-title">🏰 选择副本</div>
          <div className="dungeon-grid">
            {DUNGEONS.map(d => {
              const progress = state.dungeonProgress[d.type] || 0;
              return (
                <div
                  key={d.type}
                  className="dungeon-card"
                  onClick={() => { setSelectedDungeon(d.type); setSelectedFloor(Math.max(1, progress)); }}
                >
                  <div className="dungeon-icon">{d.icon}</div>
                  <div className="dungeon-name">{d.name}</div>
                  <div className="dungeon-info">
                    {d.element}属性 | 已通关: B{progress || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floor selection */}
      {selectedDungeon && (
        <div className="panel">
          <div className="panel-title">
            <span style={{ cursor: 'pointer' }} onClick={() => { setSelectedDungeon(null); setTeam([]); setBattleResult(null); }}>
              ← 返回
            </span>
            {' '} | {DUNGEONS.find(d => d.type === selectedDungeon)?.name}
          </div>

          <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>选择层数:</div>
          <div className="floor-selector">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(floor => {
              const cleared = (state.dungeonProgress[selectedDungeon] || 0) >= floor;
              const unlocked = floor <= (state.dungeonProgress[selectedDungeon] || 0) + 1;
              return (
                <button
                  key={floor}
                  className={`floor-btn ${selectedFloor === floor ? 'active' : ''} ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => unlocked && setSelectedFloor(floor)}
                  disabled={!unlocked}
                >
                  B{floor}
                </button>
              );
            })}
          </div>

          {/* Team selection */}
          <div style={{ fontSize: '8px', color: 'var(--text-dim)', margin: '12px 0 8px' }}>选择队伍 ({team.length}/5):</div>
          <div className="team-selector">
            {Array.from({ length: 5 }).map((_, i) => {
              const monId = team[i];
              const mon = monId ? state.monsters.find(m => m.id === monId) : null;
              const template = mon ? getTemplate(mon.templateId) : null;
              return (
                <div
                  key={i}
                  className={`team-slot ${mon ? 'filled' : ''}`}
                  onClick={() => mon && toggleTeamMember(mon.id)}
                >
                  {template ? (
                    <>
                      <div className="slot-sprite" style={{ display: 'flex', justifyContent: 'center' }}>
                        <MiniSprite family={template.family} element={template.element} size={28} />
                      </div>
                      <div className="slot-name">{template.nameZh}</div>
                    </>
                  ) : (
                    <span>空位</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Available monsters */}
          <div className="monster-grid" style={{ marginTop: '8px' }}>
            {state.monsters.map(mon => {
              const template = getTemplate(mon.templateId);
              if (!template) return null;
              const inTeam = team.includes(mon.id);
              return (
                <div
                  key={mon.id}
                  className={`monster-card ${inTeam ? 'selected' : ''}`}
                  onClick={() => toggleTeamMember(mon.id)}
                  style={{ opacity: inTeam ? 1 : 0.7 }}
                >
                  <div className={`element-badge element-${template.element}`}>
                    {ELEMENT_ICONS[template.element]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
                    <MiniSprite family={template.family} element={template.element} size={28} />
                  </div>
                  <div className="name">{template.nameZh}</div>
                  <div className="stars" style={{ fontSize: '7px' }}>{starDisplay(mon.stars)}</div>
                  <div className="level">Lv.{mon.level}</div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              className="pixel-btn primary"
              disabled={team.length === 0}
              onClick={handleStartBattle}
            >
              ⚔ 开始战斗
            </button>
            <button
              className="pixel-btn secondary"
              disabled={team.length === 0}
              onClick={handleQuickRun}
            >
              ⚡ 快速战斗
            </button>
            <button
              className="pixel-btn success"
              disabled={team.length === 0 || !!state.idleProgress.currentDungeon}
              onClick={handleStartIdle}
            >
              🔄 开始挂机
            </button>
          </div>
        </div>
      )}

      {/* Quick battle result */}
      {battleResult && (
        <div className="panel animate-fadeIn">
          <div className="panel-title">
            {battleResult.victory ? '✅ 胜利！' : '❌ 失败...'}
          </div>
          <div style={{ fontSize: '8px' }}>
            <div>💎 获得玛那: <span style={{ color: 'var(--mana-color)' }}>{battleResult.rewards.mana}</span></div>
            <div>📊 经验: <span style={{ color: 'var(--gold)' }}>{battleResult.rewards.exp}</span></div>
            {battleResult.rewards.rune && (
              <div style={{ marginTop: '6px', padding: '6px', background: 'var(--bg-dark)', border: '2px solid var(--gold)' }}>
                🎉 获得符文！ {battleResult.rewards.rune.set} {'★'.repeat(battleResult.rewards.rune.stars)}
                +{battleResult.rewards.rune.level} 槽位{battleResult.rewards.rune.slot}
              </div>
            )}
          </div>
          <button className="pixel-btn secondary small" style={{ marginTop: '8px' }} onClick={() => setBattleResult(null)}>
            确定
          </button>
        </div>
      )}
    </div>
  );
}
