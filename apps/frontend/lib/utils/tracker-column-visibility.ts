import { APPLICATION_STATUS_ORDER, type ApplicationStatus } from '@/lib/api/tracker';

export const TRACKER_COLUMN_VISIBILITY_STORAGE_KEY = 'resume-matcher:tracker-column-visibility:v1';

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  typeof value === 'string' && APPLICATION_STATUS_ORDER.includes(value as ApplicationStatus);

/**
 * Read the user's visible tracker stages without letting unavailable browser
 * storage or a stale hand-edited value prevent the board from rendering.
 */
export function loadVisibleTrackerStatuses(): ApplicationStatus[] {
  try {
    const raw = localStorage.getItem(TRACKER_COLUMN_VISIBILITY_STORAGE_KEY);
    if (!raw) return [...APPLICATION_STATUS_ORDER];

    const parsed = JSON.parse(raw) as { visibleStatuses?: unknown };
    if (!Array.isArray(parsed.visibleStatuses)) return [...APPLICATION_STATUS_ORDER];

    // An intentionally empty list is valid: the persistent Manage control lets
    // the user restore stages. Unknown-only data is stale/corrupt, so fall back.
    const known = parsed.visibleStatuses.filter(isApplicationStatus);
    if (parsed.visibleStatuses.length > 0 && known.length === 0) {
      return [...APPLICATION_STATUS_ORDER];
    }

    const selected = new Set(known);
    return APPLICATION_STATUS_ORDER.filter((status) => selected.has(status));
  } catch {
    return [...APPLICATION_STATUS_ORDER];
  }
}

export function saveVisibleTrackerStatuses(statuses: ApplicationStatus[]): void {
  try {
    localStorage.setItem(
      TRACKER_COLUMN_VISIBILITY_STORAGE_KEY,
      JSON.stringify({ visibleStatuses: statuses })
    );
  } catch {
    // Storage can be blocked by browser or enterprise policy. The preference
    // still applies for the current page session.
  }
}
