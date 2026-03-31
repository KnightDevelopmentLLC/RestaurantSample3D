// nav-template.js — inject nav, sidebar, cart panel, chatbot into every page

(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'menu.html', label: 'Menu' },
    { href: 'cart.html', label: 'Cart' },
    { href: 'contact.html', label: 'Contact' },
  ];

  const navLinksHtml = links.map(l =>
    `<li><a href="${l.href}" class="${currentPage === l.href ? 'active' : ''}">${l.label}</a></li>`
  ).join('');

  const sidebarLinksHtml = links.map(l =>
    `<a href="${l.href}">${l.label}</a>`
  ).join('');

  const html = `
<!-- NAV -->
<nav>
  <a href="index.html" class="nav-logo">AURUM<span>·</span>EST</a>
  <ul class="nav-links">${navLinksHtml}</ul>
  <div class="nav-right">
    <button class="cart-btn" aria-label="Open cart">
      🛒 Cart
      <span class="cart-badge" id="navCartBadge">0</span>
    </button>
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- SIDEBAR OVERLAY -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
  ${sidebarLinksHtml}
  <div class="sidebar-footer">
    <p>Crafted by <a href="https://knightdevelopment.space/" target="_blank">Knight Development</a></p>
  </div>
</aside>

<!-- CART PANEL -->
<div class="cart-panel" id="cartPanel">
  <div class="cart-panel-header">
    <h3>YOUR ORDER</h3>
    <button class="close-btn" id="closeCart">✕</button>
  </div>
  <div class="cart-items-list" id="cartItemsList">
    <p class="cart-empty">Your cart is empty.<br>Explore our menu to begin.</p>
  </div>
  <div class="cart-panel-footer">
    <div class="cart-total-row">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-amount" id="cartTotal">₹0</span>
    </div>
    <a href="cart.html" class="btn-gold">Proceed to Checkout</a>
  </div>
</div>

<!-- CHATBOT -->
<button class="chat-fab" id="chatFab" aria-label="Chat with us">
  💬
  <span class="notif-dot"></span>
</button>
<div class="chat-panel" id="chatPanel">
  <div class="chat-header">
    <div class="chat-avatar">🍽</div>
    <div class="chat-header-info">
      <h4>Aurum Assistant</h4>
      <p>● Online Now</p>
    </div>
    <button class="close-btn" onclick="document.getElementById('chatPanel').classList.remove('open')" style="margin-left:auto">✕</button>
  </div>
  <div class="chat-messages" id="chatMessages">
    <div class="chat-msg bot">Welcome to Aurum! How may I assist you today?</div>
  </div>
  <div class="chat-options">
    <button class="chat-option-btn" data-action="order">🍽 Order Food</button>
    <button class="chat-option-btn" data-action="menu">📜 View Menu</button>
    <button class="chat-option-btn" data-action="delivery">🚚 Delivery Info</button>
    <button class="chat-option-btn" data-action="contact">📧 Contact Us</button>
    <button class="chat-option-btn" data-action="call">📞 Call Now</button>
  </div>
</div>
`;

  document.body.insertAdjacentHTML('afterbegin', html);

  // ── SIDEBAR ── wire up immediately after injection
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sidebarOverlay');
  const sidebar   = document.getElementById('sidebar');
  const cartPanel = document.getElementById('cartPanel');
  const closeCart = document.getElementById('closeCart');

  function openSidebar() {
    hamburger.classList.add('open');
    sidebar.classList.add('open');
    overlay.classList.add('open');
    overlay.onclick = closeSidebar;
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    hamburger.classList.remove('open');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    overlay.onclick = null;
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    hamburger.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  // ── CART PANEL ── wire up immediately
  function openCart() {
    if (sidebar.classList.contains('open')) closeSidebar();
    cartPanel.classList.add('open');
    overlay.classList.add('open');
    overlay.onclick = closeCartPanel;
    document.body.style.overflow = 'hidden';
    // render cart if Cart is already defined
    if (typeof Cart !== 'undefined') { Cart.render(); Cart.updateBadge(); }
  }
  function closeCartPanel() {
    cartPanel.classList.remove('open');
    overlay.classList.remove('open');
    overlay.onclick = null;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.cart-btn').forEach(function (btn) {
    btn.addEventListener('click', openCart);
  });
  if (closeCart) closeCart.addEventListener('click', closeCartPanel);

  // ── CHATBOT ── wire up immediately
  const chatFab   = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  let chatOpen = false;

  chatFab.addEventListener('click', function () {
    chatOpen = !chatOpen;
    chatPanel.classList.toggle('open', chatOpen);
    const dot = chatFab.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
  });

  document.getElementById('chatPanel').querySelector('.close-btn').addEventListener('click', function () {
    chatOpen = false;
    chatPanel.classList.remove('open');
  });

  document.querySelectorAll('.chat-option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.dataset.action;
      const userMsg = btn.textContent.trim();
      appendNavChatMsg(userMsg, 'user');
      setTimeout(function () {
        switch (action) {
          case 'order':    appendNavChatMsg('Great! Browse our menu and tap "Add to Cart" on any item.', 'bot'); break;
          case 'menu':     appendNavChatMsg('Heading to our Menu page now!', 'bot'); setTimeout(function(){ location.href = 'menu.html'; }, 900); break;
          case 'delivery': appendNavChatMsg('We deliver within 10 km. Orders above ₹1499 get free delivery. ETA: 35–50 mins.', 'bot'); break;
          case 'contact':  appendNavChatMsg('Reach us at +91 98765 43210 or info@aurumrestaurant.com', 'bot'); break;
          case 'call':     appendNavChatMsg('Calling now! 📞', 'bot'); setTimeout(function(){ location.href = 'tel:+919876543210'; }, 600); break;
        }
      }, 350);
    });
  });

  function appendNavChatMsg(text, type) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

})();
