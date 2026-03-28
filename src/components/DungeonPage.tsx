import { useState } from 'react';
import { useGameState, useDispatch, useGameStore } from '../store/useGameStore';
import { getTemplate, starDisplay } from '../utils/helpers';
import type { DungeonType, Element } from '../types';
import type { BattleSetup } from '../App';
import { MiniSprite } from './PixelSprite';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

const CAIROS_DUNGEONS: { type: DungeonType; icon: string; name: string; element: string; maxFloor: number }[] = [
  { type: 'giants', icon: '🗿', name: '巨人地下城', element: '风', maxFloor: 12 },
  { type: 'dragons', icon: '🐲', name: '龙之地下城', element: '火', maxFloor: 12 },
  { type: 'necropolis', icon: '💀', name: '死亡地下城', element: '暗', maxFloor: 12 },
];

const ELEMENTAL_DUNGEONS: { type: DungeonType; icon: string; name: string; element: string; maxFloor: number }[] = [
  { type: 'fire_dungeon', icon: '🔥', name: '火之地下城', element: '火', maxFloor: 10 },
  { type: 'water_dungeon', icon: '💧', name: '水之地下城', element: '水', maxFloor: 10 },
  { type: 'wind_dungeon', icon: '🌪', name: '风之地下城', element: '风', maxFloor: 10 },
  { type: 'light_dungeon', icon: '✨', name: '光之地下城', element: '光', maxFloor: 10 },
  { type: 'dark_dungeon', icon: '🌑', name: '暗之地下城', element: '暗', maxFloor: 10 },
];

const TOA_DUNGEONS: { type: DungeonType; icon: string; name: string; element: string; maxFloor: number }[] = [
  { type: 'toa', icon: '🗼', name: '试炼之塔', element: '全', maxFloor: 100 },
  { type: 'toa_hard', icon: '🗼', name: '试炼之塔(困难)', element: '全', maxFloor: 100 },
];

const ALL_DUNGEONS = [...CAIROS_DUNGEONS, ...ELEMENTAL_DUNGEONS, ...TOA_DUNGEONS];

interface Props {
  onStartBattle: (setup: BattleSetup) => void;
}

export function DungeonPage({ onStartBattle }: Props) {
  const state = useGameState();
  const dispatch = useDispatch();
  const store = useGameStore();
  const [dungeonTab, setDungeonTab] = useState<'cairos' | 'elemental' | 'toa'>('cairos');
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

  const isToa = selectedDungeon === 'toa' || selectedDungeon === 'toa_hard';

  const handleQuickRun = () => {
    if (!selectedDungeon || team.length === 0) return;
    if (state.player.energy < (isToa ? 0 : 7)) {
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
    // ToA completion tracking
    if (isToa && result.victory) {
      dispatch({ type: 'TOA_CLEAR', floor: selectedFloor, hard: selectedDungeon === 'toa_hard' });
    }
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

          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
            <button className={`tab-btn ${dungeonTab === 'cairos' ? 'active' : ''}`} onClick={() => setDungeonTab('cairos')}>
              凯罗斯副本
            </button>
            <button className={`tab-btn ${dungeonTab === 'elemental' ? 'active' : ''}`} onClick={() => setDungeonTab('elemental')}>
              属性地下城
            </button>
            <button className={`tab-btn ${dungeonTab === 'toa' ? 'active' : ''}`} onClick={() => setDungeonTab('toa')}>
              试炼之塔
            </button>
          </div>

          <div className="dungeon-grid">
            {(dungeonTab === 'cairos' ? CAIROS_DUNGEONS : dungeonTab === 'elemental' ? ELEMENTAL_DUNGEONS : TOA_DUNGEONS).map(d => {
              const progress = d.type === 'toa' ? (state.toaProgress || 0)
                : d.type === 'toa_hard' ? (state.toaHardProgress || 0)
                : (state.dungeonProgress[d.type] || 0);
              return (
                <div
                  key={d.type}
                  className="dungeon-card"
                  onClick={() => { setSelectedDungeon(d.type); setSelectedFloor(Math.min(Math.max(1, progress + 1), d.maxFloor)); }}
                >
                  <div className="dungeon-icon">{d.icon}</div>
                  <div className="dungeon-name">{d.name}</div>
                  <div className="dungeon-info">
                    {d.element}属性 | 已通关: {d.type.startsWith('toa') ? `${progress}/100层` : `B${progress || 0}`}
                  </div>
                </div>
              );
            })}
          </div>

          {dungeonTab === 'toa' && (
            <div style={{ fontSize: '7px', color: 'var(--text-dim)', marginTop: '8px', lineHeight: '2' }}>
              试炼之塔每月重置。通关每10层可获得丰厚奖励（水晶、卷轴、玛那等）。困难模式奖励翻倍！
            </div>
          )}
        </div>
      )}

      {/* Floor selection */}
      {selectedDungeon && (
        <div className="panel">
          <div className="panel-title">
            <span style={{ cursor: 'pointer' }} onClick={() => { setSelectedDungeon(null); setBattleResult(null); }}>
              ← 返回
            </span>
            {' '} | {ALL_DUNGEONS.find(d => d.type === selectedDungeon)?.name}
          </div>

          {(() => {
            const dungeonInfo = ALL_DUNGEONS.find(d => d.type === selectedDungeon);
            const maxFloor = dungeonInfo?.maxFloor || 12;
            const isToa = selectedDungeon === 'toa' || selectedDungeon === 'toa_hard';
            const progress = isToa
              ? (selectedDungeon === 'toa' ? state.toaProgress || 0 : state.toaHardProgress || 0)
              : (state.dungeonProgress[selectedDungeon] || 0);

            return (
              <>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  选择层数: (已通关: {isToa ? `${progress}层` : `B${progress}`})
                </div>
                <div className="floor-selector" style={{ maxHeight: isToa ? '120px' : undefined, overflowY: isToa ? 'auto' : undefined }}>
                  {Array.from({ length: maxFloor }, (_, i) => i + 1).map(floor => {
                    const cleared = progress >= floor;
                    const unlocked = floor <= progress + 1;
                    return (
                      <button
                        key={floor}
                        className={`floor-btn ${selectedFloor === floor ? 'active' : ''} ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`}
                        onClick={() => unlocked && setSelectedFloor(floor)}
                        disabled={!unlocked}
                        style={{ fontSize: isToa ? '6px' : undefined, minWidth: isToa ? '28px' : undefined }}
                      >
                        {isToa ? floor : `B${floor}`}
                        {isToa && floor % 10 === 0 ? '★' : ''}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}

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
