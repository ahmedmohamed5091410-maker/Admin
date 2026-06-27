/* Login Script & Authentication Validator */

import { Auth } from './storage.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ensure icons compile
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('password-visibility-toggle');
  const forgotLink = document.getElementById('forgot-password-link');

  // Toggle Password Visibility
  toggleBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    // Toggle Eye Icon
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  });

  // Forgot password mock
  forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Reset Instructions Sent', 'A password reset link has been dispatched to your email address (mock action).', 'info');
  });

  // Handle Form Submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Input validation checks
    if (!email || !password) {
      showToast('Validation Error', 'Please populate both email and password parameters.', 'warning');
      return;
    }

    // Default mock user credentials check
    const defaultEmail = 'admin@example.com';
    const defaultPassword = 'password';
    
    if (email === defaultEmail && password === defaultPassword) {
      // Mock login credentials pass
      const activeUser = {
        id: 'usr-1',
        name: 'Olivia Ryhe',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
        role: 'Administrator'
      };
      
      Auth.setCurrentUser(activeUser);
      showToast('Authentication Successful', 'Access granted. Directing to dashboard...', 'success');
      
      // Redirect
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showToast('Access Denied', 'Invalid administrative credentials. Use admin@example.com / password.', 'danger');
    }
  });
});
