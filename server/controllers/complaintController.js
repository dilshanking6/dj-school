const { appendSheetData, getSheetData, updateSheetData } = require('../utils/googleSheets');

const submitComplaint = async (req, res) => {
  try {
    const { studentId, studentName, subject, description } = req.body;
    const date = new Date().toISOString();
    const id = 'COMP' + Date.now();
    const status = 'pending'; // pending, accepted, rejected, resolved
    
    await appendSheetData('Complaints', [date, studentId, studentName, subject, description, status, id]);
    res.status(201).json({ success: true, message: 'Complaint submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentComplaints = async (req, res) => {
  try {
    const { studentId } = req.params;
    const rows = await getSheetData('Complaints') || [];
    const complaints = rows.slice(1)
      .filter(row => row[1] === studentId)
      .map(row => ({
        date: row[0],
        subject: row[3],
        description: row[4],
        status: row[5],
        id: row[6]
      }))
      .reverse();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const rows = await getSheetData('Complaints') || [];
    const complaints = rows.slice(1).map(row => ({
      date: row[0],
      studentId: row[1],
      studentName: row[2],
      subject: row[3],
      description: row[4],
      status: row[5],
      id: row[6]
    })).reverse();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rows = await getSheetData('Complaints') || [];
    const rowIndex = rows.slice(1).findIndex(row => row[6] === id);

    if (rowIndex === -1) return res.status(404).json({ error: 'Complaint not found' });

    const updatedRow = [...rows[rowIndex + 1]];
    updatedRow[5] = status;

    await updateSheetData('Complaints', id, updatedRow);
    res.json({ success: true, message: `Complaint ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitComplaint, getStudentComplaints, getAllComplaints, updateComplaintStatus };
