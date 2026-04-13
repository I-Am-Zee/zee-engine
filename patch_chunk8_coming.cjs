const fs = require('fs');

// Patch ComingSoon.astro
let soon = fs.readFileSync('src/components/ui/ComingSoon.astro', 'utf-8');
soon = soon.replace('import { getEntry } from "astro:content";\n', '');
soon = soon.replace('interface Props {\n  categoryName: string;\n  class?: string;\n}', 'interface Props {\n  categoryName: string;\n  heading?: string;\n  description?: string;\n  cta_primary_label?: string;\n  cta_primary_link?: string;\n  cta_secondary_label?: string;\n  cta_secondary_link?: string;\n  class?: string;\n}');

soon = soon.replace('const { categoryName, class: className, ...rest } = Astro.props;\n\nconst uiEntry = await getEntry("component_hub", "coming_soon");\nconst { \n  heading = `Our {category} is on the way`, \n  description = "We’re putting the final polish on some exquisite new pieces. They’re worth the wait—stay tuned for the drop.",\n  cta_primary_label = "Continue Exploring Shop",\n  cta_primary_link = "/shop",\n  cta_secondary_label = "Get Notified of Drops",\n  cta_secondary_link = "/newsletter/confirm"\n} = uiEntry?.data || {};',
`const {
  categoryName,
  heading = \`Our {category} is on the way\`,
  description = "New items will be available shortly.",
  cta_primary_label = "Continue Exploring Shop",
  cta_primary_link = "/shop",
  cta_secondary_label = "Get Notified of Drops",
  cta_secondary_link = "/newsletter/confirm",
  class: className,
  ...rest
} = Astro.props;`);

fs.writeFileSync('src/components/ui/ComingSoon.astro', soon);
