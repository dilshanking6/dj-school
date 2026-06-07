const { appendSheetData, getSheetData } = require('../utils/googleSheets');

const saveMessage = async (req, res) => {
  try {
    const { room, roomId, user, userId, content, role, type, fileName, fileData } = req.body;
    const time = new Date().toISOString();
    const id = 'MSG' + Date.now();
    
    await appendSheetData('Messages', [
      time,
      user,
      roomId || room,
      content,
      role,
      id,
      userId || '',
      type || 'text',
      fileName || '',
      fileData || ''
    ]);
    res.status(201).json({ success: true, id, time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const rows = await getSheetData('Messages') || [];
    const messages = rows.slice(1)
      .filter(row => row[2] === room)
      .map(row => ({
        time: row[0],
        user: row[1],
        roomId: row[2],
        content: row[3],
        role: row[4],
        id: row[5],
        userId: row[6],
        type: row[7] || 'text',
        fileName: row[8] || '',
        fileData: row[9] || ''
      }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { saveMessage, getRoomMessages };
