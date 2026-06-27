/* Profile Settings Controller */

import { Auth, Users } from './storage.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;

  // Load User Details
  loadUserProfileDetails(currentUser);

  // Render static timeline log activities
  renderProfileActivities();

  // Setup Event Listeners
  setupInteractionListeners(currentUser);
});

// Load values into UI
function loadUserProfileDetails(user) {
  // Input forms
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  
  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;

  // Header and Left Side Card displays
  const displayAvatar = document.getElementById('profile-avatar-display');
  const displayName = document.getElementById('profile-name-display');
  const displayEmail = document.getElementById('profile-email-display');
  const displayRole = document.getElementById('profile-role-display');

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80';
  if (displayAvatar) displayAvatar.src = user.avatar || defaultAvatar;
  if (displayName) displayName.innerText = user.name;
  if (displayEmail) displayEmail.innerText = user.email;
  if (displayRole) displayRole.innerText = user.role;
}

// Injects timeline activities
function renderProfileActivities() {
  const container = document.getElementById('profile-activity-timeline');
  if (!container) return;

  const logs = [
    { title: 'Security key changed', time: 'Yesterday at 3:15 PM', detail: 'Primary API developer keys rotated.' },
    { title: 'Profile settings updated', time: 'June 25, 2026', detail: 'Completed details fields and avatar.' },
    { title: 'System login successful', time: 'June 23, 2026', detail: 'Logged in from desktop browser using Chrome.' }
  ];

  container.innerHTML = logs.map(l => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content" style="padding:0.75rem;">
        <div class="flex-between">
          <span style="font-weight:600; font-size:0.8rem;">${l.title}</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">${l.time}</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${l.detail}</p>
      </div>
    </div>
  `).join('');
}

// Interactivity Listeners Setup
function setupInteractionListeners(user) {
  // 1. Profile information submit
  document.getElementById('profile-info-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();

    if (!name || !email) {
      showToast('Validation Error', 'Please fill name and email fields.', 'warning');
      return;
    }

    // Save user update in Auth session
    const updatedUser = { ...user, name, email };
    Auth.setCurrentUser(updatedUser);

    // Sync back to Users database list if administrator profile exists there
    Users.update(user.id, { name, email });

    // Refresh UI display components
    loadUserProfileDetails(updatedUser);

    // Refresh header DOM structures
    const headerName = document.getElementById('header-user-name');
    const headerEmail = document.getElementById('header-user-email');
    if (headerName) headerName.innerText = name;
    if (headerEmail) headerEmail.innerText = email;

    showToast('Profile Saved', 'Your account details have been updated.', 'success');
  });

  // 2. Change password form submit
  document.getElementById('profile-password-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPass = document.getElementById('pass-current').value;
    const newPass = document.getElementById('pass-new').value;
    const confirmPass = document.getElementById('pass-confirm').value;

    const mockCorrectCurrent = 'password';

    if (currentPass !== mockCorrectCurrent) {
      showToast('Security Error', 'Incorrect current password validation.', 'danger');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('Validation Error', 'New passwords parameters do not match.', 'warning');
      return;
    }

    if (newPass.length < 6) {
      showToast('Validation Error', 'Passwords must be at least 6 characters.', 'warning');
      return;
    }

    showToast('Password Updated', 'Your security password keys have been refreshed.', 'success');
    document.getElementById('profile-password-form').reset();
  });

  // 3. Image upload file selection converting to Base64
  const avatarUpload = document.getElementById('profile-avatar-upload');
  avatarUpload?.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const file = files[0];
    
    // Check file size limits (< 1MB is good for localStorage)
    if (file.size > 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 1MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result;
      
      // Update displays
      const displayAvatar = document.getElementById('profile-avatar-display');
      if (displayAvatar) displayAvatar.src = base64;
      
      // Update header avatar directly in DOM
      const headerAvatar = document.getElementById('header-user-avatar');
      if (headerAvatar) headerAvatar.src = base64;

      // Save user session
      const updatedUser = { ...user, avatar: base64 };
      Auth.setCurrentUser(updatedUser);

      // Sync user table list
      Users.update(user.id, { avatar: base64 });

      showToast('Avatar Updated', 'Profile photo refreshed successfully.', 'success');
    };
    reader.readAsDataURL(file);
  });
}
