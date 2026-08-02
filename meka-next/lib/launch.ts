export const LAUNCH_DATE_ISO =
  "2026-08-25T13:00:00+02:00"

export const LAUNCH_DATE_TIMESTAMP =
  new Date(LAUNCH_DATE_ISO).getTime()

export function hasStoreLaunched() {
  return Date.now() >= LAUNCH_DATE_TIMESTAMP
}