/**
 * Sorting Engine - Pure Engine Behavior
 * Handles DOM-based sorting for products and blog posts.
 * Data-attribute driven for maximum flexibility.
 */

export const gridSort = (defaultSort = 'latest') => ({
  sortBy: defaultSort as string,
  items: [] as HTMLElement[],
  
  init() {
    // We use $nextTick to ensure all children and refs are fully rendered
    // @ts-ignore
    this.$nextTick(() => {
      // @ts-ignore
      let grid = this.$refs.grid as HTMLElement;
      if (!grid) {
        // @ts-ignore
        grid = (this.$el as HTMLElement).querySelector('[x-ref="grid"]') as HTMLElement;
      }
      if (!grid) return;

      // Capture initial order as 'featured'
      this.items = Array.from(grid.children).map((el: any, index) => {
        el.dataset.index = index.toString();
        return el as HTMLElement;
      });

      // If default is not featured, run initial sort
      if (this.sortBy !== 'featured') {
        this.sort();
      }
    });
  },

  sort() {
    // @ts-ignore
    const grid = this.$refs.grid as HTMLElement;
    if (!grid) return;
    
    const sorted = [...this.items].sort((a: HTMLElement, b: HTMLElement) => {
      switch (this.sortBy) {
        case 'featured':
          return parseInt(a.dataset.index || '0') - parseInt(b.dataset.index || '0');
        
        case 'latest':
          return new Date(b.dataset.date || 0).getTime() - new Date(a.dataset.date || 0).getTime();
        
        case 'oldest':
          return new Date(a.dataset.date || 0).getTime() - new Date(b.dataset.date || 0).getTime();
        
        case 'price-asc':
          return parseFloat(a.dataset.price || '0') - parseFloat(b.dataset.price || '0');
        
        case 'price-desc':
          return parseFloat(b.dataset.price || '0') - parseFloat(a.dataset.price || '0');
        
        case 'name-asc':
          return (a.dataset.name || '').localeCompare(b.dataset.name || '');
        
        case 'name-desc':
          return (b.dataset.name || '').localeCompare(a.dataset.name || '');
        
        case 'rating-desc':
          return parseFloat(b.dataset.rating || '0') - parseFloat(a.dataset.rating || '0');
        
        case 'on-sale':
          const aSale = a.dataset.onSale === 'true' ? 1 : 0;
          const bSale = b.dataset.onSale === 'true' ? 1 : 0;
          return bSale - aSale;

        default:
          return 0;
      }
    });

    // Efficiently re-append elements (faster than innerHTML = '')
    sorted.forEach(el => grid.appendChild(el));
  }
});
