const { appendSheetData, getSheetData, deleteSheetData } = require('../utils/googleSheets');

const shareNote = async (req, res) => {
  try {
    const { teacherId, teacherName, title, subject, className, fileUrl, type, description, fileName, fileData } = req.body;
    const date = new Date().toISOString();
    const id = 'NOTE' + Date.now();
    
    console.log(`Sharing Note: ${title} for Class: ${className}`);

    const payload = [
      date,
      teacherId,
      teacherName,
      title,
      subject,
      className,
      fileUrl || '',
      id,
      type || 'note',
      description || '',
      fileName || '',
      fileData || ''
    ];

    const success = await appendSheetData('Notes', payload);
    
    if (success) {
      console.log(`Note ${id} successfully appended to Google Sheets`);
      const io = req.app.get('socketio');
      if (io) {
        io.emit('new_note', {
          id, teacherName, title, subject, className, type, date,
          description: description || '',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          fileData: fileData || ''
        });
      }
      return res.status(201).json({ success: true, message: 'Note shared successfully' });
    } else {
      throw new Error('Failed to append data to Google Sheets');
    }
  } catch (error) {
    console.error('shareNote Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const allRows = await getSheetData('Notes') || [];
    if (allRows.length <= 1) return res.json([]);

    const notes = allRows.slice(1).map(row => ({
      date: row[0],
      teacherId: row[1],
      teacherName: row[2],
      title: row[3],
      subject: row[4],
      className: row[5],
      fileUrl: row[6],
      id: row[7],
      type: row[8] || 'note',
      description: row[9] || '',
      fileName: row[10] || '',
      fileData: row[11] || ''
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNotesByClass = async (req, res) => {
  try {
    const { className } = req.params;
    console.log(`Fetching notes for class: ${className}`);
    
    const allRows = await getSheetData('Notes') || [];
    if (allRows.length <= 1) return res.json([]);

    const notes = allRows.slice(1)
      .filter(row => {
        const rowClass = String(row[5] || '').trim().toLowerCase();
        const targetClass = String(className || '').trim().toLowerCase();
        return rowClass === 'all' || rowClass === targetClass || targetClass === 'n/a';
      })
      .map(row => ({
        date: row[0],
        teacherId: row[1],
        teacherName: row[2],
        title: row[3],
        subject: row[4],
        className: row[5],
        fileUrl: row[6],
        id: row[7],
        type: row[8] || 'note',
        description: row[9] || '',
        fileName: row[10] || '',
        fileData: row[11] || ''
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(notes);
  } catch (error) {
    console.error('getNotesByClass error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSheetData('Notes', id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { shareNote, getNotesByClass, deleteNote, getAllNotes };
