const fs = require('fs');

function patchPage(file) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('const comingSoonEntry')) {
    // Inject fetch logic after layout import
    content = content.replace(
      'import ComingSoon from "../../components/ui/ComingSoon.astro";',
      'import ComingSoon from "../../components/ui/ComingSoon.astro";\nconst comingSoonEntry = await getEntry("component_hub", "coming_soon");\nconst comingSoonData = comingSoonEntry?.data || {};'
    );

    // Inject props into component usage
    content = content.replace(
      /<ComingSoon categoryName=\{([^\}]+)\} \/>/g,
      '<ComingSoon categoryName={$1} {...comingSoonData} />'
    );

    fs.writeFileSync(file, content);
  }
}

patchPage('src/pages/shop/[category].astro');
patchPage('src/pages/collections/[tag].astro');
