const WEEKDAY_MAP = {
  周日: 0, 周一: 1, 周二: 2, 周三: 3, 周四: 4, 周五: 5, 周六: 6,
  星期天: 0, 星期一: 1, 星期二: 2, 星期三: 3, 星期四: 4, 星期五: 5, 星期六: 6,
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

const HEADER_ALIASES = {
  date: ['日期', 'date', '上课日期'],
  start: ['开始', '开始时间', 'start', '上课时间'],
  end: ['结束', '结束时间', 'end'],
  student: ['学生', '学员', 'student', '上课学生'],
  teacher: ['教师', '老师', 'teacher', '授课教师', '授课老师'],
  course: ['课程', 'course', '课程名称', '课程内容', '课程项目'],
  note: ['备注', 'note', '状态', '说明'],
};

function normalizeDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function normalizeTime(t) {
  const parts = t.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseDateToken(token) {
  const m = token.match(/(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})/);
  if (!m) return null;
  return normalizeDate(m[1], m[2], m[3]);
}

function parseTimeRange(text) {
  const m = text.match(/(\d{1,2}:\d{2})\s*[-–~至到]+\s*(\d{1,2}:\d{2})/);
  if (m) return { start: normalizeTime(m[1]), end: normalizeTime(m[2]) };
  const times = [...text.matchAll(/\d{1,2}:\d{2}/g)].map((x) => x[0]);
  if (times.length >= 2) {
    return { start: normalizeTime(times[0]), end: normalizeTime(times[1]) };
  }
  if (times.length === 1) {
    return { start: normalizeTime(times[0]), end: null };
  }
  return null;
}

function getDayOfWeek(dateStr) {
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateObj = new Date(`${dateStr}T12:00:00`);
  return isNaN(dateObj) ? '周日' : dayNames[dateObj.getDay()];
}

function detectDelimiter(line) {
  if (line.includes('\t')) return '\t';
  if (line.includes('|')) return '|';
  if (line.includes(',')) return ',';
  if (line.includes('，')) return '，';
  return null;
}

function mapHeaderRow(cells) {
  const map = {};
  cells.forEach((cell, i) => {
    const key = cell.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((a) => a.toLowerCase() === key || key.includes(a.toLowerCase()))) {
        map[field] = i;
      }
    }
  });
  return Object.keys(map).length >= 4 ? map : null;
}

function rowFromMapped(cells, headerMap, lineNum) {
  const get = (field) => (headerMap[field] !== undefined ? cells[headerMap[field]]?.trim() : '');
  const date = parseDateToken(get('date')) || get('date');
  const times = parseTimeRange(`${get('start')} ${get('end')}`) || parseTimeRange(get('start'));
  const student = get('student');
  const teacher = get('teacher').replace(/老师$/g, '').trim();
  const course = get('course');
  const note = get('note') || '正常';

  if (!date || !times?.start || !times?.end || !student || !teacher || !course) {
    return { error: `第 ${lineNum} 行：字段不完整（需日期、时间、学生、教师、课程）` };
  }
  const dateStr = typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : parseDateToken(String(date));
  if (!dateStr) return { error: `第 ${lineNum} 行：日期格式无法识别` };

  return {
    session: {
      date: dateStr,
      day: getDayOfWeek(dateStr),
      start: times.start,
      end: times.end,
      student,
      teacher: teacher || '未指定',
      course,
      note,
    },
  };
}

function parseWeekdayFromText(text) {
  if (!text) return null;
  for (const [name, num] of Object.entries(WEEKDAY_MAP)) {
    if (text.includes(name)) return num;
  }
  return null;
}

function parseRecurringLine(line, lineNum) {
  const recurMatch = line.match(
    /(每周|每星期|每天|每两周|双周|每月)([周星期一二三四五六日天]*)\s*(\d{1,2}:\d{2})\s*[-–~至到]+\s*(\d{1,2}:\d{2})\s+(\S+)\s+(\S+)\s+(.+?)\s+(?:从|起始|开始)\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2})\s*(?:共|x|×)?\s*(\d+)\s*次?/i
  );
  if (!recurMatch) return null;

  const [, freqRaw, weekdayRaw, startRaw, endRaw, student, teacherRaw, course, startDateRaw, countRaw] = recurMatch;
  const startDate = parseDateToken(startDateRaw);
  if (!startDate) return { error: `第 ${lineNum} 行：规律排课起始日期无效` };

  let recurrenceType = 'weekly';
  if (/每天/.test(freqRaw)) recurrenceType = 'daily';
  else if (/两周|双周/.test(freqRaw)) recurrenceType = 'biweekly';
  else if (/每月/.test(freqRaw)) recurrenceType = 'monthly';

  const teacher = teacherRaw.replace(/老师$/g, '').trim();
  const count = Math.min(52, Math.max(1, parseInt(countRaw, 10)));
  const start = normalizeTime(startRaw);
  const end = normalizeTime(endRaw);
  const targetWeekday = parseWeekdayFromText(weekdayRaw);

  const sessions = [];
  const baseDate = new Date(`${startDate}T12:00:00`);

  if (recurrenceType === 'weekly' && targetWeekday !== null) {
    const first = new Date(baseDate);
    const diff = (targetWeekday - first.getDay() + 7) % 7;
    first.setDate(first.getDate() + diff);
    for (let i = 0; i < count; i++) {
      const target = new Date(first);
      target.setDate(first.getDate() + i * 7);
      const dateStr = normalizeDate(target.getFullYear(), target.getMonth() + 1, target.getDate());
      sessions.push({
        date: dateStr,
        day: getDayOfWeek(dateStr),
        start,
        end,
        student,
        teacher: teacher || '未指定',
        course: course.trim(),
        note: `批量导入 (${i + 1}/${count})`,
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      const target = new Date(baseDate);
      if (recurrenceType === 'daily') target.setDate(baseDate.getDate() + i);
      else if (recurrenceType === 'weekly') target.setDate(baseDate.getDate() + i * 7);
      else if (recurrenceType === 'biweekly') target.setDate(baseDate.getDate() + i * 14);
      else if (recurrenceType === 'monthly') target.setMonth(baseDate.getMonth() + i);

      const dateStr = normalizeDate(target.getFullYear(), target.getMonth() + 1, target.getDate());
      sessions.push({
        date: dateStr,
        day: getDayOfWeek(dateStr),
        start,
        end,
        student,
        teacher: teacher || '未指定',
        course: course.trim(),
        note: `批量导入 (${i + 1}/${count})`,
      });
    }
  }

  return { sessions };
}

function parseFreeformLine(line, lineNum) {
  const dateStr = parseDateToken(line);
  if (!dateStr) return { error: `第 ${lineNum} 行：未找到有效日期` };

  const times = parseTimeRange(line);
  if (!times?.start || !times?.end) {
    return { error: `第 ${lineNum} 行：未找到时间段（如 13:50-15:50）` };
  }

  let rest = line
    .replace(/(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})/, '')
    .replace(/(\d{1,2}:\d{2})\s*[-–~至到]+\s*(\d{1,2}:\d{2})/, '')
    .trim();

  const parts = rest.split(/[\s,，|/]+/).filter(Boolean);
  if (parts.length < 3) {
    return { error: `第 ${lineNum} 行：请在日期时间后提供 学生、教师、课程（可用空格或逗号分隔）` };
  }

  const student = parts[0];
  const teacher = parts[1].replace(/老师$/g, '').trim();
  const course = parts[2];
  const note = parts.slice(3).join(' ') || '正常';

  return {
    session: {
      date: dateStr,
      day: getDayOfWeek(dateStr),
      start: times.start,
      end: times.end,
      student,
      teacher: teacher || '未指定',
      course,
      note,
    },
  };
}

function parseDelimitedLine(line, lineNum, headerMap) {
  const delim = detectDelimiter(line);
  const cells = delim ? line.split(delim).map((c) => c.trim()) : [line];

  if (headerMap) return rowFromMapped(cells, headerMap, lineNum);

  if (cells.length >= 7) {
    const fakeMap = { date: 0, start: 1, end: 2, student: 3, teacher: 4, course: 5, note: 6 };
    return rowFromMapped(cells, fakeMap, lineNum);
  }
  if (cells.length >= 6) {
    const fakeMap = { date: 0, start: 1, end: 2, student: 3, teacher: 4, course: 5, note: -1 };
    const result = rowFromMapped(cells, fakeMap, lineNum);
    if (result.session) result.session.note = '正常';
    return result;
  }

  return parseFreeformLine(line, lineNum);
}

export function parseBatchImportText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('//'));

  if (lines.length === 0) {
    return { sessions: [], errors: ['清单为空，请粘贴课程信息'] };
  }

  let headerMap = null;
  const firstDelim = detectDelimiter(lines[0]);
  if (firstDelim) {
    const firstCells = lines[0].split(firstDelim).map((c) => c.trim());
    headerMap = mapHeaderRow(firstCells);
    if (headerMap) lines.shift();
  }

  const sessions = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = headerMap ? i + 2 : i + 1;

    const recur = parseRecurringLine(line, lineNum);
    if (recur) {
      if (recur.error) errors.push(recur.error);
      else if (recur.sessions) sessions.push(...recur.sessions);
      continue;
    }

    const parsed = parseDelimitedLine(line, lineNum, headerMap);
    if (parsed.error) errors.push(parsed.error);
    else if (parsed.session) sessions.push(parsed.session);
  }

  return { sessions, errors };
}

export const IMPORT_FORMAT_HELP = `支持格式（每行一条，# 开头为注释）：

【标准表格】逗号或制表符分隔，首行可为表头：
日期,开始,结束,学生,教师,课程,备注
2026-06-03,13:50,15:50,宾思程,Aaron,SAT阅读语法,正常

【简写一行】日期 + 时间段 + 学生 + 教师 + 课程：
2026-06-03 13:50-15:50 宾思程 Aaron SAT阅读语法 正常

【规律排课】自动生成多节：
每周三 13:50-15:50 宾思程 Aaron SAT阅读语法 从2026-06-03 共8次
每周 13:50-15:50 梦圆 Oscar 梦圆课程 从2026-06-05 共4次`;
