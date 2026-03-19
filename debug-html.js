fetch('https://69bbc2cd6039b5716e7a50f7--zaviona-dev.netlify.app/products/celestial-diamond-ring').then(async r=>{
const HTML=await r.text();
const match = HTML.match(/snipcart-add-item[\s\S]*?data-item-id="celestial-diamond-ring"[\s\S]*?>/);
console.log('Match found:', !!match);
if(match) console.log(match[0]);
}).catch(console.error);
