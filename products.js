// Product database for Showlovein
const PRODUCTS = [
  {
    id: "p1",
    title: "0.07mm 3D 4D 5D Clover Lashes Crisscross Custom Logo Auto Fan Brazilian Volume Lash Extensions",
    short: "Clover Lashes 0.07mm Brazilian Volume",
    price: 2.49,
    price_max: 3.99,
    image: "images/p1.jpg",
    category: "Eyelash Extensions",
    description: "Korean PBT Fiber Material: Made from high-quality Korean PBT fiber, ensuring durability and a natural look for extended wear. Auto-fanning crisscross design saves application time. Available in multiple curls and lengths. Perfect for professional lash artists creating Brazilian volume sets.",
    features: ["Korean PBT Fiber", "Auto-Fanning Design", "Custom Logo Available", "8-15mm Length", "C/CC/D/DD Curls"],
    variants: {
      Curl: ["C", "CC", "D", "DD"],
      Length: ["8mm", "10mm", "12mm", "14mm", "Mix 8-15mm"]
    }
  },
  {
    id: "p2",
    title: "Cashmere Matte Dark Volume Lashes Extension Tray Soft Fluffy Vegan",
    short: "Cashmere Matte Volume Lashes",
    price: 1.59,
    price_max: 2.29,
    image: "images/p2.jpg",
    category: "Eyelash Extensions",
    description: "Cashmere matte dark volume lashes with soft fluffy texture. 100% vegan and cruelty-free. Available in 0.03/0.05/0.07mm thickness with all popular curls (J, B, C, CC, D, DD, L). Ultra-soft and lightweight for comfortable extended wear.",
    features: ["Vegan & Cruelty-Free", "Matte Dark Finish", "Ultra Soft", "Multiple Thicknesses"],
    variants: {
      Thickness: ["0.03mm", "0.05mm", "0.07mm"],
      Curl: ["J", "B", "C", "CC", "D", "DD", "L"]
    }
  },
  {
    id: "p3",
    title: "Most Popular Lash Extensions Cashmere 0.03 0.05mm Individual Volume Korean Silk",
    short: "Korean Silk Individual Volume Lashes",
    price: 1.59,
    price_max: 2.29,
    image: "images/p3.jpg",
    category: "Eyelash Extensions",
    description: "Our best-selling Korean Silk individual volume lashes. Premium cashmere material in 0.03 and 0.05mm thickness. Private label service available with custom packaging.",
    features: ["Korean Silk Material", "Private Label Available", "Best Seller", "0.03/0.05mm"],
    variants: {
      Thickness: ["0.03mm", "0.05mm"],
      Curl: ["C", "CC", "D", "DD"]
    }
  },
  {
    id: "p4",
    title: "Luxury Eyelash Shampoo Kit for Sensitive Eyes Vegan Foam Cleanser",
    short: "Luxury Eyelash Shampoo Kit",
    price: 2.39,
    price_max: 3.99,
    image: "images/p4.jpg",
    category: "Lash Care",
    description: "Complete luxury eyelash shampoo kit including foam cleanser, brush, and applicator. Specifically formulated for sensitive eyes. 100% vegan, cruelty-free, oil-free formula that maintains lash extension retention.",
    features: ["Sensitive Eye Formula", "Oil-Free", "Includes Brush & Applicator", "Vegan"],
    variants: {
      Volume: ["50ml", "100ml", "250ml"],
      Color: ["Pink", "White", "Black", "Nude"]
    }
  },
  {
    id: "p5",
    title: "Cashmere Lash Extensions Silk Wholesale Mega Volume 0.03 0.05mm Trays",
    short: "Wholesale Mega Volume Lash Trays",
    price: 1.59,
    price_max: 2.29,
    image: "images/p5.jpg",
    category: "Eyelash Extensions",
    description: "Wholesale mega volume lash trays for salons and distributors. Premium cashmere silk material. MOQ-friendly pricing for bulk orders. Multiple curl and length options available.",
    features: ["Wholesale Pricing", "Mega Volume", "Salon Grade", "Bulk Orders Welcome"],
    variants: {
      Thickness: ["0.03mm", "0.05mm"],
      Curl: ["C", "CC", "D", "DD"]
    }
  },
  {
    id: "p6",
    title: "Stock 0.05mm 6D 7D 8D Pre Made Fans Lashes Extension 10D 12D Premade Volume Fans",
    short: "Premade Volume Fans 6D-12D",
    price: 1.89,
    price_max: 2.69,
    image: "images/p6.jpg",
    category: "Premade Fans",
    description: "Pre-made volume fans available in 6D, 7D, 8D, 10D, and 12D options. Short stem and long stem variations. Pointy base for easy and secure application. Stock availability for fast shipping.",
    features: ["6D-12D Options", "Short/Long Stem", "Pointy Base", "In Stock"],
    variants: {
      Density: ["6D", "7D", "8D", "10D", "12D"],
      Stem: ["Short Stem", "Long Stem"]
    }
  },
  {
    id: "p7",
    title: "Professional 5W White Black UV Glue Lamp for Lash Extensions LED Light Beauty Salon",
    short: "Professional UV Glue LED Lamp 5W",
    price: 35.00,
    price_max: 69.00,
    image: "images/p7.jpg",
    category: "Lash Tools",
    description: "Professional 5W UV/LED glue curing lamp for lash extension salons. Instantly cures lash adhesive in 1-3 seconds. Available in white and black. Perfect for high-volume salons and improving retention rates.",
    features: ["5W LED/UV", "1-3 Sec Cure Time", "Salon Grade", "White/Black Color"],
    variants: {
      Color: ["White", "Black"],
      Power: ["5W", "10W"]
    }
  },
  {
    id: "p8",
    title: "Pink White Diamond Bottle 5g 10g Eyelash Glue Remover Fast Safe Jelly Gel Cream",
    short: "Diamond Bottle Glue Remover",
    price: 0.89,
    price_max: 1.49,
    image: "images/p8.jpg",
    category: "Lash Care",
    description: "Premium jelly gel cream eyelash glue remover in elegant diamond-shaped bottle. Available in 5g and 10g sizes. Fast and safe removal without irritation. Pink and white bottle options for retail beauty.",
    features: ["Diamond Bottle Design", "Jelly Gel Formula", "5g/10g Sizes", "Fast & Safe"],
    variants: {
      Size: ["5g", "10g"],
      Color: ["Pink", "White"]
    }
  }
];

// Cart utilities
const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },
  add(productId, variant, qty = 1) {
    const cart = this.get();
    const existing = cart.find(i => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant));
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId, variant, qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateBadge();
  },
  remove(index) {
    const cart = this.get();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateBadge();
  },
  updateQty(index, qty) {
    const cart = this.get();
    if (qty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].qty = qty;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateBadge();
  },
  clear() {
    localStorage.removeItem('cart');
    this.updateBadge();
  },
  getTotal() {
    return this.get().reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  },
  getCount() {
    return this.get().reduce((sum, item) => sum + item.qty, 0);
  },
  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

// Auth utilities
const Auth = {
  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  },
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this.updateUI();
  },
  logout() {
    localStorage.removeItem('user');
    this.updateUI();
    location.href = 'index.html';
  },
  updateUI() {
    const user = this.getUser();
    const loginLink = document.getElementById('login-link');
    const userMenu = document.getElementById('user-menu');
    if (user && userMenu) {
      if (loginLink) loginLink.style.display = 'none';
      userMenu.style.display = 'flex';
      const nameEl = document.getElementById('user-name');
      if (nameEl) nameEl.textContent = user.name || user.email;
    } else {
      if (loginLink) loginLink.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }
};
