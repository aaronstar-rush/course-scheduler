import { get, put } from '@vercel/blob';

const BLOB_PATHNAME = 'schedule/main.json';

export async function loadScheduleFromDb() {
  try {
    const result = await get(BLOB_PATHNAME, { access: 'private' });
    if (!result) return null;
    const text = await result.text();
    const parsed = JSON.parse(text);
    return {
      schedules: parsed.schedules || [],
      students: parsed.students || [],
      teachers: parsed.teachers || [],
      savedAt: parsed.savedAt || null,
    };
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('BLOB') || msg.includes('token')) {
      throw new Error('BLOB_NOT_CONFIGURED');
    }
    throw err;
  }
}

export async function saveScheduleToDb(payload) {
  const savedAt = new Date().toISOString();
  const body = JSON.stringify({
    schedules: payload.schedules,
    students: payload.students,
    teachers: payload.teachers,
    savedAt,
  });

  await put(BLOB_PATHNAME, body, {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
  });

  return { savedAt };
}
