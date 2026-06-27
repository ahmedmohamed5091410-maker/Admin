/* Application Bootstrap - Shared Shell Management */

import { Auth, Notifications, Messages, Settings, Users, Products, Orders } from './storage.js';
import { updateAllChartsTheme } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Authorization Access Check
  const currentUser = Auth.getCurrentUser();
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  
  if (page !== "login.html" && page !== "404.html" && !currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  // If user is already logged in and tries to access login.html, redirect to dashboard
  if (page === "login.html" && currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // 2. Perform Dynamic Component Injection
  if (page !== "login.html" && page !== "404.html") {
    injectLayout(currentUser);
    initializeTheme();
    initializeSidebar();
    initializeDropdowns();
    initializeCommandPalette();
    initializeBackToTop();
  }
});

// Layout Injection Function
function injectLayout(user) {
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
  const headerPlaceholder = document.getElementById('header-placeholder');
  
  if (sidebarPlaceholder) {
    sidebarPlaceholder.outerHTML = `
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-logo">A</div>
          <span class="sidebar-name">Antigravity</span>
        </div>
        <nav class="sidebar-menu">
          <div class="sidebar-menu-title">Core</div>
          <a href="index.html" class="sidebar-link" data-page="index.html"><i data-lucide="layout-dashboard"></i><span class="sidebar-link-text">Dashboard</span></a>
          <a href="analytics.html" class="sidebar-link" data-page="analytics.html"><i data-lucide="bar-chart-3"></i><span class="sidebar-link-text">Analytics</span></a>
          
          <div class="sidebar-menu-title">Management</div>
          <a href="users.html" class="sidebar-link" data-page="users.html"><i data-lucide="users"></i><span class="sidebar-link-text">Users</span></a>
          <a href="products.html" class="sidebar-link" data-page="products.html"><i data-lucide="package"></i><span class="sidebar-link-text">Products</span></a>
          <a href="orders.html" class="sidebar-link" data-page="orders.html"><i data-lucide="shopping-cart"></i><span class="sidebar-link-text">Orders</span></a>
          <a href="customers.html" class="sidebar-link" data-page="customers.html"><i data-lucide="user-check"></i><span class="sidebar-link-text">Customers</span></a>
          
          <div class="sidebar-menu-title">Apps</div>
          <a href="messages.html" class="sidebar-link" data-page="messages.html">
            <i data-lucide="mail"></i><span class="sidebar-link-text">Messages</span>
            <span class="badge badge-danger badge-msg-count" style="margin-left: auto; display: none;">0</span>
          </a>
          <a href="notifications.html" class="sidebar-link" data-page="notifications.html">
            <i data-lucide="bell"></i><span class="sidebar-link-text">Notifications</span>
            <span class="badge badge-danger badge-notif-count" style="margin-left: auto; display: none;">0</span>
          </a>
          <a href="calendar.html" class="sidebar-link" data-page="calendar.html"><i data-lucide="calendar"></i><span class="sidebar-link-text">Calendar</span></a>
          
          <div class="sidebar-menu-title">User</div>
          <a href="profile.html" class="sidebar-link" data-page="profile.html"><i data-lucide="user"></i><span class="sidebar-link-text">Profile</span></a>
          <a href="settings.html" class="sidebar-link" data-page="settings.html"><i data-lucide="settings"></i><span class="sidebar-link-text">Settings</span></a>
        </nav>
        <div class="sidebar-footer">
          <button class="btn btn-secondary btn-block" id="sidebar-logout-btn" style="width: 100%; justify-content: flex-start; gap: 0.75rem;">
            <i data-lucide="log-out"></i>
            <span class="sidebar-link-text">Log Out</span>
          </button>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
  }
  
  if (headerPlaceholder) {
    // Get page title from document.title
    const docTitle = document.title.split(' - ')[0] || 'Dashboard';
    
    headerPlaceholder.outerHTML = `
      <header class="header">
        <div class="flex-row">
          <button class="btn btn-icon menu-toggle-btn" id="mobile-menu-toggle" style="display: none;">
            <i data-lucide="menu"></i>
          </button>
          <button class="btn btn-icon sidebar-toggle-btn" id="sidebar-collapse-toggle">
            <i data-lucide="chevron-left" id="collapse-icon"></i>
          </button>
          <h1 class="header-title" id="page-header-title" style="font-size: 1.25rem; font-weight: 700;">${docTitle}</h1>
        </div>
        
        <div class="header-actions">
          <div class="search-box" id="header-search-trigger" style="cursor: pointer;">
            <i data-lucide="search"></i>
            <input type="text" class="form-control" placeholder="Search... (Ctrl + K)" readonly style="cursor: pointer;">
          </div>
          
          <button class="btn btn-icon" id="theme-toggle-btn" title="Toggle Theme">
            <i data-lucide="sun" class="theme-icon-light" style="display: none;"></i>
            <i data-lucide="moon" class="theme-icon-dark"></i>
          </button>
          
          <div class="dropdown-container" id="notif-dropdown-container">
            <button class="btn btn-icon" id="notif-dropdown-btn">
              <i data-lucide="bell"></i>
              <span class="badge-indicator pulse-indicator" id="notif-indicator" style="display: none;"></span>
            </button>
            <div class="dropdown-menu">
              <div class="dropdown-header flex-between">
                <span>Notifications</span>
                <button id="notif-clear-all" style="font-size: 0.75rem; color: var(--primary); background: none; border: none; cursor: pointer; font-weight:600;">Mark Read</button>
              </div>
              <div class="dropdown-list" id="notif-dropdown-list">
                <!-- Injected via JS -->
              </div>
              <div class="dropdown-item" style="justify-content: center; border-top: 1px solid var(--border-color); padding: 0.5rem;">
                <a href="notifications.html" style="font-size: 0.8rem; font-weight: 600; color: var(--primary); text-decoration: none;">View All</a>
              </div>
            </div>
          </div>

          <div class="dropdown-container" id="msg-dropdown-container">
            <button class="btn btn-icon" id="msg-dropdown-btn">
              <i data-lucide="mail"></i>
              <span class="badge-indicator pulse-indicator" id="msg-indicator" style="display: none;"></span>
            </button>
            <div class="dropdown-menu">
              <div class="dropdown-header">Recent Messages</div>
              <div class="dropdown-list" id="msg-dropdown-list">
                <!-- Injected via JS -->
              </div>
              <div class="dropdown-item" style="justify-content: center; border-top: 1px solid var(--border-color); padding: 0.5rem;">
                <a href="messages.html" style="font-size: 0.8rem; font-weight: 600; color: var(--primary); text-decoration: none;">Go to Inbox</a>
              </div>
            </div>
          </div>
          
          <div class="dropdown-container" id="user-dropdown-container">
            <button class="btn" id="user-dropdown-btn" style="background: none; border: none; padding: 0; display: flex; align-items: center;">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="Avatar" class="avatar" id="header-user-avatar">
            </button>
            <div class="dropdown-menu" style="width: 200px;">
              <div class="dropdown-header">
                <div id="header-user-name" style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
                <div id="header-user-email" style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.email}</div>
              </div>
              <a href="profile.html" class="dropdown-item"><i data-lucide="user" style="width: 16px;"></i> My Profile</a>
              <a href="settings.html" class="dropdown-item"><i data-lucide="settings" style="width: 16px;"></i> Settings</a>
              <button class="dropdown-item" id="header-logout-btn" style="width: 100%; border: none; text-align: left; background: none; color: var(--danger); font-family: inherit; font-size: inherit; cursor: pointer;">
                <i data-lucide="log-out" style="width: 16px;"></i> Log Out
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  }
  
  // Inject back to top button
  const topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.id = 'back-to-top-btn';
  topBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
  document.body.appendChild(topBtn);

  // Injections for Search modal
  const searchModal = document.createElement('div');
  searchModal.className = 'modal-overlay';
  searchModal.id = 'command-palette-overlay';
  searchModal.innerHTML = `
    <div class="modal command-palette">
      <div class="command-palette-search">
        <i data-lucide="search"></i>
        <input type="text" id="command-palette-input" placeholder="Search pages, users, products, orders..." autocomplete="off">
        <span class="command-palette-shortcut" style="margin-left:auto;">ESC</span>
      </div>
      <div class="command-palette-results" id="command-palette-results">
        <!-- Results render here -->
      </div>
    </div>
  `;
  document.body.appendChild(searchModal);

  // Highlight active link
  const path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  if (page === '') page = 'index.html';
  const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Bind Logouts
  const performLogout = () => {
    Auth.logout();
    window.location.href = 'login.html';
  };
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', performLogout);
  document.getElementById('header-logout-btn')?.addEventListener('click', performLogout);
  
  // Create icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 3. Theme Manager initialization
function initializeTheme() {
  const currentTheme = Settings.get().theme || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (!themeToggle) return;
  
  const sunIcon = themeToggle.querySelector('.theme-icon-light');
  const moonIcon = themeToggle.querySelector('.theme-icon-dark');
  
  const applyThemeUI = (theme) => {
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };
  
  applyThemeUI(currentTheme);
  
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    applyThemeUI(nextTheme);
    
    // Save theme settings
    const currentSettings = Settings.get();
    currentSettings.theme = nextTheme;
    Settings.save(currentSettings);
    
    // Update charts if present
    updateAllChartsTheme();
  });
}

// 4. Sidebar Toggle collapse and overlay management
function initializeSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const collapseToggle = document.getElementById('sidebar-collapse-toggle');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (!sidebar) return;
  
  // Load initial collapsed state
  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    const icon = collapseToggle.querySelector('i');
    if (icon) icon.setAttribute('data-lucide', 'chevron-right');
  }

  collapseToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const collapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar_collapsed', collapsed);
    
    // Toggle chevron icon direction
    const icon = collapseToggle.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', collapsed ? 'chevron-right' : 'chevron-left');
      if (window.lucide) window.lucide.createIcons();
    }
  });

  mobileToggle?.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
}

// 5. Initialize Notification / Messages Dropdowns in Header
function initializeDropdowns() {
  const dropBtnIds = ['notif-dropdown-btn', 'msg-dropdown-btn', 'user-dropdown-btn'];
  
  dropBtnIds.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.parentElement;
      const isActive = parent.classList.contains('active');
      
      // Close all dropdowns first
      document.querySelectorAll('.dropdown-container').forEach(dc => dc.classList.remove('active'));
      
      if (!isActive) {
        parent.classList.add('active');
        if (id === 'notif-dropdown-btn') renderNotificationDropdown();
        if (id === 'msg-dropdown-btn') renderMessagesDropdown();
      }
    });
  });

  // Global close dropdown click event
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-container').forEach(dc => dc.classList.remove('active'));
  });

  // Load badges
  updateHeaderBadges();
  
  // Clear notifications event
  document.getElementById('notif-clear-all')?.addEventListener('click', (e) => {
    e.stopPropagation();
    Notifications.markAllRead();
    updateHeaderBadges();
    renderNotificationDropdown();
  });
}

export function updateHeaderBadges() {
  const notifs = Notifications.getAll();
  const unreadNotifs = notifs.filter(n => !n.read).length;
  const notifIndicator = document.getElementById('notif-indicator');
  const sidebarNotifCount = document.querySelector('.badge-notif-count');
  
  if (notifIndicator) {
    notifIndicator.style.display = unreadNotifs > 0 ? 'block' : 'none';
  }
  if (sidebarNotifCount) {
    sidebarNotifCount.style.display = unreadNotifs > 0 ? 'inline-block' : 'none';
    sidebarNotifCount.innerText = unreadNotifs;
  }

  const msgs = Messages.getAll();
  const unreadMsgs = msgs.filter(m => !m.read).length;
  const msgIndicator = document.getElementById('msg-indicator');
  const sidebarMsgCount = document.querySelector('.badge-msg-count');
  
  if (msgIndicator) {
    msgIndicator.style.display = unreadMsgs > 0 ? 'block' : 'none';
  }
  if (sidebarMsgCount) {
    sidebarMsgCount.style.display = unreadMsgs > 0 ? 'inline-block' : 'none';
    sidebarMsgCount.innerText = unreadMsgs;
  }
}

function renderNotificationDropdown() {
  const listContainer = document.getElementById('notif-dropdown-list');
  if (!listContainer) return;
  
  const notifs = Notifications.getAll().slice(0, 5); // top 5
  if (notifs.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No notifications found
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = notifs.map(n => {
    let icon = 'info';
    let iconClass = 'info';
    if (n.category === 'warning') { icon = 'alert-triangle'; iconClass = 'warning'; }
    if (n.category === 'order') { icon = 'shopping-bag'; iconClass = 'success'; }
    if (n.category === 'security') { icon = 'shield-alert'; iconClass = 'danger'; }

    return `
      <div class="dropdown-item ${n.read ? '' : 'unread'}" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;" data-notif-id="${n.id}">
        <div class="flex-row" style="width:100%; gap:0.5rem; align-items: flex-start;">
          <span class="badge badge-${iconClass}" style="padding: 4px;"><i data-lucide="${icon}" style="width:14px; height:14px;"></i></span>
          <div style="flex:1;">
            <div style="font-size: 0.85rem; font-weight: 600;">${n.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">${new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) window.lucide.createIcons();

  // Add click to read event
  listContainer.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.notifId;
      Notifications.markRead(id);
      updateHeaderBadges();
      renderNotificationDropdown();
    });
  });
}

function renderMessagesDropdown() {
  const listContainer = document.getElementById('msg-dropdown-list');
  if (!listContainer) return;
  
  const msgs = Messages.getAll().slice(0, 3); // top 3
  if (msgs.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No unread messages
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = msgs.map(m => `
    <a href="messages.html?chat=${m.senderId}" class="dropdown-item" style="gap: 0.75rem;">
      <img src="${m.senderAvatar}" alt="avatar" class="avatar" style="width: 32px; height: 32px;">
      <div style="flex: 1; min-width: 0;">
        <div class="flex-between">
          <span style="font-size: 0.85rem; font-weight: 600;">${m.senderName}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
          ${m.messageText}
        </div>
      </div>
    </a>
  `).join('');
}

// 6. Command Palette Command Box Search trigger
function initializeCommandPalette() {
  const trigger = document.getElementById('header-search-trigger');
  const overlay = document.getElementById('command-palette-overlay');
  const input = document.getElementById('command-palette-input');
  const results = document.getElementById('command-palette-results');
  
  if (!overlay || !input) return;

  const showPalette = () => {
    overlay.classList.add('active');
    input.value = '';
    renderDefaultCommands();
    setTimeout(() => input.focus(), 100);
  };

  const hidePalette = () => {
    overlay.classList.remove('active');
  };

  trigger?.addEventListener('click', showPalette);

  // Keyboard Shortcuts Bind
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      showPalette();
    }
    if (e.key === 'Escape') {
      hidePalette();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hidePalette();
  });

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query === '') {
      renderDefaultCommands();
      return;
    }
    
    // Search datasets
    const filteredUsers = Users.getAll().filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)).slice(0, 3);
    const filteredProds = Products.getAll().filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)).slice(0, 3);
    const filteredOrders = Orders.getAll().filter(o => o.id.toLowerCase().includes(query) || o.customerName.toLowerCase().includes(query)).slice(0, 3);

    let html = '';

    if (filteredUsers.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); padding: 8px 16px;">Users</div>`;
      filteredUsers.forEach(u => {
        html += `
          <div class="command-palette-item" onclick="window.location.href='users.html?search=${u.name}'">
            <span style="font-size:0.9rem; font-weight:500;">${u.name} (${u.role})</span>
            <span class="command-palette-shortcut">User</span>
          </div>
        `;
      });
    }

    if (filteredProds.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); padding: 8px 16px;">Products</div>`;
      filteredProds.forEach(p => {
        html += `
          <div class="command-palette-item" onclick="window.location.href='products.html?search=${p.name}'">
            <span style="font-size:0.9rem; font-weight:500;">${p.name} - $${p.price}</span>
            <span class="command-palette-shortcut">Product</span>
          </div>
        `;
      });
    }

    if (filteredOrders.length > 0) {
      html += `<div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); padding: 8px 16px;">Orders</div>`;
      filteredOrders.forEach(o => {
        html += `
          <div class="command-palette-item" onclick="window.location.href='orders.html?search=${o.id}'">
            <span style="font-size:0.9rem; font-weight:500;">Order #${o.id} - ${o.customerName}</span>
            <span class="command-palette-shortcut">Order</span>
          </div>
        `;
      });
    }

    if (html === '') {
      results.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">No search results for "${query}"</div>`;
    } else {
      results.innerHTML = html;
    }
  });

  function renderDefaultCommands() {
    results.innerHTML = `
      <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); padding: 8px 16px;">Navigation Shortcuts</div>
      <div class="command-palette-item" onclick="window.location.href='index.html'">
        <span>Go to Dashboard</span>
        <span class="command-palette-shortcut">G + D</span>
      </div>
      <div class="command-palette-item" onclick="window.location.href='analytics.html'">
        <span>Go to Analytics</span>
        <span class="command-palette-shortcut">G + A</span>
      </div>
      <div class="command-palette-item" onclick="window.location.href='users.html'">
        <span>Manage Users</span>
        <span class="command-palette-shortcut">G + U</span>
      </div>
      <div class="command-palette-item" onclick="window.location.href='products.html'">
        <span>Manage Inventory</span>
        <span class="command-palette-shortcut">G + P</span>
      </div>
      <div class="command-palette-item" onclick="window.location.href='orders.html'">
        <span>Manage Orders</span>
        <span class="command-palette-shortcut">G + O</span>
      </div>
      <div class="command-palette-item" onclick="window.location.href='settings.html'">
        <span>App Settings</span>
        <span class="command-palette-shortcut">G + S</span>
      </div>
    `;
  }
}

// 7. Back to Top Button
function initializeBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
window.updateHeaderBadges = updateHeaderBadges;
