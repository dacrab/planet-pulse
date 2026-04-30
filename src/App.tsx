import { Component, createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { A } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { projects } from './data/projects';
import ForSale from './components/ForSale';

const App: Component = () => {
  const [time, setTime] = createSignal('');
  const [activeWork, setActiveWork] = createSignal<number | null>(null);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [scrollProgress, setScrollProgress] = createSignal(0);
  const [heroReady, setHeroReady] = createSignal(false);

  const [visibleSections, setVisibleSections] = createStore<Record<string, boolean>>({
    work: false,
    about: false,
    services: false,
    contact: false,
  });

  createEffect(() => {
    document.body.style.overflow = menuOpen() ? 'hidden' : '';
  });

  onMount(() => {
    setTimeout(() => setHeroReady(true), 80);

    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Berlin',
      }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.target.id) setVisibleSections(entry.target.id, entry.isIntersecting);
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

    onCleanup(() => {
      clearInterval(timeInterval);
      window.removeEventListener('scroll', handleScroll);
      sectionObserver.disconnect();
    });
  });


  return (
    <div class="min-h-screen bg-[#f0ede8] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-[#f0ede8]">
      <Title>Bureau — Brand & Digital, Berlin</Title>
      <Meta name="description" content="Bureau is Jonas Ek and Mara Voss. Brand and digital for climate and deep tech companies." />

      <div
        class="fixed top-0 left-0 h-[1px] bg-[#1a1a1a] z-[200] transition-none"
        style={`width: ${scrollProgress() * 100}%`}
      />

      <Show when={menuOpen()}>
        <div class="fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col justify-between p-6 md:p-12 animate-menu-in">
          <div class="flex justify-between items-center">
            <span class="text-[#f0ede8] font-medium tracking-tight text-lg">Bureau</span>
            <button
              class="text-[#f0ede8] text-sm opacity-60 hover:opacity-100 transition-opacity py-2 px-1"
              onClick={() => setMenuOpen(false)}
            >
              Close
            </button>
          </div>

          <nav class="flex flex-col gap-1">
            <For each={[
              { name: 'Work', href: '#work' },
              { name: 'Studio', href: '#about' },
              { name: 'Approach', href: '#services' },
              { name: 'Contact', href: '#contact' },
            ]}>
              {(item, i) => (
                <a
                  href={item.href}
                  class="group flex items-baseline gap-4 md:gap-6 text-[#f0ede8] text-[clamp(2rem,9vw,6rem)] font-light leading-none tracking-tight py-3 border-b border-[#f0ede8]/10 hover:border-[#f0ede8]/30 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                  style={`animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.1 + i() * 0.08}s both`}
                >
                  <span class="text-[#f0ede8]/20 text-xs font-mono w-5 shrink-0">{String(i() + 1).padStart(2, '0')}</span>
                  <span class="group-hover:translate-x-2 transition-transform duration-300">{item.name}</span>
                </a>
              )}
            </For>
          </nav>

          <div class="flex justify-between items-end text-[#f0ede8]" style="animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both">
            <div>
              <p class="text-xs opacity-40 mb-1">New projects</p>
              <a href="mailto:hello@bureau.studio" class="text-sm hover:opacity-60 transition-opacity">
                hello@bureau.studio
              </a>
            </div>
            <div class="flex gap-5 text-sm opacity-40">
              <For each={['Tw', 'Ig', 'Li']}>
                {(s) => <a href="#" class="hover:opacity-100 transition-opacity py-1">{s}</a>}
              </For>
            </div>
          </div>
        </div>
      </Show>

      <header class="fixed top-0 left-0 right-0 z-40 bg-[#f0ede8]/80 backdrop-blur-sm border-b border-[#1a1a1a]/5">
        <nav
          class="flex justify-between items-center px-6 md:px-12 py-5"
          style="animation: fadeIn 0.8s ease-out 0.1s both"
        >
          <a href="#" class="font-medium tracking-tight text-lg">Bureau</a>
          <div class="flex items-center gap-6 md:gap-8">
            <span class="text-sm font-mono opacity-40 hidden sm:block">Berlin {time()}</span>
            <button
              class="text-sm opacity-60 hover:opacity-100 transition-opacity py-1"
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
          </div>
        </nav>
      </header>

      <section class="min-h-screen flex flex-col justify-between px-6 md:px-12 pt-28 md:pt-36 pb-10 md:pb-12">
        <div class="space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">
          <div class="md:col-span-9">
            <h1 class="text-[clamp(2.6rem,9vw,9rem)] font-light leading-[0.88] tracking-[-0.04em]">
              <Show when={heroReady()}>
                <span class="block overflow-hidden">
                  <span class="block animate-clip-reveal" style="animation-delay: 0s">Brand and digital</span>
                </span>
                <span class="block overflow-hidden">
                  <span class="block animate-clip-reveal" style="animation-delay: 0.13s">for companies</span>
                </span>
                <span class="block overflow-hidden pb-[0.2em] -mb-[0.2em]">
                  <span class="block animate-clip-reveal italic" style="animation-delay: 0.26s">building what's next.</span>
                </span>
              </Show>
            </h1>
          </div>
          <div class="md:col-span-3 md:pt-4 md:flex md:flex-col md:justify-end">
            <p
              class="text-sm leading-relaxed opacity-50 max-w-xs"
              style={heroReady() ? 'animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.52s both' : 'opacity: 0'}
            >
              Bureau is Jonas Ek and Mara Voss. We work with climate and deep tech
              companies that are serious about what they're doing.
            </p>
          </div>
        </div>

        <div
          class="flex justify-between items-end mt-16 md:mt-0 pt-8 md:pt-0 border-t border-[#1a1a1a]/8 md:border-none"
          style={heroReady() ? 'animation: fadeIn 1s ease-out 0.8s both' : 'opacity: 0'}
        >
          <div class="flex gap-6 text-xs opacity-30 font-mono">
            <span>Est. 2019</span>
            <span>Berlin, DE</span>
          </div>
          <div class="hidden md:flex flex-col items-end gap-2 text-xs opacity-30">
            <span class="font-mono">{Math.round(scrollProgress() * 100)}%</span>
            <div class="w-px h-10 bg-[#1a1a1a]/20 relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full bg-[#1a1a1a] transition-none" style={`height: ${scrollProgress() * 100}%`} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="work"
        class="px-6 md:px-12 py-20 md:py-32"
      >
        <div class="flex justify-between items-baseline mb-10 md:mb-12">
          <h2 class="text-xs uppercase tracking-[0.2em] opacity-30">Selected Work</h2>
          <span class="text-xs opacity-30 font-mono">{String(projects.length).padStart(2, '0')}</span>
        </div>

        <div>
          <For each={projects}>
            {(work, index) => (
              <A
                href={`/project/${work.slug}`}
                class="group flex items-center justify-between border-t border-[#1a1a1a]/10 py-6 md:py-9 gap-4 md:gap-8"
                style={{
                  opacity: visibleSections.work ? 1 : 0,
                  transform: visibleSections.work ? 'translateY(0)' : 'translateY(10px)',
                  transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${index() * 0.09}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${index() * 0.09}s`,
                }}
                onMouseEnter={() => setActiveWork(index())}
                onMouseLeave={() => setActiveWork(null)}
              >
                <div class="flex items-baseline gap-4 md:gap-10 min-w-0">
                  <span class="text-xs opacity-25 font-mono shrink-0 hidden sm:block">
                    {String(index() + 1).padStart(2, '0')}
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-xl md:text-[2.5rem] font-light tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-500 ease-out truncate">
                      {work.client}
                    </h3>
                    <p class="text-xs md:text-sm opacity-30 mt-1.5">{work.type}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 md:gap-6 shrink-0">
                  <span class="text-sm opacity-30 hidden md:block">{work.year}</span>
                  <svg
                    class="w-4 h-4 opacity-40 md:opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out md:-translate-x-2 group-hover:translate-x-0 shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>

                <Show when={activeWork() === index()}>
                  <div
                    class="fixed top-1/2 right-20 w-[300px] h-[400px] pointer-events-none z-30 hidden lg:block overflow-hidden"
                    style={{ transform: 'translateY(-50%)', animation: 'fadeIn 0.2s ease-out' }}
                  >
                    <img
                      src={work.image}
                      alt={work.client}
                      class="w-full h-full object-cover animate-scale-in-fast"
                      loading="lazy"
                    />
                  </div>
                </Show>
              </A>
            )}
          </For>
        </div>
      </section>

      <section
        id="about"
        class="px-6 md:px-12 py-20 md:py-32 bg-[#1a1a1a] text-[#f0ede8]"
        style={{
          opacity: visibleSections.about ? 1 : 0,
          transform: visibleSections.about ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div class="grid md:grid-cols-12 gap-10 md:gap-8">
          <div class="md:col-span-5 md:col-start-2">
            <h2 class="text-xs uppercase tracking-[0.2em] opacity-30 mb-8 md:mb-10">Studio</h2>
            <p class="text-xl md:text-3xl font-light leading-[1.35] mb-6 md:mb-8">
              Jonas Ek and Mara Voss. Berlin-based since 2019.
              We are not a full-service agency and have no plans to become one.
            </p>
            <p class="text-sm leading-relaxed opacity-50">
              We started Bureau because we were tired of studios that optimise for growth
              over work. The math doesn't work — more clients means more project managers
              means more process means worse output. We kept the team small on purpose.
            </p>
            <p class="text-sm leading-relaxed opacity-50 mt-4">
              We focus on climate and deep tech because the stakes are higher and the
              briefs are harder. Clients in these spaces tend to know what they're doing
              technically. Our job is to make sure the world understands it too.
            </p>
          </div>
          <div class="md:col-span-4 md:col-start-9 md:pt-20">
            <For each={[
              { label: 'Years active', value: 6 },
              { label: 'Projects completed', value: 41 },
              { label: 'People', value: 2 },
            ]}>
              {(stat) => (
                <div class="flex justify-between items-baseline border-b border-[#f0ede8]/10 py-4 md:py-5">
                  <span class="text-sm opacity-40">{stat.label}</span>
                  <span class="text-xl md:text-2xl font-light">{stat.value}</span>
                </div>
              )}
            </For>
            <div class="mt-8 md:mt-12">
              <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-3 md:mb-4">Currently based</p>
              <p class="text-sm opacity-60">Prenzlauer Berg, Berlin</p>
              <p class="text-sm opacity-60">Available for projects from Q3 2025</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        class="px-6 md:px-12 py-20 md:py-32"
        style={{
          opacity: visibleSections.services ? 1 : 0,
          transform: visibleSections.services ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div class="grid md:grid-cols-12 gap-10 md:gap-12">
          <div class="md:col-span-3">
            <h2 class="text-xs uppercase tracking-[0.2em] opacity-30 md:sticky md:top-24">How we work</h2>
          </div>
          <div class="md:col-span-7">
            <For each={[
              {
                title: 'We work with fewer clients, not more',
                desc: "Four to six projects a year. Enough to do each one properly. We have turned down work from companies most studios would kill for — because the timing was wrong, or the brief was vague, or we didn't believe in what they were building.",
              },
              {
                title: 'The work has to stand on its own',
                desc: "We don't enter awards. We don't post process threads. If the identity doesn't work in the real world — on a building, in a product, under pressure — it doesn't work. Everything else is decoration.",
              },
              {
                title: 'We write our own briefs',
                desc: "Most briefs are wish lists written by committee. We spend the first two weeks of every project tearing the brief apart and rebuilding it. Clients who trust us to do that get better work. Clients who don't tend to go elsewhere.",
              },
            ]}>
              {(item, i) => (
                <div class="border-t border-[#1a1a1a]/10 py-7 md:py-8">
                  <div class="flex gap-5 md:gap-10">
                    <span class="text-xs font-mono opacity-20 pt-1 shrink-0">{String(i() + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 class="text-base md:text-xl font-light mb-2 md:mb-3 leading-snug">{item.title}</h3>
                      <p class="text-sm leading-relaxed opacity-40">{item.desc}</p>
                    </div>
                  </div>
                </div>
              )}
            </For>

            <div class="mt-12 pt-8 border-t border-[#1a1a1a]/10">
              <p class="text-xs uppercase tracking-[0.2em] opacity-30 mb-5">What we do</p>
              <div class="flex flex-wrap gap-2 md:gap-3">
                <For each={['Brand Identity', 'Visual Systems', 'Web Design', 'Digital Product', 'Design Systems', 'Art Direction', 'Environmental', 'Custom Type']}>
                  {(cap) => (
                    <span class="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 border border-[#1a1a1a]/15 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-300">
                      {cap}
                    </span>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        class="px-6 md:px-12 py-20 md:py-32 bg-[#1a1a1a] text-[#f0ede8]"
        style={{
          opacity: visibleSections.contact ? 1 : 0,
          transform: visibleSections.contact ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div class="grid md:grid-cols-12 gap-10 md:gap-8">
          <div class="md:col-span-7 md:col-start-2">
            <h2 class="text-xs uppercase tracking-[0.2em] opacity-30 mb-8 md:mb-10">New projects</h2>
            <p class="text-xl md:text-3xl font-light leading-[1.35] mb-8 md:mb-10 opacity-80">
              We take on four to six projects a year.
              If you're building something that matters and need help
              communicating it clearly — we'd like to hear about it.
            </p>
            <a
              href="mailto:hello@bureau.studio"
              class="inline-block text-[clamp(1.6rem,6vw,5rem)] font-light leading-none tracking-tight hover:opacity-50 transition-opacity duration-500 break-all"
            >
              hello@bureau.studio
            </a>
          </div>
          <div class="md:col-span-3 md:col-start-10 md:pt-32">
            <div class="flex flex-row md:flex-col gap-8 md:gap-6 text-sm">
              <div>
                <p class="opacity-30 mb-1 text-xs uppercase tracking-wider">Studio</p>
                <p class="opacity-60">Schönhauser Allee 36</p>
                <p class="opacity-60">10435 Berlin</p>
              </div>
              <div>
                <p class="opacity-30 mb-1 text-xs uppercase tracking-wider">Social</p>
                <div class="flex flex-col gap-1">
                  <For each={['Twitter', 'Instagram', 'LinkedIn']}>
                    {(s) => <a href="#" class="opacity-60 hover:opacity-100 transition-opacity duration-300 w-fit">{s}</a>}
                  </For>
                </div>
              </div>
            </div>
          </div>
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
  );
};

export default App;
