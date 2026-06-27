/* Customers (CRM) Controller */

import { Users, Orders } from './storage.js';
import { searchCollection } from './search.js';
import { sortCollection, paginateCollection } from './filter.js';
import { formatCurrency, formatDate } from './utils.js';

// Controller State
let currentPage = 1;
const limit = 8;
let searchQuery = '';
let sortBy = 'name';

document.addEventListener('DOMContentLoaded', () => {
  renderCustomers();
  setupInteractionListeners();
});

// Build Customers list mapping User database to their orders spent value
function getCustomersDataset() {
  const users = Users.getAll();
  const orders = Orders.getAll();
  
  // Non-administrators are customers (or fallback to include all for demo)
  const customers = users.filter(u => u.role !== 'Administrator');
  
  return customers.map(c => {
    // Find matching orders
    const matches = orders.filter(o => o.customerId === c.id || o.customerName === c.name);
    
    // Sum spent
    const totalSpent = matches
      .filter(o => o.status === 'completed' || o.status === 'processing')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      ...c,
      totalSpent,
      orderCount: matches.length,
      orders: matches
    };
  });
}

function renderCustomers() {
  const dataset = getCustomersDataset();
  
  // Update CRM top summary statistics cards
  updateCRMStats(dataset);

  // 1. Search name or email
  let processed = searchCollection(dataset, searchQuery, ['name', 'email']);
  
  // 2. Sort
  // 'totalSpent' sorts high to low by default
  const order = sortBy === 'totalSpent' || sortBy === 'orderCount' ? 'desc' : 'asc';
  processed = sortCollection(processed, sortBy, order);
  
  // 3. Paginate
  const { items, pagination } = paginateCollection(processed, currentPage, limit);

  // Render cards
  const container = document.getElementById('customers-cards-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
        No customer profiles match search.
      </div>
    `;
    updatePaginationInfo(pagination);
    return;
  }

  container.innerHTML = items.map(c => `
    <div class="card customer-card animate-fade-in-up" data-customer-id="${c.id}">
      <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="avatar" class="avatar" style="width: 56px; height: 56px; margin-bottom: 0.25rem;">
      <h4 style="font-weight: 700; font-size: 0.95rem;">${c.name}</h4>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: -4px;">${c.email}</p>
      
      <div class="flex-row" style="gap: 1.5rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); width: 100%; padding: 0.5rem 0; justify-content: center; margin-top: 0.5rem;">
        <div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total Spent</div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary);">${formatCurrency(c.totalSpent)}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Orders</div>
          <div style="font-weight: 700; font-size: 0.9rem;">${c.orderCount}</div>
        </div>
      </div>
      
      <div class="flex-between" style="width: 100%; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
        <span>Joined: ${formatDate(c.joinDate)}</span>
        <span class="badge badge-${c.status === 'active' ? 'success' : 'neutral'}">${c.status}</span>
      </div>
    </div>
  `).join('');

  updatePaginationInfo(pagination);
  renderPaginationControls(pagination);
}

// Sum cards values
function updateCRMStats(dataset) {
  const totalSpan = document.getElementById('crm-total-customers');
  const avgSpan = document.getElementById('crm-avg-ltv');
  const retentionSpan = document.getElementById('crm-retention-rate');

  if (totalSpan) totalSpan.innerText = dataset.length;
  
  if (avgSpan) {
    const totalSpentSum = dataset.reduce((sum, c) => sum + c.totalSpent, 0);
    const avg = dataset.length > 0 ? totalSpentSum / dataset.length : 0;
    avgSpan.innerText = formatCurrency(avg);
  }

  if (retentionSpan) {
    retentionSpan.innerText = '78.5%'; // premium static metric representation
  }
}

// Update pagination details
function updatePaginationInfo(p) {
  const info = document.getElementById('pagination-info');
  if (info) {
    info.innerText = `Showing ${p.startIndex}-${p.endIndex} of ${p.totalItems} customers`;
  }
}

// Generate pagination button nodes
function renderPaginationControls(p) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;

  let html = '';
  
  html += `
    <button class="pagination-btn" ${p.currentPage === 1 ? 'disabled' : ''} data-page="${p.currentPage - 1}">
      <i data-lucide="chevron-left" style="width: 14px;"></i>
    </button>
  `;

  for (let i = 1; i <= p.totalPages; i++) {
    html += `
      <button class="pagination-btn ${p.currentPage === i ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="pagination-btn" ${p.currentPage === p.totalPages ? 'disabled' : ''} data-page="${p.currentPage + 1}">
      <i data-lucide="chevron-right" style="width: 14px;"></i>
    </button>
  `;

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();

  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderCustomers();
    });
  });
}

// Setup Filters Listeners
function setupInteractionListeners() {
  // Search input
  const searchInput = document.getElementById('customers-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderCustomers();
  });

  // Sort Selector dropdown
  document.getElementById('customers-sort')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    currentPage = 1;
    renderCustomers();
  });

  // Card click trigger -> open timeline history drawer
  document.getElementById('customers-cards-container')?.addEventListener('click', (e) => {
    const card = e.target.closest('.customer-card');
    if (!card) return;
    
    const id = card.dataset.customerId;
    openCustomerDrawer(id);
  });

  // Close Drawer click
  document.getElementById('close-drawer-btn')?.addEventListener('click', closeCustomerDrawer);
  document.getElementById('crm-drawer-overlay')?.addEventListener('click', closeCustomerDrawer);
}

// Side drawer details slide out logic
function openCustomerDrawer(id) {
  const dataset = getCustomersDataset();
  const c = dataset.find(cust => cust.id === id);
  if (!c) return;

  document.getElementById('drawer-avatar').src = c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
  document.getElementById('drawer-name').innerText = c.name;
  document.getElementById('drawer-email').innerText = c.email;

  // Timeline render
  const timeline = document.getElementById('drawer-purchase-timeline');
  if (timeline) {
    if (c.orders.length === 0) {
      timeline.innerHTML = `<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding-top:1rem;">No transactions recorded.</div>`;
    } else {
      timeline.innerHTML = c.orders.map(o => `
        <div class="timeline-item">
          <div class="timeline-dot" style="background-color:${o.status === 'completed' ? 'var(--success)' : o.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)'};"></div>
          <div class="timeline-content" style="padding:0.75rem;">
            <div class="flex-between">
              <span style="font-weight:600; font-size:0.8rem; color:var(--primary);">Order #${o.id}</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${formatDate(o.date)}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${o.items}</div>
            <div style="font-weight:700; font-size:0.8rem; margin-top:4px; text-align:right;">${formatCurrency(o.total)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  document.getElementById('crm-purchase-drawer').classList.add('active');
  document.getElementById('crm-drawer-overlay').classList.add('active');
}

function closeCustomerDrawer() {
  document.getElementById('crm-purchase-drawer').classList.remove('active');
  document.getElementById('crm-drawer-overlay').classList.remove('active');
}
