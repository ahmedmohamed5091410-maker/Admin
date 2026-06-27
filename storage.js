/* Client-Side Storage Database System */

const KEYS = {
  USERS: 'admin_dashboard_users',
  PRODUCTS: 'admin_dashboard_products',
  ORDERS: 'admin_dashboard_orders',
  MESSAGES: 'admin_dashboard_messages',
  NOTIFICATIONS: 'admin_dashboard_notifications',
  SETTINGS: 'admin_dashboard_settings',
  CURRENT_USER: 'admin_dashboard_current_user'
};

// Seeding Mock Data
const MOCK_USERS = [
  { id: 'usr-1', name: 'Olivia Ryhe', email: 'olivia@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80', role: 'Administrator', status: 'active', joinDate: '2025-01-12' },
  { id: 'usr-2', name: 'Phoenix Baker', email: 'phoenix@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80', role: 'Editor', status: 'active', joinDate: '2025-02-18' },
  { id: 'usr-3', name: 'Lana Steiner', email: 'lana@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80', role: 'Viewer', status: 'inactive', joinDate: '2025-03-05' },
  { id: 'usr-4', name: 'Demi Wilkinson', email: 'demi@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&fit=crop&q=80', role: 'Editor', status: 'active', joinDate: '2025-03-24' },
  { id: 'usr-5', name: 'Candice Wu', email: 'candice@example.com', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&fit=crop&q=80', role: 'Administrator', status: 'active', joinDate: '2025-04-01' },
  { id: 'usr-6', name: 'Drew Cano', email: 'drew@example.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80', role: 'Editor', status: 'inactive', joinDate: '2025-05-15' },
  { id: 'usr-7', name: 'Natali Craig', email: 'natali@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80', role: 'Viewer', status: 'active', joinDate: '2025-06-10' }
];

const MOCK_PRODUCTS = [
  { id: 'prd-1', name: 'Premium Leather Backpack', category: 'Accessories', price: 129.99, stock: 45, status: 'in-stock', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&fit=crop&q=80' },
  { id: 'prd-2', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.99, stock: 12, status: 'low-stock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&fit=crop&q=80' },
  { id: 'prd-3', name: 'Ergonomic Office Chair', category: 'Furniture', price: 349.00, stock: 0, status: 'out-of-stock', image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=200&fit=crop&q=80' },
  { id: 'prd-4', name: 'Mechanical Gaming Keyboard', category: 'Electronics', price: 89.95, stock: 85, status: 'in-stock', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&fit=crop&q=80' },
  { id: 'prd-5', name: 'Minimalist Wall Clock', category: 'Home Decor', price: 45.00, stock: 3, status: 'low-stock', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=200&fit=crop&q=80' },
  { id: 'prd-6', name: 'Insulated Stainless Flask', category: 'Accessories', price: 24.99, stock: 120, status: 'in-stock', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&fit=crop&q=80' }
];

const MOCK_ORDERS = [
  { id: 'ord-1001', customerId: 'usr-1', customerName: 'Olivia Ryhe', items: '1x Wireless Headphones', total: 299.99, status: 'completed', date: '2026-06-25T14:32:00Z', paymentStatus: 'paid', shippingDetails: '123 Pine St, San Francisco, CA' },
  { id: 'ord-1002', customerId: 'usr-3', customerName: 'Lana Steiner', items: '2x Leather Backpack, 1x Flask', total: 284.97, status: 'processing', date: '2026-06-26T09:15:00Z', paymentStatus: 'paid', shippingDetails: '456 Oak Ave, Seattle, WA' },
  { id: 'ord-1003', customerId: 'usr-4', customerName: 'Demi Wilkinson', items: '1x Ergonomic Chair', total: 349.00, status: 'pending', date: '2026-06-27T10:45:00Z', paymentStatus: 'unpaid', shippingDetails: '789 Maple Rd, Chicago, IL' },
  { id: 'ord-1004', customerId: 'usr-6', customerName: 'Drew Cano', items: '1x Gaming Keyboard', total: 89.95, status: 'cancelled', date: '2026-06-24T18:20:00Z', paymentStatus: 'refunded', shippingDetails: '101 Cedar Ln, Austin, TX' },
  { id: 'ord-1005', customerId: 'usr-2', customerName: 'Phoenix Baker', items: '1x Wall Clock, 1x Flask', total: 69.99, status: 'completed', date: '2026-06-23T11:05:00Z', paymentStatus: 'paid', shippingDetails: '202 Birch Blvd, Denver, CO' }
];

const MOCK_MESSAGES = [
  { id: 'msg-1', senderId: 'usr-2', senderName: 'Phoenix Baker', senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80', messageText: 'Hi Olivia! I just uploaded the layout draft for review.', timestamp: '2026-06-27T10:30:00Z', read: false },
  { id: 'msg-2', senderId: 'usr-4', senderName: 'Demi Wilkinson', senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&fit=crop&q=80', messageText: 'Can we schedule the sync call for tomorrow at 2 PM EST?', timestamp: '2026-06-27T08:15:00Z', read: true },
  { id: 'msg-3', senderId: 'usr-5', senderName: 'Candice Wu', senderAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&fit=crop&q=80', messageText: 'Database migration is complete. No errors reported.', timestamp: '2026-06-26T17:40:00Z', read: true }
];

const MOCK_NOTIFICATIONS = [
  { id: 'ntf-1', title: 'New order received', message: 'Order ord-1003 has been placed by Demi Wilkinson.', time: '2026-06-27T10:45:00Z', read: false, category: 'order' },
  { id: 'ntf-2', title: 'Database Backup Complete', message: 'System backed up successfully to S3 cloud storage.', time: '2026-06-27T00:00:00Z', read: false, category: 'info' },
  { id: 'ntf-3', title: 'Low inventory alert', message: 'Minimalist Wall Clock (prd-5) is running low in stock.', time: '2026-06-26T14:30:00Z', read: true, category: 'warning' },
  { id: 'ntf-4', title: 'Security audit alert', message: 'Successful admin login detected from a new IP location.', time: '2026-06-25T09:12:00Z', read: true, category: 'security' }
];

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    browser: true,
    marketing: false
  },
  security: {
    twoFactor: false,
    sessionTimeout: '60'
  }
};

const DEFAULT_ADMIN = {
  id: 'usr-1',
  name: 'Olivia Ryhe',
  email: 'admin@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
  role: 'Administrator'
};

// Generic read/write functions
export function dbGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return null;
  }
}

export function dbSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Database Seeder Initializer
export function initDB() {
  if (!dbGet(KEYS.USERS)) dbSet(KEYS.USERS, MOCK_USERS);
  if (!dbGet(KEYS.PRODUCTS)) dbSet(KEYS.PRODUCTS, MOCK_PRODUCTS);
  if (!dbGet(KEYS.ORDERS)) dbSet(KEYS.ORDERS, MOCK_ORDERS);
  if (!dbGet(KEYS.MESSAGES)) dbSet(KEYS.MESSAGES, MOCK_MESSAGES);
  if (!dbGet(KEYS.NOTIFICATIONS)) dbSet(KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  if (!dbGet(KEYS.SETTINGS)) dbSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
  
  // Set current user as administrator if not logged in
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    dbSet(KEYS.CURRENT_USER, DEFAULT_ADMIN);
  }
}

// Initialize on import
initDB();

/* API INTERFACES */

// 1. Users CRUD
export const Users = {
  getAll: () => dbGet(KEYS.USERS) || [],
  getById: (id) => Users.getAll().find(u => u.id === id),
  save: (data) => dbSet(KEYS.USERS, data),
  add: (user) => {
    const list = Users.getAll();
    const newUser = { id: `usr-${Date.now()}`, joinDate: new Date().toISOString().split('T')[0], ...user };
    list.unshift(newUser);
    Users.save(list);
    return newUser;
  },
  update: (id, updatedFields) => {
    const list = Users.getAll();
    const index = list.findIndex(u => u.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      Users.save(list);
      return list[index];
    }
    return null;
  },
  delete: (id) => {
    const list = Users.getAll();
    const filtered = list.filter(u => u.id !== id);
    Users.save(filtered);
    return true;
  }
};

// 2. Products CRUD
export const Products = {
  getAll: () => dbGet(KEYS.PRODUCTS) || [],
  getById: (id) => Products.getAll().find(p => p.id === id),
  save: (data) => dbSet(KEYS.PRODUCTS, data),
  add: (prod) => {
    const list = Products.getAll();
    const newProd = { id: `prd-${Date.now()}`, ...prod };
    list.unshift(newProd);
    Products.save(list);
    return newProd;
  },
  update: (id, updatedFields) => {
    const list = Products.getAll();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      Products.save(list);
      return list[index];
    }
    return null;
  },
  delete: (id) => {
    const list = Products.getAll();
    const filtered = list.filter(p => p.id !== id);
    Products.save(filtered);
    return true;
  }
};

// 3. Orders CRUD
export const Orders = {
  getAll: () => dbGet(KEYS.ORDERS) || [],
  getById: (id) => Orders.getAll().find(o => o.id === id),
  save: (data) => dbSet(KEYS.ORDERS, data),
  add: (order) => {
    const list = Orders.getAll();
    const newOrder = { id: `ord-${Math.floor(1000 + Math.random() * 9000)}`, date: new Date().toISOString(), ...order };
    list.unshift(newOrder);
    Orders.save(list);
    return newOrder;
  },
  update: (id, updatedFields) => {
    const list = Orders.getAll();
    const index = list.findIndex(o => o.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      Orders.save(list);
      return list[index];
    }
    return null;
  }
};

// 4. Messages API
export const Messages = {
  getAll: () => dbGet(KEYS.MESSAGES) || [],
  save: (data) => dbSet(KEYS.MESSAGES, data),
  add: (msg) => {
    const list = Messages.getAll();
    const newMsg = { id: `msg-${Date.now()}`, timestamp: new Date().toISOString(), read: false, ...msg };
    list.unshift(newMsg);
    Messages.save(list);
    return newMsg;
  },
  markRead: (id) => {
    const list = Messages.getAll();
    const msg = list.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      Messages.save(list);
    }
  }
};

// 5. Notifications API
export const Notifications = {
  getAll: () => dbGet(KEYS.NOTIFICATIONS) || [],
  save: (data) => dbSet(KEYS.NOTIFICATIONS, data),
  add: (notif) => {
    const list = Notifications.getAll();
    const newNotif = { id: `ntf-${Date.now()}`, time: new Date().toISOString(), read: false, ...notif };
    list.unshift(newNotif);
    Notifications.save(list);
    return newNotif;
  },
  markRead: (id) => {
    const list = Notifications.getAll();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      Notifications.save(list);
    }
  },
  markAllRead: () => {
    const list = Notifications.getAll();
    list.forEach(n => n.read = true);
    Notifications.save(list);
  },
  delete: (id) => {
    const list = Notifications.getAll();
    const filtered = list.filter(n => n.id !== id);
    Notifications.save(filtered);
    return true;
  }
};

// 6. Settings & Current User API
export const Settings = {
  get: () => dbGet(KEYS.SETTINGS) || DEFAULT_SETTINGS,
  save: (data) => dbSet(KEYS.SETTINGS, data)
};

export const Auth = {
  getCurrentUser: () => dbGet(KEYS.CURRENT_USER),
  setCurrentUser: (user) => dbSet(KEYS.CURRENT_USER, user),
  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};
