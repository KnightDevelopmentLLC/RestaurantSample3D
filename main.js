/* ============================================================
   AURUM — Shared JavaScript Utilities
   ============================================================ */

// ── Custom Cursor ──
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animate() {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animate);
  })();

  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// ── Navbar Scroll ──
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Hamburger
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  if (ham && menu) {
    ham.addEventListener('click', () => {
      menu.classList.toggle('open');
      ham.classList.toggle('open');
    });
  }
})();

// ── Scroll Reveal ──
(function initReveal() {
  const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── Toast ──
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.innerHTML = '<span class="toast-icon">✦</span>' + msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Cart Utilities ──
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('aurum_cart') || '[]'); } catch { return []; }
  },
  save(items) { localStorage.setItem('aurum_cart', JSON.stringify(items)); Cart.updateBadge(); },
  add(item) {
    const items = Cart.get();
    const ex = items.find(i => i.id === item.id);
    if (ex) ex.qty += item.qty;
    else items.push({ ...item });
    Cart.save(items);
    showToast(`${item.name} added to cart`);
  },
  remove(id) {
    Cart.save(Cart.get().filter(i => i.id !== id));
  },
  updateQty(id, qty) {
    const items = Cart.get();
    const i = items.find(i => i.id === id);
    if (i) { i.qty = qty; if (i.qty <= 0) return Cart.remove(id); }
    Cart.save(items);
  },
  total() { return Cart.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },
  updateBadge() {
    document.querySelectorAll('.cart-count').forEach(el => {
      const n = Cart.count(); el.textContent = n; el.style.display = n ? 'flex' : 'none';
    });
  }
};

// init badge
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());

// ── Parallax ──
function initParallax() {
  document.addEventListener('mousemove', e => {
    const px = (e.clientX / window.innerWidth  - 0.5) * 2;
    const py = (e.clientY / window.innerHeight - 0.5) * 2;
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const s = parseFloat(el.dataset.parallax) || 20;
      el.style.transform = `translate(${px * s}px, ${py * s}px)`;
    });
  });
}
initParallax();
