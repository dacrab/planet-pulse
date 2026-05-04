import { For, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function AchievementsPanel() {
  const store = useStore();
  const achievements = () => store.achievements.achievements;
  const unlocked = () => store.achievements.unlockedCount();
  const total = () => store.achievements.totalCount();

  return (
    <div class="achievements-panel">
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem;">
          🏆 Achievements
        </h3>
        <div style="font-size: 0.75rem; color: var(--text-tertiary);">
          {unlocked()} / {total()} unlocked
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.625rem;">
        <For each={achievements()}>
          {(achievement) => (
            <div 
              class="achievement-card"
              classList={{ 'achievement-unlocked': achievement.unlocked }}
            >
              <div style="font-size: 1.5rem; margin-right: 0.75rem; opacity: var(--achievement-opacity);">
                {achievement.icon}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <div style="font-size: 0.8125rem; font-weight: 500; color: var(--text-primary);">
                    {achievement.name}
                  </div>
                  <Show when={achievement.unlocked}>
                    <span style="font-size: 0.75rem; color: var(--success);">✓</span>
                  </Show>
                </div>
                <div style="font-size: 0.6875rem; color: var(--text-tertiary); line-height: 1.3;">
                  {achievement.description}
                </div>
                <Show when={!achievement.unlocked && achievement.progress !== undefined && achievement.target}>
                  <div style="margin-top: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--text-tertiary); margin-bottom: 0.25rem;">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <div style="height: 3px; background: var(--border-color); border-radius: 2px; overflow: hidden;">
                      <div 
                        style={`width: ${Math.min(100, ((achievement.progress || 0) / (achievement.target || 1)) * 100)}%; height: 100%; background: var(--accent-primary); transition: width 0.3s ease;`}
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
