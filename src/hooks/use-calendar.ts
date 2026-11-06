"use client"

import { useMemo, useCallback } from "react"
import { toDateKey, getTodayKey, createDateFromDay as dateFromDay } from "../utils/date-utils"

export function useCalendar(currentDate: Date) {
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const todayKey = getTodayKey()

    return {
      daysInMonth,
      firstDay,
      todayKey,
      year,
      month,
    }
  }, [currentDate])

  const formatDateKey = useCallback((date: Date) => {
    return toDateKey(date)
  }, [])

  const createDateFromDay = useCallback(
    (day: number) => {
      return dateFromDay(calendarData.year, calendarData.month, day)
    },
    [calendarData.year, calendarData.month],
  )

  const navigateMonth = useCallback(
    (direction: "prev" | "next") => {
      const newDate = new Date(currentDate)
      if (direction === "prev") {
        newDate.setMonth(currentDate.getMonth() - 1)
      } else {
        newDate.setMonth(currentDate.getMonth() + 1)
      }
      return newDate
    },
    [currentDate],
  )

  const goToToday = useCallback(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }, [])

  return {
    ...calendarData,
    formatDateKey,
    createDateFromDay,
    navigateMonth,
    goToToday,
  }
}
