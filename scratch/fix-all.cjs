const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles() {
  walkDir('./src', (filePath) => {
    if (filePath.endsWith('.astro') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      // 1. Fix Breadcrumb Wrappers in pages
      if (filePath.includes('/pages/')) {
        content = content.replace(
          /<nav class="bg-surface border-b border-border-subtle py-3">\s*<div class="mx-auto max-w-7xl px-4 lg:px-8">\s*(<Breadcrumbs[\s\S]*?\/>)\s*<\/div>\s*<\/nav>/g,
          '$1'
        );
        content = content.replace(/\{\/\*\s*Full-Width Breadcrumbs Bar\s*\*\/\}\s*(<Breadcrumbs)/g, '$1');
      }

      // 2. Fix Tailwind v4 Colors (bg-surface to bg-(--color-surface) etc.)
      content = content
        .replace(/bg-surface(?!\-(muted|alt))/g, 'bg-(--color-surface)')
        .replace(/bg-surface-muted/g, 'bg-(--color-surface-muted)')
        .replace(/bg-background/g, 'bg-(--color-background)')
        .replace(/border-border-subtle/g, 'border-(--color-border-subtle)')
        .replace(/border-border-strong/g, 'border-(--color-border-strong)')
        .replace(/text-text-muted/g, 'text-(--color-text-muted)')
        .replace(/text-text-main/g, 'text-(--color-text-main)')
        .replace(/text-text-inverse/g, 'text-(--color-text-inverse)')
        .replace(/text-primary(?!\-)/g, 'text-(--color-primary)')
        .replace(/text-accent-brass/g, 'text-(--color-accent-brass)')
        .replace(/text-accent-coral/g, 'text-(--color-accent-coral)')
        .replace(/text-accent-emerald/g, 'text-(--color-accent-emerald)')
        .replace(/bg-primary(?!\-)/g, 'bg-(--color-primary)')
        .replace(/bg-accent-brass/g, 'bg-(--color-accent-brass)')
        .replace(/bg-accent-coral/g, 'bg-(--color-accent-coral)')
        .replace(/bg-accent-emerald/g, 'bg-(--color-accent-emerald)')
        .replace(/border-primary/g, 'border-(--color-primary)')
        .replace(/border-accent-brass/g, 'border-(--color-accent-brass)')
        .replace(/border-accent-coral/g, 'border-(--color-accent-coral)')
        .replace(/border-accent-emerald/g, 'border-(--color-accent-emerald)')
        ;

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
      }
    }
  });
}

processFiles();
