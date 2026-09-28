const { appendSheetData, getSheetData, deleteSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { stripHeader } = require('../utils/rows');
const { findUserById } = require('./authController');

const CLASSES = ['All', '9', '10', '11', '12'];
const TYPES = ['note', 'homework', 'assignment'];

const toNote = (row) => ({
  date: row[0],
  teacherId: row[1],
  title: row[3],
  subject: row[4],
  className: row[5],
  fileUrl: row[6] || '',
  id: row[7],
  type: row[8] || 'note',
  description: row[9] || '',
  teacherName: row[2] || '',
  fileName: row[10] || ''
});

const shareNote = asyncRoute(async (req, res) => {
  const title = v.text(req.body.title, 'Title', { max: 140 });
  const subject = v.text(req.body.subject, 'Subject', { max: 60 });
  const type = v.oneOf(req.body.type || 'note', TYPES, 'Material type');
  const description = v.optionalText(req.body.description, 'Description', { max: 1000 });

  const fileName = v.optionalText(req.body.fileName, 'File name', { max: 120 });
  const inlineFile = v.optionalDataUrl(req.body.fileData, 'Attached file', 14000);
  const link = v.optionalUrl(req.body.fileUrl, 'File link');

  if (!link && !inlineFile) {
    throw new HttpError(400, 'Attach a file or add a document link');
  }

  const fileUrl = inlineFile || link;

  let className = v.oneOf(req.body.className || 'All', CLASSES, 'Class');
  if (req.user.role === 'teacher' && req.user.class !== 'N/A') className = req.user.class;

  const date = new Date().toISOString();
  const id = `NOTE${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const author = await findUserById(req.user.id);
  const authorName = author?.user?.name || '';

  await appendSheetData('Notes', [
    date, req.user.id, authorName, title, subject,
    className, fileUrl, id, type, description, fileName, ''
  ]);

  const note = {
    date, teacherId: req.user.id, teacherName: authorName, title, subject,
    className, type, description, fileUrl, fileName, id
  };
  const io = req.app.get('socketio');
  if (io) {
    if (className === 'All') {
      io.emit('new_note', note);
    } else {
      // Class-specific material: usi class ke students + staff ko bhejo.
      io.to(`class:${className}`).emit('new_note', note);
      io.to('role:teacher').emit('new_note', note);
      io.to('role:principal').emit('new_note', note);
      io.to('role:admin').emit('new_note', note);
    }
  }

  res.status(201).json({ success: true, message: 'Material shared', note });
});

const getAllNotes = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Notes'));
  res.json(rows.map(toNote).sort((a, b) => new Date(b.date) - new Date(a.date)));
});

const getNotesByClass = asyncRoute(async (req, res) => {
  const className = String(req.params.className);

  if (req.user.role === 'student' && className !== 'All' && className !== (req.user.class || 'N/A')) {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  const rows = stripHeader(await getSheetData('Notes'));
  const target = className.toLowerCase();

  const notes = rows
    .filter((row) => {
      const rowClass = String(row[5] || '').trim().toLowerCase();
      return rowClass === 'all' || target === 'all' || rowClass === target;
    })
    .map(toNote)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(notes);
});

const deleteNote = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Notes'));
  const note = rows.find((row) => row[7] === req.params.id);
  if (!note) throw new HttpError(404, 'Material not found');

  const ownerId = String(note[1] || '').trim();
  if (ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  await deleteSheetData('Notes', req.params.id);

  const io = req.app.get('socketio');
  if (io) io.emit('note_deleted', { id: req.params.id });

  res.json({ success: true, message: 'Material deleted' });
});

module.exports = { shareNote, getNotesByClass, deleteNote, getAllNotes };
