import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';

const ForSale: Component = () => {
  const [open, setOpen] = createSignal(false);

  onMount(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open()) setOpen(false); };
    window.addEventListener('keydown', onKey);
    onCleanup(() => window.removeEventListener('keydown', onKey));
  });

  return (
    <>
      <button
        class="fixed bottom-6 right-6 z-[300] flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-[#f0ede8] text-xs uppercase tracking-[0.15em] font-mono hover:bg-[#2a2a2a] transition-colors duration-300"
        style="animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.2s both"
        onClick={() => setOpen(!open())}
        aria-label="This template is available for purchase"
      >
        <span class="relative flex h-1.5 w-1.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0ede8] opacity-60" />
          <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f0ede8]" />
        </span>
        Available
      </button>

      <Show when={open()}>
        <div class="fixed bottom-20 right-6 z-[300] w-[min(360px,calc(100vw-3rem))] bg-[#1a1a1a] text-[#f0ede8] p-7 flex flex-col gap-6 animate-content-in">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Template</p>
              <h2 class="text-lg font-light tracking-tight">Bureau — For Sale</h2>
            </div>
            <button
              class="text-[#f0ede8] opacity-40 hover:opacity-100 transition-opacity text-xs uppercase tracking-wider"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div class="h-px bg-[#f0ede8]/10" />

          <div class="space-y-4 text-sm">
            <div>
              <p class="opacity-40 text-xs uppercase tracking-wider mb-1.5">What's included</p>
              <p class="opacity-70 leading-relaxed font-light">
                Full source — SolidJS, TypeScript, Tailwind v4. Four project case studies,
                cinematic animations, mobile-first layout, SEO-ready meta. No dependencies
                you don't need.
              </p>
            </div>
            <div>
              <p class="opacity-40 text-xs uppercase tracking-wider mb-1.5">Pricing</p>
              <p class="opacity-70 leading-relaxed font-light">
                We don't post prices because serious buyers don't need a number to start
                a conversation. If you know what this is worth to you, you already know
                whether it's worth reaching out.
              </p>
            </div>
          </div>

          <div class="h-px bg-[#f0ede8]/10" />

          <div class="flex flex-col gap-3">
            <a
              href="mailto:vkavouras@proton.me?subject=Bureau Template — Purchase Inquiry"
              class="w-full text-center py-3 bg-[#f0ede8] text-[#1a1a1a] text-xs uppercase tracking-[0.15em] font-mono hover:bg-white transition-colors duration-300"
            >
              Get in touch
            </a>
            <p class="text-[10px] text-center opacity-30 font-mono">vkavouras@proton.me</p>
          </div>
        </div>
      </Show>
    </>
  );
};

export default ForSale;
