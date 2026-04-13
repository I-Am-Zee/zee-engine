const fs = require('fs');

let footer = fs.readFileSync('src/components/features/Footer.astro', 'utf-8');
footer = footer.replace(/<Logo \/>/g, '<Logo brandName={brandName} />');
footer = footer.replace(/<Logo variant="mark" \/>/g, '<Logo variant="mark" brandName={brandName} />');
footer = footer.replace(/<Logo variant="full" \/>/g, '<Logo variant="full" brandName={brandName} />');
// Note: Footer has class overrides on Logo, e.g., <Logo class="text-4xl... />
// We need a regex
footer = footer.replace(/<Logo([^>]*)\/>/g, '<Logo brandName={brandName}$1/>');
fs.writeFileSync('src/components/features/Footer.astro', footer);
