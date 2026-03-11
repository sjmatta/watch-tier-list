import { useState, useRef } from "react";

const TIERS = ["S", "A", "B", "C", "D", "F"];
const TIER_COLORS = {
  S: { bg: "#1a1a2e", accent: "#e6c068", border: "#c9a84c", label: "#e6c068" },
  A: { bg: "#1a1a2e", accent: "#a8c7e0", border: "#7ba3c4", label: "#a8c7e0" },
  B: { bg: "#1a1a2e", accent: "#8bc7a3", border: "#5fa87e", label: "#8bc7a3" },
  C: { bg: "#1a1a2e", accent: "#c4b08b", border: "#a08e6a", label: "#c4b08b" },
  D: { bg: "#1a1a2e", accent: "#c49080", border: "#a06e5e", label: "#c49080" },
  F: { bg: "#1a1a2e", accent: "#8a7080", border: "#6a5060", label: "#8a7080" },
};

const PRICE_RANGES = [
  { label: "< $500", min: 0, max: 500 },
  { label: "$500–2K", min: 500, max: 2000 },
  { label: "$2K–5K", min: 2000, max: 5000 },
  { label: "$5K–15K", min: 5000, max: 15000 },
  { label: "$15K–50K", min: 15000, max: 50000 },
  { label: "$50K–200K", min: 50000, max: 200000 },
  { label: "$200K+", min: 200000, max: 1000000 },
];

// Sentiment: -1.0 (despised) to +1.0 (beloved)
// Based on Reddit r/watches, WatchUSeek, YouTube comments, TierMaker community votes
const SENTIMENT_LABELS = [
  { min: 0.7, label: "Beloved", emoji: "💚" },
  { min: 0.4, label: "Well-liked", emoji: "👍" },
  { min: 0.1, label: "Positive", emoji: "👌" },
  { min: -0.1, label: "Mixed", emoji: "🤷" },
  { min: -0.4, label: "Divisive", emoji: "⚡" },
  { min: -0.7, label: "Disliked", emoji: "👎" },
  { min: -1.1, label: "Despised", emoji: "💀" },
];

function getSentimentLabel(s) {
  for (const sl of SENTIMENT_LABELS) {
    if (s >= sl.min) return sl;
  }
  return SENTIMENT_LABELS[SENTIMENT_LABELS.length - 1];
}

function sentimentColor(s) {
  if (s >= 0) {
    const t = Math.min(s, 1);
    const r = Math.round(200 - t * 140);
    const g = Math.round(180 + t * 55);
    const b = Math.round(80 - t * 20);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = Math.min(Math.abs(s), 1);
    const r = Math.round(200 + t * 40);
    const g = Math.round(180 - t * 120);
    const b = Math.round(80 - t * 40);
    return `rgb(${r},${g},${b})`;
  }
}

const WATCHES = [
  // S Tier
  { name: "Patek Philippe", tier: "S", avgPrice: 65000, sentiment: 0.85, country: "🇨🇭", note: "The undisputed king. 'You never actually own a Patek.' Nautilus, Calatrava, Grand Complications. Cubitus was divisive but brand reverence is untouchable.", tags: ["Holy Trinity", "Investment"] },
  { name: "A. Lange & Söhne", tier: "S", avgPrice: 45000, sentiment: 0.95, country: "🇩🇪", note: "German precision at its absolute peak. Datograph, Zeitwerk, 1815. Silver dials, hand-engraved movements. Possibly the most universally respected brand among enthusiasts.", tags: ["German", "In-house"] },
  { name: "Audemars Piguet", tier: "S", avgPrice: 55000, sentiment: 0.55, country: "🇨🇭", note: "Holy Trinity member. Royal Oak changed luxury sports watches forever in 1972. CODE 11.59 polarizes. Some backlash over pricing and availability games.", tags: ["Holy Trinity", "Iconic"] },
  { name: "Vacheron Constantin", tier: "S", avgPrice: 48000, sentiment: 0.9, country: "🇨🇭", note: "Continuous operation since 1755. Overseas, Patrimony, Historiques. The quiet sophisticate. Enthusiasts adore VC—less hype, more substance.", tags: ["Holy Trinity", "Heritage"] },
  { name: "F.P. Journe", tier: "S", avgPrice: 120000, sentiment: 0.85, country: "🇨🇭", note: "Independent genius. Chronomètre à Résonance, Tourbillon Souverain. Cult collector following. Community respects the craft deeply.", tags: ["Independent", "Collector"] },
  { name: "Greubel Forsey", tier: "S", avgPrice: 500000, sentiment: 0.7, country: "🇨🇭", note: "Absolute pinnacle of mechanical complexity. Multi-axis tourbillons. Each piece is a micro-sculpture. Respected but too rarefied for most to have opinions.", tags: ["Ultra Luxury", "Complications"] },
  { name: "Richard Mille", tier: "S", avgPrice: 310000, sentiment: -0.3, country: "🇨🇭", note: "Polarizing but undeniably successful. ~$310K avg, only 5,700/yr. Celeb culture. Community deeply split—'paying for the brand' vs. genuine tech innovation.", tags: ["Modern", "Celeb"] },

  // A Tier
  { name: "Rolex", tier: "A", avgPrice: 13000, sentiment: 0.5, country: "🇨🇭", note: "Most recognized watch brand on Earth. 32% of Swiss market. Submariner, Daytona, GMT-Master. Unmatched resale. Backlash for hype culture and waitlists.", tags: ["Iconic", "Investment"] },
  { name: "Omega", tier: "A", avgPrice: 7500, sentiment: 0.75, country: "🇨🇭", note: "Speedmaster went to the moon. Seamaster is Bond's watch. Master Chronometer cert. Community loves the value prop vs Rolex. MoonSwatch was a moment.", tags: ["Space", "Bond"] },
  { name: "Grand Seiko", tier: "A", avgPrice: 6000, sentiment: 0.95, country: "🇯🇵", note: "Japan's answer to Swiss luxury. Spring Drive is a marvel. Zaratsu polishing. Snowflake dial. Reddit's darling—possibly the most beloved brand online.", tags: ["Japanese", "Value King"] },
  { name: "Cartier", tier: "A", avgPrice: 8000, sentiment: 0.65, country: "🇫🇷", note: "Jeweler-turned-watchmaker powerhouse. Tank, Santos, Ballon Bleu. Rising fast. Some purists dismiss as 'jewelry brand' but sentiment is warming rapidly.", tags: ["Design", "Heritage"] },
  { name: "Jaeger-LeCoultre", tier: "A", avgPrice: 12000, sentiment: 0.8, country: "🇨🇭", note: "The 'watchmaker's watchmaker.' Made calibers for Patek & AP. Reverso is iconic. Enthusiasts wish it got more mainstream recognition.", tags: ["Manufacture", "Heritage"] },
  { name: "Blancpain", tier: "A", avgPrice: 14000, sentiment: 0.7, country: "🇨🇭", note: "Fifty Fathoms invented the modern dive watch. No quartz, ever. Villeret moonphase. Community considers it 'the thinking person's Omega.'", tags: ["Dive", "Heritage"] },
  { name: "H. Moser & Cie", tier: "A", avgPrice: 25000, sentiment: 0.75, country: "🇨🇭", note: "Swiss indie darling. Fumé dials are their signature. Streamliner, Endeavour. Trolls the industry brilliantly. Reddit loves the irreverence.", tags: ["Independent", "Design"] },
  { name: "Glashutte Original", tier: "A", avgPrice: 10000, sentiment: 0.7, country: "🇩🇪", note: "Germany's other powerhouse. PanoMaticLunar is stunning. Senator line. Three-quarter plates, German silver. 'Criminally undervalued' per enthusiasts.", tags: ["German", "In-house"] },

  // B Tier
  { name: "Tudor", tier: "B", avgPrice: 3500, sentiment: 0.8, country: "🇨🇭", note: "Rolex's sibling that earned its own identity. Black Bay is a modern classic. 200K+ watches/yr. Community loves it as 'the sensible Rolex alternative.'", tags: ["Value", "Dive"] },
  { name: "IWC", tier: "B", avgPrice: 9000, sentiment: 0.45, country: "🇨🇭", note: "Pilot's watches, Portugieser, Aquatimer. Engineering-focused. Some feel IWC is overpriced for what you get. Polarizing value proposition.", tags: ["Pilot", "Engineering"] },
  { name: "Breitling", tier: "B", avgPrice: 6500, sentiment: 0.5, country: "🇨🇭", note: "Aviation DNA. Navitimer is legendary. Georges Kern reshaping the brand. Improving but still 'not as prestigious as Omega' per WIS.", tags: ["Aviation", "Chrono"] },
  { name: "Panerai", tier: "B", avgPrice: 9000, sentiment: 0.3, country: "🇮🇹", note: "Italian Navy heritage. Luminor, Submersible. Passionate niche community. Wider market: 'overpriced—one design for everything.'", tags: ["Italian", "Military"] },
  { name: "Zenith", tier: "B", avgPrice: 7000, sentiment: 0.6, country: "🇨🇭", note: "El Primero is one of the most important movements ever. Defy, Chronomaster. Respected heritage. Brand identity feels inconsistent.", tags: ["Chrono", "Heritage"] },
  { name: "Nomos Glashütte", tier: "B", avgPrice: 3500, sentiment: 0.8, country: "🇩🇪", note: "Bauhaus meets German watchmaking. In-house movements at accessible prices. Tangente, Club, Metro. Beloved by design-minded collectors.", tags: ["Bauhaus", "Value"] },
  { name: "Chopard", tier: "B", avgPrice: 12000, sentiment: 0.45, country: "🇨🇭", note: "L.U.C line has serious chops. Alpine Eagle is a hit. Ethical gold pioneer. Community respects L.U.C but sees brand as 'jewelry first.'", tags: ["Luxury", "Ethical"] },
  { name: "MB&F", tier: "B", avgPrice: 80000, sentiment: 0.7, country: "🇨🇭", note: "Max Büsser's mechanical art. Legacy Machine, Horological Machine. Wearable sculptures. Enthusiasts love the creativity.", tags: ["Art", "Independent"] },
  { name: "Piaget", tier: "B", avgPrice: 20000, sentiment: 0.4, country: "🇨🇭", note: "Ultra-thin specialist. Altiplano holds world records. Polo is their sport watch. Community respects movements but brand is 'invisible' vs peers.", tags: ["Ultra-thin", "Jewelry"] },
  { name: "Ulysse Nardin", tier: "B", avgPrice: 10000, sentiment: 0.35, country: "🇨🇭", note: "Marine chronometer heritage. Freak is a genuine innovation. Community: great watches, weak brand management.", tags: ["Marine", "Innovation"] },
  { name: "Bulgari", tier: "B", avgPrice: 9000, sentiment: 0.5, country: "🇮🇹", note: "Octo Finissimo keeps breaking ultra-thin records. Serpenti is iconic. Italian design, Swiss mechanics. Gaining horological respect.", tags: ["Italian", "Ultra-thin"] },

  // C Tier
  { name: "TAG Heuer", tier: "C", avgPrice: 3000, sentiment: 0.25, country: "🇨🇭", note: "Carrera, Monaco, Aquaracer. F1 timekeeper. Gateway luxury. Community sees it as 'overmarketed'—Connected smartwatch hurt credibility.", tags: ["Racing", "Accessible"] },
  { name: "Longines", tier: "C", avgPrice: 2000, sentiment: 0.7, country: "🇨🇭", note: "Heritage brand with great value. HydroConquest, Spirit. Since 1832. Community calls it 'the best value in Swiss at this price.'", tags: ["Value", "Heritage"] },
  { name: "Oris", tier: "C", avgPrice: 2200, sentiment: 0.85, country: "🇨🇭", note: "Best value in Swiss watches. Aquis, Big Crown, Divers 65. Fiercely independent. Universally beloved by enthusiasts. Reddit darling.", tags: ["Independent", "Value"] },
  { name: "Tissot", tier: "C", avgPrice: 600, sentiment: 0.75, country: "🇨🇭", note: "The gateway to Swiss watches. PRX is a phenomenon. Powermatic 80. Under $1K for real Swiss quality. 'The perfect starter.'", tags: ["Entry", "Value"] },
  { name: "Sinn", tier: "C", avgPrice: 2000, sentiment: 0.85, country: "🇩🇪", note: "German tool watches. 556, 104, U50. Tegimented steel, mission-proven. Massive cult following on r/watches and WUS.", tags: ["Tool", "German"] },
  { name: "Bell & Ross", tier: "C", avgPrice: 3500, sentiment: 0.2, country: "🇫🇷", note: "Aviation instrument aesthetic. BR 03, BR 05. Seen as overpriced for what you get. One-trick pony reputation.", tags: ["Aviation", "Design"] },
  { name: "Montblanc", tier: "C", avgPrice: 4000, sentiment: 0.3, country: "🇩🇪", note: "Owns Minerva movements. 1858, Heritage. Pen brand reputation holds it back. 'Great watches nobody takes seriously.'", tags: ["Heritage", "Minerva"] },
  { name: "Bremont", tier: "C", avgPrice: 4500, sentiment: 0.1, country: "🇬🇧", note: "British watchmaking revival. Military connections. Trip-Tick case. Sharply divided—overpriced vs. patriotic pride.", tags: ["British", "Military"] },
  { name: "Maurice Lacroix", tier: "C", avgPrice: 2000, sentiment: 0.4, country: "🇨🇭", note: "Aikon is their breakout—integrated bracelet at a great price. Gaining respect. Still relatively under the radar.", tags: ["Swiss", "Value"] },
  { name: "Glycine", tier: "C", avgPrice: 800, sentiment: 0.2, country: "🇨🇭", note: "Airman GMT is a classic with cult following. Invicta ownership has damaged community trust considerably.", tags: ["Pilot", "Heritage"] },
  { name: "Doxa", tier: "C", avgPrice: 1500, sentiment: 0.55, country: "🇨🇭", note: "Dive watch legend. SUB 200, SUB 300. Orange dial pioneer. Cousteau connection. Niche but very well-liked.", tags: ["Dive", "Heritage"] },
  { name: "Rado", tier: "C", avgPrice: 2000, sentiment: 0.4, country: "🇨🇭", note: "Ceramic pioneers since the '60s. Captain Cook revival is a hit. Scratch-proof specialist. Quietly gaining fans.", tags: ["Ceramic", "Swiss"] },
  { name: "Frederique Constant", tier: "C", avgPrice: 2000, sentiment: 0.5, country: "🇨🇭", note: "In-house at mid-range prices. Slimline Moonphase is gorgeous. 'Accessible luxury' done right. Solid but not exciting.", tags: ["Accessible", "In-house"] },
  { name: "Baume & Mercier", tier: "C", avgPrice: 2500, sentiment: 0.3, country: "🇨🇭", note: "Richemont's entry luxury. Riviera comeback is strong. Clifton, Classima. Community: 'fine but forgettable.'", tags: ["Richemont", "Accessible"] },
  { name: "Alpina", tier: "C", avgPrice: 1500, sentiment: 0.45, country: "🇨🇭", note: "Invented the sport watch in the 1930s. Seastrong, Startimer. Adventure DNA. Under the radar—those who know, like it.", tags: ["Sport", "Heritage"] },

  // D Tier
  { name: "Hamilton", tier: "D", avgPrice: 800, sentiment: 0.8, country: "🇺🇸", note: "American heritage, Swiss-made. Khaki Field, Ventura. Hollywood's favorite. Community loves it—'best automatics under $1K.'", tags: ["American", "Value"] },
  { name: "Seiko", tier: "D", avgPrice: 400, sentiment: 0.9, country: "🇯🇵", note: "$50 to $5K. Seiko 5, Presage, Prospex. Invented Spring Drive & quartz. SKX is legendary. Community worships Seiko—'the gateway drug.'", tags: ["Japanese", "Legend"] },
  { name: "Citizen", tier: "D", avgPrice: 350, sentiment: 0.6, country: "🇯🇵", note: "Eco-Drive is a game-changer. Promaster. Light-powered, no battery changes. Respected but not exciting. 'Your dad's watch' vibes.", tags: ["Eco-Drive", "Practical"] },
  { name: "Bulova", tier: "D", avgPrice: 400, sentiment: 0.5, country: "🇺🇸", note: "Lunar Pilot went to the moon. Precisionist 262kHz. Great heritage, accessible prices. Community consensus: 'slept on.'", tags: ["American", "Space"] },
  { name: "Mido", tier: "D", avgPrice: 800, sentiment: 0.55, country: "🇨🇭", note: "Swatch Group's quiet achiever. Baroncelli, Ocean Star. Swiss autos at great prices. 'The Tissot people don't know about.'", tags: ["Swiss", "Value"] },
  { name: "Junghans", tier: "D", avgPrice: 1200, sentiment: 0.6, country: "🇩🇪", note: "Max Bill = Bauhaus perfection. German precision, clean design. Design-lovers adore it.", tags: ["Bauhaus", "German"] },
  { name: "Christopher Ward", tier: "D", avgPrice: 1000, sentiment: 0.75, country: "🇬🇧", note: "Microbrand success. C63 Sealander, C60 Trident. In-house SH21. Reddit: 'punches so far above its price it's unfair.'", tags: ["Micro", "Value"] },
  { name: "Casio", tier: "D", avgPrice: 80, sentiment: 0.95, country: "🇯🇵", note: "G-Shock is indestructible. F-91W is the GOAT beater. Not luxury—but deeply beloved. 'Everyone should own a Casio.' Universal consensus.", tags: ["Tool", "Icon"] },
  { name: "Timex", tier: "D", avgPrice: 60, sentiment: 0.7, country: "🇺🇸", note: "'Takes a licking, keeps on ticking.' Marlin, Weekender, Q Timex. Honest watches, honest prices. Americana.", tags: ["American", "Classic"] },
  { name: "Orient", tier: "D", avgPrice: 250, sentiment: 0.85, country: "🇯🇵", note: "Seiko's sibling. Bambino is a legend under $200. Kamasu punches way above. 'The best value in all of horology.'", tags: ["Japanese", "Value King"] },
  { name: "Swatch", tier: "D", avgPrice: 90, sentiment: 0.6, country: "🇨🇭", note: "Saved Swiss watchmaking in the '80s. Fun, colorful, collectible. MoonSwatch was a cultural moment. Some hype fatigue setting in.", tags: ["Swiss", "Pop Culture"] },
  { name: "Garmin", tier: "D", avgPrice: 500, sentiment: 0.65, country: "🇺🇸", note: "The serious athlete's watch. Fenix, Enduro, Instinct. GPS, health, weeks of battery. Not horology—but athletes swear by it.", tags: ["Smart", "Sport"] },
  { name: "Apple Watch", tier: "D", avgPrice: 450, sentiment: 0.0, country: "🇺🇸", note: "World's best-selling watch. Health features save lives. Enthusiasts scoff: 'it's a computer, not a watch.' Outsells all of Switzerland.", tags: ["Smart", "Health"] },
  { name: "Victorinox", tier: "D", avgPrice: 400, sentiment: 0.5, country: "🇨🇭", note: "Swiss Army knife maker. I.N.O.X. is indestructible. 'Reliable, no-nonsense. Not exciting but never disappoints.'", tags: ["Swiss", "Tool"] },
  { name: "Mondaine", tier: "D", avgPrice: 300, sentiment: 0.5, country: "🇨🇭", note: "The Swiss railway clock on your wrist. Iconic design. 'Great gift watch, one-trick pony.'", tags: ["Swiss", "Design"] },
  { name: "Shinola", tier: "D", avgPrice: 650, sentiment: -0.1, country: "🇺🇸", note: "Detroit-assembled, Swiss movements. Runwell, Canfield. Community skeptical—'lifestyle brand masquerading as a watchmaker.'", tags: ["American", "Lifestyle"] },
  { name: "Certina", tier: "D", avgPrice: 600, sentiment: 0.6, country: "🇨🇭", note: "Swatch Group's hidden gem. DS Action diver is a bargain. Powermatic 80. 'The secret weapon at this price.'", tags: ["Swiss", "Value"] },
  { name: "Marathon", tier: "D", avgPrice: 700, sentiment: 0.6, country: "🇨🇦", note: "Military-issued to US/Canadian forces. GSAR, TSAR. Tritium for 25 yrs. Niche but very respected.", tags: ["Military", "Tool"] },

  // F Tier
  { name: "Hublot", tier: "F", avgPrice: 15000, sentiment: -0.6, country: "🇨🇭", note: "Big Bang made waves. 'The art of fusion' = fusing controversy with high prices. Reddit's punching bag. Some defend Big Bang Unico.", tags: ["Polarizing", "LVMH"] },
  { name: "Invicta", tier: "F", avgPrice: 100, sentiment: -0.8, country: "🇺🇸", note: "Absurd MSRPs, perpetual 'sales.' Gaudy oversized watches. Meme-tier. 'The joke that keeps on giving.'", tags: ["Meme", "Avoid"] },
  { name: "MVMT", tier: "F", avgPrice: 150, sentiment: -0.7, country: "🇺🇸", note: "Instagram-era DTC. Cheap quartz, nice package, massive markup. 'The watch for people who don't know watches.'", tags: ["Fashion", "DTC"] },
  { name: "Daniel Wellington", tier: "F", avgPrice: 150, sentiment: -0.9, country: "🇸🇪", note: "The OG influencer watch. $2 movement in a $150 case. Pure marketing. The watch community's villain origin story.", tags: ["Fashion", "Marketing"] },
  { name: "Vincero", tier: "F", avgPrice: 170, sentiment: -0.7, country: "🇺🇸", note: "Instagram-ad special. Nice in photos, disappointing in hand. You're paying for the ad. Reddit roasts these regularly.", tags: ["Fashion", "DTC"] },
  { name: "Fossil", tier: "F", avgPrice: 120, sentiment: -0.3, country: "🇺🇸", note: "Fashion watch giant. Makes watches for Armani, Diesel, MK. Fine as a gift, zero horological substance. 'It's fine for what it is.'", tags: ["Fashion", "Mall"] },
  { name: "Michael Kors", tier: "F", avgPrice: 200, sentiment: -0.5, country: "🇺🇸", note: "Fashion-first, watch-second. Quartz in fashion cases. Zero substance. Made by Fossil Group. 'Not a watch brand.'", tags: ["Fashion", "Lifestyle"] },
  { name: "Armani Exchange", tier: "F", avgPrice: 150, sentiment: -0.6, country: "🇮🇹", note: "Designer label on basic quartz. You're buying a logo. Made by Fossil Group. Community shrugs.", tags: ["Fashion", "Logo"] },
  { name: "Diesel", tier: "F", avgPrice: 180, sentiment: -0.5, country: "🇮🇹", note: "Oversized, loud, fashion-forward. Mr. Daddy 2.0 is comically huge. Not serious horology. Fossil Group.", tags: ["Fashion", "Bold"] },
  { name: "Nixon", tier: "F", avgPrice: 150, sentiment: -0.2, country: "🇺🇸", note: "Action sports and streetwear. Time Teller, Sentry. Decent design, no horological ambition. Community is mostly indifferent.", tags: ["Streetwear", "Action"] },
  { name: "Guess", tier: "F", avgPrice: 120, sentiment: -0.5, country: "🇺🇸", note: "Pure fashion play. Flashy, basic movements. Zero collector value. Not taken seriously by any watch community.", tags: ["Fashion", "Mall"] },
  { name: "Stuhrling", tier: "F", avgPrice: 100, sentiment: -0.8, country: "🇺🇸", note: "Amazon special. Claims luxury heritage, delivers bottom-shelf movements. Misleading marketing. 'Avoid at all costs.'", tags: ["Amazon", "Avoid"] },
  { name: "Movado", tier: "F", avgPrice: 500, sentiment: -0.3, country: "🇺🇸", note: "Museum dial is iconic design. But the brand rests on that one look. Overpriced inside. 'Style over substance, literally.'", tags: ["Design", "Overpriced"] },
  { name: "Skagen", tier: "F", avgPrice: 100, sentiment: -0.2, country: "🇩🇰", note: "Danish minimalism, Fossil-owned. Thin, light, affordable. Fine as an accessory. Harmless but unserious.", tags: ["Fashion", "Minimal"] },
];

const TIER_DESCRIPTIONS = {
  S: "Haute Horlogerie / Grail",
  A: "Prestige / Industry Elite",
  B: "Premium Enthusiast",
  C: "Solid Entry Luxury",
  D: "Accessible / Respected",
  F: "Fashion / Hype / Overpriced",
};

function getPriceCol(avgPrice) {
  for (let i = 0; i < PRICE_RANGES.length; i++) {
    if (avgPrice >= PRICE_RANGES[i].min && avgPrice < PRICE_RANGES[i].max) return i;
  }
  return PRICE_RANGES.length - 1;
}

function formatPrice(p) {
  if (p >= 1000000) return `$${(p / 1000000).toFixed(1)}M`;
  if (p >= 1000) return `$${(p / 1000).toFixed(0)}K`;
  return `$${p}`;
}

function SentimentBar({ sentiment, isSelected }) {
  const pct = ((sentiment + 1) / 2) * 100;
  const color = sentimentColor(sentiment);
  return (
    <div style={{
      width: "100%", height: 3, borderRadius: 2,
      background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 2,
    }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: 2,
        background: color, transition: "width 0.3s ease",
      }} />
    </div>
  );
}

function Chip({ name, tier, avgPrice, sentiment, country, onClick, isSelected }) {
  const colors = TIER_COLORS[tier];
  const sColor = sentimentColor(sentiment);
  const glowOpacity = isSelected ? 0.4 : 0;
  return (
    <button
      onClick={onClick}
      style={{
        background: isSelected ? colors.accent : "rgba(255,255,255,0.06)",
        color: isSelected ? "#0d0d1a" : colors.accent,
        border: `1px solid ${isSelected ? colors.accent : "rgba(255,255,255,0.12)"}`,
        borderRadius: "6px",
        padding: "5px 10px 4px",
        fontSize: "11px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
        lineHeight: 1.3,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        minWidth: 0,
        boxShadow: isSelected ? `0 0 12px ${colors.accent}40` : `inset 0 -3px 0 -1px ${sColor}30`,
        position: "relative",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "10px" }}>{country}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      </span>
      <span style={{ fontSize: "9px", opacity: 0.7, fontWeight: 400 }}>{formatPrice(avgPrice)} avg</span>
      <SentimentBar sentiment={sentiment} isSelected={isSelected} />
    </button>
  );
}

function DetailPanel({ watch, onClose }) {
  if (!watch) return null;
  const colors = TIER_COLORS[watch.tier];
  const sLabel = getSentimentLabel(watch.sentiment);
  const sColor = sentimentColor(watch.sentiment);
  const pct = ((watch.sentiment + 1) / 2) * 100;
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "linear-gradient(to top, #0d0d1a 80%, rgba(13,13,26,0.97))",
        borderTop: `2px solid ${colors.accent}`,
        padding: "20px 24px 28px",
        animation: "slideUp 0.25s ease-out",
      }}
    >
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{
                background: colors.accent, color: "#0d0d1a",
                fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18,
                width: 32, height: 32, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: 4, flexShrink: 0,
              }}>
                {watch.tier}
              </span>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, color: "#f0ece2", fontFamily: "'Playfair Display', serif", fontSize: 22 }}>
                  {watch.country} {watch.name}
                </h3>
                <span style={{ color: colors.accent, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  {formatPrice(watch.avgPrice)} average · {TIER_DESCRIPTIONS[watch.tier]}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#f0ece2",
            fontSize: 18, cursor: "pointer", borderRadius: 4, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12,
          }}>✕</button>
        </div>

        {/* Sentiment meter */}
        <div style={{ margin: "14px 0 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "rgba(240,236,226,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
              Community Sentiment
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: sColor, fontFamily: "'DM Sans', sans-serif" }}>
              {sLabel.emoji} {sLabel.label} ({watch.sentiment > 0 ? "+" : ""}{watch.sentiment.toFixed(2)})
            </span>
          </div>
          <div style={{
            width: "100%", height: 10, borderRadius: 5,
            background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: 5,
              background: "linear-gradient(90deg, #d44040 0%, #d4a040 50%, #40c070 100%)", opacity: 0.12,
            }} />
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 5,
              background: `linear-gradient(90deg, #d44040, ${sColor})`,
              transition: "width 0.4s ease",
            }} />
            <div style={{
              position: "absolute", left: "50%", top: 0, bottom: 0, width: 1,
              background: "rgba(255,255,255,0.2)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(240,236,226,0.3)" }}>💀 Despised</span>
            <span style={{ fontSize: 9, color: "rgba(240,236,226,0.3)" }}>Mixed 🤷</span>
            <span style={{ fontSize: 9, color: "rgba(240,236,226,0.3)" }}>Beloved 💚</span>
          </div>
        </div>

        <p style={{ color: "rgba(240,236,226,0.8)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6, margin: "10px 0" }}>
          {watch.note}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {watch.tags.map((t) => (
            <span key={t} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(240,236,226,0.6)", padding: "3px 10px", borderRadius: 20,
              fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentimentLegend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, color: "rgba(240,236,226,0.45)", whiteSpace: "nowrap" }}>Chip bar =</span>
      <div style={{
        display: "flex", height: 8, borderRadius: 4, overflow: "hidden", width: 72, flexShrink: 0,
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: "100%", background: sentimentColor(-1 + (i / 19) * 2) }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, fontSize: 9, color: "rgba(240,236,226,0.35)" }}>
        <span>💀 Hated</span>
        <span>→</span>
        <span>💚 Loved</span>
      </div>
    </div>
  );
}

export default function WatchTierList() {
  const [selected, setSelected] = useState(null);
  const [filterTier, setFilterTier] = useState(null);
  const [sortBySentiment, setSortBySentiment] = useState(false);
  const gridRef = useRef(null);

  const filtered = filterTier ? WATCHES.filter((w) => w.tier === filterTier) : WATCHES;

  const grid = {};
  TIERS.forEach((t) => {
    grid[t] = {};
    PRICE_RANGES.forEach((_, i) => { grid[t][i] = []; });
  });
  filtered.forEach((w) => {
    const col = getPriceCol(w.avgPrice);
    grid[w.tier][col].push(w);
  });
  if (sortBySentiment) {
    TIERS.forEach((t) => {
      PRICE_RANGES.forEach((_, i) => {
        grid[t][i].sort((a, b) => b.sentiment - a.sentiment);
      });
    });
  }

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f0ece2" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ padding: "24px 20px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, margin: 0,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #e6c068, #f0ece2)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            The Watch Tier List
          </h1>
          <span style={{ fontSize: 12, color: "rgba(240,236,226,0.4)" }}>2025 · Community + Industry</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(240,236,226,0.5)", margin: "6px 0 10px", maxWidth: 660, lineHeight: 1.5 }}>
          Three dimensions: <strong style={{ color: "rgba(240,236,226,0.75)" }}>Tier</strong> (rows) × <strong style={{ color: "rgba(240,236,226,0.75)" }}>Cost</strong> (columns) × <strong style={{ color: "rgba(240,236,226,0.75)" }}>Sentiment</strong> (colored bar on each chip). Tap any brand for the full breakdown.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <SentimentLegend />
          <button
            onClick={() => setSortBySentiment(!sortBySentiment)}
            style={{
              background: sortBySentiment ? "rgba(230,192,104,0.15)" : "rgba(255,255,255,0.03)",
              color: sortBySentiment ? "#e6c068" : "rgba(240,236,226,0.4)",
              border: `1px solid ${sortBySentiment ? "rgba(230,192,104,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}
          >
            {sortBySentiment ? "✓ " : ""}Sort by sentiment
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => setFilterTier(null)} style={{
            background: !filterTier ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
            color: !filterTier ? "#f0ece2" : "rgba(240,236,226,0.4)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
            padding: "4px 14px", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          }}>All ({WATCHES.length})</button>
          {TIERS.map((t) => (
            <button key={t} onClick={() => setFilterTier(filterTier === t ? null : t)} style={{
              background: filterTier === t ? TIER_COLORS[t].accent : "rgba(255,255,255,0.03)",
              color: filterTier === t ? "#0d0d1a" : TIER_COLORS[t].accent,
              border: `1px solid ${filterTier === t ? TIER_COLORS[t].accent : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}>{t} — {TIER_DESCRIPTIONS[t]}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 120px", maxWidth: 1100, margin: "0 auto", overflowX: "auto" }} ref={gridRef}>
        <div style={{ minWidth: 800 }}>
          <div style={{ display: "grid", gridTemplateColumns: "70px repeat(7, 1fr)", gap: 0, marginBottom: 2 }}>
            <div style={{ padding: "6px 4px" }}>
              <span style={{ fontSize: 9, color: "rgba(240,236,226,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Tier ↓ Cost →
              </span>
            </div>
            {PRICE_RANGES.map((pr, i) => (
              <div key={i} style={{ textAlign: "center", padding: "6px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 11, color: "rgba(240,236,226,0.5)", fontWeight: 600 }}>{pr.label}</span>
              </div>
            ))}
          </div>

          {TIERS.map((tier) => {
            const colors = TIER_COLORS[tier];
            const rowWatches = WATCHES.filter((w) => w.tier === tier);
            if (filterTier && filterTier !== tier) return null;
            return (
              <div key={tier} style={{
                display: "grid", gridTemplateColumns: "70px repeat(7, 1fr)", gap: 0,
                borderBottom: "1px solid rgba(255,255,255,0.04)", minHeight: 70,
              }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "10px 4px", borderRight: `2px solid ${colors.accent}40`,
                }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 26,
                    color: colors.label, lineHeight: 1,
                  }}>{tier}</span>
                  <span style={{ fontSize: 8, color: "rgba(240,236,226,0.3)", textAlign: "center", marginTop: 2, lineHeight: 1.2 }}>
                    {rowWatches.length} brands
                  </span>
                </div>

                {PRICE_RANGES.map((_, colIdx) => {
                  const cell = grid[tier][colIdx];
                  return (
                    <div key={colIdx} style={{
                      padding: "6px 4px", display: "flex", flexWrap: "wrap", gap: 4,
                      alignContent: "center", borderRight: "1px solid rgba(255,255,255,0.02)",
                      background: cell.length > 0 ? `${colors.accent}08` : "transparent",
                    }}>
                      {cell.map((w) => (
                        <Chip key={w.name} {...w}
                          isSelected={selected?.name === w.name}
                          onClick={() => setSelected(selected?.name === w.name ? null : w)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: "fixed", top: 8, right: 12,
        background: "rgba(13,13,26,0.9)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, padding: "8px 12px", backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <span style={{ fontSize: 9, color: "rgba(240,236,226,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {filtered.length} brands shown
        </span>
      </div>

      <DetailPanel watch={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
