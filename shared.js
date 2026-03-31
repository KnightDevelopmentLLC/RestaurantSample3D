// ═══════════════════════════════════════
//  SHARED.JS — Cart, Sidebar, Chatbot
// ═══════════════════════════════════════

// ── CART STATE ──────────────────────────
const Cart = {
  items: JSON.parse(localStorage.getItem('aurumCart') || '[]'),

  save() { localStorage.setItem('aurumCart', JSON.stringify(this.items)); },

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) { existing.qty += item.qty || 1; }
    else { this.items.push({ ...item, qty: item.qty || 1 }); }
    this.save(); this.render(); this.updateBadge();
    showToast(`${item.name} added to cart`);
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

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const n = this.count();
    badges.forEach(b => {
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
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="remove-item-btn" onclick="Cart.remove('${item.id}')" title="Remove">✕</button>
        </div>
      `).join('');
    }

    if (totalEl) {
      totalEl.textContent = '₹' + Cart.total().toLocaleString();
    }
  }
};

// ── SIDEBAR ─────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');
  if (!hamburger || !overlay || !sidebar) return;

  function openSidebar() {
    hamburger.classList.add('open');
    overlay.classList.add('open');
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);
}

// ── CART PANEL ──────────────────────────
function initCartPanel() {
  const cartBtns = document.querySelectorAll('.cart-btn');
  const overlay = document.getElementById('sidebarOverlay');
  const panel = document.getElementById('cartPanel');
  const closeBtn = document.getElementById('closeCart');
  if (!panel) return;

  function openCart() {
    panel.classList.add('open');
    if (overlay) { overlay.classList.add('open'); overlay.onclick = closeCart; }
    document.body.style.overflow = 'hidden';
    Cart.render();
  }
  function closeCart() {
    panel.classList.remove('open');
    if (overlay) { overlay.classList.remove('open'); overlay.onclick = null; }
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
}

// ── CHATBOT ─────────────────────────────
function initChatbot() {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  if (!fab || !panel) return;

  let isOpen = false;
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    const dot = fab.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
  });

  // Option buttons
  document.querySelectorAll('.chat-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const userMsg = btn.textContent.trim();
      appendChatMsg(userMsg, 'user');

      setTimeout(() => {
        switch (action) {
          case 'order': appendChatMsg('Great! Browse our menu and tap "Add to Cart" on any item. Ready to explore?', 'bot'); break;
          case 'menu': appendChatMsg('We offer handcrafted dishes across appetisers, mains, and desserts. Head to our Menu page!', 'bot'); window.setTimeout(() => location.href = 'menu.html', 1200); break;
          case 'contact': appendChatMsg('You can reach us at +91 98765 43210 or info@aurumrestaurant.com', 'bot'); break;
          case 'delivery': appendChatMsg('We deliver within 10 km. Orders above ₹1499 get free delivery. Estimated time: 35–50 mins.', 'bot'); break;
          case 'call': appendChatMsg('Calling now! 📞', 'bot'); window.setTimeout(() => location.href = 'tel:+919876543210', 800); break;
        }
      }, 400);
    });
  });
}

function appendChatMsg(text, type) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── TOAST ────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = `
      position:fixed; bottom:6rem; left:50%; transform:translateX(-50%);
      background:var(--gold); color:var(--black);
      padding:0.7rem 1.5rem; font-size:0.8rem; letter-spacing:0.1em;
      z-index:9999; border-radius:2px; pointer-events:none;
      font-family:'Jost',sans-serif; font-weight:500;
      opacity:0; transition:opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── SCROLL ANIMATIONS ────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

// ── INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initCartPanel();
  initChatbot();
  initScrollAnimations();
  Cart.updateBadge();
  Cart.render();
});
