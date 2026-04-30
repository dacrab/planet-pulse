export interface Project {
  slug: string;
  client: string;
  type: string;
  year: string;
  image: string;
  heroImage: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  gallery: string[];
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'solaris',
    client: 'Solaris',
    type: 'Brand Identity',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=90',
    description: 'Brand identity for a utility-scale solar infrastructure company operating across Central Europe.',
    challenge: 'Solaris had closed a €120M Series C and needed a brand that could speak to institutional investors, municipal governments, and local communities simultaneously — three audiences with almost nothing in common. Their existing identity was a stock-photo logo and a WordPress site.',
    solution: 'We built the identity around the idea of infrastructure as civic pride — something that belongs to a place rather than sitting on top of it. A geometric mark derived from photovoltaic cell geometry. A type system that reads equally well on a government tender document and a field signage post. Earth tones that age well in physical environments.',
    results: [
      'Rebranded across 14 operational sites in 4 months',
      'Supported €340M Series D raise six months post-launch',
      'Brand guidelines adopted as internal design standard by two municipal energy partners',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80',
    ],
    tags: ['Brand Identity', 'Type System', 'Environmental', 'Guidelines'],
  },
  {
    slug: 'kin',
    client: 'Kin',
    type: 'Digital Product',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1920&q=90',
    description: 'Product design and design system for a longevity biotech platform that translates clinical biomarker data into actionable health protocols.',
    challenge: 'Kin\'s product sits at the intersection of hard science and consumer behaviour — a genuinely difficult place to design for. The data is complex. The stakes feel high. And their users, despite being health-conscious, are not clinicians. Every earlier version of the product had defaulted to either cold medical UI or the hollow optimism of wellness apps. Neither worked.',
    solution: 'We stripped the interface to its core job: help someone understand one thing clearly, then decide what to do about it. A strict typographic hierarchy does the heavy lifting. Data visualisations are calm, not dramatic. The colour system uses clinical white as a base with a single warm accent — enough to feel human without pretending the data is anything other than what it is.',
    results: [
      'Retention at 90 days increased from 34% to 71%',
      'Average session time up 4.2× after redesign',
      'Design system shipped across iOS, Android, and web in 11 weeks',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=1200&q=80',
    ],
    tags: ['Product Design', 'Design System', 'iOS & Android', 'Data Visualisation'],
  },
  {
    slug: 'conductor',
    client: 'Conductor',
    type: 'Brand & Web',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=90',
    description: 'Full brand and marketing site for a B2B SaaS platform that helps grid operators balance renewable energy loads in real time.',
    challenge: 'Conductor\'s product does something genuinely important — it makes renewable energy grids more stable, which directly accelerates the retirement of gas peaker plants. But their brand looked like every other enterprise SaaS company from 2018. Dark mode dashboard screenshots, blue gradients, "AI-powered" in the headline. Nobody trusted it.',
    solution: 'The new brand leads with the physical reality of energy infrastructure rather than software abstractions. Photography over illustration. Specificity over jargon. The website is structured around three buyer types — grid operators, energy traders, and regulators — each with a distinct entry point and evidence trail. The product screenshots are real. The case studies have named clients.',
    results: [
      'Inbound demo requests up 215% in first quarter post-launch',
      'Average sales cycle shortened by 5 weeks',
      'Landed two Tier 1 grid operator contracts within 90 days of launch',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',
    ],
    tags: ['Brand Identity', 'Web Design', 'Copywriting', 'Development'],
  },
  {
    slug: 'havn',
    client: 'Havn',
    type: 'Brand Identity',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1920&q=90',
    description: 'Brand identity for a Scandinavian startup building electric passenger ferries for urban coastal routes.',
    challenge: 'Maritime branding has two defaults: nautical heritage (anchors, rope, navy blue) or tech-startup futurism (gradients, sans-serif everything, "revolutionizing"). Havn wanted neither. They are a serious engineering company that also happens to care deeply about how their vessels feel to ride — the experience of crossing a fjord quietly, without exhaust fumes, at 6am.',
    solution: 'The identity is built around the Norwegian concept of "ro" — a word that means both calm and the act of rowing. Quiet confidence. The wordmark is set in a custom-modified serif, slightly condensed, with just enough weight to hold up on the hull of a 40-metre vessel. The palette is fog, slate, and a single copper accent pulled from traditional maritime hardware.',
    results: [
      'Identity rolled out across first three vessels on schedule',
      'Featured in Wallpaper* and Dezeen within two months of launch',
      'Secured naming partnership with Bergen municipality',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=1200&q=80',
      'https://images.unsplash.com/photo-1504615458222-979e04d69a27?w=1200&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80',
    ],
    tags: ['Brand Identity', 'Custom Type', 'Environmental', 'Maritime'],
  },
];

export const getProjectBySlug = (slug: string) => projects.find(p => p.slug === slug);

export const getAdjacentProjects = (slug: string) => {
  const idx = projects.findIndex(p => p.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(idx - 1 + projects.length) % projects.length],
    next: projects[(idx + 1) % projects.length],
  };
};
