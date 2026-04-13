const fs = require('fs');

function patch(file, replacements) {
    let content = fs.readFileSync(file, 'utf-8');
    replacements.forEach(([search, replace]) => {
        content = content.replace(search, replace);
    });
    fs.writeFileSync(file, content);
}

patch('src/scripts/snipcart-init.ts', [
    ["const countryInput = document.querySelector('select[name=\"country\"], .snipcart-typeahead__input') as HTMLSelectElement;", "const countryInput = document.querySelector('select[name=\"country\"], .snipcart-typeahead__input') as unknown as HTMLSelectElement;"],
    ["const countryElement = document.querySelector('select[name=\"country\"], .snipcart-typeahead__input') as HTMLSelectElement;", "const countryElement = document.querySelector('select[name=\"country\"], .snipcart-typeahead__input') as unknown as HTMLSelectElement;"]
]);

function fixAlpine(file) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/window\.Alpine/g, '(window as any).Alpine');
    content = content.replace(/sort\(criteria\)/g, 'sort(criteria: string)');
    content = content.replace(/([ab])\?\.dataset\?\.([a-zA-Z]+)/g, '($1 as HTMLElement).dataset.$2');
    fs.writeFileSync(file, content);
}

fixAlpine('src/pages/collections/[tag].astro');
fixAlpine('src/pages/shop/[category].astro');
fixAlpine('src/pages/shop/[...page].astro');

// I am reverting to the earlier fixes which seemingly got lost.
