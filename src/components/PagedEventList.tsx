import { Show, createEffect, createMemo, createSignal, on } from 'solid-js';
import type { PulseEvent } from '../types';
import { EventList } from './EventRow';
import { Button } from './UI';

/**
 * Event list with simple client-side paging.
 * `resetKey` should change whenever filters/search change so the reader
 * starts from the first page of the new result set.
 */
export function PagedEventList(props: {
  events: PulseEvent[];
  pageSize?: number;
  resetKey?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  const pageSize = () => props.pageSize ?? 40;
  const [page, setPage] = createSignal(1);
  let root: HTMLDivElement | undefined;

  const scrollList = () => {
    root?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageCount = createMemo(() =>
    Math.max(1, Math.ceil(props.events.length / pageSize()))
  );

  const current = createMemo(() => {
    const start = (Math.min(page(), pageCount()) - 1) * pageSize();
    return props.events.slice(start, start + pageSize());
  });

  const start = () => Math.min((page() - 1) * pageSize() + 1, props.events.length);
  const end = () => Math.min(page() * pageSize(), props.events.length);

  createEffect(
    on(
      () => props.resetKey,
      () => setPage(1),
      { defer: true }
    )
  );

  createEffect(() => {
    if (page() > pageCount()) setPage(pageCount());
  });

  return (
    <div ref={root} class="scroll-mt-28">
      <EventList
        events={current()}
        emptyTitle={props.emptyTitle}
        emptyMessage={props.emptyMessage}
      />

      <Show when={props.events.length > pageSize()}>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 px-3 py-3">
          <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
            {start()}–{end()} of {props.events.length}
          </span>
          <div class="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              disabled={page() <= 1}
              onClick={() => {
                setPage((value) => Math.max(1, value - 1));
                scrollList();
              }}
            >
              Previous
            </Button>
            <span class="min-w-16 text-center font-mono text-[9px] uppercase tracking-wider text-faint">
              {page()} / {pageCount()}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={page() >= pageCount()}
              onClick={() => {
                setPage((value) => Math.min(pageCount(), value + 1));
                scrollList();
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
}
