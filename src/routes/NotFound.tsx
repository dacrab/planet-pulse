import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { Icon } from '../components/Icon';

export default function NotFound() {
  return (
    <>
      <Title>Not found — Planet Pulse</Title>
      <Meta name="description" content="This signal does not exist." />

      <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p class="display text-8xl leading-none text-line-strong">404</p>
        <h1 class="display mt-4 text-4xl text-ink">
          This signal <em class="text-accent">does not exist.</em>
        </h1>
        <p class="mt-2 max-w-sm text-xs leading-relaxed text-muted">
          The route may have moved, or the event may have aged out of the live
          window.
        </p>
        <A
          href="/"
          class="focus-ring mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-[13px] font-medium text-accent-ink"
        >
          Back to the observatory
          <Icon name="arrow-right" size={14} />
        </A>
      </div>
    </>
  );
}
