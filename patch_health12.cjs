const fs = require('fs');

function fixAlpine(file) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/([ab])\.dataset\.([a-zA-Z]+)/g, '($1 as HTMLElement).dataset.$2');
    fs.writeFileSync(file, content);
}

fixAlpine('src/pages/collections/[tag].astro');

let tagAstro = fs.readFileSync('src/pages/collections/[tag].astro', 'utf-8');
tagAstro = tagAstro.replace('data-slug={product.slug}', 'data-slug={product.id}');
tagAstro = tagAstro.replace('slug: p.slug,', 'slug: p.id,');
fs.writeFileSync('src/pages/collections/[tag].astro', tagAstro);
