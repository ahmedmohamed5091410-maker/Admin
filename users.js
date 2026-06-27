/* Users Management Controller */

import { Users } from './storage.js';
import { searchCollection } from './search.js';
import { filterCollection, sortCollection, paginateCollection } from './filter.js';
import { showToast, formatDate } from './utils.js';

// Table state
let currentPage = 1;
const limit = 5; // 5 items per page for demo pagination flow
let searchQuery = '';
let roleFilter = 'all';
let statusFilter = 'all';
let currentSort = { key: 'name', direction: 'asc' };
let selectedIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  const addAction = params.get('action') === 'add';
  const searchParam = params.get('search') || '';

  if (searchParam) {
    searchQuery = searchParam;
    const searchInput = document.getElementById('users-search');
    if (searchInput) searchInput.value = searchParam;
  }

  // Initial Load
  renderUsersTable();

  // Open modal if action=add query
  if (addAction) {
    openModal('add-user-modal');
  }

  // Setup Event Listeners
  setupInteractionListeners();
});

// Main Rendering Function
function renderUsersTable() {
  const allUsers = Users.getAll();
  
  // 1. Search
  let processed = searchCollection(allUsers, searchQuery, ['name', 'email']);
  
  // 2. Filter
  const criteria = {};
  if (roleFilter !== 'all') criteria.role = roleFilter;
  if (statusFilter !== 'all') criteria.status = statusFilter;
  processed = filterCollection(processed, criteria);
  
  // 3. Sort
  processed = sortCollection(processed, currentSort.key, currentSort.direction);
  
  // 4. Paginate
  const { items, pagination } = paginateCollection(processed, currentPage, limit);

  // Render Rows
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No users match the search criteria.
        </td>
      </tr>
    `;
    updatePaginationInfo(pagination);
    return;
  }

  tbody.innerHTML = items.map(u => {
    const isSelected = selectedIds.has(u.id);
    const badgeClass = u.status === 'active' ? 'success' : 'neutral';
    
    return `
      <tr class="${isSelected ? 'selected-row' : ''}">
        <td>
          <input type="checkbox" class="table-checkbox row-checkbox" data-id="${u.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>
          <div class="flex-row" style="gap: 0.75rem;">
            <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="avatar" class="avatar" style="width: 32px; height: 32px;">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${u.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${u.role === 'Administrator' ? 'badge-info' : 'badge-neutral'}">${u.role}</span>
        </td>
        <td>
          <span class="badge badge-${badgeClass}">${u.status}</span>
        </td>
        <td>${formatDate(u.joinDate)}</td>
        <td style="text-align: right;">
          <div class="flex-row" style="justify-content: flex-end; gap: 0.25rem;">
            <button class="btn btn-icon view-btn" data-id="${u.id}" title="View Details"><i data-lucide="eye" style="width: 16px; height: 16px;"></i></button>
            <button class="btn btn-icon edit-btn" data-id="${u.id}" title="Edit User"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
            <button class="btn btn-icon delete-btn" data-id="${u.id}" title="Delete User" style="color:var(--danger);"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  updatePaginationInfo(pagination);
  renderPaginationControls(pagination);
  updateBulkActionBar();
}

// Update Pagination details text
function updatePaginationInfo(p) {
  const info = document.getElementById('pagination-info');
  if (info) {
    info.innerText = `Showing ${p.startIndex}-${p.endIndex} of ${p.totalItems} users`;
  }
}

// Generate pagination button nodes
function renderPaginationControls(p) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;

  let html = '';
  
  // Previous button
  html += `
    <button class="pagination-btn" ${p.currentPage === 1 ? 'disabled' : ''} data-page="${p.currentPage - 1}">
      <i data-lucide="chevron-left" style="width: 14px;"></i>
    </button>
  `;

  // Numbered pages
  for (let i = 1; i <= p.totalPages; i++) {
    html += `
      <button class="pagination-btn ${p.currentPage === i ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  // Next button
  html += `
    <button class="pagination-btn" ${p.currentPage === p.totalPages ? 'disabled' : ''} data-page="${p.currentPage + 1}">
      <i data-lucide="chevron-right" style="width: 14px;"></i>
    </button>
  `;

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();

  // Attach button click listeners
  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderUsersTable();
    });
  });
}

// Bulk action visibility
function updateBulkActionBar() {
  const selectAll = document.getElementById('select-all-users');
  const bar = document.getElementById('bulk-actions-container');
  const countSpan = document.getElementById('bulk-count');
  
  if (selectedIds.size > 0) {
    if (bar) bar.style.display = 'inline-block';
    if (countSpan) countSpan.innerText = selectedIds.size;
  } else {
    if (bar) bar.style.display = 'none';
  }

  // Check state of select all checkbox
  const currentCheckboxes = document.querySelectorAll('.row-checkbox');
  if (currentCheckboxes.length > 0) {
    const allChecked = Array.from(currentCheckboxes).every(cb => selectedIds.has(cb.dataset.id));
    if (selectAll) selectAll.checked = allChecked;
  }
}

// Attach all filters and buttons interaction logic
function setupInteractionListeners() {
  // Search input
  const searchInput = document.getElementById('users-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderUsersTable();
  });

  // Filter dropdown selects
  document.getElementById('filter-role')?.addEventListener('change', (e) => {
    roleFilter = e.target.value;
    currentPage = 1;
    renderUsersTable();
  });

  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    statusFilter = e.target.value;
    currentPage = 1;
    renderUsersTable();
  });

  // Column Sort Headers
  document.querySelectorAll('#users-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const direction = currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc';
      
      currentSort = { key, direction };
      
      // Update icons state dynamically
      document.querySelectorAll('#users-table th i').forEach(icon => {
        icon.setAttribute('data-lucide', 'arrow-up-down');
      });
      const currentIcon = th.querySelector('i');
      if (currentIcon) {
        currentIcon.setAttribute('data-lucide', direction === 'asc' ? 'arrow-up' : 'arrow-down');
      }
      if (window.lucide) window.lucide.createIcons();
      
      renderUsersTable();
    });
  });

  // Checkboxes change listeners
  const selectAll = document.getElementById('select-all-users');
  selectAll?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    rowCheckboxes.forEach(cb => {
      const id = cb.dataset.id;
      if (checked) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }
      cb.checked = checked;
    });
    updateBulkActionBar();
  });

  document.getElementById('users-table-body')?.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-checkbox')) {
      const id = e.target.dataset.id;
      if (e.target.checked) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }
      updateBulkActionBar();
    }
  });

  // Bulk options operations handlers
  document.getElementById('bulk-active')?.addEventListener('click', () => {
    selectedIds.forEach(id => Users.update(id, { status: 'active' }));
    showToast('Bulk Action Complete', `Activated ${selectedIds.size} users.`, 'success');
    selectedIds.clear();
    renderUsersTable();
  });

  document.getElementById('bulk-inactive')?.addEventListener('click', () => {
    selectedIds.forEach(id => Users.update(id, { status: 'inactive' }));
    showToast('Bulk Action Complete', `Deactivated ${selectedIds.size} users.`, 'warning');
    selectedIds.clear();
    renderUsersTable();
  });

  document.getElementById('bulk-delete')?.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected users?`)) {
      selectedIds.forEach(id => Users.delete(id));
      showToast('Bulk Action Complete', `Successfully deleted selected profiles.`, 'danger');
      selectedIds.clear();
      renderUsersTable();
    }
  });

  // Export buttons
  document.getElementById('export-dropdown-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('export-dropdown-btn').parentElement.classList.toggle('active');
  });

  document.getElementById('export-csv')?.addEventListener('click', () => {
    exportToCSV();
  });

  document.getElementById('export-print')?.addEventListener('click', () => {
    window.print();
  });

  // Add User Trigger
  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    openModal('add-user-modal');
  });

  // Import button modal trigger
  document.getElementById('import-users-btn')?.addEventListener('click', () => {
    openModal('import-users-modal');
  });

  // Close modals clicking
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Add User Form submit
  document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name').value;
    const email = document.getElementById('add-email').value;
    const role = document.getElementById('add-role').value;
    const status = document.getElementById('add-status').value;
    const avatar = document.getElementById('add-avatar').value || null;

    Users.add({ name, email, role, status, avatar });
    showToast('User Created', `Successfully added ${name} to system records.`, 'success');
    closeAllModals();
    document.getElementById('add-user-form').reset();
    renderUsersTable();
  });

  // Edit User modal submit
  document.getElementById('edit-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const role = document.getElementById('edit-role').value;
    const status = document.getElementById('edit-status').value;

    Users.update(id, { name, email, role, status });
    showToast('Changes Saved', 'User profile information updated successfully.', 'success');
    closeAllModals();
    renderUsersTable();
  });

  // Action buttons click delegation (View, Edit, Delete)
  document.getElementById('users-table-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const id = btn.dataset.id;
    if (btn.classList.contains('view-btn')) {
      viewUserDetails(id);
    } else if (btn.classList.contains('edit-btn')) {
      editUserDetails(id);
    } else if (btn.classList.contains('delete-btn')) {
      deleteUser(id);
    }
  });

  // Import drag drop file upload
  const dropArea = document.getElementById('drag-drop-import-area');
  const fileInput = document.getElementById('import-file-input');

  dropArea?.addEventListener('click', () => fileInput.click());

  dropArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--primary)';
  });

  dropArea?.addEventListener('dragleave', () => {
    dropArea.style.borderColor = 'var(--border-color)';
  });

  dropArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--border-color)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImportFile(files[0]);
    }
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleImportFile(fileInput.files[0]);
    }
  });
}

// Modal Toggle Helpers
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Read details of user and fill overview modal
function viewUserDetails(id) {
  const user = Users.getById(id);
  if (!user) return;

  document.getElementById('view-name').innerText = user.name;
  document.getElementById('view-email').innerText = user.email;
  document.getElementById('view-uid').innerText = user.id;
  document.getElementById('view-join-date').innerText = formatDate(user.joinDate);
  document.getElementById('view-avatar').src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
  
  const roleBadge = document.getElementById('view-role');
  roleBadge.innerText = user.role;
  roleBadge.className = `badge ${user.role === 'Administrator' ? 'badge-info' : 'badge-neutral'}`;
  
  const statusBadge = document.getElementById('view-status');
  statusBadge.innerText = user.status;
  statusBadge.className = `badge badge-${user.status === 'active' ? 'success' : 'neutral'}`;

  openModal('view-user-modal');
}

// Edit details of user modal load
function editUserDetails(id) {
  const user = Users.getById(id);
  if (!user) return;

  document.getElementById('edit-id').value = user.id;
  document.getElementById('edit-name').value = user.name;
  document.getElementById('edit-email').value = user.email;
  document.getElementById('edit-role').value = user.role;
  document.getElementById('edit-status').value = user.status;

  openModal('edit-user-modal');
}

// Delete user single record
function deleteUser(id) {
  const user = Users.getById(id);
  if (!user) return;

  if (confirm(`Are you sure you want to delete administrative access for ${user.name}?`)) {
    Users.delete(id);
    showToast('User Deleted', 'Account has been removed from system records.', 'danger');
    renderUsersTable();
  }
}

// CSV exporter trigger
function exportToCSV() {
  const users = Users.getAll();
  if (users.length === 0) return;

  let csvContent = 'data:text/csv;charset=utf-8,ID,Name,Email,Role,Status,JoinDate\n';
  
  users.forEach(u => {
    csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.joinDate}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `antigravity_users_${Date.now()}.csv`);
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
  showToast('Export Successful', 'User records exported in CSV format.', 'success');
}

// CSV upload parser
function handleImportFile(file) {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    showToast('Import Error', 'Unsupported file type. Please upload a valid CSV sheet.', 'danger');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n');
    let importCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Basic comma splitter (ignoring complex quote scopes for simplicity in mock parser)
      const cols = line.split(',').map(c => c.replace(/["']/g, ''));
      if (cols.length >= 4) {
        const [_, name, email, role, status] = cols;
        Users.add({
          name: name.trim(),
          email: email.trim(),
          role: ['Administrator', 'Editor', 'Viewer'].includes(role) ? role : 'Viewer',
          status: ['active', 'inactive'].includes(status) ? status : 'active',
          avatar: null
        });
        importCount++;
      }
    }

    showToast('Import Completed', `Successfully imported ${importCount} user profiles.`, 'success');
    closeAllModals();
    renderUsersTable();
  };
  
  reader.readAsText(file);
}
