import { beforeEach, describe, expect, it } from 'vitest';
import { APPLICATION_STATUS_ORDER } from '@/lib/api/tracker';
import {
  loadVisibleTrackerStatuses,
  saveVisibleTrackerStatuses,
  TRACKER_COLUMN_VISIBILITY_STORAGE_KEY,
} from '@/lib/utils/tracker-column-visibility';

describe('tracker column visibility storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows every stage by default', () => {
    expect(loadVisibleTrackerStatuses()).toEqual(APPLICATION_STATUS_ORDER);
  });

  it('persists the chosen stages in canonical board order', () => {
    saveVisibleTrackerStatuses(['interview', 'saved']);

    expect(loadVisibleTrackerStatuses()).toEqual(['saved', 'interview']);
    expect(JSON.parse(localStorage.getItem(TRACKER_COLUMN_VISIBILITY_STORAGE_KEY)!)).toEqual({
      visibleStatuses: ['interview', 'saved'],
    });
  });

  it('keeps an intentional choice to hide every stage', () => {
    saveVisibleTrackerStatuses([]);

    expect(loadVisibleTrackerStatuses()).toEqual([]);
  });

  it('falls back to every stage for malformed or unknown-only stored data', () => {
    localStorage.setItem(TRACKER_COLUMN_VISIBILITY_STORAGE_KEY, '{not json');
    expect(loadVisibleTrackerStatuses()).toEqual(APPLICATION_STATUS_ORDER);

    localStorage.setItem(
      TRACKER_COLUMN_VISIBILITY_STORAGE_KEY,
      JSON.stringify({ visibleStatuses: ['archived'] })
    );
    expect(loadVisibleTrackerStatuses()).toEqual(APPLICATION_STATUS_ORDER);
  });
});
