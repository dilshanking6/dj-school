/**
 * Final verification: admin login chalta hai ya nahi, aur baaki sheets
 * ke baad kya bacha hai.
 *
 *   node scripts/verifyReset.js
 */
process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '4';
process.env.SHEET_CACHE_TTL_MS = '0';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { getSheetData } = require('../utils/googleSheets');
const { toUser } = require('../controllers/authController');

const read = async (sheet) => {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const rows = await getSheetData(sheet);
    if (rows.length) return rows;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  return [];
};

(async () => {
  console.log('--- USERS ---');
  const users = await read('Users');
  const adminRow = users.find((r) => String(r[1] || '').toLowerCase() === 'dilshan@gmail.com');
  if (!adminRow) {
    console.log('  admin NOT FOUND');
  } else {
    const u = toUser(adminRow);
    console.log(`  name     : ${u.name}`);
    console.log(`  email    : ${u.email}`);
    console.log(`  role     : ${u.role}`);
    console.log(`  status   : ${u.status}`);
    if (process.env.ADMIN_PASSWORD) {
      const ok = await bcrypt.compare(process.env.ADMIN_PASSWORD, adminRow[2]);
      console.log(`  password : ${ok ? 'MATCHES' : 'DOES NOT MATCH'}`);
    } else {
      console.log('  password : (ADMIN_PASSWORD set nahi hai — check skip)');
    }
  }
  console.log(`  total user rows: ${users.length - 1}`);

  console.log('\n--- REMAINING DATA ---');
  for (const sheet of ['Attendance', 'ChatRooms', 'RoomMembers', 'Announcements', 'Events', 'Notes', 'Results', 'Complaints', 'Ratings', 'Messages']) {
    const rows = await read(sheet);
    const isHeader = rows.length === 1 && String(rows[0][0] ?? '').toLowerCase() === 'date';
    const data = isHeader ? 0 : rows.length;
    console.log(`  ${sheet.padEnd(14)} rows=${String(rows.length).padEnd(3)} data=${data}`);
    if (data && data < 6) rows.forEach((r) => console.log(`      ${JSON.stringify(r).slice(0, 120)}`));
  }
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
