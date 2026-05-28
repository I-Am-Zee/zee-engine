const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src/content', function(filePath) {
  if (filePath.endsWith('.md') || filePath.endsWith('.mdx') || filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Normalize path separators to forward slash for reliable matching
    let normalizedPath = filePath.replace(/\\/g, '/');

    if (normalizedPath.includes('/products/')) {
      content = content.replace(/^image:\s/m, 'featured: ');
    }
    if (normalizedPath.includes('/lookbooks/')) {
      content = content.replace(/^hero_image:\s/m, 'hero: ');
    }
    if (normalizedPath.includes('/blog/')) {
      content = content.replace(/^image:\s/m, 'cover: ');
    }
    if (normalizedPath.includes('/brand/') || normalizedPath.includes('/pages_content/')) {
      content = content.replace(/^hero_image:\s/m, 'hero: ');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});