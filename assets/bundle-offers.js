/**
 * Bundle Offers Loader
 * Fetches and displays bundle offers for products in lists
 */

class BundleOffersLoader {
  constructor() {
    this.baseUrl = window.location.origin;
    this.loadedOffers = new Map();
  }

  /**
   * Collect all product IDs that need bundle offer data
   */
  collectProductIds() {
    const productIds = new Set();
    const elements = document.querySelectorAll('.product-card-bundle-offer[data-bundle-offer-product-id]');

    elements.forEach(el => {
      const productId = el.getAttribute('data-bundle-offer-product-id');
      if (productId && !this.loadedOffers.has(productId)) {
        productIds.add(productId);
      }
    });

    return Array.from(productIds);
  }

  /**
   * Fetch bundle offers for a list of product IDs
   */
  async fetchBundleOffers(productIds) {
    if (!productIds || productIds.length === 0) {
      return null;
    }

    const params = productIds.map(id => `product_ids=${id}`).join('&');
    const url = `${this.baseUrl}/api/v1/products/bundle-offers?${params}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch bundle offers:', response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bundle offers:', error);
      return null;
    }
  }

  /**
   * Display bundle offer on product card
   */
  displayBundleOffer(productId, bundleOffer) {
    const elements = document.querySelectorAll(
      `.product-card-bundle-offer[data-bundle-offer-product-id="${productId}"]`
    );

    elements.forEach(el => {
      if (bundleOffer && bundleOffer.name) {
        el.textContent = bundleOffer.name;
        el.classList.add('bundle-offer-product-tag');

        // Check if there's a badge sibling and adjust position
        const parent = el.parentElement;
        const badge = parent ? parent.querySelector('[class*="badge"]') : null;
        if (badge && badge !== el) {
          el.style.top = '45px';
        }

        this.loadedOffers.set(productId, bundleOffer);
      }
    });
  }

  /**
   * Load and display bundle offers for all products on the page
   */
  async loadBundleOffers() {
    const productIds = this.collectProductIds();

    if (productIds.length === 0) {
      return;
    }

    const bundleOffersData = await this.fetchBundleOffers(productIds);

    if (bundleOffersData && bundleOffersData.payload) {
      bundleOffersData.payload.forEach(bundleOffer => {
        if (bundleOffer.product_ids && bundleOffer.product_ids.length > 0) {
          // Each bundle offer can apply to multiple products
          bundleOffer.product_ids.forEach(productId => {
            this.displayBundleOffer(productId, bundleOffer);
          });
        }
      });
    }
  }

  /**
   * Initialize the loader
   */
  init() {
    // Load bundle offers when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadBundleOffers());
    } else {
      this.loadBundleOffers();
    }
  }

  /**
   * Reload bundle offers (useful after dynamic content updates)
   */
  reload() {
    this.loadBundleOffers();
  }
}

// Create global instance
window.bundleOffersLoader = new BundleOffersLoader();

// Auto-initialize
window.bundleOffersLoader.init();
