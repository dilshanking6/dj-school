/**
 * FULL fresh start — sab kuch mita do, kuch bhi bacha nahi.
 *
 * `freshReset.js` sirf demo/fake accounts hatata tha aur admin ko bachata tha.
 * Ye script nahi: ye har sheet ki har data row delete karta hai, Users tab me
 * maujuda koi bhi account (admin samet) chala jata hai. Iske baad sirf
 * `createAdmin.js` se naya Super Admin bana rahe hain.
 *
 * Header row har sheet me bachaya rehta hai — delete sirf data row par hota hai.
 *
 *   node scripts/fullReset.js
 */
process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '2';
process.env.SHEET_WRITE_TIMEOUT = '90000';
process.env.SHEET_CACHE_TTL_MS = '0';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getSheetData, deleteSheetData } = require('../utils/googleSheets');
const { userRows } = require('../utils/rows');

// sheetName -> ID column (0-based), sirf fallback ke liye. Agar sheet me
// header row hai to ID ka asli index header se khud padha jaata hai —
// hardcode me Notes/Messages jaise columns galat the.
const SHEETS = {
  Users: 6,
  Attendance: 6,
  Complaints: 6,
  Ratings: 6,
  Results: 8,
  Messages: 5,
  Notes: 8,
  ChatRooms: 0,
  RoomMembers: 0,
  Events: 0,
  Announcements: 0
};

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Header me 'ID' likha jahan bhi hai, wahi asli ID column hai. Jo sheets
 * header ke bina shuru hoti hain (Attendance, ChatRooms, Announcements)
 * unke liye config wala index use hota hai.
 */
const resolveIdColumn = (rows, fallback) => {
  for (const row of rows.slice(0, 3)) {
    const index = row.findIndex(
      (cell) => String(cell ?? '').trim().toLowerCase() === 'id'
    );
    if (index !== -1) return index;
  }
  return fallback;
};

const dataRowIds = (rows, idCol) =>
  rows
    .filter((row) => row !== rows[0] || !isHeaderRow(row, idCol))
    .map((row) => String(row[idCol] ?? '').trim())
    .filter((id) => id && id.toLowerCase() !== 'id');

const isHeaderRow = (row, idCol) => {
  const cell = String(row[idCol] ?? '').trim().toLowerCase();
  return cell === '' || cell === 'id';
};

(async () => {
  const summary = {};

  for (const [sheet, fallbackCol] of Object.entries(SHEETS)) {
    const rows = await getSheetData(sheet);
    const idCol = resolveIdColumn(rows, fallbackCol);
    const ids = [...new Set(dataRowIds(rows, idCol))];

    if (DRY_RUN) {
      summary[sheet] = { rawRows: rows.length, idCol, wouldDelete: ids.length, ids };
      continue;
    }

    let ok = 0;
    for (const id of ids) {
      try {
        await deleteSheetData(sheet, id);
        ok += 1;
      } catch (e) {
        console.log(`  delete FAIL ${sheet} ${id}: ${e.message}`);
      }
    }
    summary[sheet] = { rawRows: rows.length, deleted: ok };
  }

  console.log(DRY_RUN ? '[DRY RUN] would delete:' : 'Deleted:');
  console.log(JSON.stringify(summary, null, 1));
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
