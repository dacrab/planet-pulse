import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function AchievementsPanel() {
  const store = useStore();
  const achievements = () => store.achievements.achievements;
  const unlocked = () => store.achievements.unlockedCount();
  const total = () => store.achievements.totalCount();

  return (
    <div class="p-6 rounded-xl border border-border bg-card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-sm font-semibold text-content">
          Achievements
        </h3>
        <div class="text-xs text-content-subtle font-medium">
          {unlocked()} / {total()} unlocked
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <Index each={achievements()}>
          {(achievement) => (
            <div 
              class={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                achievement().unlocked ? 'bg-success/5 border-success/20' : 'bg-sidebar border-border opacity-60 grayscale'
              }`}
            >
              <div class="text-2xl mt-0.5">
                {achievement().icon}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <div class="text-[0.8125rem] font-medium text-content">
                    {achievement().name}
                  </div>
                  <Show when={achievement().unlocked}>
                    <span class="text-xs text-success font-bold">✓</span>
                  </Show>
                </div>
                <div class="text-[0.6875rem] text-content-subtle leading-snug">
                  {achievement().description}
                </div>
                <Show when={!achievement().unlocked && achievement().progress !== undefined && achievement().target}>
                  <div class="mt-2">
                    <div class="flex justify-between text-[0.6875rem] text-content-subtle mb-1">
                      <span>Progress</span>
                      <span>{achievement().progress}/{achievement().target}</span>
                    </div>
                    <div class="h-1 bg-border rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-accent transition-all duration-300"
                        style={`width: ${Math.min(100, ((achievement().progress || 0) / (achievement().target || 1)) * 100)}%`}
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </Index>
      </div>
    </div>
  );
}
