const STORAGE_KEY = 'schedule-app-data-v1';

const DEFAULT_STUDENTS = ['梦圆', '刘翰麟', '宾思程'];
const DEFAULT_TEACHERS = ['Aaron', 'Oscar', '未指定'];

export function loadPersistedData(fallbackSchedules) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.schedules)) return null;
    return {
      schedules: data.schedules,
      students: Array.isArray(data.students) && data.students.length > 0
        ? data.students
        : DEFAULT_STUDENTS,
      teachers: Array.isArray(data.teachers) && data.teachers.length > 0
        ? data.teachers
        : DEFAULT_TEACHERS,
      savedAt: data.savedAt || null,
    };
  } catch {
    return null;
  }
}

export function savePersistedData({ schedules, students, teachers }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schedules,
        students,
        teachers,
        savedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportDataAsJson({ schedules, students, teachers }) {
  return JSON.stringify({ schedules, students, teachers, exportedAt: new Date().toISOString() }, null, 2);
}
