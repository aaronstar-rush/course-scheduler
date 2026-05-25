import { requireAuth } from '../lib/auth.js';
import { loadScheduleFromDb, saveScheduleToDb } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const data = await loadScheduleFromDb();
      return res.status(200).json({ data });
    }

    if (req.method === 'PUT') {
      const { schedules, students, teachers } = req.body || {};
      if (!Array.isArray(schedules) || !Array.isArray(students) || !Array.isArray(teachers)) {
        return res.status(400).json({ error: '数据格式无效' });
      }
      const result = await saveScheduleToDb({ schedules, students, teachers });
      return res.status(200).json({ ok: true, savedAt: result.savedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.message === 'SUPABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: '云端数据库未配置，请在 Vercel 设置 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY' });
    }
    console.error('schedule api error', err);
    return res.status(500).json({ error: '服务器错误' });
  }
}
