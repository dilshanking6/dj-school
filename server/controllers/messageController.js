const { appendSheetData, getSheetData } = require('../utils/googleSheets');

const saveMessage = async (req, res) => {
  try {
    const { room, roomId, user, userId, content, message, senderName, senderId, senderRole, role, type, fileName, fileData } = req.body;
    const time = new Date().toISOString();
    const id = 'MSG' + Date.now();
    
    // Normalize fields
    const targetRoomId = roomId || room;
    const sender = senderName || user;
    const sid = senderId || userId;
    const srole = senderRole || role || 'student';
    const msgContent = content || message;

    console.log(`[DEBUG] Saving message: ${msgContent} in room ${targetRoomId}`);

    await appendSheetData('Messages', [
      time,
      sender,
      targetRoomId,
      msgContent,
      srole,
      id,
      sid || '',
      type || 'text',
      fileName || '',
      fileData || ''
    ]);
    res.status(201).json({ success: true, id, time });
  } catch (error) {
    console.error('[DEBUG] Save message error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    console.log(`[DEBUG] Fetching messages for room: ${room}`);
    const rows = await getSheetData('Messages') || [];
    const messages = rows.slice(1)
      .filter(row => String(row[2]).trim() === String(room).trim())
      .map(row => ({
        time: row[0],
        user: row[1],
        senderName: row[1],
        roomId: row[2],
        content: row[3],
        message: row[3],
        role: row[4],
        senderRole: row[4],
        id: row[5],
        userId: row[6],
        senderId: row[6],
        type: row[7] || 'text',
        fileName: row[8] || '',
        fileData: row[9] || ''
      }));
    console.log(`[DEBUG] Found ${messages.length} messages for room ${room}`);
    res.json(messages);
  } catch (error) {
    console.error('[DEBUG] Fetch messages error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSheetData('Messages', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { saveMessage, getRoomMessages, deleteMessage };
