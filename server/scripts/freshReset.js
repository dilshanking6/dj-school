/**
 * Fresh start: demo/test data pura hata do — sirf asli admin account
 * (admin@dj.com) Users sheet me rehta hai. Content sheets khaali.
 * Idhar koi fake name, fake student/teacher/principal, fake attendance,
 * complaints, ratings, results, events, announcements, notes, chats nahi.
 */
process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '2';
process.env.SHEET_WRITE_TIMEOUT = '90000';
process.env.SHEET_CACHE_TTL_MS = '0';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getSheetData, deleteSheetData } = require('../utils/googleSheets');

// sheetName -> id column (0-based)
const SHEETS = {
  Users: 6,
  Attendance: 6,
  Complaints: 6,
  Ratings: 6,
  Results: 8,
  Messages: 6,
  Notes: 7,
  ChatRooms: 0,
  RoomMembers: 0,
  Events: 0,
  Announcements: 0
};

const isFakeUser = (row) => {
  const email = String(row[1] || '').trim().toLowerCase();
  if (!email) return true; // bina email wale rows bhi demo/test hain
  if (email === 'admin@dj.com') return false;
  return email.includes('@example.com') || email.includes('@dj.edu');
};

(async () => {
  const summary = {};
  for (const [sheet, idCol] of Object.entries(SHEETS)) {
    const rows = await getSheetData(sheet);
    let toDelete = [];
    if (sheet === 'Users') {
      toDelete = rows.filter(isFakeUser);
    } else {
      toDelete = rows;
    }
    const ids = toDelete.map((r) => String(r[idCol] || '').trim()).filter(Boolean);
    let ok = 0;
    for (const id of [...new Set(ids)]) {
      try {
        await deleteSheetData(sheet, id);
        ok += 1;
      } catch (e) {
        console.log(`  delete FAIL ${sheet} ${id}: ${e.message}`);
      }
    }
    summary[sheet] = { rows: rows.length, deleted: ok };
  }
  console.log(JSON.stringify(summary, null, 1));
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });