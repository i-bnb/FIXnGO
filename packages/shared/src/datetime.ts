/**
 * Single Source of Truth: ONE TIMEZONE ENGINE for FIXnGO
 *
 * All user-facing dates and times MUST be computed and rendered in Asia/Dubai (UTC+4).
 * Never render a raw UTC timestamp string directly to end users.
 */

export const DUBAI_TIMEZONE = 'Asia/Dubai';

export type SupportedLocale = 'en' | 'ar';

/**
 * Extracts the hour (0-23) in Asia/Dubai for a given date.
 */
export function getDubaiHour(date: Date | string | number = new Date()): number {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DUBAI_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d);

  const hourPart = parts.find((p) => p.type === 'hour');
  const hour = hourPart ? parseInt(hourPart.value, 10) : 0;
  return hour === 24 ? 0 : hour;
}

/**
 * Returns dynamic greeting based on Asia/Dubai local time.
 * Morning: 04:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Evening: 17:00 - 03:59
 */
export function getDubaiGreeting(
  locale: SupportedLocale = 'en',
  date: Date | string | number = new Date(),
): string {
  const hour = getDubaiHour(date);

  if (locale === 'ar') {
    if (hour >= 4 && hour < 12) {
      return 'صباح الخير';
    }
    return 'مساء الخير';
  }

  if (hour >= 4 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Formats a live date banner in Asia/Dubai (e.g. "Thursday, 25 Sep 2026").
 */
export function formatDubaiLiveDate(
  date: Date | string | number = new Date(),
  locale: SupportedLocale = 'en',
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const intlLocale = locale === 'ar' ? 'ar-AE' : 'en-AE';

  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: DUBAI_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats date and time in Asia/Dubai (e.g. "25 Sep 2026, 14:30").
 */
export function formatDubaiDateTime(
  date: Date | string | number,
  locale: SupportedLocale = 'en',
  includeSeconds: boolean = false,
): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const intlLocale = locale === 'ar' ? 'ar-AE' : 'en-AE';

  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: DUBAI_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(d);
}

/**
 * Formats time only in Asia/Dubai (e.g. "14:30" or "02:30 PM").
 */
export function formatDubaiTime(
  date: Date | string | number,
  locale: SupportedLocale = 'en',
  use24Hour: boolean = true,
): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const intlLocale = locale === 'ar' ? 'ar-AE' : 'en-AE';

  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: DUBAI_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  }).format(d);
}

/**
 * Formats a relative time string ("5 min ago", "in 12 min", "yesterday").
 */
export function formatRelativeDubaiTime(
  targetDate: Date | string | number,
  baseDate: Date | string | number = new Date(),
  locale: SupportedLocale = 'en',
): string {
  if (!targetDate) return '';
  const t = typeof targetDate === 'string' || typeof targetDate === 'number' ? new Date(targetDate).getTime() : targetDate.getTime();
  const b = typeof baseDate === 'string' || typeof baseDate === 'number' ? new Date(baseDate).getTime() : baseDate.getTime();

  const diffSec = Math.round((t - b) / 1000);
  const isPast = diffSec < 0;
  const absSec = Math.abs(diffSec);

  if (absSec < 45) {
    return locale === 'ar' ? 'الآن' : 'just now';
  }

  const minutes = Math.round(absSec / 60);
  if (minutes < 60) {
    if (locale === 'ar') {
      return isPast ? `منذ ${minutes} دقيقة` : `خلال ${minutes} دقيقة`;
    }
    return isPast ? `${minutes} min ago` : `in ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    if (locale === 'ar') {
      return isPast ? `منذ ${hours} ساعة` : `خلال ${hours} ساعة`;
    }
    return isPast ? `${hours} hr ago` : `in ${hours} hr`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) {
    if (locale === 'ar') {
      return isPast ? 'أمس' : 'غداً';
    }
    return isPast ? 'yesterday' : 'tomorrow';
  }

  return formatDubaiLiveDate(new Date(t), locale);
}
