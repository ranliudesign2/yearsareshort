const {
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
} = require('../utils.js');

// ===== Date Utility Functions Tests =====

describe('formatDate', () => {
  test('formats date as YYYY-MM-DD', () => {
    const date = new Date(2024, 2, 15, 12, 0, 0); // March 15, 2024 noon local
    expect(formatDate(date)).toBe('2024-03-15');
  });

  test('handles single digit month and day', () => {
    const date = new Date(2024, 0, 5, 12, 0, 0); // Jan 5, 2024 noon local
    expect(formatDate(date)).toBe('2024-01-05');
  });

  test('handles end of year', () => {
    const date = new Date(2024, 11, 31, 12, 0, 0); // Dec 31, 2024 noon local
    expect(formatDate(date)).toBe('2024-12-31');
  });
});

describe('formatDisplayDate', () => {
  test('formats date in human readable format', () => {
    const date = new Date(2024, 2, 15, 12, 0, 0); // March 15, 2024 noon local
    const result = formatDisplayDate(date);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });

  test('includes weekday', () => {
    const date = new Date(2024, 2, 15, 12, 0, 0); // March 15, 2024 is a Friday
    const result = formatDisplayDate(date);
    expect(result).toContain('Friday');
  });
});

describe('isToday', () => {
  test('returns true for today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  test('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  test('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe('isFutureDate', () => {
  test('returns true for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isFutureDate(tomorrow)).toBe(true);
  });

  test('returns false for today', () => {
    const today = new Date();
    expect(isFutureDate(today)).toBe(false);
  });

  test('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isFutureDate(yesterday)).toBe(false);
  });

  test('returns true for date far in future', () => {
    const future = new Date('2099-12-31');
    expect(isFutureDate(future)).toBe(true);
  });
});

describe('isPastDate', () => {
  test('returns true for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isPastDate(yesterday)).toBe(true);
  });

  test('returns false for today', () => {
    const today = new Date();
    expect(isPastDate(today)).toBe(false);
  });

  test('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isPastDate(tomorrow)).toBe(false);
  });

  test('returns true for date far in past', () => {
    const past = new Date('1990-01-01');
    expect(isPastDate(past)).toBe(true);
  });
});

describe('addDays', () => {
  test('adds positive days', () => {
    const date = new Date('2024-03-15');
    const result = addDays(date, 5);
    expect(formatDate(result)).toBe('2024-03-20');
  });

  test('adds negative days (subtracts)', () => {
    const date = new Date('2024-03-15');
    const result = addDays(date, -5);
    expect(formatDate(result)).toBe('2024-03-10');
  });

  test('handles month boundary', () => {
    const date = new Date('2024-03-30');
    const result = addDays(date, 5);
    expect(formatDate(result)).toBe('2024-04-04');
  });

  test('handles year boundary', () => {
    const date = new Date('2024-12-30');
    const result = addDays(date, 5);
    expect(formatDate(result)).toBe('2025-01-04');
  });

  test('does not mutate original date', () => {
    const date = new Date('2024-03-15');
    const originalTime = date.getTime();
    addDays(date, 5);
    expect(date.getTime()).toBe(originalTime);
  });
});

describe('daysDifference', () => {
  test('calculates positive difference', () => {
    const date1 = new Date('2024-03-20');
    const date2 = new Date('2024-03-15');
    expect(daysDifference(date1, date2)).toBe(5);
  });

  test('calculates negative difference', () => {
    const date1 = new Date('2024-03-15');
    const date2 = new Date('2024-03-20');
    expect(daysDifference(date1, date2)).toBe(-5);
  });

  test('returns 0 for same date', () => {
    const date1 = new Date('2024-03-15');
    const date2 = new Date('2024-03-15');
    expect(daysDifference(date1, date2)).toBe(0);
  });

  test('handles different times on same day', () => {
    const date1 = new Date('2024-03-15T08:00:00');
    const date2 = new Date('2024-03-15T20:00:00');
    expect(daysDifference(date1, date2)).toBe(0);
  });
});

// ===== Life Statistics Tests =====

describe('calculateLifeStats', () => {
  test('returns null for empty birth date', () => {
    expect(calculateLifeStats('', 80)).toBeNull();
    expect(calculateLifeStats(null, 80)).toBeNull();
  });

  test('calculates correct age', () => {
    const birthDate = '1990-03-15';
    const referenceDate = new Date('2024-03-15');
    const stats = calculateLifeStats(birthDate, 80, referenceDate);
    expect(stats.age).toBe(34);
  });

  test('calculates age correctly before birthday', () => {
    const birthDate = '1990-06-15';
    const referenceDate = new Date('2024-03-15');
    const stats = calculateLifeStats(birthDate, 80, referenceDate);
    expect(stats.age).toBe(33);
  });

  test('calculates weeks lived', () => {
    const birthDate = '2024-01-01';
    const referenceDate = new Date('2024-01-15'); // 2 weeks later
    const stats = calculateLifeStats(birthDate, 80, referenceDate);
    expect(stats.weeksLived).toBe(2);
  });

  test('calculates total weeks based on life expectancy', () => {
    const stats = calculateLifeStats('1990-01-01', 80, new Date('2024-01-01'));
    expect(stats.totalWeeks).toBe(80 * 52); // 4160
  });

  test('calculates weeks remaining', () => {
    const birthDate = '2024-01-01';
    const referenceDate = new Date('2024-01-15');
    const stats = calculateLifeStats(birthDate, 80, referenceDate);
    expect(stats.weeksRemaining).toBe(80 * 52 - 2);
  });

  test('percentage is between 0 and 100', () => {
    const stats = calculateLifeStats('1990-01-01', 80, new Date('2024-01-01'));
    expect(stats.percentage).toBeGreaterThan(0);
    expect(stats.percentage).toBeLessThanOrEqual(100);
  });

  test('uses default life expectancy of 80', () => {
    const stats = calculateLifeStats('1990-01-01', null, new Date('2024-01-01'));
    expect(stats.lifeExpectancy).toBe(80);
    expect(stats.totalWeeks).toBe(80 * 52);
  });

  test('weeks remaining does not go negative', () => {
    // Person who is 100 with 80 year expectancy
    const stats = calculateLifeStats('1920-01-01', 80, new Date('2024-01-01'));
    expect(stats.weeksRemaining).toBe(0);
  });
});

describe('getDateFromWeekIndex', () => {
  test('week 0 returns birth date', () => {
    const birthDate = '1990-03-15';
    const result = getDateFromWeekIndex(0, birthDate);
    expect(formatDate(result)).toBe('1990-03-15');
  });

  test('week 1 is 7 days after birth', () => {
    const birthDate = '1990-03-15';
    const result = getDateFromWeekIndex(1, birthDate);
    expect(formatDate(result)).toBe('1990-03-22');
  });

  test('week 52 is approximately one year', () => {
    const birthDate = '1990-03-15';
    const result = getDateFromWeekIndex(52, birthDate);
    expect(formatDate(result)).toBe('1991-03-14');
  });
});

describe('isBirthday', () => {
  test('returns true on birthday', () => {
    const birthDate = '1990-03-15';
    const checkDate = new Date('2024-03-15');
    expect(isBirthday(birthDate, checkDate)).toBe(true);
  });

  test('returns false on different day', () => {
    const birthDate = '1990-03-15';
    const checkDate = new Date('2024-03-16');
    expect(isBirthday(birthDate, checkDate)).toBe(false);
  });

  test('returns false on different month', () => {
    const birthDate = '1990-03-15';
    const checkDate = new Date('2024-04-15');
    expect(isBirthday(birthDate, checkDate)).toBe(false);
  });

  test('returns false for empty birth date', () => {
    expect(isBirthday('', new Date())).toBe(false);
    expect(isBirthday(null, new Date())).toBe(false);
  });
});

// ===== Completion Rate Tests =====

describe('getCompletionRate', () => {
  const nonNegotiables = [
    { id: 'task1', label: 'Task 1' },
    { id: 'task2', label: 'Task 2' },
    { id: 'task3', label: 'Task 3' }
  ];

  test('returns 0 for null day data', () => {
    expect(getCompletionRate(null, nonNegotiables)).toBe(0);
  });

  test('returns 0 when no tasks completed', () => {
    const dayData = {
      highlight: { text: '', completed: false },
      checklist: {}
    };
    expect(getCompletionRate(dayData, nonNegotiables)).toBe(0);
  });

  test('returns 1 when all tasks completed', () => {
    const dayData = {
      highlight: { text: '', completed: false },
      checklist: { task1: true, task2: true, task3: true }
    };
    expect(getCompletionRate(dayData, nonNegotiables)).toBe(1);
  });

  test('returns correct partial completion', () => {
    const dayData = {
      highlight: { text: '', completed: false },
      checklist: { task1: true, task2: false, task3: false }
    };
    expect(getCompletionRate(dayData, nonNegotiables)).toBeCloseTo(1/3);
  });

  test('includes highlight in calculation when it has text', () => {
    const dayData = {
      highlight: { text: 'Do something', completed: false },
      checklist: { task1: true, task2: true, task3: true }
    };
    // 3 tasks + 1 highlight = 4 total, 3 completed
    expect(getCompletionRate(dayData, nonNegotiables)).toBe(0.75);
  });

  test('counts completed highlight', () => {
    const dayData = {
      highlight: { text: 'Do something', completed: true },
      checklist: { task1: true, task2: true, task3: true }
    };
    // 3 tasks + 1 highlight = 4 total, all completed
    expect(getCompletionRate(dayData, nonNegotiables)).toBe(1);
  });

  test('handles empty non-negotiables list', () => {
    const dayData = {
      highlight: { text: '', completed: false },
      checklist: {}
    };
    expect(getCompletionRate(dayData, [])).toBe(0);
  });
});

describe('getWeeklyCompletion', () => {
  const nonNegotiables = [
    { id: 'task1', label: 'Task 1' }
  ];

  test('returns 0 when no data exists', () => {
    const result = getWeeklyCompletion(0, '2024-01-01', {}, nonNegotiables);
    expect(result).toBe(0);
  });

  test('calculates average across days with data', () => {
    const dailyData = {
      '2024-01-01': { highlight: { text: '', completed: false }, checklist: { task1: true } },
      '2024-01-02': { highlight: { text: '', completed: false }, checklist: { task1: false } }
    };
    const result = getWeeklyCompletion(0, '2024-01-01', dailyData, nonNegotiables);
    expect(result).toBe(0.5);
  });
});

describe('getWeekSummary', () => {
  const nonNegotiables = [
    { id: 'task1', label: 'Task 1' },
    { id: 'task2', label: 'Task 2' }
  ];

  test('returns zeros when no data exists', () => {
    const result = getWeekSummary(0, '2024-01-01', {}, nonNegotiables);
    expect(result.daysTracked).toBe(0);
    expect(result.totalTasks).toBe(0);
    expect(result.completedTasks).toBe(0);
    expect(result.completionRate).toBe(0);
  });

  test('counts days tracked correctly', () => {
    const dailyData = {
      '2024-01-01': { highlight: { text: '', completed: false }, checklist: {} },
      '2024-01-02': { highlight: { text: '', completed: false }, checklist: {} },
      '2024-01-03': { highlight: { text: '', completed: false }, checklist: {} }
    };
    const result = getWeekSummary(0, '2024-01-01', dailyData, nonNegotiables);
    expect(result.daysTracked).toBe(3);
  });

  test('counts tasks correctly', () => {
    const dailyData = {
      '2024-01-01': {
        highlight: { text: 'Test', completed: true },
        checklist: { task1: true, task2: true }
      }
    };
    const result = getWeekSummary(0, '2024-01-01', dailyData, nonNegotiables);
    expect(result.totalTasks).toBe(3); // 2 tasks + 1 highlight
    expect(result.completedTasks).toBe(3);
    expect(result.completionRate).toBe(1);
  });

  test('calculates partial completion', () => {
    const dailyData = {
      '2024-01-01': {
        highlight: { text: '', completed: false },
        checklist: { task1: true, task2: false }
      }
    };
    const result = getWeekSummary(0, '2024-01-01', dailyData, nonNegotiables);
    expect(result.totalTasks).toBe(2);
    expect(result.completedTasks).toBe(1);
    expect(result.completionRate).toBe(0.5);
  });
});
