/**
 * SideDrawer Behavior
 *
 * Handles state and logic for:
 * 1. Post-purchase Upsells
 * 2. Single-item Quick Shop
 * 3. Multi-item Lookbook Bundles (Master Set)
 */

declare const Snipcart: any;
import { getSnipcartJSItem } from "../../config/ecommerce";

export const sideDrawer = () => ({
  isOpen: false,
  isSubmitting: false,
  mode: "upsell", // upsell, quick-shop, master-set
  validationError: "",
  mainItem: null as any, // For upsell mode
  products: [] as any[], // Related or selected products
  selectedItems: [] as string[], // IDs of checked items
  selections: {} as Record<string, Record<string, string>>, // ItemID -> { VariantName -> Value }

  init() {
    // Listen for all entry points
    document.addEventListener("zeliavance:item-added", (e: any) => this.openUpsell(e.detail));
    document.addEventListener("zeliavance:quick-shop", (e: any) => this.openQuickShop(e.detail));
    document.addEventListener("zeliavance:master-set", (e: any) => this.openMasterSet(e.detail));
  },

  openUpsell(item: any) {
    console.log("[SideDrawer] Mode: Upsell", item);
    this.mode = "upsell";
    this.mainItem = item;
    this.products = (window as any).ZELIA_UPSELL_CONTEXT || [];
    this.resetInternalState();
    this.isOpen = true;
  },

  openQuickShop(product: any) {
    console.log("[SideDrawer] Mode: Quick Shop", product);
    this.mode = "quick-shop";
    this.mainItem = null;
    this.products = [product];
    this.resetInternalState();
    this.selectedItems = [product.id];
    this.isOpen = true;
  },

  openMasterSet(bundle: any) {
    console.log("[SideDrawer] Mode: Master Set", bundle);
    this.mode = "master-set";
    this.mainItem = null;
    this.products = bundle.products;
    this.resetInternalState();
    this.selectedItems = this.products.map((p) => p.id);
    this.isOpen = true;
  },

  resetInternalState() {
    this.selections = {};
    this.validationError = "";
    this.isSubmitting = false;
    this.products.forEach((p) => {
      this.selections[p.id] = {};
      // Selections remain empty to force intentional user input
    });
  },

  close() {
    this.isOpen = false;
  },

  get headerTitle() {
    if (this.mode === "upsell") return "Added to Cart!";
    if (this.mode === "quick-shop") return "Quick Shop";
    return "Complete the Look";
  },

  get subHeading() {
    if (this.mode === "upsell") return "Style it With";
    if (this.mode === "quick-shop") return "Select Your Style";
    return "The Editorial Ensemble";
  },

  get submitButtonText() {
    if (this.mode === "upsell")
      return "Add Selected to Cart (₹" + this.totalPrice.toLocaleString("en-IN") + ")";
    if (this.mode === "quick-shop") return "Add to Cart";
    return "Acquire Complete Look (₹" + this.totalPrice.toLocaleString("en-IN") + ")";
  },

  get totalPrice() {
    const activeProducts =
      this.mode !== "quick-shop"
        ? this.products.filter((p) => this.selectedItems.includes(p.id))
        : this.products;

    return activeProducts.reduce((sum, p) => sum + (Number(p.salePrice) || Number(p.price)), 0);
  },

  selectOption(itemId: string, variantName: string, val: string) {
    if (!this.selections[itemId]) this.selections[itemId] = {};
    this.selections[itemId][variantName] = val;
    this.validationError = "";
  },

  async submit() {
    const itemsToAdd = this.products.filter(
      (p) => this.mode === "quick-shop" || this.selectedItems.includes(p.id)
    );

    if (itemsToAdd.length === 0) return;

    let missingSelection: any = null;
    for (const item of itemsToAdd) {
      const variants = [item.variant_1, item.variant_2, item.variant_3].filter((v) => v?.values);
      const missing = variants.find((v) => !this.selections[item.id]?.[v.name]);
      if (missing) {
        missingSelection = { item, variant: missing };
        break;
      }
    }

    if (missingSelection) {
      if (this.mode === "master-set") {
        this.validationError = `Please select a ${missingSelection.variant.name} for "${missingSelection.item.title}" to acquire the complete set.`;
      } else {
        this.validationError = `Please select a ${missingSelection.variant.name} for "${missingSelection.item.title}", or uncheck it to proceed.`;
      }
      return;
    }

    this.isSubmitting = true;

    try {
      const payload = itemsToAdd.map((item) => {
        return getSnipcartJSItem(item, this.selections[item.id]);
      });

      for (const item of payload) {
        await Snipcart.api.cart.items.add(item);
        if (this.mode === "quick-shop" || this.mode === "master-set") {
          document.dispatchEvent(new CustomEvent("zeliavance:show-toast", { detail: item }));
        }
      }

      this.close();
    } catch (e) {
      console.error(e);
      this.validationError = "Addition failed. Please check connection.";
    } finally {
      this.isSubmitting = false;
    }
  },
});
