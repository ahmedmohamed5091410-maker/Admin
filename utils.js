/* Shared Reusable Utilities */

// 1. Currency Formatter
export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(value);
}

// 2. Date Formatter (Sleek date outputs)
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// 3. Time Ago Formatter
export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 0) return 'Just now';
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [key, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${key}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

// 4. Debouncer
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 5. Value Counter Increments Animation
export function animateValue(element, start, end, duration = 1000) {
  if (!element) return;
  let startTimestamp = null;
  const isCurrency = element.innerText.includes('$') || element.dataset.isCurrency === 'true';
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = start + progress * (end - start);
    
    if (isCurrency) {
      element.innerText = formatCurrency(currentValue);
    } else {
      element.innerText = Math.floor(currentValue).toLocaleString();
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// 6. Dynamic Floating Toast Notification Builder
export function showToast(title, message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon selections
  let iconHtml = '';
  switch (type) {
    case 'success':
      iconHtml = '<i data-lucide="check-circle" class="toast-icon"></i>';
      break;
    case 'warning':
      iconHtml = '<i data-lucide="alert-triangle" class="toast-icon"></i>';
      break;
    case 'danger':
      iconHtml = '<i data-lucide="alert-octagon" class="toast-icon"></i>';
      break;
    default:
      iconHtml = '<i data-lucide="info" class="toast-icon"></i>';
  }
  
  toast.innerHTML = `
    ${iconHtml}
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close"><i data-lucide="x"></i></button>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Re-run lucide icons compilation for new toast elements
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  // Slide in
  setTimeout(() => toast.classList.add('show'), 50);
  
  // Animation progress bar
  const progressBar = toast.querySelector('.toast-progress-bar');
  progressBar.style.transition = `transform ${duration}ms linear`;
  progressBar.style.transform = 'scaleX(0)';
  
  // Cleanup timer
  const autoClose = setTimeout(() => {
    closeToast(toast);
  }, duration);
  
  // Manual Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoClose);
    closeToast(toast);
  });
}

function closeToast(toast) {
  toast.classList.remove('show');
  toast.addEventListener('transitionend', () => {
    toast.remove();
    // Clean container if empty
    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  });
}

// Make globally accessible
window.showToast = showToast;
