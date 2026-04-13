const fs = require('fs');
let trust = fs.readFileSync('src/components/ui/TrustSection.astro', 'utf-8');
trust = trust.replace('import { getEntry } from "astro:content";\n', '');
trust = trust.replace('const { class: className, ...rest } = Astro.props;\n\n// ── Smart Logic: Self-Fetching (Component Hub Strategy) ──\nconst trustEntry = await getEntry("pages_content", "trust_section");\nconst { \n  main_heading = "Quality Assured", \n  hero_image = "/images/identity/trust-hero.webp", \n  markers = [] \n} = trustEntry?.data || {};', 'const { main_heading = "Quality Assured", hero_image = "/images/identity/trust-hero.webp", markers = [], class: className, ...rest } = Astro.props;');
fs.writeFileSync('src/components/ui/TrustSection.astro', trust);
