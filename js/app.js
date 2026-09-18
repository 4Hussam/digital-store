let cart = loadData(STORE_KEYS.cart, []);
let currentView = 'home';

document.addEventListener('DOMContentLoaded', init);

function init() {
  setTimeout(() => {
    const load = document.getElementById('app-loading');
    if (load) load.classList.add('hide');
  }, 400);
  document.getElementById('footerYear').textContent = new Date().getFullYear();
  renderSettings();
  renderHomeProducts();
  renderStoreProducts();
  renderCategoryFilter();
  updateHeroCounts();
  renderCartUI();
  navigate('home');
}

function renderSettings() {
  const s = getSettings();
  document.getElementById('siteNameLogo').textContent = s.storeName;
  document.getElementById('siteTaglineLogo').textContent = s.tagline;
  document.getElementById('heroSubtitle').textContent = s.heroSub;
  document.getElementById('footerName').textContent = '— متجر ' + s.storeName + ' —';
  document.title = 'متجر ' + s.storeName + ' | منتجات رقمية جاهزة';
}

function updateHeroCounts() {
  const products = getProducts().filter(p => p.active);
  const cats = new Set(products.map(p => p.category).filter(Boolean));
  document.getElementById('heroProdCount').textContent = products.length;
  document.getElementById('heroCatCount').textContent = cats.size;
}

function renderHomeProducts() {
  const featured = getProducts().filter(p => p.active && p.featured).slice(0, 4);
  const wrap = document.getElementById('homeProducts');
  wrap.innerHTML = featured.length ? featured.map(productCardHTML).join('') : '<p class="empty-td">لا توجد منتجات بعد — أضف منتجات من لوحة التحكم.</p>';
}

function renderCategoryFilter() {
  const products = getProducts().filter(p => p.active);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const sel = document.getElementById('categoryFilter');
  sel.innerHTML = '<option value="">كل التصنيفات</option>' + cats.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
}

function renderStoreProducts() {
  renderFilteredProducts();
}

function filterProducts() {
  renderFilteredProducts();
}

function getFilteredProducts() {
  let list = getProducts().filter(p => p.active);
  const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;
  if (q) list = list.filter(p => (p.name + ' ' + p.desc + ' ' + (p.category || '')).toLowerCase().includes(q));
  if (cat) list = list.filter(p => p.category === cat);
  switch (sort) {
    case 'price-asc': list.sort((a, b) => (a.price||0) - (b.price||0)); break;
    case 'price-desc': list.sort((a, b) => (b.price||0) - (a.price||0)); break;
    case 'newest': list.sort((a, b) => (b.date||0) - (a.date||0)); break;
    default: list.sort((a, b) => (b.featured?1:0) - (a.featured?1:0));
  }
  return list;
}

function renderFilteredProducts() {
  const list = getFilteredProducts();
  const wrap = document.getElementById('storeProducts');
  const none = document.getElementById('noResults');
  wrap.innerHTML = list.length ? list.map(productCardHTML).join('') : '';
  none.style.display = list.length ? 'none' : 'block';
}

function productCardHTML(p) {
  const s = getSettings();
  const old = p.oldPrice > p.price ? `<span class="price-old">${formatMoney(p.oldPrice, s.currency)}</span>` : '';
  const img = p.image ? `<img src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy">` : `<i class="fa-solid fa-layer-group no-img" style="color:${p.color||'#6c5ce7'}"></i>`;
  const badges = (p.oldPrice > p.price ? '<span class="badge badge-sale">خصم</span>' : '') + (p.featured ? '<span class="badge badge-featured">مميز</span>' : '');
  return `
    <article class="product-card" style="--pc:${p.color||'#6c5ce7'}">
      <div class="product-media" style="background:linear-gradient(135deg,${p.color||'#6c5ce7'}33,transparent)">
        ${img}
        <div class="product-badges">${badges}</div>
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHTML(p.category || 'منتج')}</span>
        <h3 class="product-name">${escapeHTML(p.name)}</h3>
        <p class="product-desc">${escapeHTML(p.desc || '')}</p>
        <div class="product-foot">
          <div class="price-row"><span class="price">${formatMoney(p.price, s.currency)}</span>${old}</div>
          <button class="add-btn" onclick="addToCart('${p.id}')" title="أضف إلى السلة"><i class="fa-solid fa-cart-plus"></i></button>
        </div>
        <div class="product-views">
          <span><i class="fa-solid fa-eye"></i> ${(p.sold||0) + 40 + Math.floor(Math.random()*9)} مشاهدة</span>
          <span><i class="fa-solid fa-check-circle" style="color:var(--success)"></i> ${p.sold||0} تم البيع</span>
        </div>
      </div>
    </article>`;
}

/* ---------- Cart ---------- */
function getCart() {
  cart = loadData(STORE_KEYS.cart, []);
  return cart;
}

function saveCart() {
  saveData(STORE_KEYS.cart, cart);
  renderCartUI();
}

function addToCart(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  cart = getCart();
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast('تمت الإضافة إلى السلة <i class="fa-solid fa-check"></i>', 'success');
  document.getElementById('cartCount').classList.add('pulse');
  setTimeout(() => document.getElementById('cartCount').classList.remove('pulse'), 400);
}

function changeQty(id, delta) {
  cart = getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = getCart().filter(c => c.id !== id);
  saveCart();
}

function renderCartUI() {
  cart = getCart();
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const wrap = document.getElementById('cartItems');
  const s = getSettings();
  if (!cart.length) {
    wrap.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-cart-arrow-down"></i>سلتك فارغة حالياً<br>أضف منتجات من المتجر</div>';
  } else {
    wrap.innerHTML = cart.map(item => {
      const p = getProducts().find(x => x.id === item.id);
      if (!p) return '';
      const thumb = p.image ? `<img src="${p.image}" alt="">` : `<i class="fa-solid fa-layer-group"></i>`;
      return `
        <div class="cart-item">
          <div class="ci-thumb">${thumb}</div>
          <div class="cart-item-info">
            <h5>${escapeHTML(p.name)}</h5>
            <div class="ci-price">${formatMoney(p.price * item.qty, s.currency)}</div>
            <div class="ci-qty">
              <button onclick="changeQty('${p.id}',-1)"><i class="fa-solid fa-minus"></i></button>
              <span>${item.qty}</span>
              <button onclick="changeQty('${p.id}',1)"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <button class="ci-remove" onclick="removeFromCart('${p.id}')"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
    }).join('');
  }
  const total = cart.reduce((sum, c) => {
    const p = getProducts().find(x => x.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
  document.getElementById('cartTotal').textContent = formatMoney(total, s.currency);
}

function toggleCart() {
  if (!getCart().length) { showToast('سلتك فارغة — أضف منتجات أولاً', 'error'); return; }
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}

/* ---------- Navigation ---------- */
function navigate(view) {
  currentView = view;
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  closeCart();
  const target = document.getElementById('page-' + view);
  if (target) target.style.display = 'block';
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.nav === view));
  document.getElementById('mainNav').classList.remove('open');
  if (view === 'home') renderHomeProducts();
  if (view === 'stats') renderStats();
  if (view === 'admin') renderAdmin();
  if (view === 'store') { renderCategoryFilter(); renderFilteredProducts(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileNav() {
  document.getElementById('mainNav').classList.toggle('open');
}

/* ---------- Checkout ---------- */
function checkout() {
  const items = getCart().filter(c => getProducts().find(p => p.id === c.id));
  if (!items.length) { showToast('سلتك فارغة', 'error'); return; }
  const s = getSettings();
  const box = document.getElementById('checkoutItems');
  box.innerHTML = items.map(item => {
    const p = getProducts().find(x => x.id === item.id);
    return `<div class="checkout-item"><span>${escapeHTML(p.name)} × ${item.qty}</span><small>${formatMoney(p.price * item.qty, s.currency)}</small></div>`;
  }).join('');
  const total = items.reduce((sum, item) => {
    const p = getProducts().find(x => x.id === item.id);
    return sum + p.price * item.qty;
  }, 0);
  document.getElementById('checkoutTotal').textContent = formatMoney(total, s.currency);
  document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
}

function completeOrder(e) {
  e.preventDefault();
  const name = document.getElementById('coName').value.trim();
  const email = document.getElementById('coEmail').value.trim();
  const phone = document.getElementById('coPhone').value.trim();
  if (!name || !email) { showToast('أدخل اسمك وبريدك', 'error'); return; }
  const s = getSettings();
  const items = getCart().filter(c => getProducts().find(p => p.id === c.id));
  if (!items.length) { showToast('سلتك فارغة', 'error'); return; }

  const order = {
    id: '#' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    name,
    email,
    phone: phone || '',
    items: items.map(i => {
      const p = getProducts().find(x => x.id === i.id);
      return { product: p.name, qty: i.qty, price: p.price };
    }),
    total: items.reduce((sum, i) => {
      const p = getProducts().find(x => x.id === i.id);
      return sum + p.price * i.qty;
    }, 0),
    currency: s.currency,
    status: 'awaiting'
  };
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  items.forEach(i => {
    const p = getProducts().find(x => x.id === i.id);
    if (p) { p.sold = (p.sold || 0) + i.qty; }
  });
  saveProducts(getProducts());

  cart = [];
  saveCart();
  closeCheckout();
  closeCart();

  if (s.whatsapp) {
    const msg = encodeURIComponent(`*طلب جديد* #${order.id}\nالاسم: ${name}\nالبريد: ${email}\nالهاتف: ${phone || '-'}\nالمنتجات:\n${order.items.map(i => `- ${i.product} × ${i.qty} (${i.price}${s.currency})`).join('\n')}\nالإجمالي: ${order.total}${s.currency}`);
    window.open('https://wa.me/' + s.whatsapp.replace(/\D/g, '') + '?text=' + msg, '_blank');
  }

  sendTelegramOrder(order);

  const payLink = pickPaymentLink(items);
  if (payLink) {
    window.open(payLink, '_blank');
  }

  const p = getProducts().find(x => x.id === items[0].id);
  showSuccessModal(order, p && p.fileUrl ? p.fileUrl : '');

  showToast('تم استلام طلبك بنجاح! <i class="fa-solid fa-circle-check"></i>', 'success');
}

function sendTelegramOrder(order) {
  const s = getSettings();
  const token = (s.telegramBotToken || '').trim();
  const chat = (s.telegramChatId || '').trim();
  if (!token || !chat) return;
  const itemsText = order.items.map(i => `• ${i.product} × ${i.qty} — ${i.price}${s.currency}`).join('\n');
  const text = `🛒 *طلب جديد في متجر ${s.storeName}*\n━━━━━━━━━━━━━━\n🆔 رقم الطلب: ${order.id}\n👤 الاسم: ${order.name}\n📧 البريد: ${order.email}\n📱 الهاتف: ${order.phone || '—'}\n\n📦 *المنتجات:*\n${itemsText}\n\n💰 *الإجمالي: ${order.total}${s.currency}*\n📅 ${new Date().toLocaleString('ar')}\n━━━━━━━━━━━━━━\n✅ يُرجى تسليم المنتج وتأكيد استلام الدفع.`;
  const payload = { chat_id: chat, text, parse_mode: 'Markdown' };
  fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

function pickPaymentLink(items) {
  const s = getSettings();
  for (const item of items) {
    const p = getProducts().find(x => x.id === item.id);
    if (p && p.payLink) return p.payLink;
  }
  return s.paymentLink || '';
}

/* ---------- Preview ---------- */
function openProductModalPreview() {}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Success screen ---------- */
function showSuccessModal(order, fileUrl) {
  const s = getSettings();
  const itemsList = order.items.map(it => `<li>${escapeHTML(it.product)} × ${it.qty}</li>`).join('');
  const fileBlock = fileUrl
    ? `<a class="btn btn-primary" href="${fileUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> تحميل منتجك الآن</a>`
    : '<p class="success-note">استلمنا طلبك، سيصلك المنتج على بريدك الإلكتروني خلال دقائق.</p>';
  document.getElementById('successBody').innerHTML = `
    <div class="success-check"><i class="fa-solid fa-check"></i></div>
    <h3>تم استلام طلبك بنجاح!</h3>
    <p class="success-sub">شكراً لثقتك بـ متجر ${s.storeName}</p>
    <div class="success-order">
      <strong>رقم الطلب: ${escapeHTML(order.id)}</strong>
      <ul>${itemsList}</ul>
      <span>الإجمالي: ${formatMoney(order.total, s.currency)}</span>
    </div>
    ${fileBlock}`;
  document.getElementById('successModal').style.display = 'flex';
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
}

/* ---------- Utils ---------- */
function escapeHTML(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- Stats ---------- */
function renderStats() {
  const orders = getOrders();
  const products = getProducts().filter(p => p.active);
  const s = getSettings();
  document.getElementById('statRevenue').textContent = formatMoney(orders.reduce((sum, o) => sum + (o.total || 0), 0), s.currency);
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statProducts').textContent = products.length;
  const customers = new Set(orders.map(o => o.email));
  document.getElementById('statCustomers').textContent = customers.size;

  const chart = document.getElementById('productSalesChart');
  if (!orders.length) {
    chart.innerHTML = '<p class="empty-td">لا توجد مبيعات بعد — شيّر منتجاتك وستُسجَّل هنا تلقائياً.</p>';
  } else {
    const totals = {};
    orders.forEach(o => o.items.forEach(i => { totals[i.product] = (totals[i.product] || 0) + i.qty * i.price; }));
    const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(...rows.map(r => r[1]), 1);
    chart.innerHTML = rows.map(([name, val]) => `
      <div class="sales-bar-row">
        <div class="sales-bar-label"><strong>${escapeHTML(name)}</strong><span>${formatMoney(val, s.currency)}</span></div>
        <div class="sales-bar-track"><div class="sales-bar-fill" style="width:${(val / max) * 100}%"></div></div>
      </div>`).join('');
  }

  const tbody = document.querySelector('#ordersTable tbody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td class="empty-td" colspan="6">لا توجد طلبات بعد</td></tr>';
  } else {
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${escapeHTML(o.id)}</td>
        <td>${new Date(o.date).toLocaleDateString('ar')}</td>
        <td>${escapeHTML(o.items.map(i => i.product).join('، '))}</td>
        <td>${o.items.reduce((s, i) => s + i.qty, 0)}</td>
        <td>${formatMoney(o.total, o.currency || s.currency)}</td>
        <td><span class="status-tag status-awaiting">قيد التنفيذ</span></td>
      </tr>`).join('');
  }
}