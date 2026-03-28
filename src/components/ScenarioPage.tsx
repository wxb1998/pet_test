import { useState, useEffect, useRef } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import { getTemplate, formatNumber } from '../utils/helpers';
import type { Element } from '../types';
import { ELEMENT_NAMES_ZH } from '../types';
import { MiniSprite } from './PixelSprite';
import {
  SCENARIO_REGIONS,
  getScenarioStage,
  getDifficultyZh,
  getDifficultyColor,
} from '../data/scenarios';
import type { Difficulty } from '../data/scenarios';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

import type { BattleSetup } from '../App';

export function ScenarioPage({ onStartBattle }: { onStartBattle: (setup: BattleSetup) => void }) {
  const state = useGameState();
  const dispatch = useDispatch();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [team, setTeam] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{
    victory: boolean;
    expGains: { id: string; name: string; exp: number }[];
    mana: number;
    runeDropped: boolean;
  } | null>(null);
  const [autoFarming, setAutoFarming] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [autoTotalExp, setAutoTotalExp] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up auto farming on unmount
  useEffect(() => {
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  const region = selectedRegion ? SCENARIO_REGIONS.find(r => r.id === selectedRegion) : null;

  const toggleTeamMember = (id: string) => {
    if (team.includes(id)) {
      setTeam(team.filter(t => t !== id));
    } else if (team.length < 4) {
      setTeam([...team, id]);
    }
  };

  const runScenarioBattle = () => {
    if (!selectedRegion || team.length === 0) return;

    const stageData = getScenarioStage(selectedRegion, selectedStage, difficulty);
    if (!stageData) return;

    if (state.player.energy < stageData.energyCost) {
      alert('体力不足！');
      return;
    }

    // Open animated battle page
    onStartBattle({
      team,
      mode: 'scenario',
      scenarioRegion: selectedRegion,
      scenarioStage: selectedStage,
      scenarioDifficulty: difficulty,
    });
  };

  const startAutoFarm = () => {
    if (!selectedRegion || team.length === 0) return;
    setAutoFarming(true);
    setAutoCount(0);
    setAutoTotalExp(0);

    autoRef.current = setInterval(() => {
      const stageData = getScenarioStage(selectedRegion, selectedStage, difficulty);
      if (!stageData) {
        stopAutoFarm();
        return;
      }

      // Dispatch battle
      dispatch({
        type: 'SCENARIO_BATTLE',
        regionId: selectedRegion,
        stage: selectedStage,
        difficulty,
        team,
      });

      setAutoCount(prev => prev + 1);
      setAutoTotalExp(prev => prev + stageData.rewards.expBase);
    }, 2000);
  };

  const stopAutoFarm = () => {
    setAutoFarming(false);
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  };

  // Region selection view
  if (!selectedRegion) {
    return (
      <div>
        <div className="panel">
          <div className="panel-title">🗺️ 场景模式 - 刷经验</div>
          <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '12px', lineHeight: '1.8' }}>
            选择区域进行冒险，获取经验和资源。<br />
            提示：用一个满级农夫带3个低星狗粮刷<span style={{ color: 'var(--accent)' }}>法伊蒙火山(地狱)</span>效率最高！
          </div>
          <div className="scenario-grid">
            {SCENARIO_REGIONS.map((r, idx) => {
              const cleared = (state.scenarioProgress?.[r.id] || 0);
              const unlocked = idx === 0 || (state.scenarioProgress?.[SCENARIO_REGIONS[idx - 1].id] || 0) >= 7;
              return (
                <div
                  key={r.id}
                  className={`scenario-card ${!unlocked ? 'locked' : ''}`}
                  onClick={() => unlocked && setSelectedRegion(r.id)}
                  style={{ opacity: unlocked ? 1 : 0.4 }}
                >
                  <div className="scenario-icon">{r.icon}</div>
                  <div className="scenario-name">{r.nameZh}</div>
                  <div className="scenario-info">
                    {ELEMENT_ICONS[r.element]} {ELEMENT_NAMES_ZH[r.element]}属性
                  </div>
                  <div className="scenario-progress">
                    {unlocked
                      ? cleared >= 7 ? '✅ 已通关' : `进度: ${cleared}/7`
                      : '🔒 未解锁'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Stage detail view
  const stageData = getScenarioStage(selectedRegion, selectedStage, difficulty);

  return (
    <div>
      <div className="panel">
        <div className="panel-title">
          <span style={{ cursor: 'pointer' }} onClick={() => {
            setSelectedRegion(null);
            setTeam([]);
            setLastResult(null);
            stopAutoFarm();
          }}>
            ← 返回
          </span>
          {' '} | {region?.icon} {region?.nameZh}
        </div>

        {/* Difficulty selector */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {(['normal', 'hard', 'hell'] as Difficulty[]).map(d => (
            <button
              key={d}
              className={`pixel-btn small ${difficulty === d ? 'primary' : 'secondary'}`}
              style={{
                borderColor: getDifficultyColor(d),
                color: difficulty === d ? '#fff' : getDifficultyColor(d),
              }}
              onClick={() => setDifficulty(d)}
            >
              {getDifficultyZh(d)}
            </button>
          ))}
        </div>

        {/* Stage selector */}
        <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '6px' }}>选择关卡:</div>
        <div className="floor-selector">
          {Array.from({ length: 7 }, (_, i) => i + 1).map(stage => {
            const cleared = (state.scenarioProgress?.[selectedRegion] || 0) >= stage;
            const unlocked = stage <= (state.scenarioProgress?.[selectedRegion] || 0) + 1;
            return (
              <button
                key={stage}
                className={`floor-btn ${selectedStage === stage ? 'active' : ''} ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked' : ''}`}
                onClick={() => unlocked && setSelectedStage(stage)}
                disabled={!unlocked}
              >
                {stage}
              </button>
            );
          })}
        </div>

        {/* Stage info */}
        {stageData && (
          <div style={{
            margin: '10px 0',
            padding: '8px',
            background: 'var(--bg-dark)',
            border: '2px solid var(--border)',
            fontSize: '7px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <span>推荐等级: <span style={{ color: 'var(--gold)' }}>Lv.{stageData.recommendedLevel}</span></span>
              <span>体力消耗: <span style={{ color: 'var(--accent)' }}>⚡{stageData.energyCost}</span></span>
              <span>经验: <span style={{ color: 'var(--accent2)' }}>+{formatNumber(stageData.rewards.expBase)}</span></span>
              <span>玛那: <span style={{ color: 'var(--mana-color)' }}>+{formatNumber(stageData.rewards.manaBase)}</span></span>
            </div>
            <div style={{ marginTop: '4px', color: 'var(--text-dim)' }}>
              敌人: {stageData.enemies.length}只 {ELEMENT_ICONS[stageData.element]}{ELEMENT_NAMES_ZH[stageData.element]}属性 (Lv.{stageData.enemies[0]?.level})
            </div>
          </div>
        )}

        {/* Team selection */}
        <div style={{ fontSize: '8px', color: 'var(--text-dim)', margin: '8px 0 6px' }}>
          选择队伍 ({team.length}/4)
          <span style={{ color: 'var(--gold)', marginLeft: '8px', fontSize: '7px' }}>
            💡 满级怪不吸收经验，经验全给未满级队友
          </span>
        </div>

        <div className="team-selector">
          {Array.from({ length: 4 }).map((_, i) => {
            const monId = team[i];
            const mon = monId ? state.monsters.find(m => m.id === monId) : null;
            const template = mon ? getTemplate(mon.templateId) : null;
            const maxLevel = mon ? mon.stars * 5 + 10 : 0;
            const isMaxed = mon ? mon.level >= maxLevel : false;

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
                    <div style={{ fontSize: '6px', color: isMaxed ? 'var(--gold)' : 'var(--text-dim)' }}>
                      Lv.{mon!.level}{isMaxed ? ' MAX' : `/${maxLevel}`}
                    </div>
                  </>
                ) : (
                  <span>{i === 0 ? '农夫' : '狗粮'}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Monster grid for selection */}
        <div className="monster-grid" style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {state.monsters.map(mon => {
            const template = getTemplate(mon.templateId);
            if (!template) return null;
            const inTeam = team.includes(mon.id);
            const maxLevel = mon.stars * 5 + 10;
            const isMaxed = mon.level >= maxLevel;

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
                  <MiniSprite family={template.family} element={template.element} size={24} />
                </div>
                <div className="name">{template.nameZh}</div>
                <div className="level" style={{ color: isMaxed ? 'var(--gold)' : undefined }}>
                  Lv.{mon.level}{isMaxed ? '★' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <button
            className="pixel-btn primary"
            disabled={team.length === 0 || autoFarming}
            onClick={runScenarioBattle}
          >
            ⚔ 战斗一次
          </button>
          {!autoFarming ? (
            <button
              className="pixel-btn success"
              disabled={team.length === 0}
              onClick={startAutoFarm}
            >
              🔄 自动刷图
            </button>
          ) : (
            <button
              className="pixel-btn danger"
              onClick={stopAutoFarm}
            >
              ⏹ 停止刷图
            </button>
          )}
          <button
            className="pixel-btn secondary"
            disabled={team.length === 0 || autoFarming}
            onClick={() => {
              // Quick 10 runs
              for (let i = 0; i < 10; i++) {
                dispatch({
                  type: 'SCENARIO_BATTLE',
                  regionId: selectedRegion,
                  stage: selectedStage,
                  difficulty,
                  team,
                });
              }
              setLastResult(null);
              alert(`快速刷图10次完成！`);
            }}
          >
            ⚡ 快速x10
          </button>
        </div>
      </div>

      {/* Auto farm status */}
      {autoFarming && (
        <div className="panel animate-fadeIn">
          <div className="panel-title">🔄 自动刷图中...</div>
          <div style={{ fontSize: '8px' }}>
            <div>已完成: <span style={{ color: 'var(--gold)' }}>{autoCount}</span> 次</div>
            <div>累计经验: <span style={{ color: 'var(--accent2)' }}>{formatNumber(autoTotalExp)}</span></div>
            <div style={{ marginTop: '6px', color: 'var(--text-dim)', fontSize: '7px' }}>
              每2秒自动战斗一次，体力耗尽时请手动停止
            </div>
          </div>
        </div>
      )}

      {/* Battle result */}
      {lastResult && !autoFarming && (
        <div className="panel animate-fadeIn">
          <div className="panel-title">
            {lastResult.victory ? '✅ 胜利！' : '❌ 失败'}
          </div>
          <div style={{ fontSize: '8px' }}>
            <div style={{ marginBottom: '6px' }}>
              💰 玛那: <span style={{ color: 'var(--mana-color)' }}>+{formatNumber(lastResult.mana)}</span>
            </div>
            <div style={{ fontSize: '8px', color: 'var(--accent2)', marginBottom: '4px' }}>经验分配:</div>
            {lastResult.expGains.map(g => (
              <div key={g.id} style={{ fontSize: '7px', padding: '2px 0' }}>
                {g.name}: {g.exp > 0
                  ? <span style={{ color: 'var(--accent2)' }}>+{formatNumber(g.exp)} EXP</span>
                  : <span style={{ color: 'var(--gold)' }}>已满级，不吸收经验</span>
                }
              </div>
            ))}
            {lastResult.runeDropped && (
              <div style={{ marginTop: '6px', padding: '4px', background: 'var(--bg-dark)', border: '2px solid var(--gold)', fontSize: '7px' }}>
                🎉 获得了符文！
              </div>
            )}
          </div>
        </div>
      )}

      {/* XP efficiency info */}
      <div className="panel">
        <div className="panel-title">📊 刷图效率参考</div>
        <div style={{ fontSize: '7px', color: 'var(--text-dim)', lineHeight: '2' }}>
          <div><span style={{ color: 'var(--accent)' }}>🌋 法伊蒙火山(地狱)</span> — 最佳经验/体力比，适合水属性农夫</div>
          <div><span style={{ color: 'var(--accent2)' }}>🌳 爱登森林(地狱)</span> — 最高总经验，适合火属性农夫</div>
          <div><span style={{ color: 'var(--gold)' }}>🏜️ 塔摩尔沙漠(困难)</span> — 中期过渡，敌人较弱</div>
          <div style={{ marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
            💡 满级农夫不吸收经验 → 经验全给3个狗粮 = 效率x4
          </div>
        </div>
      </div>
    </div>
  );
}
