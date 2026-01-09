// ===== Constants =====
const DEFAULT_NON_NEGOTIABLES = [
  { id: generateId(), label: 'Morning routine', order: 0 },
  { id: generateId(), label: 'Exercise', order: 1 },
  { id: generateId(), label: 'Deep work', order: 2 },
  { id: generateId(), label: 'Connect with loved one', order: 3 },
  { id: generateId(), label: 'Evening reflection', order: 4 }
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
  highlightCheckbox: document.getElementById('highlight-checkbox'),
  highlightInput: document.getElementById('highlight-input'),
  nonNegotiablesList: document.getElementById('non-negotiables-list'),
  addItemBtn: document.getElementById('add-item-btn'),
  moriGrid: document.getElementById('mori-grid'),
  statAge: document.getElementById('stat-age'),
  statWeeksLived: document.getElementById('stat-weeks-lived'),
  statWeeksRemaining: document.getElementById('stat-weeks-remaining'),
  statPercentage: document.getElementById('stat-percentage')
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

// ===== Date Navigation =====
function updateDateNavigation() {
  const today = new Date();
  const daysDiff = daysDifference(currentViewDate, today);

  // Update date display
  elements.currentDate.textContent = formatDisplayDate(currentViewDate);

  // Show/hide today badge
  if (isToday(currentViewDate)) {
    elements.todayIndicator.classList.remove('hidden');
  } else {
    elements.todayIndicator.classList.add('hidden');
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

  // Calculate dynamic cell size to fit entire grid on screen
  // Grid is: 52 columns (weeks) x years rows
  const gridContainer = elements.moriGrid.parentElement;
  const availableWidth = gridContainer.clientWidth;
  const availableHeight = gridContainer.clientHeight;

  const gapSize = 1;

  // Calculate cell size based on both dimensions
  const cellSizeByWidth = Math.floor((availableWidth - (51 * gapSize)) / 52);
  const cellSizeByHeight = Math.floor((availableHeight - ((lifeExpectancy - 1) * gapSize)) / lifeExpectancy);
  const cellSize = Math.max(3, Math.min(cellSizeByWidth, cellSizeByHeight));

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

      if (weekIndex < stats.weeksLived) {
        cell.classList.add('lived');
      } else if (weekIndex === stats.weeksLived) {
        cell.classList.add('current');
      } else {
        cell.classList.add('future');
      }

      cell.addEventListener('mouseenter', (e) => {
        tooltip.textContent = `Year ${year + 1}, Week ${week + 1}`;
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

// ===== Initialize App =====
async function initializeApp() {
  await loadData();

  if (!settings || !settings.setupComplete) {
    showOnboarding();
    return;
  }

  elements.onboardingModal.classList.add('hidden');
  elements.mainContent.classList.remove('hidden');

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
