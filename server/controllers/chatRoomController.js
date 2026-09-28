const { appendSheetData, deleteSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { STAFF, loadMembers, loadRooms, isMember, findRoom, loadUser, loadAllUsers, assertRoomAccess } = require('../utils/rooms');

const ROOM_TYPES = ['public', 'private'];

const makeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const getSelfProfile = (userId) => loadUser(userId);

const toRoom = (row, members, userId) => {
  const roomId = String(row[0] || '').trim();
  const roomMembers = members.filter((m) => String(m[0] || '').trim() === roomId);
  return {
    id: roomId,
    name: row[1] || '',
    type: String(row[2] || 'public').trim(),
    className: row[3] || 'All',
    createdBy: String(row[5] || '').trim(),
    createdByName: row[6] || '',
    createdAt: row[7] || '',
    members: roomMembers.length,
    joined: isMember(members, roomId, userId)
  };
};

const listRooms = asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const [roomRows, members, profile] = await Promise.all([
    loadRooms(),
    loadMembers(),
    getSelfProfile(userId)
  ]);

  const role = profile?.role || req.user.role;
  const className = profile?.class || 'N/A';

  const rooms = (Array.isArray(roomRows) ? roomRows : [])
    .filter((row) => {
      const roomId = String(row[0] || '').trim();
      if (!roomId) return false;

      if (String(row[2] || '').trim() === 'private') {
        return isMember(members, roomId, userId);
      }

      const roomClass = String(row[3] || 'All').trim();
      if (role === 'student' && roomClass !== 'All' && roomClass !== className) return false;

      return true;
    })
    .map((row) => toRoom(row, members, userId))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  res.json(rooms);
});

const createRoom = asyncRoute(async (req, res) => {
  const type = v.oneOf(req.body.type || 'public', ROOM_TYPES, 'Room type');
  const creator = await getSelfProfile(req.user.id);
  const creatorName = creator?.name || '';

  if (type === 'public' && !STAFF.includes(req.user.role)) {
    throw new HttpError(403, 'Only staff can create group channels');
  }

  if (type === 'private') {
    const targetUserId = v.text(req.body.targetUserId, 'Recipient', { max: 40 });
    if (targetUserId === req.user.id) throw new HttpError(400, 'You cannot start a chat with yourself');

    const [roomRows, members] = await Promise.all([loadRooms(), loadMembers()]);

    const existing = (Array.isArray(roomRows) ? roomRows : [])
      .filter((r) => String(r[2] || '').trim() === 'private')
      .find((room) => {
        const roomId = String(room[0] || '').trim();
        return (
          isMember(members, roomId, req.user.id) &&
          isMember(members, roomId, targetUserId) &&
          members.filter((m) => String(m[0] || '').trim() === roomId).length <= 2
        );
      });

    const target = await getSelfProfile(targetUserId);
    if (!target) throw new HttpError(404, 'That person is not registered on this portal');
    if (target.status === 'banned') throw new HttpError(404, 'That person is not available on this portal');

    if (existing) {
      return res.json({ success: true, room: toRoom(existing, members, req.user.id) });
    }

    const id = makeId('ROOM');
    const createdAt = new Date().toISOString();
    // Naam server par resolve hota hai, client se naam trust nahi karte.
    const label = [creatorName, target.name].filter(Boolean).join(' & ');

    await appendSheetData('ChatRooms', [id, label, 'private', 'All', 'All', req.user.id, target.name, createdAt]);
    await appendSheetData('RoomMembers', [id, req.user.id, creatorName, req.user.role, createdAt]);
    await appendSheetData('RoomMembers', [id, targetUserId, target.name, target.role, createdAt]);

    const freshMembers = await loadMembers();
    return res.status(201).json({ success: true, room: toRoom([id, label, 'private', 'All', 'All', req.user.id, '', createdAt], freshMembers, req.user.id) });
  }

  const name = v.text(req.body.name, 'Channel name', { max: 80 });
  let roomClass = v.oneOf(req.body.className || 'All', ['All', '9', '10', '11', '12'], 'Class');

  // Teacher sirf apni class ka channel bana sakta hai.
  if (req.user.role === 'teacher') {
    const own = String(creator?.class || 'N/A');
    if (own === 'N/A') throw new HttpError(403, 'Your account is not assigned to a class yet');
    roomClass = own;
  }

  const roomRows = await loadRooms();
  const duplicate = (Array.isArray(roomRows) ? roomRows : [])
    .some((r) => String(r[1] || '').trim().toLowerCase() === name.toLowerCase() && String(r[2] || '').trim() === 'public');

  if (duplicate) throw new HttpError(409, 'A channel with this name already exists');

  const id = makeId('ROOM');
  const createdAt = new Date().toISOString();

  await appendSheetData('ChatRooms', [id, name, 'public', roomClass, 'All', req.user.id, creatorName, createdAt]);
  await appendSheetData('RoomMembers', [id, req.user.id, creatorName, req.user.role, createdAt]);

  const updated = await loadMembers();
  return res.status(201).json({ success: true, room: toRoom([id, name, 'public', roomClass, 'All', req.user.id, '', createdAt], updated, req.user.id) });
});

const joinRoom = asyncRoute(async (req, res) => {
  const roomId = String(req.params.id);
  const [members, profile] = await Promise.all([loadMembers(), getSelfProfile(req.user.id)]);

  // Private membership + public class restriction, ek hi jagah.
  await assertRoomAccess(roomId, req.user);

  if (isMember(members, roomId, req.user.id)) {
    return res.json({ success: true });
  }

  await appendSheetData('RoomMembers', [roomId, req.user.id, profile?.name || '', req.user.role, new Date().toISOString()]);

  res.json({ success: true });
});

const listMembers = asyncRoute(async (req, res) => {
  const roomId = String(req.params.id);
  const [, members] = await Promise.all([assertRoomAccess(roomId, req.user), loadMembers()]);

  res.json(
    members
      .filter((m) => String(m[0] || '').trim() === roomId)
      .map((m) => ({ userId: m[1], name: m[2] || '', role: m[3] || 'member', joinedAt: m[4] || '' }))
  );
});

const deleteRoom = asyncRoute(async (req, res) => {
  const roomId = String(req.params.id);
  const [roomRows, members] = await Promise.all([loadRooms(), loadMembers()]);

  const room = findRoom(roomRows, roomId);
  if (!room) throw new HttpError(404, 'Channel not found');

  const createdBy = String(room[5] || '').trim();
  if (createdBy !== req.user.id && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to this resource');
  }

  const memberRows = members.filter((m) => String(m[0] || '').trim() === roomId);
  await Promise.all([
    deleteSheetData('ChatRooms', roomId),
    ...memberRows.map((m) => deleteSheetData('RoomMembers', `${roomId}:${m[1]}`))
  ]);

  const io = req.app.get('socketio');
  if (io) io.to(roomId).emit('room_deleted', { id: roomId });

  res.json({ success: true });
});

/**
 * Chat ke liye safe directory: sirf display fields, koi email/phone/avatar nahi.
 * Banned accounts hide rehte hain.
 */
const listDirectory = asyncRoute(async (req, res) => {
  const term = String(req.query.q || '').trim().toLowerCase();
  const users = await loadAllUsers();

  const directory = users
    .filter((u) => u.status !== 'banned' && String(u.id) !== String(req.user.id))
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      class: u.class && u.class !== 'N/A' ? u.class : '',
      subject: u.subject || ''
    }))
    .filter((u) => {
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.role.includes(term) ||
        String(u.class).toLowerCase().includes(term) ||
        u.subject.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 200);

  res.json(directory);
});

module.exports = { listRooms, createRoom, joinRoom, listMembers, deleteRoom, listDirectory };
