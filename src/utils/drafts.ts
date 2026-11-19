const DRAFT_PREFIX = 'tvk_draft_';

export function saveDraft(key: string, value: string) {
  try {
    sessionStorage.setItem(DRAFT_PREFIX + key, value);
  } catch {
    // ignore quota errors
  }
}

export function loadDraft(key: string): string | null {
  try {
    return sessionStorage.getItem(DRAFT_PREFIX + key);
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(DRAFT_PREFIX + key);
  } catch {
    // ignore
  }
}
