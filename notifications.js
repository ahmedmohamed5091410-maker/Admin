/* Notifications Center Controller */

import { Notifications } from './storage.js';
import { updateHeaderBadges } from './app.js';
import { timeAgo, showToast } from './utils.js';

// Controller State
let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderNotificationsList();
  setupInteractionListeners();
});

// Main Rendering Function
function renderNotificationsList() {
  const allNotifs = Notifications.getAll();
  
  // 1. Filter
  const filtered = selectedCategory === 'all' 
    ? allNotifs 
    : allNotifs.filter(n => n.category === selectedCategory);

  const container = document.getElementById('notifs-list-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
        <i data-lucide="bell-off" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3 style="font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">All Caught Up!</h3>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">There are no new notifications inside the "${selectedCategory}" channel.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(n => {
    // Icon mapping
    let icon = 'info';
    let badgeType = 'info';
    
    if (n.category === 'warning') { icon = 'alert-triangle'; badgeType = 'warning'; }
    if (n.category === 'security') { icon = 'shield-alert'; badgeType = 'danger'; }
    if (n.category === 'order') { icon = 'shopping-bag'; badgeType = 'success'; }

    return `
      <div class="notif-card ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
        <span class="badge badge-${badgeType}" style="padding: 0.5rem; border-radius: var(--radius-sm); margin-top: 2px;">
          <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
        </span>
        
        <div style="flex: 1; min-width: 0;">
          <div class="flex-between" style="align-items: flex-start; gap: 0.5rem;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${n.title}</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; line-height: 1.4;">${n.message}</p>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo(n.time)}</span>
            </div>
          </div>
          
          <div class="flex-row" style="margin-top: 0.75rem; gap: 1rem;">
            ${n.read ? '' : `<button class="btn btn-secondary mark-read-btn" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: var(--radius-xs);"><i data-lucide="check" style="width:12px;"></i> Mark Read</button>`}
            <button class="btn btn-secondary delete-notif-btn" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: var(--radius-xs); color: var(--danger); border-color: transparent;"><i data-lucide="trash-2" style="width:12px;"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// Setup Interaction handlers
function setupInteractionListeners() {
  // Tab changes clicks
  const tabsContainer = document.getElementById('notifs-tabs-container');
  tabsContainer?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-btn');
    if (!tab) return;

    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tab.classList.add('active');

    selectedCategory = tab.dataset.category;
    renderNotificationsList();
  });

  // Mark all read
  document.getElementById('notifs-mark-read-all-btn')?.addEventListener('click', () => {
    Notifications.markAllRead();
    showToast('Log Action Completed', 'All notifications marked as read.', 'success');
    renderNotificationsList();
    if (window.updateHeaderBadges) window.updateHeaderBadges();
  });

  // Clear all
  document.getElementById('notifs-clear-all-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all notification records? This action is permanent.')) {
      Notifications.save([]);
      showToast('Log Action Completed', 'System notifications cleared completely.', 'danger');
      renderNotificationsList();
      if (window.updateHeaderBadges) window.updateHeaderBadges();
    }
  });

  // Single card delegation click
  document.getElementById('notifs-list-container')?.addEventListener('click', (e) => {
    const card = e.target.closest('.notif-card');
    if (!card) return;

    const id = card.dataset.notifId;
    
    // Mark read button click
    if (e.target.closest('.mark-read-btn')) {
      Notifications.markRead(id);
      renderNotificationsList();
      if (window.updateHeaderBadges) window.updateHeaderBadges();
    } 
    // Delete click
    else if (e.target.closest('.delete-notif-btn')) {
      Notifications.delete(id);
      renderNotificationsList();
      if (window.updateHeaderBadges) window.updateHeaderBadges();
    }
  });
}
