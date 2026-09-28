const { appendSheetData, getSheetData, deleteSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { stripHeader } = require('../utils/rows');
const { assertRoomAccess, loadUser } = require('../utils/rooms');

const MAX_MESSAGE_LENGTH = 2000;

const saveMessage = asyncRoute(async (req, res) => {
  const roomId = v.text(req.body.roomId, 'Room', { max: 60 });
  const content = v.text(req.body.content ?? req.body.message, 'Message', { max: MAX_MESSAGE_LENGTH });

  const { profile } = await assertRoomAccess(roomId, req.user);
  const senderName = profile?.name || '';

  const time = new Date().toISOString();
  const id = `MSG${Date.now()}${Math.floor(Math.random() * 1000)}`;

  await appendSheetData('Messages', [
    time,
    req.user.id,
    roomId,
    content,
    req.user.role,
    id,
    req.user.id,
    'text',
    senderName,
    ''
  ]);

  const payload = {
    time,
    id,
    roomId,
    message: content,
    content,
    senderId: req.user.id,
    senderName,
    senderRole: req.user.role,
    type: 'text'
  };

  const io = req.app.get('socketio');
  if (io) io.to(roomId).emit('receive_message', payload);

  res.status(201).json({ success: true, message: payload });
});

const getRoomMessages = asyncRoute(async (req, res) => {
  const roomId = String(req.params.room);
  await assertRoomAccess(roomId, req.user);

  const rows = stripHeader(await getSheetData('Messages'));
  const senderIds = [...new Set(rows.filter((row) => String(row[2] || '').trim() === roomId).map((row) => row[6] || row[1]))];
  const profiles = new Map();
  await Promise.all(
    senderIds.filter(Boolean).map(async (id) => {
      const user = await loadUser(id);
      if (user) profiles.set(String(id), user.name);
    })
  );

  const messages = rows
    .filter((row) => String(row[2] || '').trim() === roomId)
    .map((row) => ({
      time: row[0],
      id: row[5],
      roomId: row[2],
      message: row[3],
      content: row[3],
      senderId: row[6] || row[1],
      senderName: row[8] || profiles.get(String(row[6] || row[1])) || '',
      senderRole: row[4],
      type: row[7] || 'text'
    }))
    .filter((m) => Boolean(m.id))
    .slice(-200);

  res.json(messages);
});

const deleteMessage = asyncRoute(async (req, res) => {
  const rows = stripHeader(await getSheetData('Messages'));
  const row = rows.find((r) => String(r[5] || '').trim() === String(req.params.id));

  if (!row) throw new HttpError(404, 'Message not found');

  const roomId = String(row[2] || '').trim();
  // Room access bhi verify karna zaroori hai, warna koi bhi member
  // kisi aur room ka message delete kar sakta tha.
  await assertRoomAccess(roomId, req.user);

  const senderId = String(row[6] || row[1] || '').trim();
  if (senderId !== req.user.id && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  await deleteSheetData('Messages', req.params.id);

  const io = req.app.get('socketio');
  if (io && roomId) io.to(roomId).emit('message_deleted', { id: req.params.id });

  res.json({ success: true });
});

module.exports = { saveMessage, getRoomMessages, deleteMessage };
