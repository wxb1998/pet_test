import { useState } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import { getTemplate, starDisplay, formatNumber, computeStats } from '../utils/helpers';
import type { MonsterInstance, Element } from '../types';
import { ELEMENT_NAMES_ZH } from '../types';
import { PixelSprite, MiniSprite } from './PixelSprite';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

export function MonsterPage() {
  const state = useGameState();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Element | 'all'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'level' | 'element'>('stars');

  let monsters = [...state.monsters];
  if (filter !== 'all') {
    monsters = monsters.filter(m => {
      const t = getTemplate(m.templateId);
      return t?.element === filter;
    });
  }

  monsters.sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'level') return b.level - a.level;
    const ta = getTemplate(a.templateId);
    const tb = getTemplate(b.templateId);
    return (ta?.element || '').localeCompare(tb?.element || '');
  });

  const selectedMon = selected ? state.monsters.find(m => m.id === selected) : null;
  const selectedTemplate = selectedMon ? getTemplate(selectedMon.templateId) : null;

  return (
    <div>
      <div className="panel">
        <div className="panel-title">🐉 我的魔灵 ({state.monsters.length})</div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部</button>
          {(['fire', 'water', 'wind', 'light', 'dark'] as Element[]).map(el => (
            <button
              key={el}
              className={`tab-btn ${filter === el ? 'active' : ''}`}
              onClick={() => setFilter(el)}
            >
              {ELEMENT_ICONS[el]} {ELEMENT_NAMES_ZH[el]}
            </button>
          ))}
          <span style={{ marginLeft: '8px', fontSize: '7px', color: 'var(--text-dim)', alignSelf: 'center' }}>排序:</span>
          <button className={`tab-btn ${sortBy === 'stars' ? 'active' : ''}`} onClick={() => setSortBy('stars')}>星级</button>
          <button className={`tab-btn ${sortBy === 'level' ? 'active' : ''}`} onClick={() => setSortBy('level')}>等级</button>
        </div>

        {/* Monster grid */}
        <div className="monster-grid">
          {monsters.map(mon => {
            const template = getTemplate(mon.templateId);
            if (!template) return null;
            return (
              <div
                key={mon.id}
                className={`monster-card ${selected === mon.id ? 'selected' : ''}`}
                onClick={() => setSelected(mon.id)}
              >
                <div className={`element-badge element-${template.element}`}>
                  {ELEMENT_ICONS[template.element]}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
                  <MiniSprite family={template.family} element={template.element} size={36} />
                </div>
                <div className="name">{template.nameZh}</div>
                <div className="stars">{starDisplay(mon.stars)}</div>
                <div className="level">Lv.{mon.level}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monster Detail Panel */}
      {selectedMon && selectedTemplate && (
        <MonsterDetail mon={selectedMon} />
      )}
    </div>
  );
}

function MonsterDetail({ mon }: { mon: MonsterInstance }) {
  const dispatch = useDispatch();
  const template = getTemplate(mon.templateId)!;
  const stats = mon.computedStats || computeStats(mon);
  const maxLevel = mon.stars * 5 + 10;

  return (
    <div className="panel animate-fadeIn">
      <div className="panel-title">{template.nameZh} 详细信息</div>
      <div className="monster-detail">
        <div className="sprite-area">
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <PixelSprite family={template.family} element={template.element} size={64} animation="idle" />
          </div>
          <div style={{ color: 'var(--gold)', fontSize: '9px' }}>{starDisplay(mon.stars)}</div>
          <div style={{ fontSize: '8px', marginTop: '4px' }}>Lv.{mon.level} / {maxLevel}</div>
          <div style={{ fontSize: '7px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {ELEMENT_ICONS[template.element]} {ELEMENT_NAMES_ZH[template.element]}属性 | {template.familyZh}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="pixel-btn secondary small"
              disabled={mon.level >= maxLevel}
              onClick={() => dispatch({ type: 'LEVEL_UP_MONSTER', monsterId: mon.id, amount: 5 })}
            >
              升级+5
            </button>
            <button
              className="pixel-btn gold small"
              disabled={mon.stars >= 6}
              onClick={() => dispatch({ type: 'STAR_UP_MONSTER', monsterId: mon.id })}
            >
              进化★
            </button>
            {!mon.awakened && (
              <button
                className="pixel-btn primary small"
                onClick={() => dispatch({ type: 'AWAKEN_MONSTER', monsterId: mon.id })}
              >
                觉醒
              </button>
            )}
          </div>

          {/* Leader Skill */}
          {template.leaderSkill && (
            <div style={{ marginTop: '8px', padding: '6px', background: 'var(--bg-dark)', border: '2px solid var(--border)', fontSize: '7px' }}>
              <div style={{ color: 'var(--gold)', marginBottom: '2px' }}>队长技能</div>
              <div style={{ color: 'var(--text-dim)' }}>{template.leaderSkill.descriptionZh}</div>
            </div>
          )}
        </div>

        <div>
          {/* Stats */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '8px', color: 'var(--accent2)', marginBottom: '6px' }}>属性</div>
            <div className="stats-grid">
              <div className="stat-row"><span className="stat-name">体力 HP</span><span className="stat-value">{formatNumber(stats.hp)}</span></div>
              <div className="stat-row"><span className="stat-name">攻击 ATK</span><span className="stat-value">{stats.atk}</span></div>
              <div className="stat-row"><span className="stat-name">防御 DEF</span><span className="stat-value">{stats.def}</span></div>
              <div className="stat-row"><span className="stat-name">速度 SPD</span><span className="stat-value">{stats.spd}</span></div>
              <div className="stat-row"><span className="stat-name">暴击率 CR</span><span className="stat-value">{stats.critRate}%</span></div>
              <div className="stat-row"><span className="stat-name">暴击伤害 CD</span><span className="stat-value">{stats.critDmg}%</span></div>
              <div className="stat-row"><span className="stat-name">效果抵抗 RES</span><span className="stat-value">{stats.resistance}%</span></div>
              <div className="stat-row"><span className="stat-name">效果命中 ACC</span><span className="stat-value">{stats.accuracy}%</span></div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div style={{ fontSize: '8px', color: 'var(--accent2)', marginBottom: '6px' }}>技能</div>
            <div className="skill-list">
              {template.skills.map((skill) => (
                <div key={skill.id} className="skill-card">
                  <div className="skill-header">
                    <span className="skill-name">
                      {skill.isPassive ? '🔮' : `⚔️`} {skill.nameZh}
                    </span>
                    <span className="skill-cd">
                      {skill.isPassive ? '被动' : skill.cooldown > 0 ? `CD: ${skill.cooldown}回合` : '无冷却'}
                    </span>
                  </div>
                  <div className="skill-desc">{skill.descriptionZh}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rune Slots */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '8px', color: 'var(--accent2)', marginBottom: '6px' }}>符文</div>
            <div className="rune-slots">
              {([1, 2, 3, 4, 5, 6] as const).map(slot => {
                const rune = mon.runes[slot];
                return (
                  <div key={slot} className={`rune-slot ${rune ? 'filled' : ''}`}>
                    <div className="slot-num">槽位 {slot}</div>
                    {rune ? (
                      <>
                        <div style={{ color: 'var(--accent2)', fontSize: '7px' }}>{rune.set}</div>
                        <div style={{ color: 'var(--gold)', fontSize: '6px' }}>+{rune.level} {'★'.repeat(rune.stars)}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '10px', opacity: 0.3 }}>＋</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
