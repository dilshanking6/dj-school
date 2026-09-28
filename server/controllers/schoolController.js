const { getSheetData, appendSheetData, updateSheetData, deleteSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { toUser } = require('./authController');
const { stripHeader, userRows, djDate } = require('../utils/rows');

const CLASSES = ['9', '10', '11', '12', 'N/A'];
const STAFF = ['teacher', 'principal', 'admin'];
const ATTENDANCE_STATUS = ['present', 'absent'];

const makeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

/**
 * Teachers apni class tak limited rehte hain.
 * Principal aur admin ko poora school dikhta hai.
 */
const assertClassAccess = (user, className) => {
  if (user.role !== 'teacher') return;
  const own = String(user.class || 'N/A');
  if (own === 'N/A' || !className) {
    throw new HttpError(403, 'Your account is not assigned to a class yet');
  }
  if (String(className) !== own) {
    throw new HttpError(403, 'You can only view your own class records');
  }
};

const getUsers = async () => {
  const rawRows = await getSheetData('Users');
  return userRows(rawRows).map(toUser);
};

const isStaff = (user) => STAFF.includes(user.role);

const getDashboard = asyncRoute(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  const [users, attendance, results, events, announcements, complaints, ratings, notes] = await Promise.all([
    getUsers(),
    getSheetData('Attendance'),
    getSheetData('Results'),
    getSheetData('Events'),
    getSheetData('Announcements'),
    getSheetData('Complaints'),
    getSheetData('Ratings'),
    getSheetData('Notes')
  ]);

  const active = users.filter((u) => u.status !== 'banned');
  const students = active.filter((u) => u.role === 'student');
  const teachers = active.filter((u) => u.role === 'teacher');
  const admins = active.filter((u) => u.role === 'admin');
  const principals = active.filter((u) => u.role === 'principal');

  const me = users.find((u) => u.id === userId);
  const classStats = {};
  students.forEach((s) => {
    const cls = s.class || 'N/A';
    classStats[cls] = (classStats[cls] || 0) + 1;
  });

  const resultRows = stripHeader(results).map((r) => ({
    className: r[0],
    studentId: String(r[1] || '').trim(),
    marks: parseInt(r[4], 10) || 0,
    total: parseInt(r[5], 10) || 0,
    subject: r[3]
  }));

  const attendanceRows = stripHeader(attendance);
  const eventRows = stripHeader(events);
  const complaintRows = stripHeader(complaints);
  const noteRows = stripHeader(notes);

  const roleData = {};

  if (role === 'student') {
    const mine = attendanceRows.filter((r) => String(r[2] || '').trim() === userId);
    const present = mine.filter((r) => String(r[4] || '').toLowerCase() === 'present').length;

    const myResults = resultRows.filter((r) => r.studentId === userId);
    const scored = myResults.filter((r) => r.total > 0);
    const averageResult = scored.length
      ? Math.round(scored.reduce((sum, r) => sum + (r.marks / r.total) * 100, 0) / scored.length)
      : null;

    const myClass = me?.class || 'N/A';
    const pendingHomework = noteRows.filter((r) => {
      const rowClass = String(r[5] || '').trim().toLowerCase();
      const isHomework = String(r[8] || 'note').toLowerCase() === 'homework';
      return isHomework && (rowClass === 'all' || rowClass === myClass.toLowerCase());
    }).length;

    let rank = null;
    if (myResults.length && myClass !== 'N/A') {
      const peers = students
        .filter((s) => s.class === myClass)
        .map((s) => {
          const rows = resultRows.filter((r) => r.studentId === s.id && r.total > 0);
          if (!rows.length) return { id: s.id, avg: -1 };
          return { id: s.id, avg: rows.reduce((sum, r) => sum + (r.marks / r.total) * 100, 0) / rows.length };
        })
        .filter((p) => p.avg >= 0)
        .sort((a, b) => b.avg - a.avg);

      const position = peers.findIndex((p) => p.id === userId);
      if (position !== -1) rank = position + 1;
    }

    roleData.student = {
      attendancePercent: mine.length ? Math.round((present / mine.length) * 100) : null,
      attendanceMarked: mine.length,
      averageResult,
      pendingHomework,
      rank
    };
  }

  if (role === 'teacher') {
    const myNotes = noteRows.filter((r) => String(r[1] || '').trim() === userId);
    const myClass = me?.class && me.class !== 'N/A' ? me.class : null;
    const myStudents = myClass ? students.filter((s) => s.class === myClass).length : students.length;

    roleData.teacher = {
      classes: myClass ? 1 : 0,
      students: myStudents,
      notesShared: myNotes.length
    };
  }

if (isStaff(req.user)) {
    const today = djDate(new Date());
    roleData.principal = {
      students: students.length,
      teachers: teachers.length,
      pendingComplaints: complaintRows.filter((r) => String(r[5] || '').toLowerCase() === 'pending').length,
      attendanceMarkedToday: attendanceRows.filter((r) => djDate(r[0]) === today).length
    };
    roleData.admin = {
      totalUsers: users.length,
      students: students.length,
      teachers: teachers.length,
      principals: principals.length,
      suspended: users.filter((u) => u.status === 'banned').length,
      activeEvents: eventRows.length
    };
  }

  const classAverages = {};
  CLASSES.filter((c) => c !== 'N/A').forEach((cls) => {
    const ids = new Set(students.filter((s) => s.class === cls).map((s) => s.id));
    const rows = resultRows.filter((r) => ids.has(r.studentId) && r.total > 0);
    if (!rows.length) return;
    classAverages[cls] = Math.round(rows.reduce((sum, r) => sum + (r.marks / r.total) * 100, 0) / rows.length);
  });

  res.json({
    stats: {
      totalUsers: users.length,
      students: students.length,
      teachers: teachers.length,
      admins: admins.length,
      principals: principals.length,
      suspended: users.filter((u) => u.status === 'banned').length,
      classWiseStudents: classStats,
      classAverages,
      activeEvents: eventRows.length,
      totalComplaints: complaintRows.length,
      totalRatings: stripHeader(ratings).length,
      subjectsTaught: [...new Set(teachers.map((t) => t.subject).filter(Boolean))].length
    },
    ...roleData,
    announcements: stripHeader(announcements)
      .slice(-5)
      .reverse()
      .map((r) => ({ id: r[0], title: r[1], message: r[2], date: r[5] })),
    events: eventRows
      .slice(-5)
      .reverse()
      .map((r) => ({ id: r[0], title: r[1], date: r[2], venue: r[4], time: r[3] }))
  });
});

const listUsers = asyncRoute(async (req, res) => {
  let users = await getUsers();

  if (req.query.role) {
    const role = v.oneOf(req.query.role, ['student', 'teacher', 'principal', 'admin'], 'Role');
    users = users.filter((u) => u.role === role);
  }

  if (req.query.className) {
    const className = String(req.query.className);
    if (req.user.role === 'student' && className !== (req.user.class || 'N/A')) {
      throw new HttpError(403, 'You do not have access to this resource');
    }
    if (req.user.role === 'teacher' && className !== 'All' && className !== (req.user.class || 'N/A')) {
      throw new HttpError(403, 'You do not have access to this resource');
    }
    if (className !== 'All') {
      users = users.filter((u) => u.class === className);
    }
  } else if (req.user.role === 'student') {
    users = users.filter((u) => u.class === req.user.class);
  }

  res.json(users.map(({ status, ...user }) => ({ ...user, status })));
});

const updateUserStatus = asyncRoute(async (req, res) => {
  const bodyStatus = req.body.status;
  const bodyClass = req.body.className;

  if (!bodyStatus && bodyClass === undefined) {
    throw new HttpError(400, 'Send status and/or className to update');
  }

  const hasStatus = bodyStatus !== undefined && bodyStatus !== null && String(bodyStatus).trim() !== '';
  const status = hasStatus ? v.oneOf(bodyStatus, ['active', 'pending', 'banned'], 'Status') : null;
  let className = null;
  if (bodyClass !== undefined && bodyClass !== null && String(bodyClass).trim() !== '') {
    className = v.oneOf(bodyClass, ['9', '10', '11', '12', 'N/A'], 'Class');
  }

  if (req.params.id === req.user.id) {
    throw new HttpError(400, 'You cannot change your own account here');
  }

  const users = await getUsers();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) throw new HttpError(404, 'Account not found');
  if (target.role === 'admin') throw new HttpError(403, 'Administrator accounts cannot be modified here');
  if (req.user.role !== 'admin' && (target.role === 'principal' || target.role === 'admin')) {
    throw new HttpError(403, 'The principal can only manage student and teacher accounts');
  }
  if (className && !['student', 'teacher'].includes(target.role)) {
    throw new HttpError(400, 'Class can only be assigned to students and teachers');
  }

  const rows = await getSheetData('Users');
  const rowIndex = rows.findIndex((r) => String(r[6] || '').trim() === req.params.id);
  if (rowIndex === -1) throw new HttpError(404, 'Account not found');

  const updatedRow = [...rows[rowIndex]];
  let detail = {};
  try {
    detail = updatedRow[5] ? JSON.parse(updatedRow[5]) : {};
  } catch {
    detail = {};
  }
  if (status) detail.status = status;
  updatedRow[5] = JSON.stringify(detail);
  if (className) updatedRow[4] = className;

  await updateSheetData('Users', req.params.id, updatedRow);
  res.json({ success: true, status: status || detail.status, className: className || String(updatedRow[4] || '') });
});

const markAttendance = asyncRoute(async (req, res) => {
  const date = v.isoDate(req.body.date, 'Date');
  const className = v.oneOf(req.body.className, CLASSES, 'Class');
  const records = v.array(req.body.records, 'Attendance records', { min: 1, max: 200 });

  if (req.user.role === 'teacher' && req.user.class !== 'N/A' && className !== req.user.class) {
    throw new HttpError(403, 'You can only mark attendance for your own class');
  }

  const students = (await getUsers()).filter((u) => u.role === 'student' && u.class === className);
  const byId = new Map(students.map((s) => [s.id, s]));

  const cleaned = records.map((record) => {
    const studentId = v.text(record.studentId, 'Student', { max: 40 });
    const student = byId.get(studentId);
    if (!student) throw new HttpError(400, 'One or more students are not in this class');
    return {
      studentId,
      studentName: student.name,
      status: v.oneOf(record.status, ATTENDANCE_STATUS, 'Attendance status')
    };
  });

const existingRows = await getSheetData('Attendance');
  const existingById = new Map(
    existingRows.map((r) => [String(r[6] || '').trim(), r])
  );

  await Promise.all(
    cleaned.map((record) => {
      const id = `${date}_${className}_${record.studentId}`;
      const values = [date, className, record.studentId, record.studentName, record.status, req.user.id, id];
      if (existingById.has(id)) {
        return updateSheetData('Attendance', id, values);
      }
      return appendSheetData('Attendance', values);
    })
  );

  res.status(201).json({ success: true, recorded: cleaned.length });
});

const getAttendance = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Attendance'));
  let filtered = rows;

  const targetStudent = req.query.studentId
    ? String(req.query.studentId)
    : req.user.role === 'student' ? req.user.id : null;

  if (targetStudent) {
    if (req.user.role === 'student' && targetStudent !== req.user.id) {
      throw new HttpError(403, 'You do not have access to this resource');
    }
    filtered = filtered.filter((row) => String(row[2] || '').trim() === targetStudent);
  }

  if (req.query.className) {
    const className = String(req.query.className);
    if (req.user.role === 'student' && className !== req.user.class) {
      throw new HttpError(403, 'You do not have access to this resource');
    }
    assertClassAccess(req.user, className);
    filtered = filtered.filter((row) => String(row[1] || '').trim() === className);
  } else if (req.user.role === 'teacher') {
    const own = String(req.user.class || 'N/A');
    if (own === 'N/A') throw new HttpError(403, 'Your account is not assigned to a class yet');
    filtered = filtered.filter((row) => String(row[1] || '').trim() === own);
  }

res.json(
    filtered
      .map((row, index) => ({
        sr: index + 1,
        date: djDate(row[0]),
        className: row[1],
        studentId: row[2],
        studentName: row[3],
        status: row[4],
        markedBy: row[5],
        id: row[6]
      }))
      .reverse()
  );
});

/**
 * Aaj ka live attendance summary — principal ko dikhta hai ki aaj total
 * kitne bache aaye, kis class me kitne, aur ladke/ladkiyan kaise bant hai.
 * Teacher ko sirf apni class ka. Date pass karo (YYYY-MM-DD) to kisi bhi din ka.
 */
const getTodayAttendance = asyncRoute(async (req, res) => {
  const date = req.query.date
    ? v.isoDate(req.query.date, 'Date')
    : djDate(new Date());

  const [rows, users] = await Promise.all([getSheetData('Attendance'), getUsers()]);
  const genderById = new Map(users.map((u) => [u.id, u.gender || '']));

  let today = stripHeader(rows).filter((r) => djDate(r[0]) === date);

  if (req.user.role === 'teacher') {
    const own = String(req.user.class || 'N/A');
    if (own === 'N/A') throw new HttpError(403, 'Your account is not assigned to a class yet');
    today = today.filter((r) => String(r[1] || '').trim() === own);
  }

  const byClass = {};
  today.forEach((r) => {
    const className = String(r[1] || '').trim();
    const status = String(r[4] || '').trim().toLowerCase();
    if (!byClass[className]) byClass[className] = { list: [] };
    byClass[className].list.push({ studentId: r[2], studentName: r[3], status, gender: genderById.get(String(r[2] || '').trim()) || '' });
  });

  const classes = Object.entries(byClass)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([className, data]) => {
      const present = data.list.filter((x) => x.status === 'present');
      return {
        className,
        students: data.list.length,
        present: present.length,
        absent: data.list.length - present.length,
        girls: present.filter((x) => x.gender === 'female').length,
        boys: present.filter((x) => x.gender === 'male').length
      };
    });

  const present = today.filter((r) => String(r[4] || '').trim().toLowerCase() === 'present').length;

  res.json({
    date,
    total: today.length,
    present,
    absent: today.length - present,
    classes
  });
});

const uploadResult = asyncRoute(async (req, res) => {
  const className = v.oneOf(req.body.className, CLASSES, 'Class');
  const subject = v.text(req.body.subject, 'Subject', { max: 60 });
  const exam = v.text(req.body.exam, 'Exam', { max: 60 });
  const marks = v.int(req.body.marks, 'Marks', { min: 0, max: 1000 });
  const total = v.int(req.body.total, 'Total marks', { min: 1, max: 1000 });

  if (marks > total) throw new HttpError(400, 'Marks cannot be higher than total marks');
  if (req.user.role === 'teacher' && req.user.class !== 'N/A' && className !== req.user.class) {
    throw new HttpError(403, 'You can only upload results for your own class');
  }

  const student = (await getUsers()).find((u) => u.id === v.text(req.body.studentId, 'Student', { max: 40 }));
  if (!student || student.class !== className) throw new HttpError(400, 'Student is not in this class');

  const id = makeId('RES');
  await appendSheetData('Results', [className, student.id, student.name, subject, marks, total, exam, req.user.id, id, new Date().toISOString()]);

  res.status(201).json({ success: true, id });
});

const getResults = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Results'));

  const targetStudent = req.query.studentId
    ? String(req.query.studentId)
    : req.user.role === 'student' ? req.user.id : null;

  if (targetStudent && req.user.role === 'student' && targetStudent !== req.user.id) {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  let requestedClass = req.query.className ? String(req.query.className) : null;
  if (req.user.role === 'student' && requestedClass && requestedClass !== req.user.class) {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  if (req.user.role === 'teacher') {
    const own = String(req.user.class || 'N/A');
    if (own === 'N/A') throw new HttpError(403, 'Your account is not assigned to a class yet');
    assertClassAccess(req.user, requestedClass || own);
    requestedClass = requestedClass || own;
  }

  let filtered = rows;
  if (targetStudent) filtered = filtered.filter((row) => String(row[1] || '').trim() === targetStudent);
  if (requestedClass) {
    filtered = filtered.filter((row) => String(row[0] || '').trim() === requestedClass);
  }

  const shaped = filtered
    .map((row) => ({
      className: row[0],
      studentId: row[1],
      studentName: row[2],
      subject: row[3],
      marks: Number(row[4]) || 0,
      total: Number(row[5]) || 0,
      exam: row[6],
      id: row[8]
    }))
    .reverse();

  if (req.user.role === 'student') {
    const scored = shaped.filter((r) => r.total > 0);
    const average = scored.length
      ? Math.round(scored.reduce((sum, r) => sum + (r.marks / r.total) * 100, 0) / scored.length)
      : null;
    return res.json({ results: shaped, average });
  }

  return res.json({ results: shaped, average: null });
});

const createEvent = asyncRoute(async (req, res) => {
  const title = v.text(req.body.title, 'Event title', { max: 120 });
  const date = v.isoDate(req.body.date, 'Date');
  const time = v.timeString(req.body.time);
  const venue = v.text(req.body.venue, 'Venue', { max: 120 });
  const description = v.optionalText(req.body.description, 'Description', { max: 1000 });

  const id = makeId('EVT');
  await appendSheetData('Events', [id, title, date, time, venue, description, req.user.id, new Date().toISOString()]);

  const io = req.app.get('socketio');
  if (io) io.emit('new_event', { id, title, date, time, venue, description });

  res.status(201).json({ success: true, id });
});

const getEvents = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Events'));
  res.json(
    rows
      .map((row) => ({
        id: row[0],
        title: row[1],
        date: row[2],
        time: row[3],
        venue: row[4],
        description: row[5],
        createdBy: row[6],
        createdAt: row[7]
      }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  );
});

const deleteEvent = asyncRoute(async (req, res) => {
  await deleteSheetData('Events', req.params.id);
  const io = req.app.get('socketio');
  if (io) io.emit('event_deleted', { id: req.params.id });
  res.json({ success: true });
});

const createAnnouncement = asyncRoute(async (req, res) => {
  const title = v.text(req.body.title, 'Notice title', { max: 120 });
  const message = v.text(req.body.message, 'Message', { max: 2000 });
  const audience = v.oneOf(req.body.audience || 'All', ['All', 'student', 'teacher', 'principal'], 'Audience');

  const id = makeId('ANN');
  await appendSheetData('Announcements', [id, title, message, audience, req.user.id, new Date().toISOString()]);

  // Sirf target audience ko bhejo — role-restricted notice poori school me leak nahi honi chahiye
  const io = req.app.get('socketio');
  if (io) {
    const payload = { id, title, message, audience };
    if (audience === 'All') io.emit('new_announcement', payload);
    else io.to(`role:${audience}`).emit('new_announcement', payload);
  }

  res.status(201).json({ success: true, id });
});

const getAnnouncements = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Announcements'));
  const role = req.user.role;

  const filtered = rows.filter((row) => {
    const audience = String(row[3] || 'All');
    return audience === 'All' || audience === role;
  });

  res.json(
    filtered
      .map((row) => ({
        id: row[0],
        title: row[1],
        message: row[2],
        audience: row[3],
        createdBy: row[4],
        createdAt: row[5]
      }))
      .reverse()
  );
});

const deleteAnnouncement = asyncRoute(async (req, res) => {
  // Announcement ki audience check karo (All / role) — warna role-restricted
  // delete-event bhi poori audience ko broadcast ho jaata hai aur boards ko
  // gair-zaroori update milti hai. Sheet delete hamesha hota hai.
  let audience = 'All';
  try {
    const rows = stripHeader(await getSheetData('Announcements'));
    const target = rows.find((row) => String(row[0]) === String(req.params.id));
    if (target) audience = String(target[3] || 'All');
  } catch { /* delete aage badhta rahe */ }

  await deleteSheetData('Announcements', req.params.id);
  const io = req.app.get('socketio');
  if (io) {
    if (audience === 'All') io.emit('announcement_deleted', { id: req.params.id });
    else io.to(`role:${audience}`).emit('announcement_deleted', { id: req.params.id });
  }
  res.json({ success: true });
});

const getPortalStats = asyncRoute(async (req, res) => {
  const [users, results] = await Promise.all([getUsers(), getSheetData('Results')]);

  const active = users.filter((u) => u.status !== 'banned');
  const students = active.filter((u) => u.role === 'student');
  const teachers = active.filter((u) => u.role === 'teacher');

  const studentIds = new Set(students.map((s) => s.id));
  const scored = stripHeader(results)
    .filter((r) => studentIds.has(String(r[1] || '').trim()) && (parseInt(r[5], 10) || 0) > 0)
    .map((r) => ((parseInt(r[4], 10) || 0) / (parseInt(r[5], 10) || 1)) * 100);

  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length)
    : null;

  res.json({
    students: students.length,
    teachers: teachers.length,
    sections: [...new Set(students.map((s) => s.section).filter(Boolean))].length,
    subjects: [...new Set(teachers.map((t) => t.subject).filter(Boolean))].length,
    averageScore
  });
});

module.exports = {
  getDashboard, listUsers, updateUserStatus, markAttendance, getAttendance, getTodayAttendance,
  uploadResult, getResults, createEvent, getEvents, deleteEvent,
  createAnnouncement, getAnnouncements, deleteAnnouncement, getPortalStats
};
