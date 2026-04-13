const fs = require('fs');

function patch(file, replacements) {
    let content = fs.readFileSync(file, 'utf-8');
    replacements.forEach(([search, replace]) => {
        content = content.replace(search, replace);
    });
    fs.writeFileSync(file, content);
}

patch('src/pages/checkout/razorpay.astro', [
    ['<CheckoutLayout>', '<CheckoutLayout title="Secure Checkout">']
]);

let layout = fs.readFileSync('src/layouts/CheckoutLayout.astro', 'utf-8');
layout = layout.replace('interface Props {', 'interface Props {\n  title?: string;');
fs.writeFileSync('src/layouts/CheckoutLayout.astro', layout);
