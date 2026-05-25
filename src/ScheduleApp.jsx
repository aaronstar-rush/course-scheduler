import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, User, BookOpen, CheckCircle, Filter, X, 
  Plus, Users, UserPlus, AlertTriangle, CalendarPlus, Check,
  List, Grid, ChevronLeft, ChevronRight, Edit, Trash2, FileSpreadsheet, Save, RotateCcw
} from 'lucide-react';
import { loadPersistedData, savePersistedData, clearPersistedData } from './utils/scheduleStorage';
import { parseBatchImportText, IMPORT_FORMAT_HELP } from './utils/batchImport';

const DEFAULT_STUDENTS = ['梦圆', '刘翰麟', '宾思程'];
const DEFAULT_TEACHERS = ['Aaron', 'Oscar', '未指定'];

function getInitialAppState(defaultSchedules) {
  const saved = loadPersistedData();
  if (saved) return saved;
  return {
    schedules: defaultSchedules,
    students: DEFAULT_STUDENTS,
    teachers: DEFAULT_TEACHERS,
    savedAt: null,
  };
}

// 初始默认数据（已直接将 宾思程 绑定给 Aaron，刘翰麟 绑定给 Oscar，免除二次虚拟计算）
const initialScheduleData = [
  // 5月
  { id: 'm1', date: '2026-05-15', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'm2', date: '2026-05-16', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '正常' },
  { id: 'm3', date: '2026-05-22', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'm4', date: '2026-05-23', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '正常' },
  { id: 'm5', date: '2026-05-29', day: '周五', start: '17:00', end: '19:00', student: '刘翰麟', teacher: 'Oscar', course: '文本阅读精读', note: '正常 (19:00结束)' },
  // 6月
  { id: 'j1', date: '2026-06-03', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j2', date: '2026-06-04', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j3', date: '2026-06-05', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'j4', date: '2026-06-06', day: '周六', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j5', date: '2026-06-06', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '同一天两节，时间错开' },
  { id: 'j6', date: '2026-06-07', day: '周日', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j7', date: '2026-06-10', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j8', date: '2026-06-11', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j9', date: '2026-06-12', day: '周五', start: '17:00', end: '19:00', student: '刘翰麟', teacher: 'Oscar', course: '文本阅读精读', note: '正常 (19:00结束)' },
  { id: 'j10', date: '2026-06-12', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常 (19:30开始，无冲突)' },
  { id: 'j11', date: '2026-06-13', day: '周六', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j12', date: '2026-06-13', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '同一天两节，时间错开' },
  { id: 'j13', date: '2026-06-14', day: '周日', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j14', date: '2026-06-17', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j15', date: '2026-06-18', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j16', date: '2026-06-19', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'j17', date: '2026-06-20', day: '周六', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j18', date: '2026-06-20', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '同一天两节，时间错开' },
  { id: 'j19', date: '2026-06-21', day: '周日', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j20', date: '2026-06-24', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j21', date: '2026-06-25', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j22', date: '2026-06-26', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'j23', date: '2026-06-27', day: '周六', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j24', date: '2026-06-27', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '同一天两节，时间错开' },
  { id: 'j25', date: '2026-06-28', day: '周日', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j26', date: '2026-06-29', day: '周一', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'j27', date: '2026-06-30', day: '周二', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  // 7月
  { id: 'jl1', date: '2026-07-01', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl2', date: '2026-07-02', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl3', date: '2026-07-03', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常' },
  { id: 'jl4', date: '2026-07-04', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '正常' },
  { id: 'jl5', date: '2026-07-06', day: '周一', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl6', date: '2026-07-07', day: '周二', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl7', date: '2026-07-08', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl8', date: '2026-07-09', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl9', date: '2026-07-10', day: '周五', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Oscar', course: '梦圆课程', note: '正常 (19:30开始，无冲突)' },
  { id: 'jl10', date: '2026-07-11', day: '周六', start: '19:30', end: '21:30', student: '梦圆', teacher: 'Aaron', course: '梦圆课程', note: '正常' },
  { id: 'jl11', date: '2026-07-13', day: '周一', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl12', date: '2026-07-14', day: '周二', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl13', date: '2026-07-15', day: '周三', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
  { id: 'jl14', date: '2026-07-16', day: '周四', start: '13:50', end: '15:50', student: '宾思程', teacher: 'Aaron', course: 'SAT阅读语法', note: '正常' },
];

const getDayOfWeek = (dateStr) => {
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateObj = new Date(dateStr);
  return isNaN(dateObj) ? '周日' : dayNames[dateObj.getDay()];
};

const hasOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// 列表精密对齐宽度定义
const COL_WIDTHS = {
  date: 'w-[15%]',
  time: 'w-[15%]',
  student: 'w-[12%]',
  teacher: 'w-[15%]',
  course: 'w-[23%]',
  note: 'w-[20%]'
};

export default function ScheduleApp() {
  const initialState = useMemo(() => getInitialAppState(initialScheduleData), []);

  // 数据源（从本机 localStorage 恢复，刷新不丢失）
  const [schedules, setSchedules] = useState(initialState.schedules);
  const [students, setStudents] = useState(initialState.students);
  const [teachers, setTeachers] = useState(initialState.teachers);
  const [lastSavedAt, setLastSavedAt] = useState(initialState.savedAt);

  // 学生搜索和修改编辑状态
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState({ type: null, name: '' });
  const [editTarget, setEditTarget] = useState({ type: null, name: '', newName: '' });

  const [newStudentInput, setNewStudentInput] = useState('');
  const [newTeacherInput, setNewTeacherInput] = useState('');

  // 视图模式 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('list');
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(6);

  // Toast 提示
  const [toast, setToast] = useState({ show: false, message: '' });
  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // 查看过滤条件
  const [selectedStudent, setSelectedStudent] = useState('全部');
  const [selectedTeacher, setSelectedTeacher] = useState('全部');

  // 智能批量导入
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState('append');

  // 新增排课弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    student: '梦圆',
    teacher: 'Aaron', 
    date: '2026-06-01',
    start: '13:50',
    end: '15:50',
    course: '新课程计划',
    note: '正常',
    isRecurring: false,
    recurrenceType: 'weekly',
    recurrenceCount: 4
  });

  // 自动保存到本机浏览器
  useEffect(() => {
    const ok = savePersistedData({ schedules, students, teachers });
    if (ok) setLastSavedAt(new Date().toISOString());
  }, [schedules, students, teachers]);

  const savedTimeLabel = useMemo(() => {
    if (!lastSavedAt) return null;
    try {
      return new Date(lastSavedAt).toLocaleString('zh-CN', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [lastSavedAt]);

  // 过滤后的学生列表（用于搜索）
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.toLowerCase().includes(searchStudentQuery.toLowerCase()));
  }, [students, searchStudentQuery]);

  // 添加学生
  const handleAddStudentDirectly = () => {
    const name = newStudentInput.trim();
    if (!name) { triggerToast('⚠️ 请输入学生姓名'); return; }
    if (students.includes(name)) { triggerToast(`⚠️ 学生 "${name}" 已存在`); return; }
    setStudents(prev => [...prev, name]);
    setNewStudentInput('');
    triggerToast(`🎉 成功创建学生: ${name}`);
  };

  // 添加教师
  const handleAddTeacherDirectly = () => {
    const name = newTeacherInput.trim();
    if (!name) { triggerToast('⚠️ 请输入教师姓名'); return; }
    if (teachers.includes(name)) { triggerToast(`⚠️ 教师 "${name}" 已存在`); return; }
    setTeachers(prev => {
      const filtered = prev.filter(t => t !== '未指定');
      return [...filtered, name, '未指定'];
    });
    setNewTeacherInput('');
    triggerToast(`🎉 成功创建教师: ${name}`);
  };

  // 确认删除逻辑（清洗全部有关数据）
  const confirmDelete = () => {
    const { type, name } = deleteTarget;
    if (type === 'student') {
      setStudents(prev => prev.filter(s => s !== name));
      setSchedules(prev => prev.filter(item => item.student !== name));
      if (selectedStudent === name) setSelectedStudent('全部');
      triggerToast(`🗑️ 已成功删除学生 ${name} 及其所有课表数据`);
    } else if (type === 'teacher') {
      setTeachers(prev => prev.filter(t => t !== name));
      setSchedules(prev => prev.filter(item => item.teacher !== name));
      if (selectedTeacher === name) setSelectedTeacher('全部');
      triggerToast(`🗑️ 已成功注销教师 ${name} 及其执教课表`);
    }
    setDeleteTarget({ type: null, name: '' });
  };

  // 确认修改名字逻辑
  const confirmEdit = () => {
    const { type, name, newName } = editTarget;
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) { triggerToast('⚠️ 名字不能为空'); return; }
    if (trimmedNewName === name) { setEditTarget({ type: null, name: '', newName: '' }); return; }

    if (type === 'student') {
      if (students.includes(trimmedNewName)) { triggerToast(`⚠️ 学生 "${trimmedNewName}" 已存在`); return; }
      setStudents(prev => prev.map(s => s === name ? trimmedNewName : s));
      setSchedules(prev => prev.map(item => item.student === name ? { ...item, student: trimmedNewName } : item));
      if (selectedStudent === name) setSelectedStudent(trimmedNewName);
      triggerToast(`✏️ 学生名由 ${name} 变更为 ${trimmedNewName}`);
    } else if (type === 'teacher') {
      if (teachers.includes(trimmedNewName)) { triggerToast(`⚠️ 教师 "${trimmedNewName}" 已存在`); return; }
      setTeachers(prev => prev.map(t => t === name ? trimmedNewName : t));
      setSchedules(prev => prev.map(item => item.teacher === name ? { ...item, teacher: trimmedNewName } : item));
      if (selectedTeacher === name) setSelectedTeacher(trimmedNewName);
      triggerToast(`✏️ 教师名由 ${name} 变更为 ${trimmedNewName}`);
    }
    setEditTarget({ type: null, name: '', newName: '' });
  };

  // 冲突排查 (Aaron & Oscar 绝对时间排他)
  const conflictSet = useMemo(() => {
    const conflicts = new Set();
    const len = schedules.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const itemA = schedules[i];
        const itemB = schedules[j];

        if (itemA.date === itemB.date) {
          const isStaffA = itemA.teacher === 'Aaron' || itemA.teacher === 'Oscar';
          const isStaffB = itemB.teacher === 'Aaron' || itemB.teacher === 'Oscar';
          
          if (isStaffA && isStaffB) {
            if (hasOverlap(itemA.start, itemA.end, itemB.start, itemB.end)) {
              conflicts.add(itemA.id);
              conflicts.add(itemB.id);
            }
          }
        }
      }
    }
    return conflicts;
  }, [schedules]);

  // 视图级筛选过滤
  const filteredData = useMemo(() => {
    return schedules.filter(item => {
      const matchStudent = selectedStudent === '全部' || item.student === selectedStudent;
      const matchTeacher = selectedTeacher === '全部' || item.teacher === selectedTeacher;
      return matchStudent && matchTeacher;
    });
  }, [selectedStudent, selectedTeacher, schedules]);

  // 按月排序与分组
  const sortedAndGroupedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start.localeCompare(b.start);
    });

    const groups = {};
    sorted.forEach(item => {
      const dateParts = item.date.split('-');
      if (dateParts.length < 2) return;
      const monthKey = `${dateParts[0]}年 ${parseInt(dateParts[1], 10)}月`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(item);
    });
    return groups;
  }, [filteredData]);

  // 规律自动排课导入
  const handleCreateSchedules = (e) => {
    e.preventDefault();
    const { student, teacher, date, start, end, course, note, isRecurring, recurrenceType, recurrenceCount } = modalData;

    const newSessions = [];
    const baseDate = new Date(date);
    const runs = isRecurring ? Math.max(1, parseInt(recurrenceCount, 10)) : 1;

    for (let i = 0; i < runs; i++) {
      const targetDate = new Date(baseDate);
      if (isRecurring) {
        if (recurrenceType === 'daily') targetDate.setDate(baseDate.getDate() + i);
        else if (recurrenceType === 'weekly') targetDate.setDate(baseDate.getDate() + (i * 7));
        else if (recurrenceType === 'biweekly') targetDate.setDate(baseDate.getDate() + (i * 14));
        else if (recurrenceType === 'monthly') targetDate.setMonth(baseDate.getMonth() + i);
      }

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      newSessions.push({
        id: `custom_${Date.now()}_${i}`,
        date: dateStr,
        day: getDayOfWeek(dateStr),
        start,
        end,
        student,
        teacher,
        course,
        note: isRecurring ? `${note} (${i+1}/${runs}次)` : note
      });
    }

    setSchedules(prev => [...prev, ...newSessions]);
    setIsModalOpen(false);
    triggerToast(`📅 已成功批量导入 ${runs} 节规律课程！`);
  };

  const handleParseImportPreview = () => {
    const result = parseBatchImportText(importText);
    setImportPreview(result);
    if (result.sessions.length === 0 && result.errors.length > 0) {
      triggerToast('⚠️ 未能解析有效课程，请检查格式');
    }
  };

  const mergePeopleFromSessions = (sessions) => {
    const newStudents = new Set(students);
    const newTeachers = new Set(teachers.filter((t) => t !== '未指定'));
    sessions.forEach((s) => {
      if (s.student) newStudents.add(s.student);
      if (s.teacher) newTeachers.add(s.teacher);
    });
    setStudents([...newStudents]);
    setTeachers([...newTeachers, '未指定']);
  };

  const handleConfirmBatchImport = () => {
    if (!importPreview?.sessions?.length) {
      triggerToast('⚠️ 请先粘贴清单并点击「解析预览」');
      return;
    }
    const withIds = importPreview.sessions.map((s, i) => ({
      ...s,
      id: `import_${Date.now()}_${i}`,
    }));
    mergePeopleFromSessions(withIds);
    if (importMode === 'replace') {
      setSchedules(withIds);
      triggerToast(`📥 已替换为 ${withIds.length} 节课程（已保存到本机）`);
    } else {
      setSchedules((prev) => [...prev, ...withIds]);
      triggerToast(`📥 已追加导入 ${withIds.length} 节课程（已保存到本机）`);
    }
    setIsImportModalOpen(false);
    setImportText('');
    setImportPreview(null);
  };

  const handleResetToDefault = () => {
    if (!window.confirm('确定恢复为系统默认课表？当前本机保存的数据将被覆盖。')) return;
    clearPersistedData();
    setSchedules(initialScheduleData);
    setStudents(DEFAULT_STUDENTS);
    setTeachers(DEFAULT_TEACHERS);
    setLastSavedAt(null);
    triggerToast('↩️ 已恢复默认课表');
  };

  // 颜色样式映射
  const getTeacherBgColor = (teacherName) => {
    if (teacherName === 'Aaron') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (teacherName === 'Oscar') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (teacherName === '未指定') return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  // ==================== 日历数据计算 ====================
  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    const totalDays = new Date(calendarYear, calendarMonth, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ isPadding: true, key: `pad-${i}` });
    }
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayCourses = filteredData.filter(item => item.date === dateStr)
        .sort((a, b) => a.start.localeCompare(b.start));
      cells.push({
        isPadding: false,
        day,
        dateStr,
        courses: dayCourses,
        key: `day-${day}`
      });
    }
    return cells;
  }, [calendarYear, calendarMonth, filteredData]);

  const prevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarYear(prev => prev - 1);
      setCalendarMonth(12);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarYear(prev => prev + 1);
      setCalendarMonth(1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 relative">
      
      {/* Toast 提示 */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 顶部固定控制面板 */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-3">
          
          {/* 标头 与 动态工具区 */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                排课管理系统
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>改完自动保存至本机浏览器</span>
                {savedTimeLabel && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <Save className="w-3 h-3" />
                    上次保存 {savedTimeLabel}
                  </span>
                )}
              </p>
            </div>

            {/* 控制器与工具区 */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* 列表 / 日历 视图切换器 */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <List className="w-3.5 h-3.5" />
                  列表视图
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  日历视图
                </button>
              </div>

              <button
                onClick={() => { setImportPreview(null); setIsImportModalOpen(true); }}
                className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                智能批量导入
              </button>

              {/* 启动规律排课 */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                新增单次/规律排课
              </button>

              <button
                onClick={handleResetToDefault}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="恢复默认示例数据"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* 快速添加学生 */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <input
                  type="text"
                  placeholder="新建学生姓名"
                  className="bg-transparent border-none text-xs px-2 py-1 w-24 focus:ring-0 focus:outline-none"
                  value={newStudentInput}
                  onChange={(e) => setNewStudentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddStudentDirectly(); }}
                />
                <button 
                  onClick={handleAddStudentDirectly} 
                  className="bg-white p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="新建学生"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 快速添加教师 */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <input
                  type="text"
                  placeholder="新建教师姓名"
                  className="bg-transparent border-none text-xs px-2 py-1 w-24 focus:ring-0 focus:outline-none"
                  value={newTeacherInput}
                  onChange={(e) => setNewTeacherInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTeacherDirectly(); }}
                />
                <button 
                  onClick={handleAddTeacherDirectly} 
                  className="bg-white p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="新建老师"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 顶端对齐三栏核心管理区 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200 items-start">
            
            {/* 栏目 1：学生信息 (支持多学生搜索+滚动优化+改删功能) - 占 4/12 */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>👤 学生信息：</span>
                </div>
                {/* 快速检索 */}
                <input 
                  type="text"
                  placeholder="🔍 检索学生姓名..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="bg-white border border-slate-200 text-[10px] px-2 py-0.5 rounded w-full sm:w-36 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                />
              </div>

              {/* 滚动学生卡片容器 (移除了教师下拉绑定选择，仅展示并支持改删) */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {filteredStudents.map(studentName => (
                  <div key={studentName} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-sm hover:border-slate-300 transition-colors">
                    <span className="font-extrabold text-slate-800 truncate" title={studentName}>{studentName}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditTarget({ type: 'student', name: studentName, newName: studentName })}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="修改名称"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'student', name: studentName })}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="删除学生"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">未找到对应学生</div>
                )}
              </div>
            </div>

            {/* 栏目 2：教师信息 (支持改删功能) - 占 4/12 */}
            <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>🎓 教师信息：</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {teachers.map(teacherName => {
                  if (teacherName === '未指定') return null;
                  return (
                    <div key={teacherName} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-sm hover:border-slate-300 transition-colors">
                      <span className="font-extrabold text-slate-800 truncate" title={teacherName}>{teacherName} 老师</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditTarget({ type: 'teacher', name: teacherName, newName: teacherName })}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="修改名称"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'teacher', name: teacherName })}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="注销教师"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 栏目 3：课表信息 (专属过滤、隐私保障与截图支持) - 占 4/12 */}
            <div className="lg:col-span-4 flex flex-col justify-start space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>📋 课表信息（一键截图隐藏过滤）：</span>
              </div>
              <div className="space-y-2 w-full pt-1">
                <select
                  className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="全部">🔍 所有学生课表</option>
                  {students.map(s => <option key={s} value={s}>学生: {s}</option>)}
                </select>
                <select
                  className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="全部">🔍 所有教师课表</option>
                  {teachers.map(t => <option key={t} value={t}>{t === '未指定' ? '待定老师' : `教师: ${t}`}</option>)}
                </select>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 主体呈现区域 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* ==================== 视图一：列表视图 (两端对齐 + 精密按列左对齐) ==================== */}
        {viewMode === 'list' && (
          Object.keys(sortedAndGroupedData).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">暂无筛选到符合条件的课程明细</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(sortedAndGroupedData).map(([month, courses]) => (
                <section key={month} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  
                  {/* 月份标记表头 */}
                  <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
                    <h2 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
                      📅 {month} 总排课表
                    </h2>
                  </div>

                  {/* 自适应对齐表格 */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[850px] divide-y divide-slate-100">
                      
                      {/* 表头对齐 */}
                      <div className="flex items-center px-5 py-2.5 bg-slate-50/70 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider text-left border-b border-slate-100">
                        <div className={`${COL_WIDTHS.date} pr-2`}>日期</div>
                        <div className={`${COL_WIDTHS.time} pr-2`}>上课时间段</div>
                        <div className={`${COL_WIDTHS.student} pr-2`}>上课学生</div>
                        <div className={`${COL_WIDTHS.teacher} pr-2`}>授课老师</div>
                        <div className={`${COL_WIDTHS.course} pr-2`}>课程项目/内容</div>
                        <div className={`${COL_WIDTHS.note} pr-2`}>状态/备注</div>
                      </div>

                      {/* 内容行 */}
                      {courses.map((course) => {
                        const dateObj = new Date(course.date);
                        const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
                        const isConflict = conflictSet.has(course.id);
                        
                        return (
                          <div 
                            key={course.id} 
                            className={`flex items-center px-5 py-3 hover:bg-indigo-50/20 transition-colors text-xs text-slate-700 text-left ${isConflict ? 'bg-red-50 hover:bg-red-100/60' : ''}`}
                          >
                            {/* 日期列 */}
                            <div className={`${COL_WIDTHS.date} shrink-0 font-bold text-slate-900 pr-2`}>
                              <span>{formattedDate}</span>
                              <span className="ml-1 text-slate-400 font-medium">({course.day})</span>
                            </div>
                            
                            {/* 时间段列 */}
                            <div className={`${COL_WIDTHS.time} shrink-0 text-slate-600 font-medium flex items-center pr-2`}>
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                              {course.start} – {course.end}
                            </div>

                            {/* 学生列 */}
                            <div className={`${COL_WIDTHS.student} shrink-0 font-extrabold text-slate-900 flex items-center pr-2`}>
                              <User className="w-3.5 h-3.5 mr-1.5 text-indigo-400 shrink-0" />
                              {course.student}
                            </div>

                            {/* 老师列 */}
                            <div className={`${COL_WIDTHS.teacher} shrink-0 pr-2`}>
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-black border leading-none ${getTeacherBgColor(course.teacher)}`}>
                                {course.teacher !== '未指定' ? `${course.teacher} 老师` : '待定老师'}
                              </span>
                            </div>

                            {/* 课程内容列 */}
                            <div className={`${COL_WIDTHS.course} shrink-0 text-slate-700 font-bold flex items-center pr-3`}>
                              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                              <span className="truncate" title={course.course}>{course.course}</span>
                            </div>

                            {/* 备注备注列 */}
                            <div className={`${COL_WIDTHS.note} shrink-0 flex items-center pr-2`}>
                              {isConflict ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                  教师时间冲突
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px] flex items-center gap-1.5 truncate" title={course.note}>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span className="truncate">{course.note}</span>
                                </span>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {/* ==================== 视图二：日历视图 (标明开始与结束时间) ==================== */}
        {viewMode === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* 日历导航 */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span className="text-base font-extrabold tracking-wide">
                  {calendarYear} 年 {calendarMonth} 月 课程行事历
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="上个月"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs bg-slate-800 px-3 py-1 rounded-md font-bold">
                  {calendarMonth}月
                </span>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="下个月"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 日历网格主体 */}
            <div className="p-4 bg-slate-50/50">
              {/* 星期行 */}
              <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
                {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d, index) => (
                  <div 
                    key={d} 
                    className={`text-xs font-black py-1.5 rounded ${index === 0 || index === 6 ? 'text-rose-500 bg-rose-50/50' : 'text-slate-500 bg-slate-100/50'}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* 日期网络格子 */}
              <div className="grid grid-cols-7 gap-1.5 min-h-[380px]">
                {calendarCells.map((cell) => {
                  if (cell.isPadding) {
                    return <div key={cell.key} className="bg-slate-100/30 border border-slate-200/50 rounded-xl min-h-[90px]"></div>;
                  }

                  return (
                    <div 
                      key={cell.key} 
                      className="bg-white border border-slate-200 rounded-xl p-2 min-h-[110px] flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      {/* 日期数 */}
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cell.day}日
                        </span>
                        {cell.courses.length > 0 && (
                          <span className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 px-1 rounded-full">
                            {cell.courses.length} 节
                          </span>
                        )}
                      </div>

                      {/* 课程微型卡片区 */}
                      <div className="flex-1 space-y-1 overflow-y-auto max-h-[100px] scrollbar-thin">
                        {cell.courses.map(course => {
                          const isConflict = conflictSet.has(course.id);
                          return (
                            <div 
                              key={course.id}
                              className={`p-1 rounded border text-[10px] leading-tight flex flex-col justify-between truncate ${isConflict ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : getTeacherBgColor(course.teacher)}`}
                              title={`${course.student} | ${course.teacher} 老师: ${course.course} (${course.start}-${course.end})`}
                            >
                              <div className="flex items-center justify-between gap-1 font-extrabold truncate">
                                <span className="truncate">{course.student} ({course.teacher})</span>
                              </div>
                              <div className="truncate text-[9px] text-slate-600 font-medium">
                                {course.course}
                              </div>
                              {/* 精确展示上课与结束时间 */}
                              <div className="text-[9px] text-slate-500 font-bold mt-0.5 flex items-center gap-1 shrink-0">
                                <Clock className="w-2.5 h-2.5 opacity-70" />
                                <span>{course.start} - {course.end}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 日历图例说明 */}
            <div className="bg-white border-t border-slate-150 px-6 py-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500 justify-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> Aaron 老师
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Oscar 老师
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> 其他自定义教师
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-400"></span> 待定老师
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-50 animate-pulse border border-rose-300"></span> ⚠️ 时间冲突
              </span>
            </div>

          </div>
        )}
      </main>

      {/* ==================== 删除确认弹窗 ==================== */}
      {deleteTarget.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5">
              <div className="flex items-center gap-2.5 text-red-600 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">确认注销此成员？</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                您确定要删除{deleteTarget.type === 'student' ? '学生' : '教师'} <strong className="text-slate-900">「{deleteTarget.name}」</strong> 吗？
                删除后，该成员在课表中的<strong className="text-red-600">所有课程记录将被级联清洗抹去，且无法恢复！</strong>
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 flex gap-2 justify-end border-t border-slate-100">
              <button
                onClick={() => setDeleteTarget({ type: null, name: '' })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 编辑修改弹窗 ==================== */}
      {editTarget.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5">
              <div className="flex items-center gap-2.5 text-indigo-600 mb-3">
                <Calendar className="w-5 h-5 animate-pulse" />
                <h3 className="font-extrabold text-sm">修改成员名称</h3>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-500">
                  将原名称 「{editTarget.name}」 变更为：
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  value={editTarget.newName}
                  onChange={(e) => setEditTarget({ ...editTarget, newName: e.target.value })}
                  placeholder="输入新名称"
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); }}
                />
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 flex gap-2 justify-end border-t border-slate-100">
              <button
                onClick={() => setEditTarget({ type: null, name: '', newName: '' })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors cursor-pointer"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 智能批量导入弹窗 ==================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-violet-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-violet-300" />
                智能批量导入课程清单
              </h3>
              <button
                onClick={() => { setIsImportModalOpen(false); setImportPreview(null); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <pre className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
                {IMPORT_FORMAT_HELP}
              </pre>

              <textarea
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-lg text-xs p-3 font-mono focus:ring-1 focus:ring-violet-500 focus:outline-none"
                placeholder={'粘贴课程清单，例如：\n2026-06-03,13:50,15:50,宾思程,Aaron,SAT阅读语法,正常\n或：2026-06-03 13:50-15:50 宾思程 Aaron SAT阅读语法'}
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportPreview(null); }}
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleParseImportPreview}
                  className="px-4 py-2 text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-lg cursor-pointer"
                >
                  解析预览
                </button>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                  />
                  追加到现有课表
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  替换全部课表
                </label>
              </div>

              {importPreview && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                    解析结果：{importPreview.sessions.length} 节可导入
                    {importPreview.errors.length > 0 && (
                      <span className="text-amber-600 ml-2">· {importPreview.errors.length} 条警告</span>
                    )}
                  </div>
                  {importPreview.errors.length > 0 && (
                    <ul className="px-3 py-2 text-[11px] text-amber-700 bg-amber-50 border-b border-amber-100 max-h-24 overflow-y-auto">
                      {importPreview.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  )}
                  {importPreview.sessions.length > 0 && (
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-[11px]">
                      {importPreview.sessions.slice(0, 20).map((s, i) => (
                        <div key={i} className="px-3 py-1.5 text-slate-600">
                          {s.date} {s.start}-{s.end} · {s.student} · {s.teacher} · {s.course}
                        </div>
                      ))}
                      {importPreview.sessions.length > 20 && (
                        <div className="px-3 py-1.5 text-slate-400">… 另有 {importPreview.sessions.length - 20} 节</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 flex gap-2 justify-end border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => { setIsImportModalOpen(false); setImportPreview(null); }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchImport}
                disabled={!importPreview?.sessions?.length}
                className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow cursor-pointer"
              >
                确认导入并保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 规律排课/新单次课排课弹窗 ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* 弹窗头部 */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-400" />
                新增排课计划 (单次 / 规律重复)
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedules} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* 1. 学生选择 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">上课学生</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                    value={modalData.student}
                    onChange={(e) => setModalData({ ...modalData, student: e.target.value })}
                  >
                    {students.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* 2. 授课教师选择 (直接绑定与简化) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">授课教师</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                    value={modalData.teacher}
                    onChange={(e) => setModalData({ ...modalData, teacher: e.target.value })}
                  >
                    {teachers.map(t => (
                      <option key={t} value={t}>{t === '未指定' ? '暂不指派 (待定)' : `${t} 老师`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. 上课日期与时间范围 */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">首课日期</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={modalData.date}
                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">开始时间</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={modalData.start}
                    onChange={(e) => setModalData({ ...modalData, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">结束时间</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={modalData.end}
                    onChange={(e) => setModalData({ ...modalData, end: e.target.value })}
                  />
                </div>
              </div>

              {/* 4. 课程名称 & 备注 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">课程名称 / 级别</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                    value={modalData.course}
                    onChange={(e) => setModalData({ ...modalData, course: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">上课状态/备注</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                    value={modalData.note}
                    onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                  />
                </div>
              </div>

              {/* 5. 规律排课逻辑 */}
              <div className="border-t border-slate-150 pt-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    checked={modalData.isRecurring}
                    onChange={(e) => setModalData({ ...modalData, isRecurring: e.target.checked })}
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800">开启“规律排课”（自动按设定的周期生成多节课程）</span>
                  </div>
                </label>
              </div>

              {modalData.isRecurring && (
                <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-indigo-950 mb-1">重复频率</label>
                    <select
                      className="w-full bg-white border border-indigo-200 rounded-lg text-xs p-2 font-bold focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      value={modalData.recurrenceType}
                      onChange={(e) => setModalData({ ...modalData, recurrenceType: e.target.value })}
                    >
                      <option value="daily">每天重复</option>
                      <option value="weekly">每周重复</option>
                      <option value="biweekly">每两周重复</option>
                      <option value="monthly">每月重复</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-950 mb-1">重复生成总次数 (节)</label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      className="w-full bg-white border border-indigo-200 rounded-lg text-xs p-2 font-bold focus:ring-1 focus:ring-indigo-500"
                      value={modalData.recurrenceCount}
                      onChange={(e) => setModalData({ ...modalData, recurrenceCount: e.target.value })}
                    />
                    <span className="text-[10px] text-indigo-600 mt-0.5 block font-medium">包含首课共生成 {modalData.recurrenceCount} 节课</span>
                  </div>
                </div>
              )}

              {/* 提交与取消 */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors cursor-pointer"
                >
                  确认并导入排课
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}