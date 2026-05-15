const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/pages', (filePath) => {
  if (filePath.endsWith('.astro')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // The current pattern in pages is:
    // <nav class="bg-(--color-surface) border-b border-(--color-border-subtle) py-3">
    //   <div class="mx-auto max-w-7xl px-4 lg:px-8">
    //     <Breadcrumbs items={...} />
    //   </div>
    // </nav>

    // Regex to capture the Breadcrumbs tag and remove the surrounding nav/div
    const navRegex = /<nav class="bg-\(--color-surface\) border-b border-\(--color-border-subtle\) py-3">\s*<div class="mx-auto max-w-7xl px-4 lg:px-8">\s*(<Breadcrumbs[\s\S]*?\/>)\s*<\/div>\s*<\/nav>/g;
    content = content.replace(navRegex, '$1');

    // Also handle commented versions
    const commentNavRegex = /\{\/\*\s*Full-Width Breadcrumbs Bar\s*\*\/\}\s*(<Breadcrumbs[\s\S]*?\/>)/g;
    content = content.replace(commentNavRegex, '$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
