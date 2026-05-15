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
    
    // Replace the repeated nav wrapper with just the component
    let newContent = content.replace(
      /<nav class="bg-surface border-b border-border-subtle py-3">\s*<div class="mx-auto max-w-7xl px-4 lg:px-8">\s*(<Breadcrumbs[\s\S]*?\/>)\s*<\/div>\s*<\/nav>/g,
      '$1'
    );
    
    // In case it used comments inside like {/* Full-Width Breadcrumbs Bar */}
    // We should also remove that comment if it's right before the nav, but let's just leave it or remove it.
    newContent = newContent.replace(/\{\/\*\s*Full-Width Breadcrumbs Bar\s*\*\/\}\s*(<Breadcrumbs)/g, '$1');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
