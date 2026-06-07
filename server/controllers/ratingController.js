const { appendSheetData, getSheetData, updateSheetData } = require('../utils/googleSheets');

const submitRating = async (req, res) => {
  try {
    const { studentId, teacherId, teacherName, rating, comment } = req.body;
    const id = 'RAT' + Date.now();
    const date = new Date().toISOString();
    
    // Check if student already rated this teacher
    const rows = await getSheetData('Ratings') || [];
    const existing = rows.slice(1).find(row => row[1] === studentId && row[2] === teacherId);
    
    if (existing) {
      return res.status(400).json({ error: 'You have already rated this teacher' });
    }

    await appendSheetData('Ratings', [date, studentId, teacherId, teacherName, rating, comment, id]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopTeachers = async (req, res) => {
  try {
    const rows = await getSheetData('Ratings') || [];
    const ratings = rows.slice(1);
    
    // Group by teacher and calculate average
    const stats = {};
    ratings.forEach(row => {
      const tId = row[2];
      const tName = row[3];
      const score = parseFloat(row[4]);
      
      if (!stats[tId]) stats[tId] = { name: tName, total: 0, count: 0 };
      stats[tId].total += score;
      stats[tId].count += 1;
    });

    const top = Object.values(stats)
      .map(t => ({ ...t, avg: (t.total / t.count).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg);

    res.json(top);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitRating, getTopTeachers };
