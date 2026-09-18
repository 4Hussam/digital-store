let adminLoggedIn = false;
let editingProductId = null;

function renderAdmin() {
  if (isAdminLoggedIn()) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderAdminProducts();
    renderAdminOrders();
    fillSettingsForm();
  } else {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(STORE_KEYS.adminSession) === '1';
}

function adminLogin(e) {
  e.preventDefault();
  const pin = document.getElementById('adminPinInput').value.trim();
  const s = getSettings();
  if (pin === String(s.adminPin)) {
    sessionStorage.setItem(STORE_KEYS.adminSession, '1');
    adminLoggedIn = true;
    showToast('مرحباً بك في لوحة التحكم <i class="fa-solid fa-hand-sparkles"></i>', 'success');
    renderAdmin();
  } else {
    showToast('رمز خاطئ، حاول مجدداً', 'error');
  }
}

function useDefaultPin() {
  document.getElementById('adminPinInput').value = getSettings().adminPin;
  const s = getSettings();
  sessionStorage.setItem(STORE_KEYS.adminSession, '1');
  adminLoggedIn = true;
  showToast('تم الدخول بالرمز الافتراضي', 'success');
  renderAdmin();
}

function adminLogout() {
  sessionStorage.removeItem(STORE_KEYS.adminSession);
  adminLoggedIn = false;
  navigate('admin');
  showToast('تم تسجيل الخروج');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  ['products', 'orders', 'settings', 'guide'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'orders') renderAdminOrders();
}

/* ---------- Products admin ---------- */
function renderAdminProducts() {
  const list = getProducts();
  const s = getSettings();
  const wrap = document.getElementById('adminProductsList');
  if (!list.length) {
    wrap.innerHTML = '<p class="empty-td">لا توجد منتجات — أضف أول منتج.</p>';
    return;
  }
  wrap.innerHTML = list.map(p => {
    const thumb = p.image ? `<img src="${p.image}" alt="">` : `<i class="fa-solid fa-layer-group"></i>`;
    const state = p.active ? '<span class="badge" style="background:var(--success)">نشط</span>' : '<span class="badge" style="background:var(--muted)">موقوف</span>';
    return `
      <div class="admin-prod-card">
        <div class="thumb">${thumb}</div>
        <div class="admin-prod-info">
          <h4>${escapeHTML(p.name)}</h4>
          <small>${escapeHTML(p.category || 'عام')} · <span class="price-inline">${formatMoney(p.price, s.currency)}</span></small>
          <div style="margin-top:4px">${state}</div>
        </div>
        <div class="admin-prod-actions">
          <button class="icon-btn" onclick="openProductModal('${p.id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn danger" onclick="deleteProduct('${p.id}')" title="حذف"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>`;
  }).join('');
}

function openProductModal(id) {
  editingProductId = id || null;
  const f = document.getElementById('productForm');
  const d = document.getElementById('pfDeleteBtn');
  if (editingProductId) {
    const p = getProducts().find(x => x.id === editingProductId);
    if (!p) return;
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    document.getElementById('pfId').value = p.id;
    document.getElementById('pfName').value = p.name || '';
    document.getElementById('pfDesc').value = p.desc || '';
    document.getElementById('pfPrice').value = p.price || 0;
    document.getElementById('pfOldPrice').value = p.oldPrice || '';
    document.getElementById('pfCategory').value = p.category || '';
    document.getElementById('pfImageUrl').value = p.image || '';
    document.getElementById('pfColor').value = p.color || '#6c5ce7';
    document.getElementById('pfPayLink').value = p.payLink || '';
    document.getElementById('pfFileUrl').value = p.fileUrl || '';
    document.getElementById('pfFeatured').checked = !!p.featured;
    document.getElementById('pfActive').checked = p.active !== false;
    d.style.display = 'inline-flex';
  } else {
    f.reset();
    document.getElementById('productModalTitle').textContent = 'منتج جديد';
    document.getElementById('pfId').value = '';
    document.getElementById('pfFeatured').checked = true;
    document.getElementById('pfActive').checked = true;
    document.getElementById('pfColor').value = '#6c5ce7';
    d.style.display = 'none';
  }
  document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  editingProductId = null;
}

function saveProduct(e) {
  e.preventDefault();
  const name = document.getElementById('pfName').value.trim();
  if (!name) { showToast('أدخل اسم المنتج', 'error'); return; }
  const price = parseFloat(document.getElementById('pfPrice').value) || 0;
  const oldPrice = parseFloat(document.getElementById('pfOldPrice').value) || 0;
  const products = getProducts();
  const data = {
    name,
    desc: document.getElementById('pfDesc').value.trim(),
    price,
    oldPrice: oldPrice > price ? oldPrice : 0,
    category: document.getElementById('pfCategory').value.trim(),
    image: document.getElementById('pfImageUrl').value.trim(),
    color: document.getElementById('pfColor').value,
    payLink: document.getElementById('pfPayLink').value.trim(),
    fileUrl: document.getElementById('pfFileUrl').value.trim(),
    featured: document.getElementById('pfFeatured').checked,
    active: document.getElementById('pfActive').checked
  };
  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx > -1) products[idx] = Object.assign({}, products[idx], data);
    showToast('تم حفظ التعديلات <i class="fa-solid fa-check"></i>', 'success');
  } else {
    products.unshift(Object.assign({ id: uid(), date: Date.now(), sold: 0, icon: 'fa-solid fa-layer-group' }, data));
    showToast('تمت إضافة المنتج <i class="fa-solid fa-check"></i>', 'success');
  }
  saveProducts(products);
  closeProductModal();
  renderAdminProducts();
  renderHomeProducts();
  renderCategoryFilter();
  renderFilteredProducts();
  updateHeroCounts();
}

function deleteProduct(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  if (!confirm('حذف المنتج «' + p.name + '»؟')) return;
  saveProducts(getProducts().filter(x => x.id !== id));
  renderAdminProducts();
  renderHomeProducts();
  renderCategoryFilter();
  renderFilteredProducts();
  updateHeroCounts();
  showToast('تم حذف المنتج', 'success');
}

function deleteCurrentProduct() {
  if (editingProductId) deleteProduct(editingProductId);
}

function readImage(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('pfImageUrl').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- Orders admin ---------- */
function renderAdminOrders() {
  const orders = getOrders();
  const s = getSettings();
  const tbody = document.querySelector('#adminOrdersTable tbody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td class="empty-td" colspan="8">لا توجد طلبات بعد — تعمل تلقائياً عند إتمام أي عميل للشراء.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map((o, i) => {
    const hasWa = !!s.whatsapp;
    return `
      <tr>
        <td>${escapeHTML(o.id)}</td>
        <td>${new Date(o.date).toLocaleString('ar')}</td>
        <td>${escapeHTML(o.name)}<br><small style="color:var(--muted)">${escapeHTML(o.email)}</small></td>
        <td>${escapeHTML(o.items.map(it => it.product + '×' + it.qty).join('، '))}</td>
        <td>${o.items.reduce((sum, it) => sum + it.qty, 0)}</td>
        <td>${formatMoney(o.total, o.currency || s.currency)}</td>
        <td><span class="status-tag status-awaiting">قيد التنفيذ</span></td>
        <td>${hasWa ? `<button class="icon-btn" onclick="openWhatsappOrder(${i})" title="إرسال للعميل"><i class="fa-brands fa-whatsapp" style="color:#25d366"></i></button>` : '<span style="color:var(--muted)">—</span>'}</td>
      </tr>`;
  }).join('');
}

function openWhatsappOrder(index) {
  const orders = getOrders();
  const o = orders[index];
  if (!o) return;
  const s = getSettings();
  const msg = encodeURIComponent(`مرحباً ${o.name} 🌟\n\nشكراً لطلبك من متجر ${s.storeName}!\n\nرقم الطلب: ${o.id}\n\nبعد إتمام الدفع، سيصلك المنتج فوراً على بريدك: ${o.email}\n\nشكراً لثقتك!`);
  window.open('https://wa.me/' + (o.phone || '').replace(/\D/g, '') + '?text=' + msg, '_blank');
}

function exportOrdersCSV() {
  const orders = getOrders();
  if (!orders.length) { showToast('لا توجد طلبات للتصدير', 'error'); return; }
  const s = getSettings();
  const rows = [['الرقم', 'التاريخ', 'الاسم', 'البريد', 'الهاتف', 'المنتجات', 'الكمية', 'الإجمالي', 'العملة']];
  orders.forEach(o => {
    rows.push([o.id, new Date(o.date).toLocaleString('ar'), o.name, o.email, o.phone,
      o.items.map(i => i.product).join('|'), o.items.reduce((a, b) => a + b.qty, 0), o.total, o.currency || s.currency]);
  });
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  downloadFile('\uFEFF' + csv, 'orders.csv', 'text/csv');
  showToast('تم تصدير الطلبات <i class="fa-solid fa-check"></i>', 'success');
}

function clearOrders() {
  if (!confirm('مسح جميع الطلبات؟ لا يمكن التراجع.')) return;
  saveOrders([]);
  renderAdminOrders();
  renderStats();
  showToast('تم مسح الطلبات', 'success');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Settings ---------- */
function fillSettingsForm() {
  const s = getSettings();
  document.getElementById('setStoreName').value = s.storeName || '';
  document.getElementById('setTagline').value = s.tagline || '';
  document.getElementById('setHeroSub').value = s.heroSub || '';
  document.getElementById('setCurrency').value = s.currency || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setTelegramBotToken').value = s.telegramBotToken || '';
  document.getElementById('setTelegramChatId').value = s.telegramChatId || '';
  document.getElementById('setAdminPin').value = '';
  document.getElementById('setPaymentLink').value = s.paymentLink || '';
}

function readTelegramFields() {
  return {
    telegramBotToken: document.getElementById('setTelegramBotToken').value.trim(),
    telegramChatId: document.getElementById('setTelegramChatId').value.trim()
  };
}

function saveTelegramFields(s) {
  const t = readTelegramFields();
  s.telegramBotToken = t.telegramBotToken;
  s.telegramChatId = t.telegramChatId;
  return Object.assign({}, s, t);
}

async function testTelegram() {
  const t = readTelegramFields();
  if (!t.telegramBotToken || !t.telegramChatId) {
    showToast('أدخل رمز البوت ومعرف الدردشة أولاً', 'error');
    return;
  }
  const s = getSettings();
  const text = `📢 *رسالة تجريبية من متجر ${s.storeName}*\nتهانينا! 🎉\nإشعارات الطلبات تعمل الآن تلقائياً.\nكل طلب جديد سيصل إليك هنا فوراً.`;
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جار الإرسال...';
  try {
    const res = await fetch('https://api.telegram.org/bot' + t.telegramBotToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: t.telegramChatId, text, parse_mode: 'Markdown' })
    });
    const json = await res.json();
    if (json.ok) {
      saveTelegramFields(getSettings());
      showToast('وصلت الرسالة التجريبية لتطبيقك ✅', 'success');
    } else {
      showToast('خطأ: ' + (json.description || 'تحقق من الرمز والمعرف'), 'error');
    }
  } catch (e) {
    showToast('لا يمكن الاتصال, تحقق من اتصالك', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fa-brands fa-telegram"></i> إرسال طلب تجريبي لتيليجرام';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const s = getSettings();
      const pinInput = document.getElementById('setAdminPin').value.trim();
      const merged = saveTelegramFields(s);
      saveSettings({
        storeName: document.getElementById('setStoreName').value.trim() || 'الرقمي',
        tagline: document.getElementById('setTagline').value.trim(),
        heroSub: document.getElementById('setHeroSub').value.trim(),
        currency: document.getElementById('setCurrency').value,
        whatsapp: document.getElementById('setWhatsapp').value.trim(),
        adminPin: pinInput || s.adminPin,
        paymentLink: document.getElementById('setPaymentLink').value.trim(),
        telegramBotToken: merged.telegramBotToken,
        telegramChatId: merged.telegramChatId
      });
      renderSettings();
      renderCartUI();
      fillSettingsForm();
      showToast('تم حفظ الإعدادات <i class="fa-solid fa-check"></i>', 'success');
    });
  }
});