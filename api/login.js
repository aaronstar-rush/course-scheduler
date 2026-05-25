import { createSessionCookie } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const expected = process.env.ACCESS_PASSWORD;

  if (!expected) {
    return res.status(500).json({ error: '服务器未配置 ACCESS_PASSWORD' });
  }

  if (password !== expected) {
    return res.status(401).json({ error: '密码错误' });
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  return res.status(200).json({ ok: true });
}
