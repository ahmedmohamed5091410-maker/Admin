# Antigravity Systems - Admin Dashboard Console

A complete, enterprise-level Administrative Management Console built from scratch using semantic **HTML5**, custom **CSS3 variables & layout engines**, and modular **Vanilla JavaScript (ES6+)**. 

This console is optimized for performance, accessibility, and sleek glassmorphic visual aesthetics (drawing inspiration from Stripe, Vercel, and Linear dashboards).

---

## 🚀 Key Features Checklist

1. **Light & Dark Theme Engine**: Dynamically matches client settings. Persists configuration to `localStorage`. Charts smoothly recalculate coordinate grid colors upon switching.
2. **Command Palette (`Ctrl + K`)**: Instantly search pages, customer profiles, order IDs, and inventory from anywhere inside the app.
3. **Dynamic Layout Loader**: Unified sidebar, header, preview dropdowns, and toast elements are injected on DOM load, avoiding code duplication across HTML files.
4. **Drag & Drop Dashboard Widgets**: Adjust the layout of summary statistic widgets. Order configurations are persisted automatically in `localStorage`.
5. **Interactive Client CRM**: Calculate lifetime values (LTV), order frequency, and retention averages by joining database logs. Side timeline drawer shows purchase histories.
6. **Simulated Inbox Chatbot**: Chat inbox supports incoming/outgoing messages and simulates real-time response delay from contacts.
7. **CSV Exporter & Invoice Print**: Export lists to CSV files instantly or trigger custom print invoice configurations.
8. **Operational Calendar**: Calendar day calculation grid, add custom task milestones, filter meetings.
9. **Responsive Grid**: Adaptive flexboxes and grid variables shifting layouts for Mobile, Tablet, Laptop, and Desktop screens.

---

## 📂 Project Architecture

```text
Admin-Dashboard/
├── index.html          # Dashboard (Metrics, Charts, Activities Summary)
├── users.html          # Users database (CRUD, import/export controls, search)
├── products.html       # Inventory (Category filters, stock progress, edit items)
├── orders.html         # Transaction tracking (Full invoice details panel)
├── customers.html      # CRM Directory (Lifetime value analysis, purchase timeline)
├── analytics.html      # Report charts (Area, Bar, Line, Pie metrics)
├── messages.html       # Inbox Live chat (Interactive chatbot simulation)
├── notifications.html  # System alert logs (Filters, single/bulk dismissals)
├── calendar.html       # Operational schedules (Weekly grids, meeting lists)
├── profile.html        # Admin settings (Password check, Base64 avatar upload)
├── settings.html       # Preferences (Toggles for theme, timeout rules, 2FA)
├── login.html          # Authentication portal (Mock credentials check)
├── 404.html            # Illustrated error redirect page
├── css/
│   ├── variables.css   # Color palette (HSL values), shadows, spacing variables
│   ├── style.css       # Core layout resets, sidebar transitions, grid classes
│   ├── components.css  # Cards, tables, forms, badges, modals, toasts
│   ├── responsive.css  # Media queries for responsive viewports wrapping
│   └── animations.css  # Keyframes, skeleton shimmering, toast transitions
├── js/
│   ├── app.js          # App bootstrap (Layout injection, themes, commands, badges)
│   ├── storage.js      # Relational LocalStorage database (Seeds mock values)
│   ├── utils.js        # Formatting, debouncing, counters, toasts
│   ├── charts.js       # Chart.js registry and configuration wrapper
│   ├── search.js       # Fuzzy query string scanner
│   ├── filter.js       # Slicing page counts, multi-key lists filter/sorter
│   └── [pages].js      # Page-specific controllers (dashboard.js, users.js, etc.)
└── assets/
    ├── images/         # Static images directory
    ├── icons/          # SVG shapes icons directory
    └── fonts/          # Embedded font weights directory
```

---

## 🔑 Administrative Credentials

To access the console, open `login.html` and sign in using:
- **Email**: `admin@example.com`
- **Password**: `password`

*Note: Session state is saved in local storage. Once authenticated, navigating between pages will remain secure. Click 'Log Out' to terminate session tokens.*

---

## 🛠️ Installation & Running

Since this project utilizes native ES6 JavaScript Modules (`import` and `export` statements), browsers restrict file loads from the local filesystem (`file://` protocol) due to CORS policies. You must run this project on a local server.

### Option 1: Live Server (VS Code Extension)
1. Open this workspace in **VS Code**.
2. Install the **Live Server** extension.
3. Click **Go Live** in the status bar at the bottom right.

### Option 2: Node.js (http-server / vite)
If you have Node.js installed, open terminal inside the root directory and run:
```bash
# Run a quick zero-config server
npx http-server -p 8080
```
Then open `http://localhost:8080` in your web browser.

---

## 💎 Code Quality & Performance

- **Event Delegation**: Centralized table click actions delegate event bubbles to prevent redundant event bindings on rows.
- **Micro-Interactions**: Hover scales, loading skeleton pulse shimmers, and slide-in notifications keep the viewport interactive.
- **Cache Size Optimization**: Measures byte weight of cached strings in local storage to prevent browser memory blockages.
- **Semantic Tags**: Utilizes `<aside>`, `<header>`, `<main>`, `<nav>`, `<section>` to ensure search-engine optimization (SEO) and accessibility.
