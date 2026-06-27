/* Orders & Fullfillments Controller */

import { Orders } from './storage.js';
import { searchCollection } from './search.js';
import { filterCollection, sortCollection, paginateCollection } from './filter.js';
import { showToast, formatCurrency, formatDate } from './utils.js';

// Table state
let currentPage = 1;
const limit = 5;
let searchQuery = '';
let orderStatusFilter = 'all';
let paymentStatusFilter = 'all';
let currentSort = { key: 'date', direction: 'desc' };
let activeOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  const searchParam = params.get('search') || '';

  if (searchParam) {
    searchQuery = searchParam;
    const searchInput = document.getElementById('orders-search');
    if (searchInput) searchInput.value = searchParam;
  }

  // Initial render
  renderOrdersTable();

  // Setup Event listeners
  setupInteractionListeners();
});

// Main Rendering Function
function renderOrdersTable() {
  const allOrders = Orders.getAll();
  
  // 1. Search
  let processed = searchCollection(allOrders, searchQuery, ['id', 'customerName']);
  
  // 2. Filter
  const criteria = {};
  if (orderStatusFilter !== 'all') criteria.status = orderStatusFilter;
  if (paymentStatusFilter !== 'all') criteria.paymentStatus = paymentStatusFilter;
  processed = filterCollection(processed, criteria);
  
  // 3. Sort
  processed = sortCollection(processed, currentSort.key, currentSort.direction);
  
  // 4. Paginate
  const { items, pagination } = paginateCollection(processed, currentPage, limit);

  // Render Rows
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No transactions match current filters.
        </td>
      </tr>
    `;
    updatePaginationInfo(pagination);
    return;
  }

  tbody.innerHTML = items.map(o => {
    // Fulfillment badge
    let fulfillClass = 'neutral';
    if (o.status === 'completed') fulfillClass = 'success';
    if (o.status === 'processing') fulfillClass = 'info';
    if (o.status === 'pending') fulfillClass = 'warning';
    if (o.status === 'cancelled') fulfillClass = 'danger';

    // Payment badge
    let paymentClass = 'neutral';
    if (o.paymentStatus === 'paid') paymentClass = 'success';
    if (o.paymentStatus === 'unpaid') paymentClass = 'warning';
    if (o.paymentStatus === 'refunded') paymentClass = 'info';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--primary);">#${o.id}</td>
        <td>${o.customerName}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${o.items}</td>
        <td style="font-weight: 600;">${formatCurrency(o.total)}</td>
        <td>${formatDate(o.date)}</td>
        <td>
          <span class="badge badge-${paymentClass}">${o.paymentStatus}</span>
        </td>
        <td>
          <span class="badge badge-${fulfillClass}">${o.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-icon view-invoice-btn" data-id="${o.id}" title="View Invoice">
            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  updatePaginationInfo(pagination);
  renderPaginationControls(pagination);
}

// Update pagination detail text
function updatePaginationInfo(p) {
  const info = document.getElementById('pagination-info');
  if (info) {
    info.innerText = `Showing ${p.startIndex}-${p.endIndex} of ${p.totalItems} transactions`;
  }
}

// Generate pagination controls
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
      renderOrdersTable();
    });
  });
}

// Setup Event Listeners
function setupInteractionListeners() {
  // Search input
  const searchInput = document.getElementById('orders-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderOrdersTable();
  });

  // Filter dropdown sets
  document.getElementById('filter-order-status')?.addEventListener('change', (e) => {
    orderStatusFilter = e.target.value;
    currentPage = 1;
    renderOrdersTable();
  });

  document.getElementById('filter-payment-status')?.addEventListener('change', (e) => {
    paymentStatusFilter = e.target.value;
    currentPage = 1;
    renderOrdersTable();
  });

  // Column Sort Headers
  document.querySelectorAll('#orders-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const direction = currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc';
      
      currentSort = { key, direction };
      
      document.querySelectorAll('#orders-table th i').forEach(icon => {
        icon.setAttribute('data-lucide', 'arrow-up-down');
      });
      const currentIcon = th.querySelector('i');
      if (currentIcon) {
        currentIcon.setAttribute('data-lucide', direction === 'asc' ? 'arrow-up' : 'arrow-down');
      }
      if (window.lucide) window.lucide.createIcons();
      
      renderOrdersTable();
    });
  });

  // CSV Exporter button
  document.getElementById('export-orders-btn')?.addEventListener('click', () => {
    exportOrdersToCSV();
  });

  // Invoice detailed row trigger
  document.getElementById('orders-table-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-invoice-btn');
    if (!btn) return;
    
    const id = btn.dataset.id;
    viewOrderInvoice(id);
  });

  // Print button click
  document.getElementById('invoice-print-btn')?.addEventListener('click', () => {
    window.print();
  });

  // Update Status Selector inside modal
  document.getElementById('invoice-update-status-select')?.addEventListener('change', (e) => {
    if (!activeOrderId) return;
    const nextStatus = e.target.value;
    
    Orders.update(activeOrderId, { status: nextStatus });
    showToast('Fulfillment Updated', `Order status has been updated to "${nextStatus}".`, 'success');
    renderOrdersTable();
  });

  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('invoice-modal').classList.remove('active');
    });
  });
}

// Populate details inside invoice modal
function viewOrderInvoice(id) {
  const o = Orders.getById(id);
  if (!o) return;

  activeOrderId = o.id;

  document.getElementById('invoice-id').innerText = `#${o.id}`;
  document.getElementById('invoice-date').innerText = `Date: ${formatDate(o.date)}`;
  document.getElementById('invoice-customer-name').innerText = o.customerName;
  document.getElementById('invoice-shipping-address').innerText = o.shippingDetails || 'N/A';
  
  // Set items listing
  document.getElementById('invoice-items-description').innerText = o.items;
  document.getElementById('invoice-items-total').innerText = formatCurrency(o.total);
  document.getElementById('invoice-subtotal').innerText = formatCurrency(o.total);
  document.getElementById('invoice-grand-total').innerText = formatCurrency(o.total);

  // Set fulfillment dropdown selector value inside modal
  const select = document.getElementById('invoice-update-status-select');
  if (select) {
    select.value = o.status;
  }

  // Populate email fallback
  document.getElementById('invoice-customer-email').innerText = `${o.customerName.toLowerCase().replace(/\s/g, '')}@example.com`;

  // Display modal
  document.getElementById('invoice-modal').classList.add('active');
}

// Orders to CSV file exporter helper
function exportOrdersToCSV() {
  const orders = Orders.getAll();
  if (orders.length === 0) return;

  let csvContent = 'data:text/csv;charset=utf-8,ID,Customer,Items,Total,Date,Payment,Fulfillment\n';
  
  orders.forEach(o => {
    csvContent += `"${o.id}","${o.customerName}","${o.items}","${o.total}","${o.date}","${o.paymentStatus}","${o.status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `antigravity_orders_${Date.now()}.csv`);
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
  showToast('Export Successful', 'Order database logs exported.', 'success');
}
