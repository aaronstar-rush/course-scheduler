/** 共用教室的核心教师：同一时段不能同时上课 */
export const CORE_TEACHERS = ['Aaron', 'Oscar'];

export function hasTimeOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

export function isCoreTeacher(name) {
  return CORE_TEACHERS.includes(name);
}

function sessionKey(s) {
  return `${s.date}|${s.start}|${s.end}|${s.teacher}|${s.student}|${s.course}`;
}

function describePair(a, b) {
  const time = `${a.date} ${a.start}–${a.end}`;
  if (
    isCoreTeacher(a.teacher) &&
    isCoreTeacher(b.teacher) &&
    a.teacher !== b.teacher
  ) {
    return `【教室冲突】${time}：${a.teacher} 老师 与 ${b.teacher} 老师 时段重叠（教室有限，不能同时上课）`;
  }
  if (a.teacher === b.teacher && a.teacher && a.teacher !== '未指定') {
    return `【教师冲突】${time}：${a.teacher} 老师 有两节重叠课程（${a.student} / ${b.student}）`;
  }
  return `【时间冲突】${time}：${a.teacher}（${a.student}）与 ${b.teacher}（${b.student}）时段重叠`;
}

/**
 * 检测冲突：incoming 与 existing（排除 excludeIds）及 incoming 内部
 */
export function detectScheduleConflicts(existing, incoming, options = {}) {
  const { excludeIds = [] } = options;
  const base = existing.filter((s) => !excludeIds.includes(s.id));
  const messages = [];
  const seen = new Set();

  const checkPair = (a, b) => {
    if (!a?.date || !b?.date || a.date !== b.date) return;
    if (!hasTimeOverlap(a.start, a.end, b.start, b.end)) return;

    const coreA = isCoreTeacher(a.teacher);
    const coreB = isCoreTeacher(b.teacher);
    const sameTeacher = a.teacher === b.teacher && a.teacher && a.teacher !== '未指定';
    const classroomClash = coreA && coreB && a.teacher !== b.teacher;

    if (!classroomClash && !sameTeacher) return;

    const key = [sessionKey(a), sessionKey(b)].sort().join('<>');
    if (seen.has(key)) return;
    seen.add(key);
    messages.push(describePair(a, b));
  };

  incoming.forEach((a) => {
    base.forEach((b) => checkPair(a, b));
    incoming.forEach((b) => {
      if (a !== b) checkPair(a, b);
    });
  });

  return messages;
}

/** 从完整课表得到冲突课程 id 集合（用于列表/日历标红） */
export function getConflictIdsFromSchedules(schedules) {
  const ids = new Set();
  const len = schedules.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const a = schedules[i];
      const b = schedules[j];
      if (a.date !== b.date) continue;
      if (!hasTimeOverlap(a.start, a.end, b.start, b.end)) continue;

      const coreA = isCoreTeacher(a.teacher);
      const coreB = isCoreTeacher(b.teacher);
      const classroomClash = coreA && coreB && a.teacher !== b.teacher;
      const sameTeacher = a.teacher === b.teacher && a.teacher && a.teacher !== '未指定';

      if (classroomClash || sameTeacher) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}
