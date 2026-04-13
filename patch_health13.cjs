const fs = require('fs');

function patch(file, replacements) {
    let content = fs.readFileSync(file, 'utf-8');
    replacements.forEach(([search, replace]) => {
        content = content.replace(search, replace);
    });
    fs.writeFileSync(file, content);
}

patch('src/pages/search.astro', [
    ['if (!window.Alpine) return;', 'if (!(window as any).Alpine) return;']
]);

function fixAlpine2(file) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/([ab])\.dataset\.([a-zA-Z]+)/g, '($1 as HTMLElement).dataset.$2');
    fs.writeFileSync(file, content);
}

fixAlpine2('src/pages/collections/[tag].astro');
