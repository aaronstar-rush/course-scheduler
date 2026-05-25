import crypto from 'crypto';

export const COOKIE_NAME = 'schedule_auth';

function getSecret() {
  return process.env.AUTH_SECRET || 'dev-secret-change-in-production';
}

export function createSessionToken() {
  return crypto.createHmac('sha256', getSecret()).update('authenticated').digest('hex');
}

export function createSessionCookie() {
  const token = createSessionToken();
  const maxAge = 60 * 60 * 24 * 30;
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAuthenticated(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return match[1] === createSessionToken();
}

export function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: '未登录或会话已过期' });
    return false;
  }
  return true;
}
