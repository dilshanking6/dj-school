const { appendSheetData, getSheetData, updateSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { stripHeader } = require('../utils/rows');
const { findUserById } = require('./authController');

const STATUSES = ['pending', 'accepted', 'rejected', 'resolved'];

const toComplaint = (row) => ({
  date: row[0],
  studentId: row[1],
  studentName: row[2],
  subject: row[3],
  description: row[4],
  status: row[5],
  id: row[6]
});

const loadComplaints = async () => stripHeader(await getSheetData('Complaints'));

const submitComplaint = asyncRoute(async (req, res) => {
  const subject = v.text(req.body.subject, 'Subject', { max: 140 });
  const description = v.text(req.body.description, 'Description', { max: 3000 });

  const existing = await loadComplaints();
  const openCount = existing.filter(
    (row) => String(row[1] || '').trim() === req.user.id && String(row[5] || '').toLowerCase() === 'pending'
  ).length;

  if (openCount >= 5) {
    throw new HttpError(429, 'You already have 5 complaints awaiting a response. Please wait for those first.');
  }

  const date = new Date().toISOString();
  const id = `COMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const found = await findUserById(req.user.id);
  const name = found?.user?.name || 'Student';

  await appendSheetData('Complaints', [date, req.user.id, name, subject, description, 'pending', id]);

  const io = req.app.get('socketio');
  if (io) {
    const payload = { date, studentId: req.user.id, studentName: name, subject, description, status: 'pending', id };
    io.to('role:principal').emit('new_complaint', payload);
    io.to('role:admin').emit('new_complaint', payload);
  }

  res.status(201).json({ success: true, message: 'Complaint submitted', id });
});

const getStudentComplaints = asyncRoute(async (req, res) => {
  const studentId = String(req.params.studentId);
  if (req.user.role === 'student' && studentId !== req.user.id) {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  const rows = await loadComplaints();
  const complaints = rows
    .filter((row) => String(row[1] || '').trim() === studentId)
    .map(toComplaint)
    .reverse();

  res.json(complaints);
});

const getAllComplaints = asyncRoute(async (req, res) => {
  const rows = await loadComplaints();
  const complaints = rows.map(toComplaint).reverse();
  res.json(complaints);
});

const updateComplaintStatus = asyncRoute(async (req, res) => {
  const status = v.oneOf(req.body.status, STATUSES, 'Status');
  const all = await loadComplaints();

  const row = all.find((item) => String(item[6] || '').trim() === String(req.params.id));
  if (!row) throw new HttpError(404, 'Complaint not found');

  const updatedRow = [...row];
  updatedRow[5] = status;

  await updateSheetData('Complaints', req.params.id, updatedRow);

  const io = req.app.get('socketio');
  if (io) {
    const ownerRoom = `user:${updatedRow[1]}`;
    io.to(ownerRoom).emit('complaint_status_updated', { id: req.params.id, status });
    io.to(ownerRoom).emit('notification', {
      title: 'Complaint update',
      message: `Your complaint "${updatedRow[3]}" was marked ${status}.`
    });
  }

  res.json({ success: true, status });
});

module.exports = { submitComplaint, getStudentComplaints, getAllComplaints, updateComplaintStatus };
