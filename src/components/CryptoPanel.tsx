import { Index, Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { createMemo } from 'solid-js';
import { useStore } from '../stores/context';
import { CryptoEvent } from '../types/events';

function FlashRow(props: { coin: CryptoEvent }) {
  const [cls, setCls] = createSignal('');
  let prev = props.coin.price;

  createEffect(() => {
    const price = props.coin.price;
    if (price !== prev) {
      prev = price;
      setCls('flash');
      const timer = setTimeout(() => setCls(''), 400);
      onCleanup(() => clearTimeout(timer));
    }
  });

  const up = () => props.coin.change_24h >= 0;

  return (
    <div class={`flex items-center justify-between py-1 ${cls()}`}>
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs font-semibold text-content w-12 shrink-0">{props.coin.symbol}</span>
        <span class="text-[11px] text-content-muted truncate">${props.coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      </div>
      <span class={`text-xs font-semibold tabular-nums shrink-0 ${up() ? 'text-success' : 'text-danger'}`}>
        {up() ? '+' : ''}{props.coin.change_24h.toFixed(2)}%
      </span>
    </div>
  );
}

export function CryptoPanel() {
  const { aggregator } = useStore();

  const movers = createMemo(() => {
    const coins = aggregator.allEvents().filter((e): e is CryptoEvent => e.source === 'crypto');
    return [...coins].sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h)).slice(0, 8);
  });

  return (
    <Show when={movers().length > 0}>
      <div class="p-5 border-b border-border">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Crypto Movers</p>
        <div class="space-y-1">
          <Index each={movers()}>
            {(coin) => <FlashRow coin={coin()} />}
          </Index>
        </div>
      </div>
    </Show>
  );
}
