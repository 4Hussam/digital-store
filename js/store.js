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
  paymentLink: ''
};

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'قالب سيرة ذاتية احترافي',
    desc: 'قالب سيرة ذاتية عربي جاهز بتصميم عصري قابل للتعديل بالكامل. مناسب للتوظيف والجامعات.',
    price: 5,
    oldPrice: 9,
    category: 'قوالب',
    image: '',
    color: '#6c5ce7',
    icon: 'fa-solid fa-file-lines',
    payLink: '',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 10,
    sold: 23
  },
  {
    id: 'p2',
    name: 'باقة تغطيات سوشيال ميديا',
    desc: '120 تغطية جاهزة لستوري انستغرام وتيليجرام بواجهات عربية جذابة جاهزة للاستخدام.',
    price: 7,
    oldPrice: 12,
    category: 'تصاميم',
    image: '',
    color: '#00d2d3',
    icon: 'fa-solid fa-images',
    payLink: '',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 8,
    sold: 17
  },
  {
    id: 'p3',
    name: 'دليل الربح من المصورات الهاتفية',
    desc: 'خطة عملية خطوة بخطوة لتحويل ساعة واحدة يومياً إلى دخل إضافي من تصوير الهاتف.',
    price: 9,
    oldPrice: 15,
    category: 'دليلات',
    image: '',
    color: '#fd79a8',
    icon: 'fa-solid fa-book-open',
    payLink: '',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 5,
    sold: 31
  },
  {
    id: 'p4',
    name: 'بوت تيليجرام مبيعات جاهز',
    desc: 'بوت تيليجرام كامل للبيع والرد التلقائي على العملاء، جاهز للربط والتشغيل الفوري.',
    price: 25,
    oldPrice: 40,
    category: 'أدوات',
    image: '',
    color: '#00b894',
    icon: 'fa-solid fa-robot',
    payLink: '',
    featured: true,
    active: true,
    date: Date.now() - 86400000 * 3,
    sold: 8
  },
  {
    id: 'p5',
    name: 'حزمة إعدادات متاجر مسبقة',
    desc: 'إعدادات ونصوص جاهزة لأي متجر رقمي: سياسات، أوصاف، وصفحات جاهزة للنسخ السريع.',
    price: 3,
    oldPrice: 0,
    category: 'قوالب',
    image: '',
    color: '#fdcb6e',
    icon: 'fa-solid fa-cube',
    payLink: '',
    featured: false,
    active: true,
    date: Date.now() - 86400000 * 2,
    sold: 12
  },
  {
    id: 'p6',
    name: 'قالب خطة تسويق للمنتجات الرقمية',
    desc: 'نموذج قابل للتعبئة لتخطيط إطلاق وترويج أي منتج رقمي خلال 30 يوم.',
    price: 6,
    oldPrice: 10,
    category: 'أدوات',
    image: '',
    color: '#e17055',
    icon: 'fa-solid fa-chart-line',
    payLink: '',
    featured: false,
    active: true,
    date: Date.now() - 86400000,
    sold: 14
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