import { newsletterConfirm, newsletterWidget } from './newsletter';
import type { Alpine } from 'alpinejs';
import collapse from '@alpinejs/collapse';
import { wishlistStore } from './wishlist';
import { regionStore } from './region';
import { popupBehavior } from './popup';
import { sideDrawer } from './side-drawer';
import { carousel } from './carousel';

import { blogDiscovery } from './blog-discovery';

export default (Alpine: Alpine) => {
  // Register plugins
  Alpine.plugin(collapse);
  
  // Register the wishlist & region stores
  Alpine.store('wishlist', wishlistStore);
  Alpine.store('region', regionStore);

  // Register components
  Alpine.data('popupBehavior', popupBehavior as any);
  Alpine.data('sideDrawer', sideDrawer as any);
  Alpine.data('carousel', carousel as any);
  Alpine.data('newsletterConfirm', newsletterConfirm as any);
  Alpine.data('newsletterWidget', newsletterWidget as any);
  Alpine.data('blogDiscovery', blogDiscovery as any);
};
