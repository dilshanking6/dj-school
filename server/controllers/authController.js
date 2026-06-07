const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSheetData, appendSheetData, updateSheetData } = require('../utils/googleSheets');

const parseJson = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role, phone, otp } = req.body;
    
    const rows = await getSheetData('Users') || [];
    const usersRows = rows.slice(1);

    let userRow;
    if (phone) {
      // Phone Login (Assuming OTP 123456 is correct for this demo)
      userRow = usersRows.find(row => String(row[8]) === String(phone)); 
      if (!userRow) return res.status(401).json({ error: 'Phone number not registered' });
      if (otp !== '123456') return res.status(401).json({ error: 'Invalid OTP. Try 123456' });
    } else {
      userRow = usersRows.find(row => row[1] === email);
      if (!userRow) return res.status(401).json({ error: 'User not found' });
      
      // For Admin from Sheets, we check bcrypt password like others
      if (!(await bcrypt.compare(password, userRow[2]))) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    if (role && userRow[3].toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ error: `Unauthorized. This portal is only for ${role}s.` });
    }

    const detail = parseJson(userRow[5], {});
    if (detail.status === 'banned') {
      return res.status(403).json({ error: 'This account has been banned by admin.' });
    }

    const user = {
      id: userRow[6],
      name: userRow[0],
      email: userRow[1],
      role: userRow[3],
      class: userRow[4],
      avatar: userRow[7] || null,
      phone: userRow[8],
      status: detail.status || 'active'
    };

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, 
      className, rollNumber, subject, 
      isClassTeacher, classesHandled, degree, experience 
    } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    
    const detail = JSON.stringify({ isClassTeacher, classesHandled, rollNumber });
    
    await appendSheetData('Users', [
      name, email, hashedPassword, role, className || 'N/A', 
      detail, id, '', phone, subject || 'N/A', degree || 'N/A', experience || '0'
    ]);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const rows = await getSheetData('Users') || [];
    const rowIndex = rows.slice(1).findIndex(row => row[6] === userId);

    if (rowIndex === -1) return res.status(404).json({ error: 'User not found' });

    const userRow = rows[rowIndex + 1];
    if (!(await bcrypt.compare(oldPassword, userRow[2]))) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    userRow[2] = await bcrypt.hash(newPassword, 10);
    await updateSheetData('Users', userId, userRow);
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfileSettings = async (req, res) => {
  try {
    const { userId, email, phone, avatarUrl } = req.body;
    const rows = await getSheetData('Users') || [];
    const rowIndex = rows.slice(1).findIndex(row => row[6] === userId);

    if (rowIndex === -1) return res.status(404).json({ error: 'User not found' });

    const userRow = [...rows[rowIndex + 1]];
    if (email) userRow[1] = email;
    if (phone) userRow[8] = phone;
    if (avatarUrl) userRow[7] = avatarUrl;

    await updateSheetData('Users', userId, userRow);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listTeachers = async (req, res) => {
  try {
    const rows = await getSheetData('Users') || [];
    const teachers = rows.slice(1)
      .filter(row => row[3] === 'teacher')
      .map(row => ({
        id: row[6],
        name: row[0],
        subject: row[9] || 'General',
        degree: row[10]
      }));
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setupAdmin = async (req, res) => {
  try {
    const adminEmail = 'admin@dj.com';
    const adminPass = 'dj_admin_master_99';
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    const id = 'ADMIN_001';
    
    await appendSheetData('Users', [
      'Super Admin', adminEmail, hashedPassword, 'admin', 'N/A', 
      '{}', id, '', '0000000000', 'Management', 'Master', '10'
    ]);
    
    res.json({ message: 'Admin account created in Google Sheets!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, register, changePassword, updateProfileSettings, listTeachers, setupAdmin };
