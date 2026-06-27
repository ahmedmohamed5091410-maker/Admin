/* Dashboard Script - Controller */

import { Users, Products, Orders, Notifications } from './storage.js';
import { formatCurrency, formatDate, animateValue } from './utils.js';
import { drawAreaChart, drawDoughnutChart } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  // Set Date badge
  const dateBadge = document.getElementById('current-date-badge');
  if (dateBadge) {
    dateBadge.innerText = formatDate(new Date());
  }

  // Set User Name
  const welcomeName = document.getElementById('welcome-user-name');
  const sessionUser = JSON.parse(localStorage.getItem('admin_dashboard_current_user'));
  if (welcomeName && sessionUser) {
    welcomeName.innerText = sessionUser.name;
  }

  // Load and Animate Metrics
  loadMetrics();

  // Draw Charts
  initDashboardCharts();

  // Render lists
  renderLatestOrders();
  renderTopProducts();
  renderActivities();
  renderNotifications();

  // Initialize Drag & Drop Widgets
  initDragAndDrop();
});

// Calculate metrics and run count up animation
function loadMetrics() {
  const users = Users.getAll();
  const products = Products.getAll();
  const orders = Orders.getAll();
  
  // Aggregate revenue from completed orders
  const revenueTotal = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0) + 128450.00; // static base to look premium

  const salesVolume = orders.length + 15420; // static base + actual
  const activeOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'pending').length + 8;
  const customersCount = users.length + 1420;

  // Animate values
  animateValue(document.getElementById('stat-revenue'), 0, revenueTotal, 1200);
  animateValue(document.getElementById('stat-sales'), 0, salesVolume, 1200);
  animateValue(document.getElementById('stat-orders'), 0, activeOrdersCount, 1200);
  animateValue(document.getElementById('stat-customers'), 0, customersCount, 1200);
}

// Chart Initializations
function initDashboardCharts() {
  // 1. Revenue Area Chart
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const datasets = [
    {
      label: 'Revenue ($)',
      data: [8000, 9500, 11000, 10500, 13000, 12500, 14200, 15500, 16000, 17500, 19000, 21500],
      borderColor: 'rgba(99, 102, 241, 1)', // primary
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true
    },
    {
      label: 'Target ($)',
      data: [7500, 8500, 9500, 10500, 11500, 12500, 13500, 14500, 15500, 16500, 17500, 18500],
      borderColor: 'rgba(139, 92, 246, 0.5)', // violet muted
      backgroundColor: 'transparent',
      borderDash: [5, 5]
    }
  ];
  
  drawAreaChart('dashboard-revenue-chart', labels, datasets);

  // 2. Traffic Channels Doughnut
  const trafficLabels = ['Organic Search', 'Direct Traffic', 'Social Media', 'Referrals'];
  const trafficData = [45, 25, 20, 10];
  const trafficColors = [
    '#6366f1', // primary
    '#10b981', // success
    '#f59e0b', // warning
    '#3b82f6'  // info
  ];
  
  drawDoughnutChart('dashboard-traffic-chart', trafficLabels, trafficData, trafficColors);
}

// Render Table Rows
function renderLatestOrders() {
  const tableBody = document.getElementById('dashboard-orders-table');
  if (!tableBody) return;

  const orders = Orders.getAll().slice(0, 5); // display 5 orders
  
  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No orders found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = orders.map(o => {
    let statusClass = 'neutral';
    if (o.status === 'completed') statusClass = 'success';
    if (o.status === 'processing') statusClass = 'info';
    if (o.status === 'pending') statusClass = 'warning';
    if (o.status === 'cancelled') statusClass = 'danger';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--primary);">#${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.items}</td>
        <td>${formatCurrency(o.total)}</td>
        <td><span class="badge badge-${statusClass}">${o.status}</span></td>
      </tr>
    `;
  }).join('');
}

// Render Top Selling products with custom styling
function renderTopProducts() {
  const container = document.getElementById('dashboard-top-products');
  if (!container) return;

  const products = Products.getAll().slice(0, 3); // Get 3 products
  
  if (products.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">No inventory records</div>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="flex-row" style="align-items: center; justify-content: space-between;">
      <div class="flex-row" style="gap: 0.75rem;">
        <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;">
        <div>
          <div style="font-weight: 600; font-size: 0.85rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${p.category}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; font-size: 0.9rem;">${formatCurrency(p.price)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.stock} units left</div>
      </div>
    </div>
  `).join('');
}

// Render system activities timeline
function renderActivities() {
  const container = document.getElementById('dashboard-activities-timeline');
  if (!container) return;

  const logs = [
    { title: 'Database index rebuilt', time: '10 minutes ago', detail: 'Primary database optimized for write operations.' },
    { title: 'Billing system synchronized', time: '1 hour ago', detail: 'Stripe integrations parsed daily recurring invoices.' },
    { title: 'New administrator onboarded', time: '4 hours ago', detail: 'Drew Cano invited with Editor credentials.' }
  ];

  container.innerHTML = logs.map(l => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="flex-between">
          <span style="font-size: 0.85rem; font-weight: 600;">${l.title}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted);">${l.time}</span>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">${l.detail}</p>
      </div>
    </div>
  `).join('');
}

// Render recent dashboard notifications
function renderNotifications() {
  const container = document.getElementById('dashboard-notifications-list');
  if (!container) return;

  const notifs = Notifications.getAll().slice(0, 3);
  
  if (notifs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">No notification updates.</div>`;
    return;
  }

  container.innerHTML = notifs.map(n => {
    let borderStyle = 'var(--primary)';
    if (n.category === 'warning') borderStyle = 'var(--warning)';
    if (n.category === 'security') borderStyle = 'var(--danger)';
    if (n.category === 'order') borderStyle = 'var(--success)';

    return `
      <div style="background-color: var(--background); border-left: 3px solid ${borderStyle}; padding: 0.75rem 1rem; border-radius: var(--radius-xs); display:flex; flex-direction:column; gap:0.2rem;">
        <div style="font-weight: 600; font-size: 0.85rem;">${n.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${n.message}</div>
      </div>
    `;
  }).join('');
}

// Draggable widgets configurations
function initDragAndDrop() {
  const container = document.getElementById('stats-widgets-container');
  const widgets = document.querySelectorAll('.draggable-widget');
  
  if (!container) return;

  // Load layout from local storage
  const order = JSON.parse(localStorage.getItem('dashboard_widgets_order'));
  if (order) {
    const list = Array.from(widgets);
    order.forEach(id => {
      const widget = list.find(w => w.id === id);
      if (widget) container.appendChild(widget);
    });
  }

  widgets.forEach(widget => {
    widget.addEventListener('dragstart', (e) => {
      widget.classList.add('dragging');
      e.dataTransfer.setData('text/plain', widget.id);
    });

    widget.addEventListener('dragend', () => {
      widget.classList.remove('dragging');
      saveWidgetsLayout(container);
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    
    const afterElement = getDragAfterElement(container, e.clientX);
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.draggable-widget:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: -Infinity }).element;
}

function saveWidgetsLayout(container) {
  const currentWidgets = container.querySelectorAll('.draggable-widget');
  const ids = Array.from(currentWidgets).map(w => w.id);
  localStorage.setItem('dashboard_widgets_order', JSON.stringify(ids));
}
