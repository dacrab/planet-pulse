import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function AchievementsPanel() {
  const { achievements: { achievements, unlockedCount, totalCount } } = useStore();

  return (
    <div class="bg-card border border-border rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-content-subtle">Achievements</h3>
        <span class="text-xs text-content-subtle tabular-nums">{unlockedCount()}/{totalCount}</span>
      </div>

      <div class="flex flex-col gap-2">
        <Index each={achievements}>
          {(a) => (
            <div class={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              a().unlocked
                ? 'bg-success/5 border-success/20'
                : 'bg-surface border-border opacity-50'
            }`}>
              <span class="text-lg leading-none mt-0.5">{a().icon}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <p class="text-xs font-medium text-content">{a().name}</p>
                  <Show when={a().unlocked}>
                    <span class="text-[10px] text-success font-bold">✓</span>
                  </Show>
                </div>
                <p class="text-[10px] text-content-subtle leading-snug">{a().description}</p>
                <Show when={!a().unlocked && a().progress !== undefined && a().target}>
                  <div class="mt-2">
                    <div class="flex justify-between text-[10px] text-content-subtle mb-1">
                      <span>Progress</span>
                      <span class="tabular-nums">{a().progress}/{a().target}</span>
                    </div>
                    <div class="h-0.5 bg-border rounded-full overflow-hidden">
                      <div
                        class="h-full bg-accent transition-all duration-300"
                        style={`width: ${Math.min(100, ((a().progress || 0) / (a().target || 1)) * 100)}%`}
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
