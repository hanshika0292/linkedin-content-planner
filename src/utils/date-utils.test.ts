import { afterAll, beforeAll, describe, expect, it } from "vitest"
import {
  createDateFromDay,
  dateFromKey,
  daysBetweenKeys,
  formatRelativeDate,
  formatScheduledDate,
  formatScheduledTime,
  getMinScheduleTime,
  getTimeUntil,
  getTodayKey,
  isPastDateKey,
  scheduledDateKey,
  scheduledDateToInputValue,
  toDateKey,
} from "./date-utils"

// Node applies a change to process.env.TZ immediately, so each block runs in its own zone.
// Offsets are in minutes, as Date#getTimezoneOffset reports them for 1 January 2026.
const ZONES = [
  { tz: "UTC", januaryOffset: 0 },
  { tz: "Asia/Kolkata", januaryOffset: -330 },
  { tz: "America/Los_Angeles", januaryOffset: 480 },
  { tz: "Pacific/Kiritimati", januaryOffset: -840 }, // UTC+14
  { tz: "Pacific/Pago_Pago", januaryOffset: 660 }, // UTC-11
]

// "Today" for two fixed instants, per zone.
const TODAY_AT: Record<string, Record<string, string>> = {
  // 02:00 UTC is 07:30 in Kolkata and 18:00 the previous evening in Los Angeles.
  "2026-11-06T02:00:00Z": {
    UTC: "2026-11-06",
    "Asia/Kolkata": "2026-11-06",
    "America/Los_Angeles": "2026-11-05",
    "Pacific/Kiritimati": "2026-11-06",
    "Pacific/Pago_Pago": "2026-11-05",
  },
  // 20:00 UTC is 01:30 the next morning in Kolkata and noon in Los Angeles.
  "2026-11-06T20:00:00Z": {
    UTC: "2026-11-06",
    "Asia/Kolkata": "2026-11-07",
    "America/Los_Angeles": "2026-11-06",
    "Pacific/Kiritimati": "2026-11-07",
    "Pacific/Pago_Pago": "2026-11-06",
  },
}

const originalTz = process.env.TZ

describe.each(ZONES)("date helpers in $tz", ({ tz, januaryOffset }) => {
  beforeAll(() => {
    process.env.TZ = tz
  })
  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ
    else process.env.TZ = originalTz
  })

  it("runs in the intended time zone", () => {
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(januaryOffset)
  })

  it("puts a date-only post on the calendar cell for the same day, for every day of the year", () => {
    // Includes both US daylight-saving changes (8 March and 1 November 2026).
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(2026, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const stored = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const cellKey = toDateKey(createDateFromDay(2026, month, day))
        expect(cellKey).toBe(stored)
        expect(scheduledDateKey(stored)).toBe(cellKey)
      }
    }
  })

  it("keeps the day of a date-and-time value written without an offset", () => {
    expect(scheduledDateKey("2026-11-20T00:30")).toBe("2026-11-20")
    expect(scheduledDateKey("2026-11-20T23:45:00")).toBe("2026-11-20")
    expect(scheduledDateKey("2026-11-20 09:00:00")).toBe("2026-11-20")
  })

  it("uses the local day for a value with an offset (a timestamptz column)", () => {
    const value = "2026-11-20T20:00:00+00:00"
    expect(scheduledDateKey(value)).toBe(toDateKey(new Date(value)))
  })

  it("works out today's key in the browser's zone", () => {
    for (const [instant, byZone] of Object.entries(TODAY_AT)) {
      expect(getTodayKey(new Date(instant))).toBe(byZone[tz])
    }
  })

  it("marks only earlier days as past", () => {
    const today = getTodayKey(new Date(2026, 10, 6, 23, 59))
    expect(today).toBe("2026-11-06")
    expect(isPastDateKey("2026-11-05", today)).toBe(true)
    expect(isPastDateKey("2026-11-06", today)).toBe(false)
    expect(isPastDateKey("2026-11-07", today)).toBe(false)
  })

  it("turns a day key back into that local day", () => {
    const date = dateFromKey("2026-11-13")
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 10, 13, 0])
    expect(date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })).toBe(
      "Friday, November 13",
    )
    expect(() => dateFromKey("13/11/2026")).toThrow()
  })

  it("counts calendar days across daylight-saving changes", () => {
    expect(daysBetweenKeys("2026-10-31", "2026-11-02")).toBe(2)
    expect(daysBetweenKeys("2026-03-07", "2026-03-09")).toBe(2)
    expect(daysBetweenKeys("2026-11-06", "2026-11-06")).toBe(0)
    expect(daysBetweenKeys("2026-11-06", "2026-11-01")).toBe(-5)
  })

  it("fills the editor's date-and-time field without shifting the day", () => {
    expect(scheduledDateToInputValue("2026-11-20")).toBe("2026-11-20T09:00")
    expect(scheduledDateToInputValue("2026-11-20", "18:30")).toBe("2026-11-20T18:30")
    expect(scheduledDateToInputValue("2026-11-20T14:05")).toBe("2026-11-20T14:05")
    expect(scheduledDateToInputValue("2026-11-20T14:05:59")).toBe("2026-11-20T14:05")
    const instant = new Date(Date.UTC(2026, 10, 20, 3, 30))
    const local = scheduledDateToInputValue("2026-11-20T03:30:00+00:00")
    expect(local).toBe(
      `${toDateKey(instant)}T${String(instant.getHours()).padStart(2, "0")}:${String(instant.getMinutes()).padStart(2, "0")}`,
    )
  })

  it("sets the earliest schedule time to one hour from now in local time", () => {
    expect(getMinScheduleTime(new Date(2026, 10, 6, 14, 20))).toBe("2026-11-06T15:20")
    expect(getMinScheduleTime(new Date(2026, 10, 6, 23, 30))).toBe("2026-11-07T00:30")
  })

  it("labels date-only posts by calendar day, without a time", () => {
    const now = new Date(2026, 10, 6, 23, 30) // late evening, local time
    expect(formatRelativeDate("2026-11-06", now)).toBe("Today")
    expect(formatRelativeDate("2026-11-07", now)).toBe("Tomorrow")
    expect(formatRelativeDate("2026-11-05", now)).toBe("Yesterday")
    expect(formatRelativeDate("2026-11-10", now)).toBe("in 4 days")
    expect(formatRelativeDate("2026-11-01", now)).toBe("5 days ago")
    expect(formatRelativeDate("2026-12-25", now)).toBe("Dec 25, 2026")
  })

  it("labels timestamps by the local calendar day", () => {
    const now = new Date(2026, 10, 6, 0, 15)
    const earlierToday = new Date(2026, 10, 6, 0, 5).toISOString()
    const lateYesterday = new Date(2026, 10, 5, 23, 55).toISOString()
    expect(formatRelativeDate(earlierToday, now)).toMatch(/^Today at /)
    expect(formatRelativeDate(lateYesterday, now)).toMatch(/^Yesterday at /)
  })

  it("treats a date-only post as due for the whole of its day", () => {
    const evening = new Date(2026, 10, 6, 22, 0)
    expect(getTimeUntil("2026-11-06", evening)).toBe("today")
    expect(getTimeUntil("2026-11-05", evening)).toBe("overdue")
    expect(getTimeUntil("2026-11-07", evening)).toBe("in 1 day")
    expect(getTimeUntil("2026-11-09", evening)).toBe("in 3 days")
  })

  it("counts hours for posts that have a time", () => {
    const now = new Date(2026, 10, 6, 9, 0)
    expect(getTimeUntil("2026-11-06T12:30", now)).toBe("in 3 hours")
    expect(getTimeUntil("2026-11-06T09:20", now)).toBe("soon")
    expect(getTimeUntil("2026-11-06T08:00", now)).toBe("overdue")
    expect(getTimeUntil("2026-11-08T09:00", now)).toBe("in 2 days")
  })

  it("shows the stored day, and a time only when one was stored", () => {
    expect(formatScheduledDate("2026-11-09")).toBe("Nov 9")
    expect(formatScheduledTime("2026-11-09")).toBe("")
    expect(formatScheduledDate("2026-11-09T09:00")).toBe("Nov 9, 09:00 AM")
  })
})
