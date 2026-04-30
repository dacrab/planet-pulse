import { Component, createSignal, createEffect, onMount, onCleanup, Show, For } from 'solid-js';
import { useParams, A, useNavigate } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { getProjectBySlug, getAdjacentProjects, type Project } from '../data/projects';
import ForSale from '../components/ForSale';

const ProjectPage: Component = () => {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = createSignal<Project | undefined>();
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [scrollY, setScrollY] = createSignal(0);

  createEffect(() => {
    const p = getProjectBySlug(params.slug);
    if (!p) { navigate('/', { replace: true }); return; }
    setProject(p);
    setImageLoaded(false);
    window.scrollTo(0, 0);
  });

  onMount(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    onCleanup(() => window.removeEventListener('scroll', handleScroll));
  });

  createEffect(() => {
    if (!project()) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    });
    onCleanup(() => observer.disconnect());
  });

  const heroParallax = () => `translateY(${scrollY() * 0.25}px)`;
  const heroOpacity = () => Math.max(0, 1 - scrollY() / 700);
  const headerOpaque = () => scrollY() > 80;

  const adjacent = () => project() ? getAdjacentProjects(project()!.slug) : { prev: undefined, next: undefined };

  return (
    <Show when={project()} fallback={<div class="min-h-screen bg-[#f0ede8]" />}>
      {(proj) => (
        <div class="min-h-screen bg-[#f0ede8] text-[#1a1a1a]">
          <Title>{proj().client} — Bureau</Title>
          <Meta name="description" content={proj().description} />

          <header
            class="fixed top-0 left-0 right-0 z-40 transition-[background,backdrop-filter,border-color] duration-500 ease-out"
            style={{
              background: headerOpaque() ? 'rgba(240,237,232,0.85)' : 'transparent',
              'backdrop-filter': headerOpaque() ? 'blur(12px)' : 'none',
              'border-bottom': headerOpaque() ? '1px solid rgba(26,26,26,0.05)' : '1px solid transparent',
            }}
          >
            <nav class="flex justify-between items-center px-6 md:px-12 py-5">
              <A
                href="/"
                class="font-medium tracking-tight text-lg transition-colors duration-500"
                style={{ color: headerOpaque() ? '#1a1a1a' : '#f0ede8' }}
              >
                Bureau
              </A>
              <A
                href="/"
                class="text-sm transition-colors duration-500 py-1"
                style={{ color: headerOpaque() ? 'rgba(26,26,26,0.4)' : 'rgba(240,237,232,0.6)' }}
              >
                ← Work
              </A>
            </nav>
          </header>

          <section class="relative h-[100svh] overflow-hidden">
            <div
              class="absolute inset-0"
              style={{ transform: heroParallax(), opacity: heroOpacity() }}
            >
              <img
                src={proj().heroImage}
                alt={proj().client}
                classList={{
                  'w-full h-[115%] object-cover transition-opacity duration-1000': true,
                  'opacity-100 animate-scale-in': imageLoaded(),
                  'opacity-0': !imageLoaded(),
                }}
                onLoad={() => setImageLoaded(true)}
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            </div>

            <div class="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-10 md:pb-14">
              <div
                class="flex items-center gap-3 mb-4 text-xs text-white/50 font-mono uppercase tracking-widest"
                style="animation: fadeIn 0.6s ease-out 0.3s both"
              >
                <span>{proj().type}</span>
                <span>·</span>
                <span>{proj().year}</span>
              </div>
              <h1 class="text-[clamp(2.8rem,10vw,8rem)] font-light leading-[0.88] tracking-[-0.04em] text-white mb-4 md:mb-0 overflow-hidden">
                <span class="block animate-clip-reveal" style="animation-delay: 0.1s">
                  {proj().client}
                </span>
              </h1>
              <p
                class="text-sm leading-relaxed text-white/60 max-w-sm mt-4 md:mt-5"
                style="animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both"
              >
                {proj().description}
              </p>
            </div>
          </section>

          <section class="px-6 md:px-12 py-16 md:py-28 border-b border-[#1a1a1a]/8">
            <div class="flex flex-wrap gap-x-4 gap-y-1 mb-10 md:hidden">
              <For each={proj().tags}>
                {(tag) => <span class="text-[11px] uppercase tracking-widest opacity-30 font-mono">{tag}</span>}
              </For>
            </div>

            <div class="grid md:grid-cols-12 gap-10 md:gap-8">
              <div class="hidden md:block md:col-span-1">
                <div class="flex flex-col gap-2">
                  <For each={proj().tags}>
                    {(tag) => <span class="text-[11px] uppercase tracking-widest opacity-30 font-mono">{tag}</span>}
                  </For>
                </div>
              </div>

              <div class="md:col-span-5 md:col-start-3 reveal">
                <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-5 md:mb-6">The situation</p>
                <p class="text-lg md:text-2xl font-light leading-[1.5] opacity-80">{proj().challenge}</p>
              </div>

              <div class="md:col-span-4 md:col-start-9 md:pt-10 reveal" style="transition-delay: 0.1s">
                <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-5 md:mb-6">What we did</p>
                <p class="text-sm leading-relaxed opacity-50">{proj().solution}</p>
              </div>
            </div>
          </section>

          <section class="px-6 md:px-12 py-12 md:py-16">
            <div class="flex flex-col gap-3 md:hidden">
              <For each={proj().gallery}>
                {(image, index) => (
                  <img
                    src={image}
                    alt={`${proj().client} ${String(index() + 1).padStart(2, '0')}`}
                    class="w-full h-auto object-cover reveal"
                    loading="lazy"
                  />
                )}
              </For>
            </div>

            <div class="hidden md:grid md:grid-cols-12 gap-4">
              <div class="md:col-span-12 overflow-hidden reveal">
                <img
                  src={proj().gallery[0]}
                  alt={`${proj().client} 01`}
                  class="w-full h-[60vh] object-cover gallery-img"
                  loading="lazy"
                />
              </div>
              <Show when={proj().gallery[1]}>
                <div class="md:col-span-7 overflow-hidden reveal" style="transition-delay: 0.07s">
                  <img
                    src={proj().gallery[1]}
                    alt={`${proj().client} 02`}
                    class="w-full h-[50vh] object-cover gallery-img"
                    loading="lazy"
                  />
                </div>
              </Show>
              <Show when={proj().gallery[2]}>
                <div class="md:col-span-5 overflow-hidden mt-16 reveal" style="transition-delay: 0.14s">
                  <img
                    src={proj().gallery[2]}
                    alt={`${proj().client} 03`}
                    class="w-full h-[40vh] object-cover gallery-img"
                    loading="lazy"
                  />
                </div>
              </Show>
            </div>
          </section>

          <section class="px-6 md:px-12 py-16 md:py-28 bg-[#1a1a1a] text-[#f0ede8]">
            <div class="grid md:grid-cols-12 gap-8">
              <div class="md:col-span-2 md:col-start-2">
                <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-6 md:mb-0">Outcomes</p>
              </div>
              <div class="md:col-span-8 md:col-start-4 reveal-group">
                <For each={proj().results}>
                  {(result, index) => (
                    <div class="reveal flex gap-5 md:gap-10 items-baseline border-t border-[#f0ede8]/10 py-6 md:py-7">
                      <span class="text-xs font-mono opacity-20 shrink-0">{String(index() + 1).padStart(2, '0')}</span>
                      <p class="text-base md:text-xl font-light leading-snug opacity-80">{result}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </section>

          <section class="px-6 md:px-12 py-12 md:py-16">
            <div class="grid grid-cols-2 gap-3 md:gap-4">
              <Show when={adjacent().prev}>
                {(prev) => (
                  <A
                    href={`/project/${prev().slug}`}
                    class="group flex flex-col gap-2 md:gap-3 p-4 md:p-6 border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30 transition-colors duration-300"
                  >
                    <span class="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-30">← Previous</span>
                    <span class="text-base md:text-2xl font-light tracking-tight group-hover:translate-x-1 transition-transform duration-300 leading-tight">{prev().client}</span>
                    <span class="text-[10px] md:text-xs opacity-30 hidden sm:block">{prev().type}</span>
                  </A>
                )}
              </Show>
              <Show when={adjacent().next}>
                {(next) => (
                  <A
                    href={`/project/${next().slug}`}
                    class="group flex flex-col gap-2 md:gap-3 p-4 md:p-6 border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30 transition-colors duration-300 items-end text-right"
                  >
                    <span class="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-30">Next →</span>
                    <span class="text-base md:text-2xl font-light tracking-tight group-hover:translate-x-1 transition-transform duration-300 leading-tight">{next().client}</span>
                    <span class="text-[10px] md:text-xs opacity-30 hidden sm:block">{next().type}</span>
                  </A>
                )}
              </Show>
            </div>
          </section>

          <footer class="px-6 md:px-12 py-6 border-t border-[#1a1a1a]/10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
              <div class="text-xs opacity-25">© 2025 Bureau, Berlin</div>
              <div class="text-xs opacity-25 font-mono hidden md:block">Brand & Digital for Climate & Deep Tech</div>
              <div class="text-xs opacity-25">Jonas Ek · Mara Voss</div>
            </div>
          </footer>

          <ForSale />
        </div>
      )}
    </Show>
  );
};

export default ProjectPage;
