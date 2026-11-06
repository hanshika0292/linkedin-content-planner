"use client"

// Date helpers for the calendar, the scheduling picker and relative labels.
//
// A post's scheduled date is a calendar day, not an instant. The default schema
// (supabase/setup.sql) stores it in a `date` column, so Supabase returns a plain
// "YYYY-MM-DD" string. `new Date("YYYY-MM-DD")` reads that as midnight UTC, which
// is the previous evening anywhere west of UTC, and converting it to another time
// zone shifts it again. So these helpers never send a scheduled date through UTC:
// date-only strings are compared as strings, and when a Date is needed it is built
// from the local year, month and day.
//
// "Today" and the date picker use the browser's own time zone.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
// "YYYY-MM-DDTHH:mm" (optionally with seconds) and no offset: a local wall-clock time.
const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/

const MS_PER_DAY = 24 * 60 * 60 * 1000

const pad = (n: number) => String(n).padStart(2, "0")

/** The local calendar day of a Date, as "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Today's local calendar day, as "YYYY-MM-DD". */
export function getTodayKey(now: Date = new Date()): string {
  return toDateKey(now)
}

/** Local midnight at the start of a "YYYY-MM-DD" day. */
export function dateFromKey(key: string): Date {
  const match = DATE_ONLY.exec(key)
  if (!match) throw new Error(`Not a YYYY-MM-DD date: ${key}`)
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** Local midnight on a day of a month (month is 0-based, like Date#getMonth). */
export function createDateFromDay(year: number, month: number, day: number): Date {
  return new Date(year, month, day)
}

/** True when a stored date value carries a time of day, not just a date. */
export function hasTime(value: string): boolean {
  return !DATE_ONLY.test(value)
}

/**
 * The calendar day a stored scheduled date belongs to, as "YYYY-MM-DD".
 * - "2026-11-20" (a `date` column): that day, in every time zone.
 * - "2026-11-20T09:00" (no offset): the day as written.
 * - "2026-11-20T03:30:00+00:00" (a `timestamptz` column): the local day of that instant.
 */
export function scheduledDateKey(value: string): string {
  if (DATE_ONLY.test(value)) return value
  const local = LOCAL_DATE_TIME.exec(value)
  if (local) return local[1]
  return toDateKey(new Date(value))
}

/**
 * A Date for a stored date value: local midnight for a date-only value, local
 * wall-clock time for a value without an offset, and the exact instant otherwise.
 */
export function parseScheduledDate(value: string): Date {
  if (DATE_ONLY.test(value)) return dateFromKey(value)
  // ECMAScript reads a date-time string without an offset as local time.
  return new Date(value)
}

/** Whole calendar days from `fromKey` to `toKey` (both "YYYY-MM-DD"). Safe across DST changes. */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  return Math.round((dateFromKey(toKey).getTime() - dateFromKey(fromKey).getTime()) / MS_PER_DAY)
}

/** True when a "YYYY-MM-DD" day is before today. */
export function isPastDateKey(key: string, todayKey: string = getTodayKey()): boolean {
  return key < todayKey
}

/** A Date formatted for <input type="datetime-local">: local "YYYY-MM-DDTHH:mm". */
export function toDateTimeInputValue(date: Date): string {
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * The editor's date-and-time value for a stored scheduled date. A date-only value
 * gets `defaultTime`, because the default schema does not keep a time.
 */
export function scheduledDateToInputValue(value: string, defaultTime = "09:00"): string {
  if (DATE_ONLY.test(value)) return `${value}T${defaultTime}`
  const local = LOCAL_DATE_TIME.exec(value)
  if (local) return `${local[1]}T${local[2]}:${local[3]}`
  return toDateTimeInputValue(new Date(value))
}

/** The earliest value the scheduling picker allows: one hour from now, in local time. */
export function getMinScheduleTime(now: Date = new Date()): string {
  return toDateTimeInputValue(new Date(now.getTime() + 60 * 60 * 1000))
}

/** "Nov 20" for a date-only value, "Nov 20, 09:00 AM" when the value has a time. */
export function formatScheduledDate(value: string): string {
  const date = parseScheduledDate(value)
  return hasTime(value)
    ? date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** The time of day of a stored value ("09:00 AM"), or "" for a date-only value. */
export function formatScheduledTime(value: string): string {
  return hasTime(value)
    ? parseScheduledDate(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : ""
}

/**
 * "Today", "Tomorrow at 09:00 AM", "in 3 days", "2 days ago" or "Nov 20, 2026",
 * by local calendar day. Date-only values are shown without a time.
 */
export function formatRelativeDate(dateString: string, now: Date = new Date()): string {
  const date = parseScheduledDate(dateString)
  const diffDays = daysBetweenKeys(getTodayKey(now), toDateKey(date))
  const time = formatScheduledTime(dateString)
  const at = time ? ` at ${time}` : ""

  if (diffDays === 0) return `Today${at}`
  if (diffDays === -1) return `Yesterday${at}`
  if (diffDays === 1) return `Tomorrow${at}`
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${-diffDays} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/**
 * How far away a scheduled post is: "in 2 days", "in 3 hours", "soon", "today" or "overdue".
 * A date-only post is due for the whole of its day, so it reads "today" until midnight.
 */
export function getTimeUntil(scheduledDate: string, now: Date = new Date()): string {
  if (!hasTime(scheduledDate)) {
    const diffDays = daysBetweenKeys(getTodayKey(now), scheduledDate)
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
    return diffDays === 0 ? "today" : "overdue"
  }

  const diffMs = parseScheduledDate(scheduledDate).getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
  if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`
  if (diffMs > 0) return "soon"
  return "overdue"
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
