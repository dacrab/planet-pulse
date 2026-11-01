import {
  Show,
  children,
  createMemo,
  mergeProps,
  splitProps,
  type JSX,
} from 'solid-js';
import { clamp } from '../lib/format';
import { SOURCE_BY_ID, SOURCE_COLORS } from '../data/sources';
import type { SourceId } from '../types';
import { Icon } from './Icon';

/* -------------------------------------------------------------------------- */
/* Panel                                                                       */
/* -------------------------------------------------------------------------- */

export interface PanelProps {
  title?: string;
  eyebrow?: string;
  action?: JSX.Element;
  class?: string;
  bodyClass?: string;
  children?: JSX.Element;
}

export function Panel(props: PanelProps) {
  const merged = mergeProps({ bodyClass: 'p-5' }, props);
  const [local, rest] = splitProps(merged, [
    'title',
    'eyebrow',
    'action',
    'class',
    'bodyClass',
    'children',
  ]);
  const content = children(() => local.children);

  return (
    <section class={`panel ${local.class ?? ''}`} {...rest}>
      <Show when={local.eyebrow || local.title || local.action}>
        <header class="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div class="min-w-0">
            <Show when={local.eyebrow}>
              <p class="eyebrow text-faint">{local.eyebrow}</p>
            </Show>
            <Show when={local.title}>
              <h2
                class="text-[12px] font-semibold tracking-tight text-ink"
                classList={{ 'mt-1': Boolean(local.eyebrow) }}
              >
                {local.title}
              </h2>
            </Show>
          </div>
          <Show when={local.action}>
            <div class="shrink-0">{local.action}</div>
          </Show>
        </header>
      </Show>
      <div class={local.bodyClass}>{content()}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'danger';
type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-105',
  outline:
    'border border-line-strong bg-transparent text-ink hover:bg-panel-2 hover:border-line-strong',
  ghost: 'text-muted hover:text-ink hover:bg-panel-2',
  subtle: 'bg-panel-2 text-ink hover:bg-line/60',
  danger: 'text-danger hover:bg-danger/10',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs rounded',
  md: 'h-9 px-3.5 text-[13px] rounded',
  icon: 'h-9 w-9 rounded',
};

export function Button(props: ButtonProps) {
  const merged = mergeProps({ variant: 'outline' as ButtonVariant, size: 'md' as ButtonSize }, props);
  const [local, rest] = splitProps(merged, ['variant', 'size', 'class', 'children']);

  return (
    <button
      type="button"
      {...rest}
      class={`focus-ring inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${BUTTON_VARIANTS[local.variant]} ${BUTTON_SIZES[local.size]} ${local.class ?? ''}`}
    >
      {local.children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Source marks                                                                */
/* -------------------------------------------------------------------------- */

export function SourceDot(props: { source: SourceId; size?: number; class?: string }) {
  return (
    <span
      class={`inline-block shrink-0 rounded-full ${props.class ?? ''}`}
      style={{
        width: `${props.size ?? 6}px`,
        height: `${props.size ?? 6}px`,
        'background-color': SOURCE_COLORS[props.source],
        'box-shadow': `0 0 0 3px color-mix(in srgb, ${SOURCE_COLORS[props.source]} 14%, transparent)`,
      }}
    />
  );
}

export function SourceTag(props: { source: SourceId; label?: string; class?: string }) {
  const source = () => SOURCE_BY_ID[props.source];
  return (
    <span
      class={`inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${props.class ?? ''}`}
      style={{ color: SOURCE_COLORS[props.source] }}
    >
      <SourceDot source={props.source} size={5} />
      {props.label ?? source().short}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Sparkline                                                                   */
/* -------------------------------------------------------------------------- */

export function Sparkline(props: {
  values: number[];
  color?: string;
  class?: string;
  height?: number;
}) {
  const points = createMemo(() => {
    const values = props.values;
    if (values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 34 - ((value - min) / span) * 30;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  const area = createMemo(() => {
    const line = points();
    return line ? `M0,36 L${line.split(' ').join(' L')} L100,36 Z` : '';
  });

  return (
    <Show when={points()}>
      <svg
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
        class={props.class ?? 'h-9 w-full'}
        style={{ color: props.color ?? 'var(--accent)' }}
        aria-hidden="true"
      >
        <path d={area()} fill="currentColor" opacity="0.1" />
        <polyline
          points={points()}
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </Show>
  );
}

/* -------------------------------------------------------------------------- */
/* Score meter                                                                 */
/* -------------------------------------------------------------------------- */

export function ScoreMeter(props: {
  value: number;
  color?: string;
  class?: string;
  showValue?: boolean;
}) {
  return (
    <div class={`flex items-center gap-2 ${props.class ?? ''}`}>
      <div
        class="h-1 flex-1 overflow-hidden rounded-sm bg-line/80"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamp(props.value, 0, 100))}
      >
        <div
          class="h-full rounded-sm transition-[width] duration-500"
          style={{
            width: `${clamp(props.value, 0, 100)}%`,
            'background-color': props.color ?? 'var(--accent)',
          }}
        />
      </div>
      <Show when={props.showValue}>
        <span class="w-6 text-right font-mono text-[10px] tabular-nums text-faint">
          {Math.round(clamp(props.value, 0, 100))}
        </span>
      </Show>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state + skeleton                                                      */
/* -------------------------------------------------------------------------- */

export function EmptyState(props: {
  icon?: 'search' | 'feed' | 'alert' | 'globe';
  title: string;
  message: string;
  action?: JSX.Element;
}) {
  return (
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span class="flex h-11 w-11 items-center justify-center rounded border border-line bg-panel-2 text-faint">
        <Icon name={props.icon ?? 'search'} size={20} />
      </span>
      <div>
        <p class="text-sm font-medium text-ink">{props.title}</p>
        <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
          {props.message}
        </p>
      </div>
      {props.action}
    </div>
  );
}

export function Skeleton(props: { class?: string }) {
  return <div class={`skeleton rounded ${props.class ?? ''}`} aria-hidden="true" />;
}

export function Kbd(props: { children: JSX.Element }) {
  return (
    <kbd class="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line bg-panel-2 px-1 font-mono text-[10px] text-faint">
      {props.children}
    </kbd>
  );
}
