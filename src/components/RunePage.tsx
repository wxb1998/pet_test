import { useState } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import type { Rune, RuneSlot } from '../types';
import { getTemplate, formatNumber } from '../utils/helpers';

const RUNE_SET_NAMES_ZH: Record<string, string> = {
  energy: '元气', guard: '守护', swift: '迅速', blade: '刀刃', rage: '愤怒',
  focus: '集中', endure: '忍耐', shield: '保护', revenge: '反击', will: '意志',
  nemesis: '复仇', vampire: '吸血', destroy: '破灭', despair: '绝望', violent: '暴走',
  fatal: '猛攻', phantom: '幻影', tolerance: '容忍', fight: '斗志', determination: '决意',
  enhance: '提升', accuracy: '命中',
};

const STAT_NAMES_ZH: Record<string, string> = {
  hp_flat: '体力', hp_percent: '体力%', atk_flat: '攻击力', atk_percent: '攻击力%',
  def_flat: '防御力', def_percent: '防御力%', spd: '速度',
  crit_rate: '暴击率', crit_dmg: '暴击伤害', resistance: '效果抵抗', accuracy: '效果命中',
};

export function RunePage() {
  const state = useGameState();
  const dispatch = useDispatch();
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<'inventory' | 'equipped'>('inventory');

  // Get all runes (inventory + equipped)
  const inventoryRunes = state.runes;
  const equippedRunes: (Rune & { monsterName: string })[] = [];

  for (const mon of state.monsters) {
    const template = getTemplate(mon.templateId);
    for (const slot of [1, 2, 3, 4, 5, 6] as RuneSlot[]) {
      const rune = mon.runes[slot];
      if (rune) {
        equippedRunes.push({ ...rune, monsterName: template?.nameZh || '未知' });
      }
    }
  }

  const displayRunes = tab === 'inventory' ? inventoryRunes : equippedRunes;
  const filteredRunes = filter === 'all' ? displayRunes : displayRunes.filter(r => r.set === filter);

  return (
    <div>
      <div className="panel">
        <div className="panel-title">💠 符文管理</div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>
            仓库 ({inventoryRunes.length})
          </button>
          <button className={`tab-btn ${tab === 'equipped' ? 'active' : ''}`} onClick={() => setTab('equipped')}>
            已装备 ({equippedRunes.length})
          </button>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '3px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部</button>
          {['violent', 'swift', 'despair', 'rage', 'fatal', 'blade', 'energy', 'focus', 'guard', 'will', 'revenge', 'nemesis', 'vampire', 'destroy'].map(set => (
            <button
              key={set}
              className={`tab-btn ${filter === set ? 'active' : ''}`}
              onClick={() => setFilter(set)}
              style={{ fontSize: '6px', padding: '4px 6px' }}
            >
              {RUNE_SET_NAMES_ZH[set] || set}
            </button>
          ))}
        </div>

        {/* Rune grid */}
        {filteredRunes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '8px' }}>
            暂无符文。去副本刷取吧！
          </div>
        ) : (
          <div className="rune-grid">
            {filteredRunes.map(rune => (
              <div
                key={rune.id}
                className="rune-card"
                onClick={() => setSelectedRune(rune)}
              >
                <div className="rune-header">
                  <span className="rune-set">{RUNE_SET_NAMES_ZH[rune.set] || rune.set}</span>
                  <span className="rune-stars">{'★'.repeat(rune.stars)} +{rune.level}</span>
                </div>
                <div style={{ fontSize: '6px', color: 'var(--text-dim)' }}>槽位 {rune.slot}</div>
                <div className="main-stat">
                  {STAT_NAMES_ZH[rune.mainStat.type]}: +{rune.mainStat.value}{rune.mainStat.type.includes('percent') || ['crit_rate', 'crit_dmg', 'resistance', 'accuracy'].includes(rune.mainStat.type) ? '%' : ''}
                </div>
                {rune.subStats.map((sub, i) => (
                  <div key={i} className="sub-stat">
                    {STAT_NAMES_ZH[sub.type]}: +{sub.value}{sub.type.includes('percent') || ['crit_rate', 'crit_dmg', 'resistance', 'accuracy', 'spd'].includes(sub.type) && sub.type !== 'spd' ? '%' : ''}
                  </div>
                ))}
                {'monsterName' in rune && (
                  <div style={{ fontSize: '6px', color: 'var(--accent2)', marginTop: '2px' }}>
                    装备于: {(rune as any).monsterName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rune detail / upgrade modal */}
      {selectedRune && (
        <div className="modal-overlay" onClick={() => setSelectedRune(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {RUNE_SET_NAMES_ZH[selectedRune.set]} 符文 {'★'.repeat(selectedRune.stars)}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>槽位 {selectedRune.slot} | +{selectedRune.level}/15</div>
              <div style={{ fontSize: '10px', color: 'var(--gold)', margin: '6px 0' }}>
                {STAT_NAMES_ZH[selectedRune.mainStat.type]}: +{selectedRune.mainStat.value}{selectedRune.mainStat.type.includes('percent') ? '%' : ''}
              </div>
              {selectedRune.subStats.map((sub, i) => (
                <div key={i} style={{ fontSize: '8px', color: 'var(--text-dim)', margin: '3px 0' }}>
                  {STAT_NAMES_ZH[sub.type]}: +{sub.value}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className="pixel-btn gold small"
                disabled={selectedRune.level >= 15}
                onClick={() => {
                  dispatch({ type: 'UPGRADE_RUNE', runeId: selectedRune.id });
                  // Refresh selected rune
                }}
              >
                ⬆ 强化 (费用: ~{formatNumber(Math.floor((500 + selectedRune.level * 1000) * (1 + selectedRune.stars * 0.3)))})
              </button>
              <button
                className="pixel-btn primary small"
                onClick={() => {
                  dispatch({ type: 'SELL_RUNE', runeId: selectedRune.id });
                  setSelectedRune(null);
                }}
              >
                💰 出售 (+{formatNumber(selectedRune.stars * 2000 + selectedRune.level * 500)})
              </button>
              <button className="pixel-btn secondary small" onClick={() => setSelectedRune(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
