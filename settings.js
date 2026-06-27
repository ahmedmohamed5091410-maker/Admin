/* Settings Controller */

import { Settings } from './storage.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Load Settings
  const currentSettings = Settings.get();
  populateSettingsForm(currentSettings);

  // Measure Storage cache usage size
  calculateCacheUsage();

  // Setup Event Listeners
  setupInteractionListeners(currentSettings);
});

// Fill forms from datastore values
function populateSettingsForm(s) {
  // General Form
  const themeSelect = document.getElementById('settings-theme');
  const langSelect = document.getElementById('settings-lang');
  if (themeSelect) themeSelect.value = s.theme || 'light';
  if (langSelect) langSelect.value = s.language || 'en';

  // Security Form
  const twoFaCheck = document.getElementById('settings-2fa');
  const timeoutSelect = document.getElementById('settings-timeout');
  if (twoFaCheck) twoFaCheck.checked = s.security?.twoFactor || false;
  if (timeoutSelect) timeoutSelect.value = s.security?.sessionTimeout || '60';

  // Notifications Form
  const emailCheck = document.getElementById('settings-notif-email');
  const browserCheck = document.getElementById('settings-notif-browser');
  const marketingCheck = document.getElementById('settings-notif-marketing');
  
  if (emailCheck) emailCheck.checked = s.notifications?.email ?? true;
  if (browserCheck) browserCheck.checked = s.notifications?.browser ?? true;
  if (marketingCheck) marketingCheck.checked = s.notifications?.marketing ?? false;
}

// Calculate sizes of storage key strings in localStorage
function calculateCacheUsage() {
  const elem = document.getElementById('cache-usage-metric');
  if (!elem) return;

  let totalChars = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalChars += localStorage[key].length + key.length;
    }
  }

  const kb = (totalChars / 1024).toFixed(2);
  elem.innerText = `${kb} KB`;
}

// Setup submission forms
function setupInteractionListeners(initialSettings) {
  // 1. General Preferences Save
  document.getElementById('settings-general-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const theme = document.getElementById('settings-theme').value;
    const language = document.getElementById('settings-lang').value;

    const s = Settings.get();
    s.theme = theme;
    s.language = language;
    Settings.save(s);

    // Apply theme settings immediately
    document.documentElement.setAttribute('data-theme', theme);
    
    // Sync toggler header icons if present
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      const sun = toggleBtn.querySelector('.theme-icon-light');
      const moon = toggleBtn.querySelector('.theme-icon-dark');
      if (sun && moon) {
        if (theme === 'dark') {
          sun.style.display = 'block';
          moon.style.display = 'none';
        } else {
          sun.style.display = 'none';
          moon.style.display = 'block';
        }
      }
    }

    showToast('General Settings Saved', 'Visual layout and localization updated.', 'success');
    calculateCacheUsage();
  });

  // 2. Security Preferences Save
  document.getElementById('settings-security-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const twoFactor = document.getElementById('settings-2fa').checked;
    const sessionTimeout = document.getElementById('settings-timeout').value;

    const s = Settings.get();
    s.security = { twoFactor, sessionTimeout };
    Settings.save(s);

    showToast('Security Settings Saved', 'User session keys rules and validation systems updated.', 'success');
    calculateCacheUsage();
  });

  // 3. Notifications Preferences Save
  document.getElementById('settings-notifs-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('settings-notif-email').checked;
    const browser = document.getElementById('settings-notif-browser').checked;
    const marketing = document.getElementById('settings-notif-marketing').checked;

    const s = Settings.get();
    s.notifications = { email, browser, marketing };
    Settings.save(s);

    showToast('Notification Settings Saved', 'Alert pathways configurations saved.', 'success');
    calculateCacheUsage();
  });
}
