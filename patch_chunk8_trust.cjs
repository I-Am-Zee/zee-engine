const fs = require('fs');

// Patch index.astro
let index = fs.readFileSync('src/pages/index.astro', 'utf-8');
index = index.replace('const homeHeroEntry = await getEntry("pages_content", "home");', 'const homeHeroEntry = await getEntry("pages_content", "home");\nconst trustEntry = await getEntry("pages_content", "trust_section");\nconst trustData = trustEntry?.data || { main_heading: "Quality Assured", hero_image: "/images/identity/trust-hero.webp", markers: [] };');
index = index.replace('<TrustSection />', '<TrustSection main_heading={trustData.main_heading} hero_image={trustData.hero_image} markers={trustData.markers} />');
fs.writeFileSync('src/pages/index.astro', index);

// Patch TrustSection.astro
let trust = fs.readFileSync('src/components/ui/TrustSection.astro', 'utf-8');
trust = trust.replace('import { getEntry } from "astro:content";\n', '');
trust = trust.replace('// ── Smart Logic: Self-Fetching (Component Hub Strategy) ──\nconst trustEntry = await getEntry("pages_content", "trust_section");\nconst { \n  main_heading = "Quality Assured", \n  hero_image = "/images/identity/trust-hero.webp", \n  markers = [] \n} = trustEntry?.data || {};', '');
// the component already destructures `main_heading`, `hero_image`, `markers` via props but doesn't actually assign them, wait let me check the file
