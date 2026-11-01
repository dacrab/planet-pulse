import { Dynamic } from 'solid-js/web';
import type { JSX } from 'solid-js';
import type { IconName } from '../types';

const PATHS: Record<IconName, () => JSX.Element> = {
  activity: () => <polyline points="2 12 6 12 9 5 13 19 16 12 22 12" />,
  alert: () => (
    <>
      <path d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2h16a1.4 1.4 0 0 0 1.2-2Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  'arrow-right': () => (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  'arrow-up-right': () => (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  check: () => <path d="m4 12 5 5L20 6" />,
  clock: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  cloud: () => (
    <path d="M7 18a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9Z" />
  ),
  coin: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5h4" />
    </>
  ),
  copy: () => (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  external: () => (
    <>
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  feed: () => (
    <>
      <path d="M4 5h16M4 12h16M4 19h10" />
    </>
  ),
  globe: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3.2 3.4 3.2 14.6 0 18M12 3c-3.2 3.4-3.2 14.6 0 18" />
    </>
  ),
  layers: () => (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  'map-pin': () => (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  moon: () => <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  orbit: () => (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-28 12 12)" />
      <circle cx="19.4" cy="7.2" r="1.4" />
    </>
  ),
  pause: () => (
    <>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </>
  ),
  play: () => <path d="M7 4.5v15l13-7.5Z" />,
  pulse: () => (
    <>
      <path d="M2 12h4l2.5-6 4 12 2.5-6H22" />
    </>
  ),
  rain: () => (
    <>
      <path d="M7 15a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 6a4 4 0 0 1 0 8" />
      <path d="m8 18-1 3M12 18l-1 3M16 18l-1 3" />
    </>
  ),
  refresh: () => (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 6.3" />
      <path d="M20 4v7h-7" />
    </>
  ),
  search: () => (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  sliders: () => (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </>
  ),
  snow: () => (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    </>
  ),
  spark: () => (
    <path d="M12 2.5 14 10l7.5 2-7.5 2-2 7.5-2-7.5L2.5 12 10 10Z" />
  ),
  storm: () => (
    <>
      <path d="M7 15a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 7a4 4 0 0 1 0 8" />
      <path d="m13 12-4 6h4l-2 4 6-7h-4Z" />
    </>
  ),
  sun: () => (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  trophy: () => (
    <>
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 11v5M8 21h8M10 16h4v5h-4Z" />
    </>
  ),
  x: () => (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
};

export function Icon(props: {
  name: IconName;
  size?: number;
  class?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={props.size ?? 18}
      height={props.size ?? 18}
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth ?? 1.7}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
      aria-hidden="true"
    >
      <Dynamic component={PATHS[props.name]} />
    </svg>
  );
}
