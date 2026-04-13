const fs = require('fs');

let footer = fs.readFileSync('src/components/features/Footer.astro', 'utf-8');
footer = footer.replace(/<SocialLinks orientation="horizontal" \/>/g, '<SocialLinks orientation="horizontal" social={siteSettings?.data?.social || []} />');
fs.writeFileSync('src/components/features/Footer.astro', footer);
