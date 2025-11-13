/**
 * Utility functions for date/time formatting
 * Handles timezone issues by treating all dates as local time
 */

export class DateTimeUtils {
  /**
   * Format datetime string to Vietnamese locale without timezone conversion
   * @param dateTime - DateTime string from SQL (e.g., "2025-11-07 10:00:00.000")
   * @returns Formatted string in Vietnamese format (e.g., "07/11/2025 10:00")
   */
  static formatDateTime(dateTime: string | null | undefined): string {
    if (!dateTime) return '-';

    try {
      const cleanDateTime = dateTime.trim().replace(/Z$/, '');

      // Parse manually for SQL datetime format: "2025-11-07 10:00:00.000"
      const sqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/;
      const match = cleanDateTime.match(sqlDateTimeRegex);

      if (match) {
        const [, year, month, day, hour, minute] = match;

        // Format manually without Date object to avoid timezone conversion
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

        return `${formattedDate} ${formattedTime}`;
      }

      // Fallback: try to parse ISO format but treat as local time
      const isoMatch = cleanDateTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
      if (isoMatch) {
        const [, year, month, day, hour, minute] = isoMatch;
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

        return `${formattedDate} ${formattedTime}`;
      }

      // Last resort: return original value
      return cleanDateTime;
    } catch (error) {
      console.warn('DateTime formatting error:', error, dateTime);
      return dateTime;
    }
  }

  /**
   * Format date only (without time)
   * @param date - Date string
   * @returns Formatted date string (e.g., "07/11/2025")
   */
  static formatDate(date: string | null | undefined): string {
    if (!date) return '-';

    try {
      let cleanDate = date.trim().replace(/Z$/, '');

      // Handle both full datetime and date-only strings
      if (cleanDate.includes(' ')) {
        cleanDate = cleanDate.split(' ')[0]; // Take only date part
      }

      const d = new Date(cleanDate + 'T00:00:00'); // Add time to avoid timezone issues

      if (isNaN(d.getTime())) {
        console.warn('Invalid date format:', date);
        return date;
      }

      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.warn('Date formatting error:', error, date);
      return date;
    }
  }

  /**
   * Format time only (without date)
   * @param time - Time string or datetime string
   * @returns Formatted time string (e.g., "10:00")
   */
  static formatTime(time: string | null | undefined): string {
    if (!time) return '-';

    try {
      const cleanTime = time.trim().replace(/Z$/, '');

      // Extract time from datetime string
      const timeMatch = cleanTime.match(/(\d{2}):(\d{2}):?\d{2}?/);
      if (timeMatch) {
        const [, hour, minute] = timeMatch;
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      }

      return cleanTime;
    } catch {
      return time;
    }
  }

  /**
   * Format minutes duration to human readable format
   * @param minutes - Duration in minutes
   * @returns Formatted duration string (e.g., "2 giờ 30 phút")
   */
  static formatMinutes(minutes: number): string {
    if (minutes < 0) return 'Đã quá giờ';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  }
}
