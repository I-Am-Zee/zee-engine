const fs = require('fs');

// Patch EngineLayout.astro
let engine = fs.readFileSync('src/layouts/EngineLayout.astro', 'utf-8');
engine = engine.replace('interface Props {', 'interface Props {\n  pageTitle?: string;');
engine = engine.replace('const { title, description } = Astro.props;', 'const { pageTitle, title, description } = Astro.props;');
engine = engine.replace('<BaseLayout title={title} description={description}>', '<BaseLayout pageTitle={pageTitle} title={title} description={description}>');
fs.writeFileSync('src/layouts/EngineLayout.astro', engine);

// Patch BaseLayout.astro
let base = fs.readFileSync('src/layouts/BaseLayout.astro', 'utf-8');
base = base.replace('interface Props {', 'interface Props {\n  pageTitle?: string;');
base = base.replace(
  "const {\n  title = `${brandSettings?.data?.name || 'Zelia Vance'} | ${brandSettings?.data?.tagline || 'Luxury Jewelry'}`,\n  description = brandSettings?.data?.description,\n} = Astro.props;",
  "const {\n  pageTitle,\n  title,\n  description = brandSettings?.data?.description,\n} = Astro.props;\n\nconst brandName = brandSettings?.data?.name;\nconst fullTitle = pageTitle ? `${pageTitle} | ${brandName}` : (title || brandName);"
);
base = base.replace('<title>{title}</title>', '<title>{fullTitle}</title>');
fs.writeFileSync('src/layouts/BaseLayout.astro', base);
