/* Products Management Controller */

import { Products } from './storage.js';
import { searchCollection } from './search.js';
import { filterCollection, sortCollection, paginateCollection } from './filter.js';
import { showToast, formatCurrency } from './utils.js';

// Table state
let currentPage = 1;
const limit = 5;
let searchQuery = '';
let categoryFilter = 'all';
let stockFilter = 'all';
let currentSort = { key: 'name', direction: 'asc' };

// Beautiful placeholder image
const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  const addAction = params.get('action') === 'add';
  const searchParam = params.get('search') || '';

  if (searchParam) {
    searchQuery = searchParam;
    const searchInput = document.getElementById('products-search');
    if (searchInput) searchInput.value = searchParam;
  }

  // Initial Load
  renderProductsTable();

  // Open modal if action=add
  if (addAction) {
    openModal('add-product-modal');
  }

  // Setup Event Listeners
  setupInteractionListeners();
});

// Main Rendering Function
function renderProductsTable() {
  const allProds = Products.getAll();
  
  // 1. Search
  let processed = searchCollection(allProds, searchQuery, ['name', 'category']);
  
  // 2. Filter
  const criteria = {};
  if (categoryFilter !== 'all') criteria.category = categoryFilter;
  if (stockFilter !== 'all') criteria.status = stockFilter;
  processed = filterCollection(processed, criteria);
  
  // 3. Sort
  processed = sortCollection(processed, currentSort.key, currentSort.direction);
  
  // 4. Paginate
  const { items, pagination } = paginateCollection(processed, currentPage, limit);

  // Render Rows
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No products found in the catalog.
        </td>
      </tr>
    `;
    updatePaginationInfo(pagination);
    return;
  }

  tbody.innerHTML = items.map(p => {
    // Stock Badge colors
    let badgeClass = 'success';
    if (p.status === 'low-stock') badgeClass = 'warning';
    if (p.status === 'out-of-stock') badgeClass = 'danger';

    return `
      <tr>
        <td>
          <img src="${p.image || DEFAULT_PRODUCT_IMG}" alt="${p.name}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-color);">
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${p.id}</div>
        </td>
        <td>${p.category}</td>
        <td>
          <div class="flex-row" style="gap: 0.5rem; width: 100px;">
            <div style="flex: 1; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden;">
              <div style="width: ${Math.min(100, (p.stock / 100) * 100)}%; height: 100%; background-color: ${p.stock === 0 ? 'var(--danger)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)'};"></div>
            </div>
            <span style="font-size: 0.8rem; font-weight: 500;">${p.stock}</span>
          </div>
        </td>
        <td style="font-weight: 600;">${formatCurrency(p.price)}</td>
        <td>
          <span class="badge badge-${badgeClass}">${p.status.replace('-', ' ')}</span>
        </td>
        <td style="text-align: right;">
          <div class="flex-row" style="justify-content: flex-end; gap: 0.25rem;">
            <button class="btn btn-icon edit-btn" data-id="${p.id}" title="Edit Product"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
            <button class="btn btn-icon delete-btn" data-id="${p.id}" title="Delete Product" style="color:var(--danger);"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  updatePaginationInfo(pagination);
  renderPaginationControls(pagination);
}

// Update pagination details
function updatePaginationInfo(p) {
  const info = document.getElementById('pagination-info');
  if (info) {
    info.innerText = `Showing ${p.startIndex}-${p.endIndex} of ${p.totalItems} products`;
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
      renderProductsTable();
    });
  });
}

// Setup Event listeners
function setupInteractionListeners() {
  // Search Box input
  const searchInput = document.getElementById('products-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderProductsTable();
  });

  // Filter Categories dropdown
  document.getElementById('filter-category')?.addEventListener('change', (e) => {
    categoryFilter = e.target.value;
    currentPage = 1;
    renderProductsTable();
  });

  // Filter Stocks status dropdown
  document.getElementById('filter-stock')?.addEventListener('change', (e) => {
    stockFilter = e.target.value;
    currentPage = 1;
    renderProductsTable();
  });

  // Column headers Sorting
  document.querySelectorAll('#products-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const direction = currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc';
      
      currentSort = { key, direction };
      
      document.querySelectorAll('#products-table th i').forEach(icon => {
        icon.setAttribute('data-lucide', 'arrow-up-down');
      });
      const currentIcon = th.querySelector('i');
      if (currentIcon) {
        currentIcon.setAttribute('data-lucide', direction === 'asc' ? 'arrow-up' : 'arrow-down');
      }
      if (window.lucide) window.lucide.createIcons();
      
      renderProductsTable();
    });
  });

  // Modal actions triggers
  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    openModal('add-product-modal');
  });

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Add Product Submit
  document.getElementById('add-product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name').value;
    const category = document.getElementById('add-category').value;
    const price = parseFloat(document.getElementById('add-price').value);
    const stock = parseInt(document.getElementById('add-stock').value);
    const image = document.getElementById('add-image').value || DEFAULT_PRODUCT_IMG;
    
    // Auto status determination
    let status = 'in-stock';
    if (stock === 0) status = 'out-of-stock';
    else if (stock < 10) status = 'low-stock';

    Products.add({ name, category, price, stock, image, status });
    showToast('Product Created', `Catalog entry for "${name}" completed successfully.`, 'success');
    closeAllModals();
    document.getElementById('add-product-form').reset();
    renderProductsTable();
  });

  // Edit Product Submit
  document.getElementById('edit-product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const category = document.getElementById('edit-category').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const stock = parseInt(document.getElementById('edit-stock').value);
    const image = document.getElementById('edit-image').value;
    
    // Auto status determination
    let status = 'in-stock';
    if (stock === 0) status = 'out-of-stock';
    else if (stock < 10) status = 'low-stock';

    Products.update(id, { name, category, price, stock, image, status });
    showToast('Changes Saved', 'Catalog item details updated.', 'success');
    closeAllModals();
    renderProductsTable();
  });

  // Delegate Action buttons (Edit, Delete)
  document.getElementById('products-table-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const id = btn.dataset.id;
    if (btn.classList.contains('edit-btn')) {
      editProductDetails(id);
    } else if (btn.classList.contains('delete-btn')) {
      deleteProduct(id);
    }
  });
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Edit Product modal loader
function editProductDetails(id) {
  const p = Products.getById(id);
  if (!p) return;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-category').value = p.category;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-stock').value = p.stock;
  document.getElementById('edit-image').value = p.image || '';

  openModal('edit-product-modal');
}

// Delete inventory item
function deleteProduct(id) {
  const p = Products.getById(id);
  if (!p) return;

  if (confirm(`Are you sure you want to delete product "${p.name}"?`)) {
    Products.delete(id);
    showToast('Product Deleted', 'Catalog entry removed.', 'danger');
    renderProductsTable();
  }
}
