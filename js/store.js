const STORE_KEYS = {
  products: 'ds_products_v1',
  settings: 'ds_settings_v1',
  orders: 'ds_orders_v1',
  cart: 'ds_cart_v1',
  adminSession: 'ds_admin_session_v1'
};

const DEFAULT_SETTINGS = {
  storeName: 'الرقمي',
  tagline: 'منتجات رقمية جاهزة للاستخدام الفوري',
  heroSub: 'قوالب وأدوات ودليلات جاهزة بعملية شراء واحدة — ادفع واحصل على المنتج مباشرة بدون انتظار.',
  currency: '$',
  whatsapp: '',
  adminPin: '1234',
  paymentLink: '',
  telegramBotToken: '8640050360:AAFazOSTqUi80xTfsWYF6CHCqL871TQ4PkM',
  telegramChatId: '7443219236'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'قالب سيرة ذاتية احترافي',
    desc: 'تصميم CV عصري RTL جاهز للتعديل والطباعة كـ PDF. يتضمن قسم المهارات، الخبرة، التعليم والشهادات.',
    price: 5,
    oldPrice: 12,
    category: 'قوالب',
    image: '',
    color: '#6c5ce7',
    icon: 'fa-solid fa-file-lines',
    payLink: '',
    fileUrl: 'https://4hussam.github.io/digital-store/products/cv-template.html',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 10,
    sold: 47
  },
  {
    id: 'p2',
    name: 'دفتر إدارة المال الشخصي',
    desc: 'محفظة رقمية تفاعلية لتتبع دخلك ومصاريفك شهرياً مع تقارير وتصدير CSV. يعمل بلا إنترنت.',
    price: 7,
    oldPrice: 15,
    category: 'أدوات',
    image: '',
    color: '#00b894',
    icon: 'fa-solid fa-wallet',
    payLink: '',
    fileUrl: 'https://4hussam.github.io/digital-store/products/budget-tracker.html',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 5,
    sold: 33
  },
  {
    id: 'p3',
    name: 'دليل إطلاق أول منتج رقمي',
    desc: 'كتيب عملي من 20 صفحة يأخذك من الفكرة إلى أول ربح خلال 30 يوم. خطة جاهزة للتنفيذ فوراً.',
    price: 9,
    oldPrice: 18,
    category: 'دليلات',
    image: '',
    color: '#6c5ce7',
    icon: 'fa-solid fa-book-open',
    payLink: '',
    fileUrl: 'https://4hussam.github.io/digital-store/products/launch-guide.html',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 3,
    sold: 25
  }
];

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    showToast('تعذّر الحفظ في المتصفح', 'error');
  }
}

function getSettings() {
  const s = loadData(STORE_KEYS.settings, null);
  return Object.assign({}, DEFAULT_SETTINGS, s || {});
}

function saveSettings(s) {
  saveData(STORE_KEYS.settings, s);
}

function getProducts() {
  const list = loadData(STORE_KEYS.products, null);
  return Array.isArray(list) ? list : DEFAULT_PRODUCTS.slice();
}

function saveProducts(list) {
  saveData(STORE_KEYS.products, list);
}

function getOrders() {
  return loadData(STORE_KEYS.orders, []);
}

function saveOrders(list) {
  saveData(STORE_KEYS.orders, list);
}

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatMoney(n, currency) {
  const cur = currency || getSettings().currency || '$';
  return cur + formatNum(n);
}

function formatNum(n) {
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { minimumFractionDigits: num % 1 ? 2 : 0, maximumFractionDigits: 2 });
}