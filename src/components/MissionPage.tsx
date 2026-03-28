import { useState } from 'react';
import { useGameState, useDispatch } from '../store/useGameStore';
import { formatNumber } from '../utils/helpers';
import { DAILY_MISSIONS, ACHIEVEMENT_MISSIONS } from '../data/missions';
import type { Mission } from '../types';

export function MissionPage() {
  const state = useGameState();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<'daily' | 'achievement'>('daily');

  const missions = tab === 'daily' ? DAILY_MISSIONS : ACHIEVEMENT_MISSIONS;

  const getProgress = (mission: Mission) => {
    const prog = state.missions?.find(m => m.missionId === mission.id);
    return {
      current: Math.min(prog?.current || 0, mission.requirement.count),
      claimed: prog?.claimed || false,
    };
  };

  const handleClaim = (missionId: string) => {
    dispatch({ type: 'CLAIM_MISSION', missionId });
  };

  // Check daily reset status
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0);
  const hoursUntilReset = Math.floor((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minsUntilReset = Math.floor(((nextReset.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div>
      <div className="panel">
        <div className="panel-title">📋 活动任务</div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
          <button
            className={`tab-btn ${tab === 'daily' ? 'active' : ''}`}
            onClick={() => setTab('daily')}
          >
            每日任务
          </button>
          <button
            className={`tab-btn ${tab === 'achievement' ? 'active' : ''}`}
            onClick={() => setTab('achievement')}
          >
            成就
          </button>
        </div>

        {tab === 'daily' && (
          <div style={{ fontSize: '7px', color: 'var(--text-dim)', marginBottom: '8px' }}>
            每日重置倒计时: {hoursUntilReset}小时{minsUntilReset}分
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {missions.map(mission => {
            const { current, claimed } = getProgress(mission);
            const complete = current >= mission.requirement.count;
            const pct = Math.min(100, Math.floor((current / mission.requirement.count) * 100));

            return (
              <div
                key={mission.id}
                style={{
                  padding: '8px',
                  background: claimed ? 'var(--bg-dark)' : 'var(--bg-card)',
                  border: `2px solid ${complete && !claimed ? 'var(--gold)' : 'var(--border)'}`,
                  opacity: claimed ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: complete ? 'var(--gold)' : 'var(--text)' }}>
                      {mission.nameZh}
                    </div>
                    <div style={{ fontSize: '7px', color: 'var(--text-dim)' }}>
                      {mission.descriptionZh}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {claimed ? (
                      <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>✅ 已领取</span>
                    ) : complete ? (
                      <button className="pixel-btn gold small" onClick={() => handleClaim(mission.id)}>
                        领取
                      </button>
                    ) : (
                      <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>{current}/{mission.requirement.count}</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  marginTop: '4px', height: '4px', background: 'var(--bg-dark)',
                  borderRadius: '2px', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: claimed ? 'var(--text-dim)' : complete ? 'var(--gold)' : 'var(--accent)',
                    transition: 'width 0.3s',
                  }} />
                </div>

                {/* Rewards */}
                <div style={{ marginTop: '4px', fontSize: '7px', color: 'var(--accent2)' }}>
                  奖励:
                  {mission.rewards.mana ? ` 💎${formatNumber(mission.rewards.mana)}` : ''}
                  {mission.rewards.crystals ? ` 🔮${mission.rewards.crystals}` : ''}
                  {mission.rewards.energy ? ` ⚡${mission.rewards.energy}` : ''}
                  {mission.rewards.mysticalScrolls ? ` 📜${mission.rewards.mysticalScrolls}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
