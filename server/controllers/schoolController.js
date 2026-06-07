const { getSheetData, appendSheetData, updateSheetData } = require('../utils/googleSheets');

const rowsWithoutHeader = (rows) => (Array.isArray(rows) ? rows.slice(1) : []);
const makeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const parseJson = (value, fallback = {}) => {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toUser = (row) => {
  const detail = parseJson(row[5], {});
  return {
    name: row[0] || '',
    email: row[1] || '',
    role: row[3] || '',
    class: row[4] || '',
    detail,
    id: row[6] || '',
    avatar: row[7] || '',
    phone: row[8] || '',
    subject: row[9] || '',
    degree: row[10] || '',
    experience: row[11] || '',
    status: detail.status || 'active'
  };
};

const getUsers = async () => rowsWithoutHeader(await getSheetData('Users')).map(toUser);

const getDashboard = async (req, res) => {
  try {
    const { role, userId, className } = req.query;
    const [users, attendanceRows, resultRows, notesRows, eventRows, announcementRows, complaintRows, ratingsRows] =
      await Promise.all([
        getUsers(),
        getSheetData('Attendance'),
        getSheetData('Results'),
        getSheetData('Notes'),
        getSheetData('Events'),
        getSheetData('Announcements'),
        getSheetData('Complaints'),
        getSheetData('Ratings')
      ]);

    const attendance = rowsWithoutHeader(attendanceRows);
    const results = rowsWithoutHeader(resultRows);
    const notes = rowsWithoutHeader(notesRows);
    const events = rowsWithoutHeader(eventRows).map((row) => ({
      id: row[0],
      title: row[1],
      date: row[2],
      time: row[3],
      venue: row[4],
      description: row[5],
      createdBy: row[6],
      createdAt: row[7]
    }));
    const announcements = rowsWithoutHeader(announcementRows).map((row) => ({
      id: row[0],
      title: row[1],
      message: row[2],
      audience: row[3],
      createdBy: row[4],
      createdAt: row[5]
    }));
    const complaints = rowsWithoutHeader(complaintRows);
    const ratings = rowsWithoutHeader(ratingsRows);

    const students = users.filter((u) => u.role === 'student');
    const teachers = users.filter((u) => u.role === 'teacher');
    const subjects = new Set(teachers.map((t) => t.subject).filter(Boolean));

    const studentAttendance = userId ? attendance.filter((row) => row[2] === userId) : [];
    const presentCount = studentAttendance.filter((row) => row[4] === 'present').length;
    const attendancePercent = studentAttendance.length ? Math.round((presentCount / studentAttendance.length) * 100) : null;

    const studentResults = userId ? results.filter((row) => row[2] === userId) : [];
    const resultPercentages = studentResults
      .map((row) => ({ marks: Number(row[5]), total: Number(row[6]) }))
      .filter((r) => r.total > 0)
      .map((r) => (r.marks / r.total) * 100);
    const averageResult = resultPercentages.length
      ? Math.round(resultPercentages.reduce((sum, value) => sum + value, 0) / resultPercentages.length)
      : null;

    const classScope = className && className !== 'N/A' ? className : undefined;
    const classHomework = notes.filter((row) => {
      const noteClass = row[5];
      const type = row[8] || 'note';
      return type === 'homework' && (!classScope || noteClass === classScope || noteClass === 'All');
    });

    const rankedStudents = students
      .map((student) => {
        const studentRows = results.filter((row) => row[2] === student.id);
        const percentages = studentRows
          .map((row) => ({ marks: Number(row[5]), total: Number(row[6]) }))
          .filter((r) => r.total > 0)
          .map((r) => (r.marks / r.total) * 100);
        const avg = percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : null;
        return { id: student.id, avg };
      })
      .filter((student) => student.avg !== null)
      .sort((a, b) => b.avg - a.avg);
    const rankIndex = rankedStudents.findIndex((student) => student.id === userId);

    const successValues = results
      .map((row) => ({ marks: Number(row[5]), total: Number(row[6]) }))
      .filter((r) => r.total > 0)
      .map((r) => (r.marks / r.total) * 100);
    const successRate = successValues.length
      ? Math.round(successValues.reduce((sum, value) => sum + value, 0) / successValues.length)
      : null;

    res.json({
      stats: {
        students: students.length,
        teachers: teachers.length,
        courses: subjects.size,
        successRate,
        totalUsers: users.length,
        complaintsPending: complaints.filter((row) => row[5] === 'pending').length,
        ratings: ratings.length,
        serverUptimeSeconds: Math.round(process.uptime())
      },
      student: {
        attendancePercent,
        pendingHomework: classHomework.length,
        averageResult,
        rank: rankIndex >= 0 ? rankIndex + 1 : null
      },
      teacher: {
        students: classScope ? students.filter((u) => u.class === classScope).length : students.length,
        notesShared: userId ? notes.filter((row) => row[1] === userId).length : 0,
        classes: classScope ? 1 : new Set(students.map((u) => u.class).filter(Boolean)).size
      },
      principal: {
        students: students.length,
        teachers: teachers.length,
        pendingComplaints: complaints.filter((row) => row[5] === 'pending').length,
        attendanceMarkedToday: attendance.filter((row) => row[0] === new Date().toISOString().slice(0, 10)).length
      },
      events: events.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 5),
      announcements: announcements.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const { role, className } = req.query;
    let users = await getUsers();
    if (role) users = users.filter((u) => u.role === role);
    if (className) users = users.filter((u) => u.class === className);
    res.json(users.map(({ detail, ...user }) => user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rows = await getSheetData('Users');
    const index = rowsWithoutHeader(rows).findIndex((row) => row[6] === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    const row = [...rows[index + 1]];
    const detail = parseJson(row[5], {});
    detail.status = status === 'banned' ? 'banned' : 'active';
    row[5] = JSON.stringify(detail);
    await updateSheetData('Users', id, row);
    res.json({ success: true, status: detail.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { date, className, markedBy, records } = req.body;
    if (!date || !className || !Array.isArray(records)) {
      return res.status(400).json({ error: 'date, className and records are required' });
    }
    await Promise.all(records.map((record) => appendSheetData('Attendance', [
      date,
      className,
      record.studentId,
      record.studentName,
      record.status === 'absent' ? 'absent' : 'present',
      markedBy,
      makeId('ATT')
    ])));
    res.status(201).json({ success: true, count: records.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { studentId, className } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Attendance'));
    if (studentId) rows = rows.filter((row) => row[2] === studentId);
    if (className) rows = rows.filter((row) => row[1] === className);
    res.json(rows.map((row) => ({
      date: row[0],
      className: row[1],
      studentId: row[2],
      studentName: row[3],
      status: row[4],
      markedBy: row[5],
      id: row[6]
    })).reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadResult = async (req, res) => {
  try {
    const { className, studentId, studentName, subject, marks, total, exam, uploadedBy } = req.body;
    if (!className || !studentId || !subject || marks === undefined || total === undefined || !exam) {
      return res.status(400).json({ error: 'Missing result fields' });
    }
    await appendSheetData('Results', [
      new Date().toISOString(),
      className,
      studentId,
      studentName,
      subject,
      marks,
      total,
      exam,
      uploadedBy,
      makeId('RES')
    ]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const { studentId, className } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Results'));
    if (studentId) rows = rows.filter((row) => row[2] === studentId);
    if (className) rows = rows.filter((row) => row[1] === className);
    res.json(rows.map((row) => ({
      date: row[0],
      className: row[1],
      studentId: row[2],
      studentName: row[3],
      subject: row[4],
      marks: Number(row[5]),
      total: Number(row[6]),
      exam: row[7],
      uploadedBy: row[8],
      id: row[9]
    })).reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, time, venue, description, createdBy } = req.body;
    const id = makeId('EVT');
    await appendSheetData('Events', [id, title, date, time, venue, description, createdBy, new Date().toISOString()]);
    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const rows = rowsWithoutHeader(await getSheetData('Events'));
    res.json(rows.map((row) => ({
      id: row[0],
      title: row[1],
      date: row[2],
      time: row[3],
      venue: row[4],
      description: row[5],
      createdBy: row[6],
      createdAt: row[7]
    })).sort((a, b) => String(a.date).localeCompare(String(b.date))));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, createdBy } = req.body;
    const id = makeId('ANN');
    await appendSheetData('Announcements', [id, title, message, audience || 'All', createdBy, new Date().toISOString()]);
    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Announcements'));
    if (audience) rows = rows.filter((row) => row[3] === 'All' || row[3] === audience);
    res.json(rows.map((row) => ({
      id: row[0],
      title: row[1],
      message: row[2],
      audience: row[3],
      createdBy: row[4],
      createdAt: row[5]
    })).reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  listUsers,
  updateUserStatus,
  markAttendance,
  getAttendance,
  uploadResult,
  getResults,
  createEvent,
  getEvents,
  createAnnouncement,
  getAnnouncements
};
