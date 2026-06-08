const { getSheetData, appendSheetData, updateSheetData, deleteSheetData } = require('../utils/googleSheets');

const rowsWithoutHeader = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  
  // If first row has "Name" or "Email" or doesn't have an "@" in index 1, assume it's a header
  const firstRow = rows[0];
  const isHeader = String(firstRow[0]).toLowerCase().includes('name') || 
                   String(firstRow[1]).toLowerCase().includes('email') || 
                   !String(firstRow[1] || '').includes('@');
  
  return isHeader ? rows.slice(1) : rows;
};

const makeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const parseJson = (value, fallback = {}) => {
  try {
    if (!value) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
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
    firstName: row[12] || '',
    lastName: row[13] || '',
    section: row[14] || 'A',
    motherName: row[15] || '',
    fatherName: row[16] || '',
    status: detail.status || 'active'
  };
};

const getUsers = async () => {
  const rawRows = await getSheetData('Users');
  console.log(`[DEBUG] Raw Users rows from sheet: ${rawRows.length}`);
  const rows = rowsWithoutHeader(rawRows);
  console.log(`[DEBUG] Users rows after header removal: ${rows.length}`);
  return rows.map(toUser);
};

const getDashboard = async (req, res) => {
  try {
    const { role, userId, className } = req.query;
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

    const students = users.filter((u) => String(u.role).toLowerCase().trim() === 'student');
    const teachers = users.filter((u) => String(u.role).toLowerCase().trim() === 'teacher');
    const admins = users.filter((u) => String(u.role).toLowerCase().trim() === 'admin');
    const principals = users.filter((u) => String(u.role).toLowerCase().trim() === 'principal');

    console.log(`[DEBUG] Dashboard Stats - Students: ${students.length}, Teachers: ${teachers.length}, Admins: ${admins.length}`);

    // Class-wise statistics
    const classStats = {};
    students.forEach(s => {
      const cls = String(s.class || 'N/A').trim();
      if (!classStats[cls]) classStats[cls] = 0;
      classStats[cls]++;
    });

    const resultRows = rowsWithoutHeader(results).map((r) => ({
      className: r[0],
      studentId: r[1],
      studentName: r[2],
      subject: r[3],
      marks: parseInt(r[4]) || 0,
      total: parseInt(r[5]) || 100,
      exam: r[6]
    }));

    // Role-specific data logic
    let roleData = {};
    if (role === 'student') {
      const myAttendance = rowsWithoutHeader(attendance).filter(r => r[2] === userId);
      const presentDays = myAttendance.filter(r => r[4] === 'present').length;
      const attendancePercent = myAttendance.length ? Math.round((presentDays / myAttendance.length) * 100) : 0;
      
      const myResults = resultRows.filter(r => r.studentId === userId);
      const myAverage = myResults.length ? Math.round(myResults.reduce((sum, r) => sum + (r.marks/r.total)*100, 0) / myResults.length) : 0;

      const classHomework = rowsWithoutHeader(notes).filter(r => String(r[5]) === String(className) && (r[8] === 'homework' || !r[8]));

      roleData = {
        student: {
          attendancePercent,
          averageResult: myAverage,
          pendingHomework: classHomework.length,
          rank: 0 // Will calculate if needed
        }
      };
    } else if (role === 'teacher') {
      const myNotes = rowsWithoutHeader(notes).filter(r => String(r[4]).trim() === String(userId).trim() || String(r[1]).trim() === String(userId).trim()); 
      
      // Teacher might handle multiple classes or one
      const teacherClass = String(className || '').trim();
      const myStudents = students.filter(s => String(s.class).trim() === teacherClass && teacherClass !== 'N/A');

      roleData = {
        teacher: {
          classes: teacherClass !== 'N/A' ? 1 : 0,
          students: myStudents.length,
          notesShared: myNotes.length
        }
      };
    }

    res.json({
      stats: {
        totalUsers: users.length,
        students: students.length,
        teachers: teachers.length,
        admins: admins.length,
        principals: principals.length,
        classWiseStudents: classStats,
        activeEvents: rowsWithoutHeader(events).length,
        totalComplaints: rowsWithoutHeader(complaints).length,
        totalRatings: rowsWithoutHeader(ratings).length
      },
      ...roleData,
      announcements: rowsWithoutHeader(announcements).slice(-5).reverse().map(r => ({ id: r[0], title: r[1], message: r[2], date: r[5] })),
      events: rowsWithoutHeader(events).slice(-5).reverse().map(r => ({ id: r[0], title: r[1], date: r[2], venue: r[4], time: r[3] }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const { role, className } = req.query;
    console.log('--- ATTEMPTING TO LIST USERS ---');
    console.log(`Query Params -> Role: ${role}, Class: ${className}`);
    
    let users = await getUsers();
    console.log(`Total users in DB: ${users.length}`);

    // Log first few users for debugging
    if (users.length > 0) {
      console.log('Sample User [0]:', JSON.stringify(users[0]));
    }

    if (role) {
      users = users.filter((u) => {
        const match = String(u.role).toLowerCase() === String(role).toLowerCase();
        if (!match) console.log(`Role Mismatch: User ${u.name} has role ${u.role}, looking for ${role}`);
        return match;
      });
    }
    
    if (className) {
      users = users.filter((u) => {
        const uClass = String(u.class || '').trim().toLowerCase();
        const targetClass = String(className).trim().toLowerCase();
        const match = uClass === targetClass || uClass === 'all' || targetClass === 'n/a';
        if (!match) console.log(`Class Mismatch: User ${u.name} is in class ${uClass}, looking for ${targetClass}`);
        return match;
      });
    }
    
    console.log(`Final count after filtering: ${users.length}`);
    console.log('--- END LIST USERS ---');
    res.json(users.map(({ detail, ...user }) => user));
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rows = await getSheetData('Users');
    const rowIndex = rows.findIndex((r) => r[6] === id);
    if (rowIndex === -1) return res.status(404).json({ error: 'User not found' });

    const userRow = [...rows[rowIndex]];
    const detail = parseJson(userRow[5], {});
    detail.status = status;
    userRow[5] = JSON.stringify(detail);

    await updateSheetData('Users', id, userRow);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { date, className, markedBy, records } = req.body;
    for (const record of records) {
      const id = `${date}_${record.studentId}`;
      await appendSheetData('Attendance', [date, className, record.studentId, record.studentName, record.status, markedBy, id]);
    }
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { className, studentId } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Attendance'));
    if (className) rows = rows.filter((row) => row[1] === className);
    if (studentId) rows = rows.filter((row) => row[2] === studentId);
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
    const id = `RES_${Date.now()}_${studentId}`;
    await appendSheetData('Results', [className, studentId, studentName, subject, marks, total, exam, uploadedBy, id, new Date().toISOString()]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const { className, studentId } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Results'));
    if (className) rows = rows.filter((row) => row[0] === className);
    if (studentId) rows = rows.filter((row) => row[1] === studentId);
    res.json(rows.map((row) => ({
      className: row[0],
      studentId: row[1],
      studentName: row[2],
      subject: row[3],
      marks: row[4],
      total: row[5],
      exam: row[6],
      id: row[8]
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
    
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_event', { id, title, date, time, venue, description, createdAt: new Date().toISOString() });
    }

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
    
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_announcement', { id, title, message, audience, createdAt: new Date().toISOString() });
    }

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    let rows = rowsWithoutHeader(await getSheetData('Announcements'));
    if (audience) rows = rows.filter((row) => String(row[3]) === 'All' || String(row[3]) === String(audience));
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

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSheetData('Announcements', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPortalStats = async (req, res) => {
  try {
    const users = await getUsers();
    const studentsCount = users.filter(u => u.role === 'student').length;
    const teachersCount = users.filter(u => u.role === 'teacher').length;

    res.json({
      students: studentsCount,
      teachers: teachersCount,
      courses: 15, // Real estimate for a school
      successRate: 98
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitExcuse = async (req, res) => {
  try {
    const { studentId, studentName, studentClass, teacherId, teacherName, type, reason, date } = req.body;
    const id = makeId('EXC');
    const status = 'pending';
    const createdAt = new Date().toISOString();

    await appendSheetData('Excuses', [id, studentId, studentName, studentClass, teacherId || 'All', teacherName || 'Principal', type, reason, status, date, createdAt]);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_application', { id, studentName, type });
      io.emit('notification', { 
        userId: teacherId || 'All',
        title: 'New Application', 
        message: `${studentName} submitted a ${type} request.`,
        link: teacherId ? '/teacher/applications' : '/principal/applications'
      });
    }

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listExcuses = async (req, res) => {
  try {
    const { studentId, teacherId } = req.query;
    const rows = rowsWithoutHeader(await getSheetData('Excuses'));
    let filtered = rows.map(r => ({
      id: r[0], studentId: r[1], studentName: r[2], studentClass: r[3],
      teacherId: r[4], teacherName: r[5], type: r[6], reason: r[7],
      status: r[8], date: r[9], createdAt: r[10]
    }));
    if (studentId) filtered = filtered.filter(x => x.studentId === studentId);
    if (teacherId) filtered = filtered.filter(x => x.teacherId === teacherId || x.teacherId === 'All');
    res.json(filtered.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExcuseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rows = await getSheetData('Excuses');
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) return res.status(404).json({ error: 'Not found' });

    const updatedRow = [...rows[rowIndex]];
    updatedRow[8] = status;
    await updateSheetData('Excuses', id, updatedRow);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', {
        userId: updatedRow[1],
        title: 'Application Update',
        message: `Your ${updatedRow[6]} request was ${status}.`,
        link: '/student/applications'
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.query;
    const rows = rowsWithoutHeader(await getSheetData('Notifications'));
    const filtered = rows.map(r => ({
      id: r[0], userId: r[1], title: r[2], message: r[3], link: r[4], role: r[5], status: r[6], createdAt: r[7]
    })).filter(n => (n.userId === 'All' || n.userId === userId) && (n.role === 'All' || n.role === role));
    res.json(filtered.reverse().slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSheetData('Events', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard, listUsers, updateUserStatus, markAttendance, getAttendance, uploadResult, getResults,
  createEvent, getEvents, deleteEvent, createAnnouncement, getAnnouncements, deleteAnnouncement, getPortalStats,
  submitExcuse, listExcuses, updateExcuseStatus, getNotifications
};
