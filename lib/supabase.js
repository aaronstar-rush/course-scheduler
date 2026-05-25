import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function loadScheduleFromDb() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const { data, error } = await supabase
    .from('schedule_store')
    .select('schedules, students, teachers, updated_at')
    .eq('id', 'main')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    schedules: data.schedules || [],
    students: data.students || [],
    teachers: data.teachers || [],
    savedAt: data.updated_at || null,
  };
}

export async function saveScheduleToDb(payload) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const updatedAt = new Date().toISOString();
  const row = {
    id: 'main',
    schedules: payload.schedules,
    students: payload.students,
    teachers: payload.teachers,
    updated_at: updatedAt,
  };

  const { data, error } = await supabase
    .from('schedule_store')
    .upsert(row, { onConflict: 'id' })
    .select('updated_at')
    .single();

  if (error) throw error;
  return { savedAt: data.updated_at || updatedAt };
}
