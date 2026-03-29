const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.astro') || filePath.endsWith('.md') || filePath.endsWith('.ts') || filePath.endsWith('.yml') || filePath.endsWith('.json')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Zaviona') || content.includes('zaviona')) {     
        let newContent = content.replace(/Zaviona/g, 'Zelia Vance');
        // Handle lower case zaviona for emails, urls, etc.
        newContent = newContent.replace(/zaviona/g, 'zeliavance');
        
        fs.writeFileSync(filePath, newContent);
        console.log('Updated', filePath);
    }
  }
});
