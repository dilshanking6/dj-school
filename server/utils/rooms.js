const { getSheetData } = require('./googleSheets');
const { HttpError } = require('../middleware/auth');
const { stripHeader, userRows } = require('./rows');
const { toUser } = require('../controllers/authController');

const STAFF = ['teacher', 'principal', 'admin'];

/** RoomMembers sheet: [roomId, userId, name, role, joinedAt] */
const loadMembers = async () => stripHeader(await getSheetData('RoomMembers'));

/** ChatRooms sheet: [id, name, type, className, membersAll, createdBy, createdByName, createdAt] */
const loadRooms = async () => stripHeader(await getSheetData('ChatRooms'));

const isMember = (members, roomId, userId) =>
  members.some(
    (m) => String(m[0] || '').trim() === String(roomId) && String(m[1] || '').trim() === String(userId)
  );

const findRoom = (rooms, roomId) => {
  const target = String(roomId).trim();
  return (Array.isArray(rooms) ? rooms : []).find((r) => String(r[0] || '').trim() === target) || null;
};

const loadAllUsers = async () => {
  const rows = userRows(await getSheetData('Users'));
  return rows.map(toUser);
};

const loadUser = async (userId) => {
  const users = await loadAllUsers();
  return users.find((u) => String(u.id).trim() === String(userId).trim()) || null;
};

/**
 * Messages/joins ke liye access check.
 * Private rooms ke liye strict membership, public class rooms ke liye
 * role + class match, staff ke liye school-wide access.
 */
const assertRoomAccess = async (roomId, user) => {
  const [rooms, members, profile] = await Promise.all([
    loadRooms(),
    loadMembers(),
    loadUser(user.id)
  ]);

  const room = findRoom(rooms, roomId);
  if (!room) throw new HttpError(404, 'Channel not found');

  const type = String(room[2] || 'public').trim();
  if (isMember(members, roomId, user.id)) return { room, members, profile };

  if (type === 'private') {
    throw new HttpError(403, 'You are not a participant in this conversation');
  }

  if (STAFF.includes(user.role)) return { room, members, profile };

  const roomClass = String(room[3] || 'All').trim();
  const ownClass = String(profile?.class || 'N/A').trim();

  if (user.role === 'student' && roomClass !== 'All' && roomClass !== ownClass) {
    throw new HttpError(403, 'This channel belongs to another class');
  }

  return { room, members, profile };
};

module.exports = { STAFF, loadMembers, loadRooms, isMember, findRoom, loadAllUsers, loadUser, assertRoomAccess };
