// ═══════════════════════════════════════
//  SHARED.JS — Cart state, Toast, Scroll
//  Sidebar/Cart panel/Chatbot are wired
//  inside nav-template.js on injection.
// ═══════════════════════════════════════

const Cart = {
  items: JSON.parse(localStorage.getItem('aurumCart') || '[]'),

  save() { localStorage.setItem('aurumCart', JSON.stringify(this.items)); },

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) { existing.qty += (item.qty || 1); }
    else { this.items.push({ ...item, qty: item.qty || 1 }); }
    this.save(); this.render(); this.updateBadge();
    showToast(item.name + ' added to cart');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save(); this.render(); this.updateBadge();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.save(); this.render(); this.updateBadge();
  },

  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },

  updateBadge() {
    const n = this.count();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = n;
      b.classList.toggle('visible', n > 0);
    });
  },

  render() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    if (!list) return;
    if (this.items.length === 0) {
      list.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Explore our menu to begin.</p>';
    } else {
      list.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}" alt="${item.name}" loading="lazy">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}',-1)">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}',1)">+</button>
            </div>
          </div>
          <button class="remove-item-btn" onclick="Cart.remove('${item.id}')" title="Remove">✕</button>
        </div>`).join('');
    }
    if (totalEl) totalEl.textContent = '₹' + this.total().toLocaleString();
  }
};

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = 'position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--black);padding:0.7rem 1.5rem;font-size:0.8rem;letter-spacing:0.1em;z-index:9999;border-radius:2px;pointer-events:none;font-family:Jost,sans-serif;font-weight:500;opacity:0;transition:opacity 0.3s;white-space:nowrap';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  Cart.updateBadge();
  Cart.render();
});
