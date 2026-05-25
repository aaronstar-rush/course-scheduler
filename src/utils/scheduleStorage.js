const STORAGE_KEY = 'schedule-app-data-v1';

export function loadPersistedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.schedules)) return null;
    return {
      schedules: data.schedules,
      students: Array.isArray(data.students) ? data.students : [],
      teachers: Array.isArray(data.teachers) ? data.teachers : [],
      savedAt: data.savedAt || null,
    };
  } catch {
    return null;
  }
}

export function savePersistedData({ schedules, students, teachers }) {
  try {
    const payload = {
      schedules,
      students,
      teachers,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
