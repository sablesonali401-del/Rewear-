const STORAGE_KEYS = {
  users: 'rewear_users',
  products: 'rewear_products',
  orders: 'rewear_orders',
  rentals: 'rewear_rentals',
  donations: 'rewear_donations',
  inventory: 'rewear_inventory',
  currentUser: 'rewear_current_user'
};

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';
const remoteState = { users: [], products: [], orders: [], rentals: [], donations: [], inventory: [] };

function readStoredData(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn(`Unable to load ${key} from local storage.`, error);
    return [];
  }
}

Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
  if (name !== 'currentUser') remoteState[name] = readStoredData(key);
});

function getAccessToken() {
  return localStorage.getItem('rewear_access_token');
}

async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadRemoteData() {
  if (!getAccessToken()) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    [STORAGE_KEYS.users, STORAGE_KEYS.orders, STORAGE_KEYS.rentals, STORAGE_KEYS.donations, STORAGE_KEYS.inventory]
      .forEach(key => saveData(key, []));
    const publicData = await apiRequest('/public/clothes');
    saveRemoteData(STORAGE_KEYS.products, publicData.products || []);
    return publicData;
  }

  let data;
  try {
    data = await apiRequest('/bootstrap');
  } catch (error) {
    if (error.status !== 401) throw error;
    localStorage.removeItem('rewear_access_token');
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    [STORAGE_KEYS.users, STORAGE_KEYS.orders, STORAGE_KEYS.rentals, STORAGE_KEYS.donations, STORAGE_KEYS.inventory]
      .forEach(key => saveData(key, []));
    const publicData = await apiRequest('/public/clothes');
    saveRemoteData(STORAGE_KEYS.products, publicData.products || []);
    return publicData;
  }
  saveRemoteData(STORAGE_KEYS.users, data.users || (data.profile ? [data.profile] : []));
  saveRemoteData(STORAGE_KEYS.products, data.products || []);
  saveRemoteData(STORAGE_KEYS.orders, data.orders || []);
  saveRemoteData(STORAGE_KEYS.rentals, data.rentals || []);
  saveRemoteData(STORAGE_KEYS.donations, data.donations || []);
  setCurrentUser(data.profile);
  return data;
}

function saveData(key, data) {
  const stateKey = key.replace('rewear_', '');
  remoteState[stateKey] = data;
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

function saveRemoteData(key, data) {
  return saveData(key, data);
}

function seedLocalDemoTransactions(user) {
  if (!user) return;
  const today = new Date();
  const dateAfterDays = days => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const createdAt = today.toISOString();
  const userKey = String(user.id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const sampleScope = {
    customerId: user.role === 'owner' ? 'DEMO_CUSTOMER' : user.id,
    ownerId: user.role === 'owner' ? user.id : null
  };
  const demoRows = {
    [STORAGE_KEYS.orders]: [
      { id: `DEMO_ORDER_${userKey}_1`, ...sampleScope, productId: 'DEMO_FLORAL_DRESS', amount: 2200, address: user.address || '', phone: user.phone || '', status: 'Pending', createdAt },
      { id: `DEMO_ORDER_${userKey}_2`, ...sampleScope, productId: 'DEMO_OCCASION_DRESS', amount: 3400, address: user.address || '', phone: user.phone || '', status: 'Confirmed', createdAt },
      { id: `DEMO_ORDER_${userKey}_3`, ...sampleScope, productId: 'DEMO_SUMMER_DRESS', amount: 2100, address: user.address || '', phone: user.phone || '', status: 'Completed', createdAt }
    ],
    [STORAGE_KEYS.rentals]: [
      { id: `DEMO_RENTAL_${userKey}_1`, ...sampleScope, productId: 'DEMO_OCCASION_DRESS', startDate: dateAfterDays(7), endDate: dateAfterDays(10), rentalPrice: 350, deposit: 700, totalAmount: 1750, status: 'Pending', createdAt },
      { id: `DEMO_RENTAL_${userKey}_2`, ...sampleScope, productId: 'DEMO_FLORAL_DRESS', startDate: dateAfterDays(12), endDate: dateAfterDays(15), rentalPrice: 300, deposit: 600, totalAmount: 1500, status: 'Confirmed', createdAt },
      { id: `DEMO_RENTAL_${userKey}_3`, ...sampleScope, productId: 'DEMO_SUMMER_DRESS', startDate: dateAfterDays(18), endDate: dateAfterDays(20), rentalPrice: 280, deposit: 560, totalAmount: 1120, status: 'Returned', createdAt }
    ],
    [STORAGE_KEYS.donations]: [
      { id: `DEMO_DONATION_${userKey}_1`, ...sampleScope, productId: 'DEMO_SUMMER_DRESS', productName: 'Summer Dress', status: 'Pending', createdAt },
      { id: `DEMO_DONATION_${userKey}_2`, ...sampleScope, productId: 'DEMO_FLORAL_DRESS', productName: 'Floral Dress', status: 'Approved', createdAt },
      { id: `DEMO_DONATION_${userKey}_3`, ...sampleScope, productId: 'DEMO_OCCASION_DRESS', productName: 'Occasion Dress', status: 'Completed', createdAt }
    ]
  };

  Object.entries(demoRows).forEach(([key, rows]) => {
    const existing = getData(key);
    const existingIds = new Set(existing.map(item => String(item.id)));
    const missing = rows.filter(item => !existingIds.has(String(item.id)));
    if (missing.length) saveData(key, [...existing, ...missing]);
  });
}

function getData(key, fallback = []) {
  const stateKey = key.replace('rewear_', '');
  if (!Array.isArray(remoteState[stateKey])) {
    remoteState[stateKey] = readStoredData(key);
  }
  return Array.isArray(remoteState[stateKey]) ? remoteState[stateKey] : fallback;
}

function addData(key, item) {
  const items = getData(key, []);
  items.push(item);
  saveData(key, items);
  return item;
}

function updateData(key, id, updatedItem) {
  const items = getData(key, []);
  const index = items.findIndex(item => String(item.id) === String(id));

  if (index === -1) {
    return null;
  }

  items[index] = { ...items[index], ...updatedItem };
  saveData(key, items);
  return items[index];
}

function deleteData(key, id) {
  const items = getData(key, []);
  const filtered = items.filter(item => String(item.id) !== String(id));
  saveData(key, filtered);
  return filtered;
}

function clearData(key) {
  saveData(key, []);
}

function makeId(prefix = 'ID') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}
