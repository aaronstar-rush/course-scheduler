const jsonHeaders = { 'Content-Type': 'application/json' };

export async function checkAuth() {
  const res = await fetch('/api/me', { credentials: 'include' });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.authenticated);
}

export async function login(password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '登录失败');
  return data;
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
}

export async function fetchCloudSchedule() {
  const res = await fetch('/api/schedule', { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(data.error || '加载失败');
  return data.data;
}

export async function saveCloudSchedule(payload) {
  const res = await fetch('/api/schedule', {
    method: 'PUT',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(data.error || '保存失败');
  return data.savedAt;
}
