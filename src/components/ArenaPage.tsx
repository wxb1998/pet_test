import { useState } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import { getTemplate, starDisplay } from '../utils/helpers';
import type { Element } from '../types';
import { ELEMENT_NAMES_ZH } from '../types';
import { MONSTER_TEMPLATES } from '../data/monsters';
import type { BattleSetup } from '../App';

const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥', water: '💧', wind: '🌪', light: '✨', dark: '🌑',
};

// Generate random arena opponents
function generateOpponents() {
  const opponents = [];
  const nonBossTemplates = MONSTER_TEMPLATES.filter(t => !t.id.includes('boss'));

  for (let i = 0; i < 5; i++) {
    const teamSize = 3 + Math.floor(Math.random() * 2); // 3-4 monsters
    const team = [];
    const used = new Set<number>();

    for (let j = 0; j < teamSize; j++) {
      let idx;
      do { idx = Math.floor(Math.random() * nonBossTemplates.length); } while (used.has(idx));
      used.add(idx);
      team.push(nonBossTemplates[idx]);
    }

    opponents.push({
      id: `opp_${i}`,
      name: `召唤师${1000 + Math.floor(Math.random() * 9000)}`,
      score: 900 + Math.floor(Math.random() * 600),
      team,
    });
  }

  return opponents.sort((a, b) => a.score - b.score);
}

interface Props {
  onStartBattle: (setup: BattleSetup) => void;
}

export function ArenaPage({ onStartBattle }: Props) {
  const state = useGameState();
  const dispatch = useDispatch();
  const [opponents] = useState(() => generateOpponents());
  const [team, setTeam] = useState<string[]>([]);
  const [showTeamSelect, setShowTeamSelect] = useState(false);

  const toggleTeamMember = (id: string) => {
    if (team.includes(id)) {
      setTeam(team.filter(t => t !== id));
    } else if (team.length < 4) { // Arena is 4v4
      setTeam([...team, id]);
    }
  };

  const handleAttack = () => {
    if (team.length === 0) return;
    onStartBattle({ team, mode: 'arena' });
  };

  return (
    <div>
      <div className="panel">
        <div className="panel-title">⚔ 竞技场</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '8px' }}>
          <span>当前积分: <span style={{ color: 'var(--gold)' }}>{state.player.arenaScore}</span></span>
          <button className="pixel-btn secondary small" onClick={() => setShowTeamSelect(!showTeamSelect)}>
            {showTeamSelect ? '收起选队' : '🛡 设置队伍'}
          </button>
        </div>

        {/* Team selection */}
        {showTeamSelect && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '6px' }}>
              进攻队伍 ({team.length}/4):
            </div>
            <div className="team-selector">
              {Array.from({ length: 4 }).map((_, i) => {
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
                        <div className="slot-sprite">{template.pixelArt}</div>
                        <div className="slot-name">{template.nameZh}</div>
                      </>
                    ) : (
                      <span>空位</span>
                    )}
                  </div>
                );
              })}
            </div>

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
                    <div className="pixel-sprite">{template.pixelArt}</div>
                    <div className="name">{template.nameZh}</div>
                    <div className="stars" style={{ fontSize: '7px' }}>{starDisplay(mon.stars)}</div>
                    <div className="level">Lv.{mon.level}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Opponent list */}
        <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>对手列表:</div>
        {opponents.map(opp => (
          <div key={opp.id} className="arena-opponent">
            <div className="opp-team">
              {opp.team.map((t, i) => (
                <span key={i} title={t.nameZh}>{t.pixelArt}</span>
              ))}
            </div>
            <div className="opp-info">
              <div>{opp.name}</div>
              <div style={{ color: 'var(--text-dim)' }}>
                {opp.team.map(t => t.nameZh).join(', ')}
              </div>
            </div>
            <div className="opp-score">{opp.score}</div>
            <button
              className="pixel-btn primary small"
              disabled={team.length === 0}
              onClick={handleAttack}
            >
              攻击
            </button>
          </div>
        ))}
      </div>

      {/* Arena rewards info */}
      <div className="panel">
        <div className="panel-title">🏆 竞技场奖励</div>
        <div style={{ fontSize: '7px', color: 'var(--text-dim)', lineHeight: '2' }}>
          每周根据积分排名发放奖励：水晶、玛那、神秘卷轴等。积分越高奖励越丰厚！
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px', marginTop: '8px' }}>
          {[
            { rank: 'C1 (1400+)', reward: '🔮150 📜3' },
            { rank: 'C2 (1600+)', reward: '🔮200 📜5' },
            { rank: 'C3 (1800+)', reward: '🔮300 📜7' },
            { rank: 'G1 (2000+)', reward: '🔮400 ⭐1' },
          ].map(tier => (
            <div key={tier.rank} style={{
              padding: '6px', background: 'var(--bg-dark)', border: '2px solid var(--border)', fontSize: '7px'
            }}>
              <div style={{ color: 'var(--gold)' }}>{tier.rank}</div>
              <div style={{ color: 'var(--text-dim)' }}>{tier.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
