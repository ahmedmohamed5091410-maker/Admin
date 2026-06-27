/* Calendar Operations Controller */

import { showToast } from './utils.js';

// Calendar database key
const EVENTS_KEY = 'admin_dashboard_calendar_events';

const MOCK_EVENTS = [
  { id: 'evt-1', title: 'Product Launch Sync', date: '2026-06-27', time: '10:00', category: 'meeting' },
  { id: 'evt-2', title: 'Invoice Submission', date: '2026-06-29', time: '14:00', category: 'deadline' },
  { id: 'evt-3', title: 'Antigravity Happy Hour', date: '2026-06-30', time: '17:00', category: 'personal' },
  { id: 'evt-4', title: 'Vercel Deployment Review', date: '2026-07-02', time: '11:30', category: 'meeting' },
  { id: 'evt-5', title: 'Database Security Audit', date: '2026-06-24', time: '09:00', category: 'deadline' }
];

// Current Date State (Defaults to June 2026 to match mock data & metadata time)
let currentMonthDate = new Date(2026, 5, 27); // June 27, 2026

document.addEventListener('DOMContentLoaded', () => {
  // Initialize storage
  if (!localStorage.getItem(EVENTS_KEY)) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(MOCK_EVENTS));
  }

  // Draw Calendar
  renderCalendar();

  // Setup Event Listeners
  setupInteractionListeners();
});

// Get all events from storage
function getEvents() {
  return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
}

// Write events to storage
function saveEvents(list) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
}

// Drawing function
function renderCalendar() {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed (5 for June)
  
  // Set month title text
  const monthTitle = document.getElementById('cal-month-title');
  if (monthTitle) {
    monthTitle.innerText = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return;

  // Clear grid
  grid.innerHTML = '';

  // 1. Render Weekday Name labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
    const labelCell = document.createElement('div');
    labelCell.className = 'calendar-header-cell';
    labelCell.innerText = day;
    grid.appendChild(labelCell);
  });

  // 2. Calendar Grid Math
  const firstDayIndex = new Date(year, month, 1).getDay(); // weekday index of 1st day (e.g. 1 for Mon)
  const totalDays = new Date(year, month + 1, 0).getDate(); // days count in current month (e.g. 30 for June)
  const prevMonthTotalDays = new Date(year, month, 0).getDate(); // days count in previous month

  // Render preceding padding cells from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell outside-month';
    cell.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    grid.appendChild(cell);
  }

  // Render current month days
  const eventsList = getEvents();
  
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    
    // Check if cell is "today"
    const isToday = day === 27 && month === 5 && year === 2026; // match mockup static today (June 27, 2026)
    if (isToday) {
      cell.classList.add('today');
    }

    // Format current cell date key YYYY-MM-DD
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.dataset.date = dateString;

    cell.innerHTML = `<span class="calendar-day-number">${day}</span>`;

    // Filter events for this day
    const dayEvents = eventsList.filter(e => e.date === dateString);
    
    // Render event badges
    dayEvents.forEach(evt => {
      const badge = document.createElement('div');
      badge.className = `calendar-event event-${evt.category}`;
      badge.innerText = `${evt.time} - ${evt.title}`;
      badge.title = evt.title;
      cell.appendChild(badge);
    });

    grid.appendChild(cell);
  }

  // Render remaining grid boxes to round cells to complete rows of 7
  const totalInjected = firstDayIndex + totalDays;
  const nextMonthPadding = (7 - (totalInjected % 7)) % 7;
  
  for (let day = 1; day <= nextMonthPadding; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell outside-month';
    cell.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    grid.appendChild(cell);
  }

  // Update Sidebars lists
  renderSidebarEvents();
}

// Side panels upcoming lists rendering
function renderSidebarEvents() {
  const events = getEvents();
  const meetingsContainer = document.getElementById('cal-sidebar-meetings');
  const deadlinesContainer = document.getElementById('cal-sidebar-deadlines');

  // Filter and sort meetings & deadlines
  const meetings = events.filter(e => e.category === 'meeting').sort((a,b) => a.date.localeCompare(b.date));
  const deadlines = events.filter(e => e.category === 'deadline').sort((a,b) => a.date.localeCompare(b.date));

  if (meetingsContainer) {
    if (meetings.length === 0) {
      meetingsContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No upcoming meetings</div>`;
    } else {
      meetingsContainer.innerHTML = meetings.map(m => `
        <div style="background-color: var(--background); padding: 0.75rem; border-radius: var(--radius-xs); border-left: 3px solid var(--primary);">
          <div style="font-weight: 600; font-size: 0.85rem;">${m.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; display:flex; align-items:center; gap:4px;">
            <i data-lucide="calendar" style="width:12px; height:12px;"></i> ${m.date} at ${m.time}
          </div>
        </div>
      `).join('');
    }
  }

  if (deadlinesContainer) {
    if (deadlines.length === 0) {
      deadlinesContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No upcoming deadlines</div>`;
    } else {
      deadlinesContainer.innerHTML = deadlines.map(d => `
        <div style="background-color: var(--background); padding: 0.75rem; border-radius: var(--radius-xs); border-left: 3px solid var(--danger);">
          <div style="font-weight: 600; font-size: 0.85rem;">${d.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; display:flex; align-items:center; gap:4px;">
            <i data-lucide="clock" style="width:12px; height:12px;"></i> Due: ${d.date} at ${d.time}
          </div>
        </div>
      `).join('');
    }
  }
  
  if (window.lucide) window.lucide.createIcons();
}

// Interaction Listeners
function setupInteractionListeners() {
  // Next / Prev buttons month navigation
  document.getElementById('cal-prev-btn')?.addEventListener('click', () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('cal-next-btn')?.addEventListener('click', () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    renderCalendar();
  });

  // Cell clicking -> open event modal on selected date
  document.getElementById('calendar-days-grid')?.addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-day-cell:not(.outside-month)');
    if (!cell) return;

    const date = cell.dataset.date;
    document.getElementById('evt-date').value = date;
    openModal('cal-event-modal');
  });

  // Manual Add Event button
  document.getElementById('cal-add-event-btn')?.addEventListener('click', () => {
    // default to today YYYY-MM-DD
    const todayStr = '2026-06-27';
    document.getElementById('evt-date').value = todayStr;
    openModal('cal-event-modal');
  });

  // Modal actions close
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Form scheduling submit
  document.getElementById('cal-event-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('evt-title').value;
    const date = document.getElementById('evt-date').value;
    const time = document.getElementById('evt-time').value;
    const category = document.getElementById('evt-category').value;

    const events = getEvents();
    const newEvent = {
      id: `evt-${Date.now()}`,
      title,
      date,
      time,
      category
    };

    events.push(newEvent);
    saveEvents(events);

    showToast('Event Scheduled', `"${title}" has been successfully added.`, 'success');
    closeAllModals();
    document.getElementById('cal-event-form').reset();
    renderCalendar();
  });
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}
