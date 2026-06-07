const { getSheetData, appendSheetData } = require('../utils/googleSheets');

const rowsWithoutHeader = (rows) => (Array.isArray(rows) ? rows.slice(1) : []);
const makeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const toRoom = (row, memberCount = 0, joined = false) => ({
  id: row[0],
  name: row[1],
  type: row[2],
  className: row[3],
  rank: row[4],
  createdBy: row[5],
  createdByName: row[6],
  createdAt: row[7],
  members: memberCount,
  joined
});

const listRooms = async (req, res) => {
  try {
    const { userId, className, role } = req.query;
    const [roomRows, memberRows] = await Promise.all([
      getSheetData('ChatRooms'),
      getSheetData('RoomMembers')
    ]);
    const members = rowsWithoutHeader(memberRows);
    const rooms = rowsWithoutHeader(roomRows)
      .filter((row) => {
        if (!row[0]) return false;
        
        // Private rooms should only be visible to their members
        if (row[2] === 'private') {
          const roomMembers = members.filter((m) => m[0] === row[0]);
          return roomMembers.some((m) => m[1] === userId);
        }

        // Public rooms restricted by class
        if (row[3] && row[3] !== 'All' && className && row[3] !== className && role === 'student') return false;
        
        return true;
      })
      .map((row) => {
        const roomMembers = members.filter((member) => member[0] === row[0]);
        const joined = userId ? roomMembers.some((member) => member[1] === userId) : false;
        return toRoom(row, roomMembers.length, joined);
      });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, type, className, rank, createdBy, createdByName, role, targetUserId, targetUserName } = req.body;
    if (!name || !createdBy) return res.status(400).json({ error: 'Room name and creator are required' });
    
    // If private, check if it already exists
    if (type === 'private' && targetUserId) {
      const [roomRows, memberRows] = await Promise.all([
        getSheetData('ChatRooms'),
        getSheetData('RoomMembers')
      ]);
      const members = rowsWithoutHeader(memberRows);
      const rooms = rowsWithoutHeader(roomRows).filter(r => r[2] === 'private');
      
      for (const room of rooms) {
        const roomMembers = members.filter(m => m[0] === room[0]);
        const hasMe = roomMembers.some(m => m[1] === createdBy);
        const hasThem = roomMembers.some(m => m[1] === targetUserId);
        if (hasMe && hasThem) {
          return res.json({ success: true, room: toRoom(room, 2, true) });
        }
      }
    }

    const id = makeId('ROOM');
    await appendSheetData('ChatRooms', [
      id,
      name,
      type || 'public',
      className || 'All',
      rank || 'All',
      createdBy,
      createdByName || '',
      new Date().toISOString()
    ]);
    
    // Add creator
    await appendSheetData('RoomMembers', [id, createdBy, createdByName || '', role || 'admin', new Date().toISOString()]);
    
    // Add target user if private
    if (type === 'private' && targetUserId) {
      await appendSheetData('RoomMembers', [id, targetUserId, targetUserName || '', 'member', new Date().toISOString()]);
    }

    res.status(201).json({ success: true, room: { id, name, type: type || 'public', className: className || 'All', members: targetUserId ? 2 : 1, joined: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, role } = req.body;
    const rows = rowsWithoutHeader(await getSheetData('RoomMembers'));
    const exists = rows.some((row) => row[0] === id && row[1] === userId);
    if (!exists) {
      await appendSheetData('RoomMembers', [id, userId, userName || '', role || 'member', new Date().toISOString()]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = rowsWithoutHeader(await getSheetData('RoomMembers'));
    res.json(rows.filter((row) => row[0] === id).map((row) => ({
      roomId: row[0],
      userId: row[1],
      userName: row[2],
      role: row[3],
      joinedAt: row[4]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listRooms, createRoom, joinRoom, listMembers };
