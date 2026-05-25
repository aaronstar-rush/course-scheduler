const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const IMPORT_FORMAT_HELP = `每行一节课，支持多种写法（逗号或空格分隔）：

1) 2026-06-03,13:50,15:50,学生名,Aaron,SAT阅读语法
2) 2026-06-03 13:50-15:50 学生名 Aaron SAT阅读语法
3) 2026/6/3 13:50~15:50 | 学生名 | Oscar | 课程名

字段顺序：日期、开始时间、结束时间、学生、教师、课程名
粘贴后点「解析预览」，确认无误再导入。系统会自动检测教室/教师时间冲突。`;

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '周日' : DAY_NAMES[d.getDay()];
}

function normalizeDate(raw) {
  const s = raw.trim().replace(/\//g, '-');
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const month = String(parseInt(m[2], 10)).padStart(2, '0');
  const day = String(parseInt(m[3], 10)).padStart(2, '0');
  return `${m[1]}-${month}-${day}`;
}

function normalizeTime(raw) {
  const t = raw.trim().replace(/：/g, ':');
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`;
}

function parseTimeRange(token) {
  const range = token.match(/(\d{1,2}:\d{2})\s*[-~–—]\s*(\d{1,2}:\d{2})/);
  if (range) {
    const start = normalizeTime(range[1]);
    const end = normalizeTime(range[2]);
    if (start && end) return { start, end };
  }
  return null;
}

function parseLine(line, lineNum) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return null;

  let date;
  let start;
  let end;
  let student;
  let teacher;
  let course;

  const rangeFirst = trimmed.match(
    /^(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(\d{1,2}:\d{2}\s*[-~–—]\s*\d{1,2}:\d{2})\s+(.+)$/i
  );
  if (rangeFirst) {
    date = normalizeDate(rangeFirst[1]);
    const tr = parseTimeRange(rangeFirst[2]);
    if (!date || !tr) return { error: `第 ${lineNum} 行：日期或时间格式有误` };
    start = tr.start;
    end = tr.end;
    const rest = rangeFirst[3].split(/\s+/).filter(Boolean);
    if (rest.length < 3) return { error: `第 ${lineNum} 行：缺少学生/教师/课程名` };
    [student, teacher, course] = rest;
  } else if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    if (parts.length < 6) return { error: `第 ${lineNum} 行：逗号分隔至少需要 6 段（日期,开始,结束,学生,教师,课程）` };
    [date, start, end, student, teacher, course] = parts;
    date = normalizeDate(date);
    start = normalizeTime(start);
    end = normalizeTime(end);
  } else {
    const pipeParts = trimmed.split('|').map((p) => p.trim());
    const parts = pipeParts.length >= 4 ? pipeParts : trimmed.split(/\s+/);
    if (parts.length < 6) {
      return { error: `第 ${lineNum} 行：无法识别，请用逗号或「日期 13:50-15:50 学生 教师 课程」格式` };
    }
    date = normalizeDate(parts[0]);
    const tr = parseTimeRange(parts[1]);
    if (tr) {
      start = tr.start;
      end = tr.end;
      student = parts[2];
      teacher = parts[3];
      course = parts.slice(4).join(' ');
    } else {
      start = normalizeTime(parts[1]);
      end = normalizeTime(parts[2]);
      student = parts[3];
      teacher = parts[4];
      course = parts.slice(5).join(' ');
    }
  }

  if (!date || !start || !end) return { error: `第 ${lineNum} 行：日期或时间无效` };
  if (start >= end) return { error: `第 ${lineNum} 行：结束时间须晚于开始时间` };
  if (!student || !teacher || !course) return { error: `第 ${lineNum} 行：学生、教师、课程名不能为空` };

  return {
    session: {
      date,
      day: getDayOfWeek(date),
      start,
      end,
      student: student.trim(),
      teacher: teacher.trim(),
      course: course.trim(),
      note: '',
    },
  };
}

export function parseBatchImportText(text) {
  const lines = text.split(/\r?\n/);
  const sessions = [];
  const errors = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const result = parseLine(line, lineNum);
    if (!result) return;
    if (result.error) errors.push(result.error);
    else sessions.push(result.session);
  });

  return { sessions, errors };
}
