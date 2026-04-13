const fs = require('fs');

// Patch Footer.astro
let footer = fs.readFileSync('src/components/features/Footer.astro', 'utf-8');
footer = footer.replace(/<SocialLinks \/>/g, '<SocialLinks social={siteSettings?.data?.social || []} />');
fs.writeFileSync('src/components/features/Footer.astro', footer);

// Patch SocialLinks.astro
let social = fs.readFileSync('src/components/ui/SocialLinks.astro', 'utf-8');
social = social.replace('import { getEntry } from "astro:content";\n', '');
social = social.replace('interface Props {\n', 'interface Props {\n  social?: any[];\n');
social = social.replace(
  'const { orientation = "horizontal", class: className, ...rest } = Astro.props;\n\n// Fetch Title from Content Layer\nconst site = await getEntry("settings", "brand");\nconst social = site?.data?.social || [];',
  'const { social = [], orientation = "horizontal", class: className, ...rest } = Astro.props;'
);
fs.writeFileSync('src/components/ui/SocialLinks.astro', social);
