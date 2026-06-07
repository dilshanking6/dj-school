const { appendSheetData, getSheetData, deleteSheetData } = require('../utils/googleSheets');

const shareNote = async (req, res) => {
  try {
    const { teacherId, teacherName, title, subject, className, fileUrl, type, description, fileName, fileData } = req.body;
    const date = new Date().toISOString();
    const id = 'NOTE' + Date.now();
    
    await appendSheetData('Notes', [
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
    ]);
    res.status(201).json({ success: true, message: 'Note shared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNotesByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const rows = await getSheetData('Notes') || [];
    const notes = rows.slice(1)
      .filter(row => row[5] === className || row[5] === 'All')
      .map(row => ({
        date: row[0],
        teacherName: row[2],
        title: row[3],
        subject: row[4],
        fileUrl: row[6],
        id: row[7],
        type: row[8] || 'note',
        description: row[9] || '',
        fileName: row[10] || '',
        fileData: row[11] || ''
      }))
      .reverse();
    res.json(notes);
  } catch (error) {
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

module.exports = { shareNote, getNotesByClass, deleteNote };
