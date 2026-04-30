# Bureau — Brand & Digital Studio

Studio site for an independent brand and digital studio focused on climate and deep tech companies.

**Live:** https://solid-studio-zeta.vercel.app

## What's Inside

- Single-page portfolio with project case studies
- Cinematic animations and parallax effects
- Mobile-first responsive design
- Fast page transitions
- SEO-ready

## Stack

- SolidJS + TypeScript
- Tailwind CSS v4
- Vite

## Development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

## Customization

**Projects** — Edit `src/data/projects.ts`  
Add your own projects with images, descriptions, and case study details.

**Studio Info** — Edit `src/App.tsx`  
Update studio name, location, contact info, and about section.

**Styles** — Edit `src/index.css`  
Customize colors, fonts, and animations.

## Structure

```
src/
├── App.tsx              # Main page
├── data/projects.ts     # Project data
├── pages/
│   ├── ProjectPage.tsx  # Project detail view
│   └── NotFound.tsx     # 404 page
└── components/
    └── ForSale.tsx      # Template purchase widget
```

## License

MIT
