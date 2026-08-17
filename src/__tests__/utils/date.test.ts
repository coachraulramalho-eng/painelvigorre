import {
  formatDate,
  formatDateTime,
  isToday,
  isPast,
  isFuture,
  addDays,
  getDaysDiff,
  getMonthName,
} from '@/lib/utils/date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-08-17');
      expect(formatDate(date)).toBe('17/08/2026');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2026-08-17T14:30:00');
      expect(formatDateTime(date)).toBe('17/08/2026 14:30');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for different date', () => {
      const date = new Date('2026-08-16');
      expect(isToday(date)).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past date', () => {
      const date = new Date('2026-08-16');
      expect(isPast(date)).toBe(true);
    });

    it('should return false for future date', () => {
      const date = new Date('2026-08-19');
      expect(isPast(date)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const date = new Date('2026-08-17');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(22);
    });
  });

  describe('getDaysDiff', () => {
    it('should calculate days difference correctly', () => {
      const date1 = new Date('2026-08-17');
      const date2 = new Date('2026-08-20');
      expect(getDaysDiff(date1, date2)).toBe(3);
    });
  });

  describe('getMonthName', () => {
    it('should return month name correctly', () => {
      expect(getMonthName(0)).toBe('Janeiro');
      expect(getMonthName(7)).toBe('Agosto');
      expect(getMonthName(11)).toBe('Dezembro');
    });
  });
});
