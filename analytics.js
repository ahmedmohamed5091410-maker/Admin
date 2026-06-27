/* Analytics Center Controller */

import { Orders, Users } from './storage.js';
import { drawAreaChart, drawBarChart, drawLineChart, drawPieChart, destroyAllCharts } from './charts.js';
import { formatCurrency, animateValue } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Load initial statistics
  calculateKPIs();

  // Draw charts initially with "Yearly" data
  renderAnalyticsCharts('yearly');

  // Listen to select period alterations
  document.getElementById('analytics-period-select')?.addEventListener('change', (e) => {
    const period = e.target.value;
    
    // Clear and redraw all charts to avoid overlay/conflict
    destroyAllCharts();
    renderAnalyticsCharts(period);
    
    // Update minor KPI numbers values to simulate dynamic updates
    updateKPIDataOnToggle(period);
  });
});

// Dynamic values calculator
function calculateKPIs() {
  const orders = Orders.getAll();
  
  if (orders.length > 0) {
    const totalVal = orders.reduce((sum, o) => sum + o.total, 0);
    const aov = totalVal / orders.length;
    
    const aovElem = document.getElementById('analytic-aov');
    if (aovElem) {
      animateValue(aovElem, 0, aov, 1000);
    }
  }
}

// Simulated data update
function updateKPIDataOnToggle(period) {
  const conversionElem = document.getElementById('analytic-conversion');
  const bounceElem = document.getElementById('analytic-bounce');

  if (period === 'monthly') {
    animateValue(conversionElem, 3.24, 4.12, 500); // simulate increase
    animateValue(bounceElem, 41.8, 38.5, 500); // simulate reduction
  } else {
    animateValue(conversionElem, 4.12, 3.24, 500);
    animateValue(bounceElem, 38.5, 41.8, 500);
  }
}

// Redraw chart pipelines
function renderAnalyticsCharts(period) {
  let labels = [];
  let revenueData = [];
  let salesData = [];
  let growthData = [];
  
  if (period === 'yearly') {
    // 12 Months dataset
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    revenueData = [18000, 22000, 25000, 24000, 28000, 31000, 35000, 33000, 38000, 42000, 48000, 56000];
    salesData = [120, 150, 180, 170, 210, 230, 260, 240, 290, 310, 350, 410];
    growthData = [1000, 1200, 1350, 1600, 1750, 1950, 2200, 2400, 2650, 2900, 3200, 3600];
  } else {
    // 4 Weeks dataset (Monthly review)
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    revenueData = [12000, 15000, 14000, 18500];
    salesData = [85, 105, 98, 135];
    growthData = [3100, 3250, 3400, 3600];
  }

  // Draw 1. Revenue Trajectory Area Chart
  drawAreaChart('chart-revenue-trajectory', labels, [
    {
      label: 'Gross Receipts ($)',
      data: revenueData,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      fill: true
    }
  ]);

  // Draw 2. Sales Conversion Count Bar Chart
  drawBarChart('chart-sales-bar', labels, [
    {
      label: 'Units Shipped',
      data: salesData,
      backgroundColor: '#10b981',
      borderColor: 'transparent'
    }
  ]);

  // Draw 3. Customer Acquisition Line Chart
  drawLineChart('chart-growth-curve', labels, [
    {
      label: 'Registered Accounts count',
      data: growthData,
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      tension: 0.3
    }
  ]);

  // Draw 4. Acquisition Demographics Pie Chart (stays consistent or updates mildly)
  const pieLabels = ['Desktop App', 'Mobile Viewport', 'Tablet Screen', 'Integrations API'];
  const pieData = period === 'yearly' ? [55, 30, 10, 5] : [48, 38, 8, 6];
  const pieColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'];
  
  drawPieChart('chart-traffic-pie', pieLabels, pieData, pieColors);
}
