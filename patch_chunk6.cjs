const fs = require('fs');

// Patch Navbar.astro
let nav = fs.readFileSync('src/components/features/Navbar.astro', 'utf-8');
if (!nav.includes('const brandSettings = await getEntry("settings", "brand");')) {
    nav = nav.replace(
        'const taxonomy = await getEntry("settings", "taxonomy");',
        'const brandSettings = await getEntry("settings", "brand");\nconst taxonomy = await getEntry("settings", "taxonomy");\nconst brandName = brandSettings?.data?.name || "Brand";'
    );
}
nav = nav.replace(/<Logo \/>/g, '<Logo brandName={brandName} />');
nav = nav.replace(/<Logo variant="mark" \/>/g, '<Logo variant="mark" brandName={brandName} />');
nav = nav.replace(/<Logo variant="full" \/>/g, '<Logo variant="full" brandName={brandName} />');
fs.writeFileSync('src/components/features/Navbar.astro', nav);

// Patch Logo.astro
let logo = fs.readFileSync('src/components/primitives/Logo.astro', 'utf-8');
logo = logo.replace('import { getEntry } from "astro:content";\n', '');
logo = logo.replace('interface Props {\n', 'interface Props {\n  brandName: string;\n');
logo = logo.replace(
    'const { variant = "full", color = "black", class: className, ...rest } = Astro.props;\n\n// Fetch Title from Content Layer (Fail-fast is already in config.ts)\nconst site = await getEntry("settings", "brand");\nconst brandName = site?.data?.name || "Brand";\nconst brandMark = brandName.charAt(0).toUpperCase();',
    'const { brandName, variant = "full", color = "black", class: className, ...rest } = Astro.props;\n\nconst brandMark = brandName.charAt(0).toUpperCase();'
);
fs.writeFileSync('src/components/primitives/Logo.astro', logo);
