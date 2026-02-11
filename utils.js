// ===== Date Utility Functions =====

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date for display (e.g., "Wednesday, Jan 8")
 * @param {Date} date - The date to format
 * @returns {string} Human-readable date string
 */
function formatDisplayDate(date) {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Checks if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
function isToday(date) {
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

/**
 * Checks if a date is in the future
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is after today
 */
function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate > today;
}

/**
 * Checks if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is before today
 */
function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

/**
 * Adds days to a date
 * @param {Date} date - The starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date with days added
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculates the difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days (date1 - date2)
 */
function daysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

// ===== Life Statistics Calculations =====

/**
 * Calculates life statistics based on birth date and life expectancy
 * @param {string} birthDateStr - Birth date in YYYY-MM-DD format
 * @param {number} lifeExpectancy - Expected lifespan in years
 * @param {Date} [referenceDate] - Date to calculate from (defaults to today)
 * @returns {Object|null} Life statistics object or null if invalid input
 */
function calculateLifeStats(birthDateStr, lifeExpectancy, referenceDate = new Date()) {
  if (!birthDateStr) return null;

  const birthDate = new Date(birthDateStr);
  const today = new Date(referenceDate);
  const expectancy = lifeExpectancy || 80;

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Calculate weeks
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksLived = Math.floor((today - birthDate) / msPerWeek);
  const totalWeeks = expectancy * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentage = Math.min(100, (weeksLived / totalWeeks) * 100);

  return {
    age,
    weeksLived,
    weeksRemaining,
    percentage,
    totalWeeks,
    lifeExpectancy: expectancy
  };
}

/**
 * Gets the start date of a specific week in someone's life
 * @param {number} weekIndex - Zero-based week index
 * @param {string} birthDateStr - Birth date in YYYY-MM-DD format
 * @returns {Date} Start date of that week
 */
function getDateFromWeekIndex(weekIndex, birthDateStr) {
  const birth = new Date(birthDateStr);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return new Date(birth.getTime() + weekIndex * msPerWeek);
}

/**
 * Checks if a given date is the user's birthday (same month and day)
 * @param {string} birthDateStr - Birth date in YYYY-MM-DD format
 * @param {Date} [checkDate] - Date to check (defaults to today)
 * @returns {boolean} True if it's the user's birthday
 */
function isBirthday(birthDateStr, checkDate = new Date()) {
  if (!birthDateStr) return false;
  const birthDate = new Date(birthDateStr);
  return checkDate.getMonth() === birthDate.getMonth() &&
         checkDate.getDate() === birthDate.getDate();
}

// ===== Completion Rate Calculations =====

/**
 * Calculates completion rate for a specific day
 * @param {Object} dayData - Day data object with highlight and checklist
 * @param {Array} nonNegotiables - Array of non-negotiable items
 * @returns {number} Completion rate between 0 and 1
 */
function getCompletionRate(dayData, nonNegotiables) {
  if (!dayData) return 0;

  let completed = 0;
  let total = nonNegotiables.length;

  nonNegotiables.forEach(item => {
    if (dayData.checklist && dayData.checklist[item.id]) completed++;
  });

  // Include highlight if it has text
  if (dayData.highlight && dayData.highlight.text) {
    total++;
    if (dayData.highlight.completed) completed++;
  }

  return total > 0 ? completed / total : 0;
}

/**
 * Calculates average completion rate for a week
 * @param {number} weekIndex - Zero-based week index
 * @param {string} birthDateStr - Birth date in YYYY-MM-DD format
 * @param {Object} dailyData - Object containing all daily data keyed by date string
 * @param {Array} nonNegotiables - Array of non-negotiable items
 * @returns {number} Average completion rate for the week (0-1)
 */
function getWeeklyCompletion(weekIndex, birthDateStr, dailyData, nonNegotiables) {
  const weekStart = getDateFromWeekIndex(weekIndex, birthDateStr);
  let totalRate = 0;
  let daysWithData = 0;

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const dateStr = formatDate(date);

    if (dailyData[dateStr]) {
      totalRate += getCompletionRate(dailyData[dateStr], nonNegotiables);
      daysWithData++;
    }
  }

  return daysWithData > 0 ? totalRate / daysWithData : 0;
}

/**
 * Gets detailed summary for a week
 * @param {number} weekIndex - Zero-based week index
 * @param {string} birthDateStr - Birth date in YYYY-MM-DD format
 * @param {Object} dailyData - Object containing all daily data keyed by date string
 * @param {Array} nonNegotiables - Array of non-negotiable items
 * @returns {Object} Week summary with daysTracked, totalTasks, completedTasks, completionRate
 */
function getWeekSummary(weekIndex, birthDateStr, dailyData, nonNegotiables) {
  const weekStart = getDateFromWeekIndex(weekIndex, birthDateStr);
  let daysTracked = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const dateStr = formatDate(date);

    if (dailyData[dateStr]) {
      daysTracked++;
      const dayData = dailyData[dateStr];
      nonNegotiables.forEach(item => {
        totalTasks++;
        if (dayData.checklist && dayData.checklist[item.id]) completedTasks++;
      });
      if (dayData.highlight && dayData.highlight.text) {
        totalTasks++;
        if (dayData.highlight.completed) completedTasks++;
      }
    }
  }

  return {
    daysTracked,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0
  };
}

// Export for Node.js testing (ignored in browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    formatDisplayDate,
    isToday,
    isFutureDate,
    isPastDate,
    addDays,
    daysDifference,
    calculateLifeStats,
    getDateFromWeekIndex,
    isBirthday,
    getCompletionRate,
    getWeeklyCompletion,
    getWeekSummary
  };
}
