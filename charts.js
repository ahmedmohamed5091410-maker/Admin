/* Chart.js Configuration Wrapper & Registry */

const activeCharts = new Set();

// Get theme colors based on current dataset theme
function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    grid: isDark ? '#334155' : '#f1f5f9',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#475569' : '#cbd5e1',
    tooltipText: isDark ? '#f8fafc' : '#0f172a'
  };
}

// Global chart styles
function getBaseOptions() {
  const colors = getThemeColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: { family: 'Inter', size: 12, weight: 500 }
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Inter', weight: 700 },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { color: colors.grid, drawBorder: false },
        ticks: { color: colors.text, font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: colors.grid, drawBorder: false },
        ticks: { color: colors.text, font: { family: 'Inter', size: 11 } }
      }
    }
  };
}

// Keep track of charts for destruction on page reload/navigation if needed
export function registerChart(chart) {
  activeCharts.add(chart);
  return chart;
}

// Destroy all active charts (useful on dynamic changes)
export function destroyAllCharts() {
  activeCharts.forEach(chart => {
    try { chart.destroy(); } catch (e) {}
  });
  activeCharts.clear();
}

// Update colors of all charts dynamically when theme switches
export function updateAllChartsTheme() {
  const colors = getThemeColors();
  activeCharts.forEach(chart => {
    // Update generic options
    if (chart.options.scales) {
      if (chart.options.scales.x && chart.options.scales.x.grid) {
        chart.options.scales.x.grid.color = colors.grid;
        chart.options.scales.x.ticks.color = colors.text;
      }
      if (chart.options.scales.y && chart.options.scales.y.grid) {
        chart.options.scales.y.grid.color = colors.grid;
        chart.options.scales.y.ticks.color = colors.text;
      }
    }
    
    if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
      chart.options.plugins.legend.labels.color = colors.text;
    }
    
    if (chart.options.plugins && chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
      chart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
      chart.options.plugins.tooltip.titleColor = colors.tooltipText;
      chart.options.plugins.tooltip.bodyColor = colors.tooltipText;
    }
    
    chart.update();
  });
}

// 1. Line Chart Builder
export function drawLineChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const options = getBaseOptions();
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(ds => ({
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        ...ds
      }))
    },
    options
  });
  
  return registerChart(chart);
}

// 2. Area Chart Builder (Line with fill option)
export function drawAreaChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const options = getBaseOptions();
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(ds => ({
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
        ...ds
      }))
    },
    options
  });
  
  return registerChart(chart);
}

// 3. Bar Chart Builder
export function drawBarChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const options = getBaseOptions();
  
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(ds => ({
        borderRadius: 4,
        borderSkipped: false,
        ...ds
      }))
    },
    options
  });
  
  return registerChart(chart);
}

// 4. Pie Chart Builder
export function drawPieChart(canvasId, labels, data, backgroundColors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const colors = getThemeColors();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.text,
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: getBaseOptions().plugins.tooltip
    }
  };
  
  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options
  });
  
  return registerChart(chart);
}

// 5. Doughnut Chart Builder
export function drawDoughnutChart(canvasId, labels, data, backgroundColors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  const colors = getThemeColors();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.text,
          font: { family: 'Inter', size: 12, weight: 500 }
        }
      },
      tooltip: getBaseOptions().plugins.tooltip
    }
  };
  
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options
  });
  
  return registerChart(chart);
}
