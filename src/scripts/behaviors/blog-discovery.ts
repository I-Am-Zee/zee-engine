/**
 * blog-discovery.ts - Feature Behavior
 * 
 * A unified discovery engine for the blog, combining
 * category filtering and grid sorting.
 */
import { gridSort } from "./sorting";

export const blogDiscovery = (initialSort = 'latest') => ({
  ...gridSort(initialSort), // Inherit base sorting logic
  
  selectedCategories: [] as string[],
  filteredCount: 0,

  init() {
    // Run the inherited sorting init
    // @ts-ignore
    this.gridSortInit(); 
    
    // Watch for category changes to update the count
    // @ts-ignore
    this.$watch('selectedCategories', () => this.updateFilteredCount());
    
    // @ts-ignore
    this.$nextTick(() => {
      this.updateFilteredCount();
    });
  },

  // Overwrite the sorting init to capture initial state correctly
  gridSortInit() {
    // @ts-ignore
    this.$nextTick(() => {
      // @ts-ignore
      let grid = this.$refs.grid as HTMLElement;
      if (!grid) return;

      this.items = Array.from(grid.children).map((el: any, index) => {
        el.dataset.index = index.toString();
        return el as HTMLElement;
      });

      if (this.sortBy !== 'featured') {
        this.sort();
      }
    });
  },

  updateFilteredCount() {
    // @ts-ignore
    const grid = this.$refs.grid as HTMLElement;
    if (!grid) return;
    
    const items = Array.from(grid.querySelectorAll('.blog-item')) as HTMLElement[];
    this.filteredCount = items.filter(el => {
      if (this.selectedCategories.length === 0) return true;
      
      const category = el.dataset.category || '';
      if (this.selectedCategories.includes(category)) return true;
      
      const tags = JSON.parse(el.dataset.tags || '[]');
      return this.selectedCategories.some(cat => tags.includes(cat));
    }).length;
  },

  toggleCategory(cat: string) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
    } else {
      this.selectedCategories.push(cat);
    }
  },

  isActive(cat: string) {
    return this.selectedCategories.includes(cat);
  },

  clearFilters() {
    this.selectedCategories = [];
  },

  isAllSelected() {
    return this.selectedCategories.length === 0;
  },

  shouldShow(tagsJson: string, category: string) {
    if (this.selectedCategories.length === 0) return true;
    
    // Check both category and tags for maximum flexibility
    if (this.selectedCategories.includes(category)) return true;
    
    const tags = JSON.parse(tagsJson || '[]');
    return this.selectedCategories.some(cat => tags.includes(cat));
  }
});
