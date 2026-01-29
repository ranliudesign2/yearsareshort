// ===== Constants =====
const DEFAULT_NON_NEGOTIABLES = [
  { id: 'default-morning-routine', label: 'Morning routine', order: 0 },
  { id: 'default-exercise', label: 'Exercise', order: 1 },
  { id: 'default-deep-work', label: 'Deep work', order: 2 },
  { id: 'default-connect', label: 'Connect with loved one', order: 3 },
  { id: 'default-reflection', label: 'Evening reflection', order: 4 }
];

const MAX_ITEMS = 10;
const MIN_ITEMS = 1;
const MAX_PAST_DAYS = 30;
const MAX_FUTURE_DAYS = 7;

// ===== State =====
let currentViewDate = new Date();
let settings = null;
let nonNegotiables = [];
let dailyData = {};

// ===== Utility Functions =====
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date) {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function isToday(date) {
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate > today;
}

function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

// ===== Storage Functions =====
async function loadData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings', 'nonNegotiables', 'dailyData'], (result) => {
      settings = result.settings || null;
      nonNegotiables = result.nonNegotiables || [...DEFAULT_NON_NEGOTIABLES];
      dailyData = result.dailyData || {};
      resolve();
    });
  });
}

async function saveSettings(newSettings) {
  settings = newSettings;
  return new Promise((resolve) => {
    chrome.storage.local.set({ settings }, resolve);
  });
}

async function saveNonNegotiables() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ nonNegotiables }, resolve);
  });
}

async function saveDailyData() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ dailyData }, resolve);
  });
}

function getDayData(dateStr) {
  if (!dailyData[dateStr]) {
    dailyData[dateStr] = {
      highlight: { text: '', completed: false },
      checklist: {}
    };
  }
  return dailyData[dateStr];
}

function getCompletionRate(dateStr) {
  const dayData = dailyData[dateStr];
  if (!dayData) return 0;

  // Count completed non-negotiables
  let completed = 0;
  let total = nonNegotiables.length;

  nonNegotiables.forEach(item => {
    if (dayData.checklist[item.id]) completed++;
  });

  // Include highlight if it has text
  if (dayData.highlight.text) {
    total++;
    if (dayData.highlight.completed) completed++;
  }

  return total > 0 ? completed / total : 0;
}

function getDateFromWeekIndex(weekIndex, birthDate) {
  const birth = new Date(birthDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return new Date(birth.getTime() + weekIndex * msPerWeek);
}

function getWeeklyCompletion(weekIndex, birthDate) {
  const weekStart = getDateFromWeekIndex(weekIndex, birthDate);
  let totalRate = 0;
  let daysWithData = 0;

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const dateStr = formatDate(date);

    if (dailyData[dateStr]) {
      totalRate += getCompletionRate(dateStr);
      daysWithData++;
    }
  }

  return daysWithData > 0 ? totalRate / daysWithData : 0;
}

// ===== Theme Toggle =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggle(savedTheme);
}

function updateThemeToggle(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const options = toggle.querySelectorAll('.theme-toggle-option');
  options.forEach(option => {
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', (e) => {
    const option = e.target.closest('.theme-toggle-option');
    if (!option) return;

    const theme = option.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggle(theme);
  });
}

// Initialize theme immediately
initTheme();

// ===== DOM Elements =====
const elements = {
  onboardingModal: document.getElementById('onboarding-modal'),
  settingsModal: document.getElementById('settings-modal'),
  mainContent: document.getElementById('main-content'),
  birthDate: document.getElementById('birth-date'),
  lifeExpectancy: document.getElementById('life-expectancy'),
  setupCompleteBtn: document.getElementById('setup-complete-btn'),
  settingsBirthDate: document.getElementById('settings-birth-date'),
  settingsLifeExpectancy: document.getElementById('settings-life-expectancy'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  closeSettings: document.getElementById('close-settings'),
  openSettings: document.getElementById('open-settings'),
  prevDay: document.getElementById('prev-day'),
  nextDay: document.getElementById('next-day'),
  currentDate: document.getElementById('current-date'),
  todayIndicator: document.getElementById('today-indicator'),
  todayBtn: document.getElementById('today-btn'),
  highlightCheckbox: document.getElementById('highlight-checkbox'),
  highlightInput: document.getElementById('highlight-input'),
  nonNegotiablesList: document.getElementById('non-negotiables-list'),
  addItemBtn: document.getElementById('add-item-btn'),
  moriGrid: document.getElementById('mori-grid'),
  statAge: document.getElementById('stat-age'),
  statWeeksLived: document.getElementById('stat-weeks-lived'),
  statWeeksRemaining: document.getElementById('stat-weeks-remaining'),
  statPercentage: document.getElementById('stat-percentage'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  importFileInput: document.getElementById('import-file-input')
};

// ===== Onboarding =====
function showOnboarding() {
  elements.onboardingModal.classList.remove('hidden');
  elements.mainContent.classList.add('hidden');

  // Set default date to 30 years ago
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 30);
  elements.birthDate.value = formatDate(defaultDate);
}

function hideOnboarding() {
  elements.onboardingModal.classList.add('hidden');
  elements.mainContent.classList.remove('hidden');
}

elements.setupCompleteBtn.addEventListener('click', async () => {
  const birthDate = elements.birthDate.value;
  const lifeExpectancy = parseInt(elements.lifeExpectancy.value) || 80;

  if (!birthDate) {
    elements.birthDate.focus();
    return;
  }

  await saveSettings({
    birthDate,
    lifeExpectancy,
    setupComplete: true
  });

  hideOnboarding();
  initializeApp();
});

// ===== Settings Modal =====
elements.openSettings.addEventListener('click', () => {
  elements.settingsBirthDate.value = settings.birthDate;
  elements.settingsLifeExpectancy.value = settings.lifeExpectancy;
  elements.settingsModal.classList.remove('hidden');
});

elements.closeSettings.addEventListener('click', () => {
  elements.settingsModal.classList.add('hidden');
});

elements.saveSettingsBtn.addEventListener('click', async () => {
  const birthDate = elements.settingsBirthDate.value;
  const lifeExpectancy = parseInt(elements.settingsLifeExpectancy.value) || 80;

  if (!birthDate) return;

  await saveSettings({
    ...settings,
    birthDate,
    lifeExpectancy
  });

  elements.settingsModal.classList.add('hidden');
  renderMoriGrid();
  updateLifeStats();
});

// Close modal on backdrop click
elements.settingsModal.addEventListener('click', (e) => {
  if (e.target === elements.settingsModal) {
    elements.settingsModal.classList.add('hidden');
  }
});

// ===== Data Export/Import =====
function exportDataAsJSON() {
  // Get current theme from the DOM
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: {
      birthDate: settings.birthDate,
      lifeExpectancy: settings.lifeExpectancy,
      theme: currentTheme
    },
    nonNegotiables: nonNegotiables,
    dailyData: dailyData
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `years-are-short-backup-${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportDataAsCSV() {
  // Get all unique dates from dailyData
  const dates = Object.keys(dailyData).sort();

  if (dates.length === 0) {
    alert('No data to export yet. Start tracking your days first!');
    return;
  }

  // Sort tasks by order
  const sortedTasks = [...nonNegotiables].sort((a, b) => a.order - b.order);

  // Build CSV header with actual task names
  let headers = ['Date', 'Highlight', 'Highlight Completed'];
  sortedTasks.forEach((task, i) => {
    headers.push(`Task ${i + 1}: ${task.label}`, `Task ${i + 1} Completed`);
  });

  // Build CSV rows
  const rows = [headers.join(',')];

  for (const date of dates) {
    const day = dailyData[date];
    // Handle highlight as object { text, completed } or legacy string format
    const highlightText = typeof day.highlight === 'object' ? (day.highlight.text || '') : (day.highlight || '');
    const highlightCompleted = typeof day.highlight === 'object' ? day.highlight.completed : day.highlightCompleted;
    const row = [
      date,
      `"${highlightText.replace(/"/g, '""')}"`,
      highlightCompleted ? 'true' : 'false'
    ];

    // Get completion status from checklist by task ID
    const checklist = day.checklist || {};
    sortedTasks.forEach(task => {
      row.push(`"${task.label.replace(/"/g, '""')}"`);
      row.push(checklist[task.id] ? 'true' : 'false');
    });

    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `years-are-short-data-${formatDate(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate the data structure
        if (!data.settings || !data.settings.birthDate) {
          throw new Error('Invalid backup file: missing settings');
        }

        // Confirm import
        const confirmed = confirm(
          'This will replace all your current data with the imported data. ' +
          'Are you sure you want to continue?'
        );

        if (!confirmed) {
          resolve(false);
          return;
        }

        // Import settings
        settings = {
          ...settings,
          birthDate: data.settings.birthDate,
          lifeExpectancy: data.settings.lifeExpectancy || 80,
          theme: data.settings.theme || 'dark',
          setupComplete: true
        };
        await saveSettings(settings);

        // Import non-negotiables
        if (data.nonNegotiables && Array.isArray(data.nonNegotiables)) {
          nonNegotiables = data.nonNegotiables;
          await saveNonNegotiables();
        }

        // Import daily data
        if (data.dailyData && typeof data.dailyData === 'object') {
          dailyData = data.dailyData;
          await saveDailyData();
        }

        alert('Data imported successfully! The page will now reload.');

        // Force page reload to ensure clean state
        window.location.reload();
        resolve(true);

      } catch (error) {
        alert('Error importing data: ' + error.message);
        reject(error);
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

// Export/Import event listeners
elements.exportJsonBtn.addEventListener('click', exportDataAsJSON);
elements.exportCsvBtn.addEventListener('click', exportDataAsCSV);
elements.importFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await importData(file);
    e.target.value = ''; // Reset input
  }
});

// ===== Date Navigation =====
function updateDateNavigation() {
  const today = new Date();
  const daysDiff = daysDifference(currentViewDate, today);

  // Update date display
  elements.currentDate.textContent = formatDisplayDate(currentViewDate);

  // Show/hide today badge and today button
  if (isToday(currentViewDate)) {
    elements.todayIndicator.classList.remove('hidden');
    elements.todayBtn.classList.add('hidden');
  } else {
    elements.todayIndicator.classList.add('hidden');
    elements.todayBtn.classList.remove('hidden');
  }

  // Enable/disable nav buttons
  elements.prevDay.disabled = daysDiff <= -MAX_PAST_DAYS;
  elements.nextDay.disabled = daysDiff >= MAX_FUTURE_DAYS;

  // Update readonly state
  const focusPanel = document.querySelector('.focus-panel');
  if (isPastDate(currentViewDate)) {
    focusPanel.classList.add('readonly');
  } else {
    focusPanel.classList.remove('readonly');
  }
}

elements.prevDay.addEventListener('click', () => {
  currentViewDate = addDays(currentViewDate, -1);
  updateDateNavigation();
  renderDailyContent();
});

elements.nextDay.addEventListener('click', () => {
  currentViewDate = addDays(currentViewDate, 1);
  updateDateNavigation();
  renderDailyContent();
});

elements.todayBtn.addEventListener('click', () => {
  currentViewDate = new Date();
  updateDateNavigation();
  renderDailyContent();
});

// ===== Daily Highlight =====
function renderHighlight() {
  const dateStr = formatDate(currentViewDate);
  const dayData = getDayData(dateStr);

  elements.highlightInput.value = dayData.highlight.text;
  elements.highlightCheckbox.checked = dayData.highlight.completed;

  if (dayData.highlight.completed) {
    elements.highlightInput.classList.add('completed');
  } else {
    elements.highlightInput.classList.remove('completed');
  }
}

elements.highlightInput.addEventListener('input', async () => {
  const dateStr = formatDate(currentViewDate);
  const dayData = getDayData(dateStr);
  dayData.highlight.text = elements.highlightInput.value;
  await saveDailyData();
});

elements.highlightCheckbox.addEventListener('change', async () => {
  const dateStr = formatDate(currentViewDate);
  const dayData = getDayData(dateStr);
  dayData.highlight.completed = elements.highlightCheckbox.checked;

  if (elements.highlightCheckbox.checked) {
    elements.highlightInput.classList.add('completed');
  } else {
    elements.highlightInput.classList.remove('completed');
  }

  await saveDailyData();
});

// ===== Non-Negotiables =====
function renderNonNegotiables() {
  const dateStr = formatDate(currentViewDate);
  const dayData = getDayData(dateStr);
  const isReadonly = isPastDate(currentViewDate);

  elements.nonNegotiablesList.innerHTML = '';

  nonNegotiables.sort((a, b) => a.order - b.order).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'checklist-item';
    li.dataset.id = item.id;

    const isChecked = dayData.checklist[item.id] || false;

    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${isChecked ? 'checked' : ''} ${isReadonly ? 'disabled' : ''}>
      <input type="text" class="item-label ${isChecked ? 'completed' : ''}" value="${escapeHtml(item.label)}"
             placeholder="Enter task..." ${isReadonly ? 'disabled' : ''}>
      ${!isReadonly && nonNegotiables.length > MIN_ITEMS ?
        '<button class="delete-btn" aria-label="Delete item">&times;</button>' : ''}
    `;

    elements.nonNegotiablesList.appendChild(li);

    // Event listeners
    const checkbox = li.querySelector('.checkbox');
    const label = li.querySelector('.item-label');
    const deleteBtn = li.querySelector('.delete-btn');

    checkbox.addEventListener('change', async () => {
      dayData.checklist[item.id] = checkbox.checked;
      label.classList.toggle('completed', checkbox.checked);
      await saveDailyData();
    });

    label.addEventListener('input', async () => {
      item.label = label.value;
      await saveNonNegotiables();
    });

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        nonNegotiables = nonNegotiables.filter(n => n.id !== item.id);
        await saveNonNegotiables();
        renderNonNegotiables();
        updateAddButton();
      });
    }
  });

  updateAddButton();
}

function updateAddButton() {
  const isReadonly = isPastDate(currentViewDate);
  if (nonNegotiables.length >= MAX_ITEMS || isReadonly) {
    elements.addItemBtn.classList.add('hidden');
  } else {
    elements.addItemBtn.classList.remove('hidden');
  }
}

elements.addItemBtn.addEventListener('click', async () => {
  if (nonNegotiables.length >= MAX_ITEMS) return;

  const newItem = {
    id: generateId(),
    label: '',
    order: nonNegotiables.length
  };

  nonNegotiables.push(newItem);
  await saveNonNegotiables();
  renderNonNegotiables();

  // Focus the new input
  const inputs = elements.nonNegotiablesList.querySelectorAll('.item-label');
  if (inputs.length > 0) {
    inputs[inputs.length - 1].focus();
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Memento Mori Grid =====
function calculateLifeStats() {
  if (!settings || !settings.birthDate) return null;

  const birthDate = new Date(settings.birthDate);
  const today = new Date();
  const lifeExpectancy = settings.lifeExpectancy || 80;

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Calculate weeks
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksLived = Math.floor((today - birthDate) / msPerWeek);
  const totalWeeks = lifeExpectancy * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentage = Math.min(100, (weeksLived / totalWeeks) * 100);

  return {
    age,
    weeksLived,
    weeksRemaining,
    percentage,
    totalWeeks,
    lifeExpectancy
  };
}

function updateLifeStats() {
  const stats = calculateLifeStats();
  if (!stats) return;

  elements.statAge.textContent = stats.age;
  elements.statWeeksLived.textContent = stats.weeksLived.toLocaleString();
  elements.statWeeksRemaining.textContent = stats.weeksRemaining.toLocaleString();
  elements.statPercentage.textContent = stats.percentage.toFixed(1) + '%';
}

function renderMoriGrid() {
  const stats = calculateLifeStats();
  if (!stats) return;

  elements.moriGrid.innerHTML = '';

  const lifeExpectancy = stats.lifeExpectancy;

  // Calculate dynamic cell size based on available width
  // Grid is: 52 columns (weeks) x years rows - allow vertical scrolling
  const gridContainer = elements.moriGrid.parentElement;
  const availableWidth = gridContainer.clientWidth;

  const gapSize = 1;

  // Calculate cell size based on width only - allow vertical scroll
  const cellSize = Math.max(4, Math.floor((availableWidth - (51 * gapSize)) / 52));

  // Apply grid template: 52 columns x years rows
  elements.moriGrid.style.gridTemplateColumns = `repeat(52, ${cellSize}px)`;
  elements.moriGrid.style.gridTemplateRows = `repeat(${lifeExpectancy}, ${cellSize}px)`;

  // Create tooltip element
  let tooltip = document.querySelector('.tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }

  // Render grid: iterate by year (row) then by week (column)
  // Each row = 1 year, each column = 1 week
  for (let year = 0; year < lifeExpectancy; year++) {
    for (let week = 0; week < 52; week++) {
      const cell = document.createElement('div');
      cell.className = 'week-cell';

      const weekIndex = year * 52 + week;

      let completionRate = 0;
      if (weekIndex < stats.weeksLived) {
        cell.classList.add('lived');
        completionRate = getWeeklyCompletion(weekIndex, settings.birthDate);
        // Apply stepped opacity based on completion rate
        // 0-30% → 30% opacity, 30-50% → 50%, 50-70% → 70%, 70-100% → 100%
        let opacity = 0.3; // minimum for no/low completion
        if (completionRate > 0.7) {
          opacity = 1.0;
        } else if (completionRate > 0.5) {
          opacity = 0.7;
        } else if (completionRate > 0.3) {
          opacity = 0.5;
        }
        // Use CSS variable with opacity
        cell.style.background = `color-mix(in srgb, var(--accent) ${opacity * 100}%, transparent)`;
      } else if (weekIndex === stats.weeksLived) {
        cell.classList.add('current');
        completionRate = getWeeklyCompletion(weekIndex, settings.birthDate);
      } else {
        cell.classList.add('future');
      }

      cell.addEventListener('mouseenter', (e) => {
        const completionText = weekIndex <= stats.weeksLived && completionRate > 0
          ? ` - ${Math.round(completionRate * 100)}% complete`
          : '';
        tooltip.textContent = `Year ${year + 1}, Week ${week + 1}${completionText}`;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      });

      cell.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      });

      cell.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      elements.moriGrid.appendChild(cell);
    }
  }
}

// Handle window resize to recalculate grid
window.addEventListener('resize', () => {
  if (settings && settings.setupComplete) {
    renderMoriGrid();
  }
});

// ===== Render Daily Content =====
function renderDailyContent() {
  renderHighlight();
  renderNonNegotiables();
}

// ===== Falling Leaves Animation =====
function createFallingLeaves() {
  const container = document.createElement('div');
  container.className = 'falling-leaves';
  document.body.appendChild(container);

  const leafCount = 7; // Small number for subtle effect

  for (let i = 0; i < leafCount; i++) {
    createLeaf(container, i);
  }
}

function createLeaf(container, index) {
  const leaf = document.createElement('div');
  leaf.className = 'leaf';

  // Randomly pick one of three leaf variants
  const leafVariant = Math.floor(Math.random() * 3) + 1;
  leaf.classList.add('leaf-' + leafVariant);

  // Start from top-right corner (where tree is) - 70-95% of screen width
  const startX = 70 + Math.random() * 25;
  leaf.style.left = startX + '%';

  // Start lower on screen - 10-25% from top (where branches are)
  const startY = 20 + Math.random() * 15;
  leaf.style.top = startY + '%';

  // Random size
  const size = 18 + Math.random() * 18;
  leaf.style.width = size + 'px';
  leaf.style.height = size + 'px';

  // Random perspective transforms - limited so leaf points downward
  const rotateX = Math.random() * 30 - 15; // -15 to 15 degrees (slight tilt)
  const rotateY = Math.random() * 30 - 15; // -15 to 15 degrees (slight tilt)
  const rotateZ = Math.random() * 40 - 20; // -20 to 20 degrees (slight rotation, keeps stem up)
  leaf.style.setProperty('--rotateX', rotateX + 'deg');
  leaf.style.setProperty('--rotateY', rotateY + 'deg');
  leaf.style.setProperty('--rotateZ', rotateZ + 'deg');

  // Random animation duration and delay
  const fallDuration = 15 + Math.random() * 20; // 15-35 seconds
  const swayDuration = 3 + Math.random() * 4; // 3-7 seconds for sway
  const delay = Math.random() * 8; // 0-8 second random delay
  leaf.style.animationDuration = fallDuration + 's, ' + swayDuration + 's';
  leaf.style.animationDelay = delay + 's, 0s';

  // Subtle sway as leaves fall
  const swayAmount = 20 + Math.random() * 40;
  leaf.style.setProperty('--sway', swayAmount + 'px');

  container.appendChild(leaf);
}

// ===== Initialize App =====
async function initializeApp() {
  await loadData();

  if (!settings || !settings.setupComplete) {
    showOnboarding();
    return;
  }

  elements.onboardingModal.classList.add('hidden');
  elements.mainContent.classList.remove('hidden');

  // Setup theme toggle
  setupThemeToggle();

  // Create falling leaves animation
  createFallingLeaves();

  // Set current view date to today
  currentViewDate = new Date();

  updateDateNavigation();
  renderDailyContent();
  updateLifeStats();
  renderMoriGrid();
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
  // Only if not in input field
  if (e.target.tagName === 'INPUT') return;

  if (e.key === 'ArrowLeft') {
    elements.prevDay.click();
  } else if (e.key === 'ArrowRight') {
    elements.nextDay.click();
  }
});

// ===== Start App =====
initializeApp();

// ===== TEST DATA GENERATOR (Remove before production) =====
// Run populateTestData() in browser console to generate sample data
window.populateTestData = async function(daysBack = 90) {
  const today = new Date();

  for (let i = 1; i <= daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    // Random completion rate (weighted towards higher completion)
    const completionChance = Math.random();
    const checklist = {};

    nonNegotiables.forEach(item => {
      // 70% chance of completing each item
      checklist[item.id] = Math.random() < 0.7;
    });

    // Random highlight
    const hasHighlight = Math.random() < 0.8;
    const highlightCompleted = hasHighlight && Math.random() < 0.6;

    dailyData[dateStr] = {
      highlight: {
        text: hasHighlight ? 'Test highlight for ' + dateStr : '',
        completed: highlightCompleted
      },
      checklist
    };
  }

  await saveDailyData();
  renderMoriGrid();
  console.log(`Generated test data for ${daysBack} days. Refresh to see changes.`);
};

// Run clearTestData() to remove all daily data
window.clearTestData = async function() {
  dailyData = {};
  await saveDailyData();
  renderMoriGrid();
  console.log('All daily data cleared.');
};
