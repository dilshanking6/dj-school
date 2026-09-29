/**
 * READ-ONLY inventory. Kuch delete nahi karta — sirf batata hai ki
 * fresh reset chalate to har sheet me kitni rows jayengi.
 */
process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '2';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getSheetData } = require('../utils/googleSheets');

const SHEETS = [
  'Users', 'Attendance', 'Complaints', 'Ratings', 'Results',
  'Messages', 'Notes', 'ChatRooms', 'RoomMembers', 'Events', 'Announcements'
];

const isRealLooking = (row) => {
  const email = String(row[1] || '').trim().toLowerCase();
  if (!email) return false;
  return !email.includes('@example.com') && !email.includes('@dj.edu');
};

(async () => {
  for (const sheet of SHEETS) {
    let rows = [];
    try {
      rows = await getSheetData(sheet);
    } catch (e) {
      console.log(`${sheet}: READ FAIL -> ${e.message}`);
      continue;
    }
    console.log(`\n=== ${sheet} (${rows.length} rows) ===`);
    if (sheet === 'Users') {
      const real = rows.filter(isRealLooking);
      console.log(`  users: ${rows.length} total | test/demo: ${rows.length - real.length} | real: ${real.length}`);
      for (const r of rows) {
        const email = String(r[1] || '').trim();
        const role = String(r[3] || '').toLowerCase();
        let status = '';
        try { status = (JSON.parse(r[5] || '{}').status) || 'active'; } catch { status = '?'; }
        console.log(
          `   - ${String(r[0] || '').padEnd(22)} | ${role.padEnd(9)} | ${(email || '(no email)').padEnd(34)} | ${status}`
        );
      }
    } else {
      for (const r of rows.slice(0, 25)) {
        console.log(`   - ${JSON.stringify(r).slice(0, 140)}`);
      }
      if (rows.length > 25) console.log(`   ... +${rows.length - 25} more`);
    }
  }
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
