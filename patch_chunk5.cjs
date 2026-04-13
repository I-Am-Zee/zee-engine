const fs = require('fs');

// Patch BaseLayout.astro
let base = fs.readFileSync('src/layouts/BaseLayout.astro', 'utf-8');
base = base.replace(
  'const marketingSettings = await getEntry("settings", "marketing");',
  'const marketingSettings = await getEntry("settings", "marketing");\nconst shippingSettings = await getEntry("settings", "shipping");\nconst threshold = shippingSettings?.data?.free_shipping_threshold || 3000;'
);
base = base.replace('<AnnouncementBar data={announcement_bar} />', '<AnnouncementBar data={announcement_bar} threshold={threshold} />');
base = base.replace('<SideDrawer />', '<SideDrawer threshold={threshold} />');
fs.writeFileSync('src/layouts/BaseLayout.astro', base);

// Patch AnnouncementBar.astro
let ann = fs.readFileSync('src/components/ui/AnnouncementBar.astro', 'utf-8');
// remove getEntry import and calls
ann = ann.replace('import { getEntry } from "astro:content";\n', '');
ann = ann.replace('const marketingSettings = await getEntry("settings", "marketing");\n', '');
ann = ann.replace('const shippingSettings = await getEntry("settings", "shipping");\n', '');
ann = ann.replace('const threshold = shippingSettings?.data?.free_shipping_threshold || 3000;\n', '');
ann = ann.replace('const announcement = marketingSettings?.data?.announcement_bar;\n', '');
// add Props interface
const propInterface = `interface Props {
  data: any;
  threshold: number;
}
const { data: announcement, threshold } = Astro.props;
`;
ann = ann.replace('import Text from "../primitives/Text.astro";', 'import Text from "../primitives/Text.astro";\n\n' + propInterface);
fs.writeFileSync('src/components/ui/AnnouncementBar.astro', ann);

// Patch SideDrawer.astro
let side = fs.readFileSync('src/components/ui/SideDrawer.astro', 'utf-8');
side = side.replace('import { getEntry } from "astro:content";\n', '');
side = side.replace('// Get Shipping Settings\nconst settings = await getEntry("settings", "shipping");\nconst threshold = settings?.data?.free_shipping_threshold || 3000;\n', `interface Props {
  threshold: number;
}
const { threshold } = Astro.props;
`);
fs.writeFileSync('src/components/ui/SideDrawer.astro', side);
