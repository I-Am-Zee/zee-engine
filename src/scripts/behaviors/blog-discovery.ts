/**
 * blog-discovery.ts - Feature Behavior
 * 
 * A unified discovery engine for the blog, combining
 * category filtering and grid sorting.
 */
import { gridSort } from "./sorting";

export const blogDiscovery = (initialSort = 'latest') => ({
  ...gridSort(initialSort), // Inherit base sorting logic
  
  selectedCategories: [],
  filteredCount: 0,

  init() {
    // Run the inherited sorting init
    // @ts-ignore
    this.gridSortInit(); 
    
    // Watch for category changes to update the count
    // @ts-ignore
    this.$watch('selectedCategories', () => this.updateFilteredCount());
    this.updateFilteredCount();
  },

  // Overwrite the sorting init to capture initial state correctly
  gridSortInit() {
    // @ts-ignore
    this.$nextTick(() => {
      let grid = this.$refs.grid as HTMLElement;
      if (!grid) return;

      this.items = Array.from(grid.children).map((el: any, index) => {
        el.dataset.index = index.toString();
        return el;
      });

      if (this.sortBy !== 'featured') {
        this.sort();
      }
    });
  },

  updateFilteredCount() {
    // @ts-ignore
    const grid = this.$refs.grid;
    if (!grid) return;
    
    const items = Array.from(grid.querySelectorAll('.blog-item')) as HTMLElement[];
    this.filteredCount = items.filter(el => {
      if (this.selectedCategories.length === 0) return true;
      
      const category = el.dataset.category || '';
      // @ts-ignore
      if (this.selectedCategories.includes(category)) return true;
      
      const tags = JSON.parse(el.dataset.tags || '[]');
      // @ts-ignore
      return this.selectedCategories.some(cat => tags.includes(cat));
    }).length;
  },

  toggleCategory(cat: string) {
    // @ts-ignore
    if (this.selectedCategories.includes(cat)) {
      // @ts-ignore
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
    } else {
      // @ts-ignore
      this.selectedCategories.push(cat);
    }
  },

  isActive(cat: string) {
    // @ts-ignore
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
    // @ts-ignore
    if (this.selectedCategories.includes(category)) return true;
    
    const tags = JSON.parse(tagsJson || '[]');
    // @ts-ignore
    return this.selectedCategories.some(cat => tags.includes(cat));
  }
});
