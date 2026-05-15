/**
 * Business-hours helpers — timezone-aware, runtime-safe.
 *
 * Inputs come straight from Square's `Location.business_hours.periods`
 * (we store them as JSONB exactly as Square returns). The location's
 * `timezone` (IANA) is also from Square.
 *
 * Everything here is pure — no DB or auth — so it can be called from
 * server routes and client components alike.
 */

export type DayOfWeek = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type BusinessHoursPeriod = {
  day_of_week: DayOfWeek;
  /** "HH:MM:SS" 24-hour local time. */
  start_local_time?: string;
  end_local_time?: string;
};

const DAY_ORDER: DayOfWeek[] = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  SUN: "Sun",
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
};

const DAY_SHORT_TO_KEY: Record<string, DayOfWeek> = {
  Sun: "SUN",
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
};

/** What day-of-week is it RIGHT NOW in the given IANA timezone? */
function currentDayInTz(timezone?: string): DayOfWeek {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: timezone || undefined,
    });
    return DAY_SHORT_TO_KEY[fmt.format(new Date())] ?? "SUN";
  } catch {
    // Unknown timezone string → fall back to the JS runtime's local TZ.
    const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    return DAY_SHORT_TO_KEY[fmt.format(new Date())] ?? "SUN";
  }
}

/** Current local time as "HH:MM:SS" in the given IANA timezone. */
function currentTimeInTz(timezone?: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone || undefined,
    });
    const parts = fmt.formatToParts(new Date());
    // Safari sometimes returns "24" for midnight — normalize.
    let hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    if (hh === "24") hh = "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const ss = parts.find((p) => p.type === "second")?.value ?? "00";
    return `${hh}:${mm}:${ss}`;
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
}

/** "05:00:00" → "5am". "17:30:00" → "5:30pm". */
export function formatTime(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  if (Number.isNaN(h)) return timeStr;
  const period = h >= 12 ? "pm" : "am";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  if (m === 0) return `${display}${period}`;
  return `${display}:${String(m).padStart(2, "0")}${period}`;
}

/**
 * "Open today 5am – 8pm" / "Closed today" / "Hours not available" — plus a
 * boolean indicating whether the location is open at this exact moment.
 */
export function getTodayHours(
  periods: BusinessHoursPeriod[] | null | undefined,
  timezone?: string,
): { label: string; isOpenNow: boolean; openTime?: string; closeTime?: string } {
  if (!Array.isArray(periods) || periods.length === 0) {
    return { label: "Hours not available", isOpenNow: false };
  }
  const today = currentDayInTz(timezone);
  const period = periods.find((p) => p.day_of_week === today);
  if (!period || !period.start_local_time || !period.end_local_time) {
    return { label: "Closed today", isOpenNow: false };
  }
  const now = currentTimeInTz(timezone);
  // Strings compare lexicographically with "HH:MM:SS" — correct for same-day
  // ranges. Doesn't handle past-midnight close (e.g. open 8pm – 2am next day);
  // donut shops generally close before midnight so this is OK in practice.
  const isOpenNow =
    now >= period.start_local_time && now < period.end_local_time;
  return {
    label: `Open today ${formatTime(period.start_local_time)} – ${formatTime(period.end_local_time)}`,
    isOpenNow,
    openTime: period.start_local_time,
    closeTime: period.end_local_time,
  };
}

/** Full 7-day schedule formatted for display. */
export function getWeeklySchedule(
  periods: BusinessHoursPeriod[] | null | undefined,
): Array<{ day: string; shortDay: string; hours: string | null }> {
  if (!Array.isArray(periods)) return [];
  return DAY_ORDER.map((day) => {
    const period = periods.find((p) => p.day_of_week === day);
    if (!period || !period.start_local_time || !period.end_local_time) {
      return { day: DAY_LABELS[day], shortDay: DAY_SHORT_LABELS[day], hours: null };
    }
    return {
      day: DAY_LABELS[day],
      shortDay: DAY_SHORT_LABELS[day],
      hours: `${formatTime(period.start_local_time)} – ${formatTime(period.end_local_time)}`,
    };
  });
}
