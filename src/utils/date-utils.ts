"use client"

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (diffDays > 0 && diffDays <= 7) {
    return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
  } else if (diffDays < 0 && diffDays >= -7) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
}

export function getContrastTextColor(hexcolor: string): string {
  // If a category color is not provided, default to a dark text color
  if (!hexcolor) return "text-gray-800"

  // Remove # if it exists
  const r = Number.parseInt(hexcolor.substring(1, 3), 16)
  const g = Number.parseInt(hexcolor.substring(3, 5), 16)
  const b = Number.parseInt(hexcolor.substring(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "text-gray-800" : "text-white"
}

// IST (Indian Standard Time) utilities - UTC+05:30
const IST_OFFSET_MINUTES = 5.5 * 60; // IST is UTC+05:30

/**
 * Get current date and time in IST
 */
export function getCurrentIST(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

/**
 * Convert any date to IST
 */
export function toIST(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

/**
 * Format date as YYYY-MM-DD in IST
 */
export function formatDateIST(date: Date): string {
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return istDate.toISOString().split('T')[0];
}

/**
 * Format datetime as YYYY-MM-DDTHH:mm for input field in IST
 */
export function formatDateTimeIST(date: Date): string {
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return istDate.toISOString().slice(0, 16);
}

/**
 * Parse datetime string and ensure it's treated as IST
 */
export function parseDateTimeIST(dateTimeString: string): Date {
  // Create date assuming local timezone
  const date = new Date(dateTimeString);
  // Convert to UTC by adjusting for IST offset
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000) + (IST_OFFSET_MINUTES * 60000));
}

/**
 * Get today's date key in IST format (YYYY-MM-DD)
 */
export function getTodayIST(): string {
  return formatDateIST(getCurrentIST());
}

/**
 * Create a date from day number in the current month (IST)
 */
export function createISTDateFromDay(year: number, month: number, day: number): Date {
  // Create date in IST timezone
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const localDate = new Date(dateString + 'T00:00:00');
  return localDate;
}

/**
 * Check if a date is today in IST
 */
export function isTodayIST(date: Date): boolean {
  return formatDateIST(date) === getTodayIST();
}

/**
 * Check if a date is in the past (before today) in IST
 */
export function isPastDateIST(date: Date): boolean {
  const today = getTodayIST();
  const dateString = formatDateIST(date);
  return dateString < today;
}

/**
 * Get the minimum datetime for scheduling (current time + 1 hour in IST)
 */
export function getMinScheduleTimeIST(): string {
  const now = getCurrentIST();
  now.setHours(now.getHours() + 1); // Add 1 hour minimum
  return formatDateTimeIST(now);
}

/**
 * Convert a datetime to IST and format for display
 */
export function formatDisplayDateTimeIST(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a date string consistently for calendar comparisons
 */
export function normalizeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDateIST(d);
}
