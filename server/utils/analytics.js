/**
 * Attendance reporting ke pure helpers.
 *
 * Attendance sheet ke raw rows aur Users list se per-student percentage
 * banata hai. Koi IO nahi — isliye asaani se test hota hai. Percentage galat
 * ho to parents ko galat report chali jaati hai, isliye ye alag module me hai.
 */

const { stripHeader, djDate } = require('./rows');

const percent = (present, marked) => (marked > 0 ? Math.round((present / marked) * 100) : null);

/**
 * Ek class ke students ka gender breakdown: { '9': { total, boys, girls } }.
 */
const genderSplit = (students) => {
  const out = {};
  (Array.isArray(students) ? students : []).forEach((s) => {
    const cls = String(s.class || 'N/A');
    if (!out[cls]) out[cls] = { total: 0, boys: 0, girls: 0 };
    out[cls].total += 1;
    if (s.gender === 'male') out[cls].boys += 1;
    else if (s.gender === 'female') out[cls].girls += 1;
  });
  return out;
};

/**
 * Per-student attendance summary.
 *
 * @param {Array} attendanceRows - raw 'Attendance' sheet rows (header ke saath)
 * @param {Array} students       - active students (toUser shape)
 * @param {object} opts          - { className, from, to }
 */
const summariseAttendance = (attendanceRows, students, opts = {}) => {
  const { className = '', from = '', to = '' } = opts;
  const rows = stripHeader(attendanceRows);

  const inRange = (date) => (!from || date >= from) && (!to || date <= to);
  const byStudent = new Map();
  rows.filter((r) => inRange(djDate(r[0]))).forEach((r) => {
    const id = String(r[2] || '').trim();
    if (!id) return;
    if (!byStudent.has(id)) byStudent.set(id, { present: 0, absent: 0 });
    const rec = byStudent.get(id);
    if (String(r[4] || '').trim().toLowerCase() === 'present') rec.present += 1;
    else rec.absent += 1;
  });

  const list = (Array.isArray(students) ? students : [])
    .filter((s) => !className || String(s.class) === String(className))
    .map((s) => {
      const rec = byStudent.get(s.id) || { present: 0, absent: 0 };
      const marked = rec.present + rec.absent;
      return {
        id: s.id,
        name: s.name,
        className: s.class,
        section: s.section || 'A',
        gender: s.gender || '',
        marked,
        present: rec.present,
        absent: rec.absent,
        percent: percent(rec.present, marked)
      };
    })
    .sort(
      (a, b) =>
        String(a.className).localeCompare(String(b.className)) ||
        String(a.name).localeCompare(String(b.name))
    );

  const totalMarked = list.reduce((n, s) => n + s.marked, 0);
  const totalPresent = list.reduce((n, s) => n + s.present, 0);

  return {
    students: list,
    summary: {
      students: list.length,
      withAttendance: list.filter((s) => s.marked > 0).length,
      totalMarked,
      totalPresent,
      totalAbsent: totalMarked - totalPresent,
      averagePercent: totalMarked ? Math.round((totalPresent / totalMarked) * 100) : null,
      lowAttendance: list.filter((s) => s.percent !== null && s.percent < 75).length
    },
    filters: { className: className || 'All', from: from || '', to: to || '' }
  };
};

module.exports = { summariseAttendance, genderSplit, percent };
