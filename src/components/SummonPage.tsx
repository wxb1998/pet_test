import { useState } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import { getTemplate, starDisplay } from '../utils/helpers';
import type { Element } from '../types';
import { ELEMENT_NAMES_ZH } from '../types';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

export function SummonPage() {
  const state = useGameState();
  const dispatch = useDispatch();
  const [showLightning, setShowLightning] = useState(false);

  const handleSummon = (type: 'mystical' | 'fire' | 'water' | 'wind' | 'legendary') => {
    const prevCount = state.monsters.length;
    dispatch({ type: 'SUMMON', scrollType: type });

    setTimeout(() => {
      const newest = state.monsters[state.monsters.length - 1];
      if (newest && state.monsters.length > prevCount) {
        const template = getTemplate(newest.templateId);
        if (template && template.naturalStars >= 4) {
          setShowLightning(true);
          setTimeout(() => setShowLightning(false), 1000);
        }
      }
    }, 50);
  };

  // We use an effect-like approach: track monsters count
  const lastMon = state.monsters[state.monsters.length - 1];
  const lastTemplate = lastMon ? getTemplate(lastMon.templateId) : null;

  return (
    <div>
      {showLightning && <div className="lightning-flash" />}

      <div className="panel">
        <div className="panel-title">📜 召唤台</div>

        <div className="summon-area">
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            使用卷轴召唤新的魔灵加入你的队伍！<br />
            <span style={{ fontSize: '7px' }}>
              ★★★ 91.5% | ★★★★ 8% | ★★★★★ 0.5% (传说卷轴: ★★★★★ 6.5%)
            </span>
          </div>

          <div className="scroll-options">
            <ScrollCard
              icon="📜"
              name="神秘卷轴"
              count={state.inventory.mysticalScrolls}
              onClick={() => handleSummon('mystical')}
            />
            <ScrollCard
              icon="🔥"
              name="火属性卷轴"
              count={state.inventory.elementalScrolls.fire}
              onClick={() => handleSummon('fire')}
            />
            <ScrollCard
              icon="💧"
              name="水属性卷轴"
              count={state.inventory.elementalScrolls.water}
              onClick={() => handleSummon('water')}
            />
            <ScrollCard
              icon="🌪"
              name="风属性卷轴"
              count={state.inventory.elementalScrolls.wind}
              onClick={() => handleSummon('wind')}
            />
            <ScrollCard
              icon="⭐"
              name="传说卷轴"
              count={state.inventory.legendaryScrolls}
              onClick={() => handleSummon('legendary')}
            />
          </div>

          {/* Buy scrolls with crystals */}
          <div style={{ marginTop: '12px' }}>
            <button
              className="pixel-btn secondary small"
              disabled={state.player.crystals < 75}
              onClick={() => {
                dispatch({ type: 'USE_CRYSTALS', amount: 75, purpose: 'scroll' });
                // Add scroll manually via a workaround
              }}
            >
              🔮 75水晶 → 购买神秘卷轴
            </button>
          </div>
        </div>
      </div>

      {/* Latest summon result display */}
      {lastTemplate && (
        <div className="panel">
          <div className="panel-title">最近召唤</div>
          <div className="summon-result">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>{lastTemplate.pixelArt}</div>
            <div className={`star-${lastTemplate.naturalStars >= 5 ? '5' : lastTemplate.naturalStars >= 4 ? '4' : '3'}`}
              style={{ fontSize: '14px', marginBottom: '4px' }}>
              {lastTemplate.nameZh}
            </div>
            <div style={{ color: 'var(--gold)', fontSize: '10px' }}>
              {starDisplay(lastTemplate.naturalStars)}
            </div>
            <div style={{ fontSize: '7px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {ELEMENT_ICONS[lastTemplate.element]} {ELEMENT_NAMES_ZH[lastTemplate.element]}属性 {lastTemplate.familyZh}
            </div>
          </div>
        </div>
      )}

      {/* Summon history */}
      <div className="panel">
        <div className="panel-title">库存</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px' }}>
          <InventoryItem icon="📜" name="神秘卷轴" count={state.inventory.mysticalScrolls} />
          <InventoryItem icon="🔥" name="火属性卷轴" count={state.inventory.elementalScrolls.fire} />
          <InventoryItem icon="💧" name="水属性卷轴" count={state.inventory.elementalScrolls.water} />
          <InventoryItem icon="🌪" name="风属性卷轴" count={state.inventory.elementalScrolls.wind} />
          <InventoryItem icon="⭐" name="传说卷轴" count={state.inventory.legendaryScrolls} />
          <InventoryItem icon="😈" name="恶魔兽" count={state.inventory.devilmons} />
        </div>
      </div>
    </div>
  );
}

function ScrollCard({ icon, name, count, onClick }: {
  icon: string; name: string; count: number; onClick: () => void;
}) {
  return (
    <div className="scroll-card" onClick={count > 0 ? onClick : undefined} style={{ opacity: count > 0 ? 1 : 0.4 }}>
      <div className="scroll-icon">{icon}</div>
      <div className="scroll-name">{name}</div>
      <div className="scroll-count">x{count}</div>
    </div>
  );
}

function InventoryItem({ icon, name, count }: { icon: string; name: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px',
      background: 'var(--bg-dark)', border: '2px solid var(--border)', fontSize: '7px'
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{name}</span>
      <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>x{count}</span>
    </div>
  );
}
