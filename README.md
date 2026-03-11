# The Watch Tier List — 2025

An interactive, three-dimensional watch brand tier list built with React. Ranks 70+ watch brands across **Tier** (S–F), **Cost** (average retail price), and **Community Sentiment** (how much the watch community actually loves or hates them).

**[Live Demo →](https://YOUR_USERNAME.github.io/watch-tier-list/)**

## What is this?

A single-page React app that maps watch brands onto a grid:

- **Y-axis (rows):** Tier ranking from S (haute horlogerie) to F (fashion/hype)
- **X-axis (columns):** Average retail price from <$500 to $200K+
- **Color bar on each chip:** Community sentiment from 💀 Despised (-1.0) to 💚 Beloved (+1.0)

Tap any brand to see a detailed breakdown with sentiment meter, description, and tags.

## Data Sources

Rankings and sentiment scores are synthesized from:

- **Morgan Stanley / LuxeConsult** — Swiss watch industry annual report (2024 figures)
- **WatchCharts** — Secondary market pricing and brand indices
- **Reddit r/watches & r/WatchesCirclejerk** — Community sentiment and tier discussions
- **WatchUSeek Forums** — Enthusiast hierarchy threads
- **TierMaker** — Community-voted brand rankings
- **Teddy Baldassarre, Nico Leonard, Gear Patrol** — Watch media rankings
- **Chrono24 / Bob's Watches** — Market pricing data

> **Disclaimer:** All rankings are subjective and meant for entertainment. Sentiment scores are approximate vibes, not scientific measurements. Buy what you love.

## Featured Brands

| Tier | Description | Example Brands |
|------|-------------|----------------|
| **S** | Haute Horlogerie / Grail | Patek Philippe, A. Lange & Söhne, Vacheron Constantin, F.P. Journe |
| **A** | Prestige / Industry Elite | Rolex, Omega, Grand Seiko, Cartier, JLC |
| **B** | Premium Enthusiast | Tudor, Nomos, Zenith, Breitling, MB&F |
| **C** | Solid Entry Luxury | Oris, Tissot, Sinn, TAG Heuer, Longines |
| **D** | Accessible / Respected | Seiko, Casio, Hamilton, Orient, Swatch |
| **F** | Fashion / Hype / Overpriced | Hublot, Daniel Wellington, Invicta, MVMT |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/watch-tier-list.git
cd watch-tier-list

# Install dependencies
npm install

# Run locally
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Deploy to GitHub Pages

1. Update `homepage` in `package.json` with your GitHub username
2. Update `base` in `vite.config.js` if your repo name differs
3. Run:

```bash
npm run deploy
```

This builds the project and pushes to a `gh-pages` branch. Enable GitHub Pages in your repo settings (Settings → Pages → Source: `gh-pages` branch).

### Alternative: GitHub Actions (automatic deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

Then in repo Settings → Pages, set source to "GitHub Actions."

## How to Contribute

**Add a brand:** Edit the `WATCHES` array in `src/WatchTierList.jsx`. Each brand needs:

```javascript
{
  name: "Brand Name",
  tier: "C",           // S, A, B, C, D, or F
  avgPrice: 2000,      // Average retail price in USD
  sentiment: 0.5,      // -1.0 (despised) to +1.0 (beloved)
  country: "🇨🇭",      // Country flag emoji
  note: "Description of the brand, community perception, key models.",
  tags: ["Tag1", "Tag2"]
}
```

**Disagree with a ranking?** Open an issue or PR with your reasoning and sources!

## Tech Stack

- **React 18** — UI
- **Vite 6** — Build tool
- **Google Fonts** — Playfair Display + DM Sans
- **Zero dependencies** beyond React (no Tailwind, no UI libraries)

## License

MIT — do whatever you want with it.

---

*Built with [Claude](https://claude.ai) as an exploration of watch community data. Not affiliated with any watch brand.*
