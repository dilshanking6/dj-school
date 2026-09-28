#!/usr/bin/env node
// ============================================================
//  STALE TEST DATA CLEANUP
//  ----------------------------------------------------------
//  Purane test students/teachers (junk emails, pehle ke tests)
//  ko Users + unse judi sheets se hata deta hai.
//  Rakhne wale: original admin@dj.com + saari demo accounts
//  (student10/student12/teacher/principal/admin @example.com).
// ============================================================

process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_WRITE_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '2';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getSheetData, deleteSheetData } = require('../utils/googleSheets');
const { stripHeader } = require('../utils/rows');

const STALE_STUDENT_IDS = new Set([
  '1780733116126', // dilshan@gmail.com    (class 10)
  '1780820316448', // chand@gmail.com      (class 9)
  '1780983741576', // prince@gmail.com     (class 10)
  '1786928620634', // khansimran2351@gmail.com (class 10)
  '1790225010839', // goyf...@gmail.com    (class 9)
  '1790225207240' //  goyf...@gmail.com    (class 10)
]);

const STALE_TEACHER_IDS = new Set([
  '1780675763566', // dev@gmail.com
  '1780989007891' //  rakesh@gmail.com
]);

const STALE_ALL = new Set([...STALE_STUDENT_IDS, ...STALE_TEACHER_IDS]);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const main = async () => {
  // 1) Users
  const users = stripHeader(await getSheetData('Users'));
  const toDeleteUsers = users.filter((r) => STALE_ALL.has(String(r[6] || '').trim()));
  for (const row of toDeleteUsers) {
    await deleteSheetData('Users', String(row[6]).trim());
  }
  console.log(`[Users] deleted ${toDeleteUsers.length}`);

  // 2) Attendance — stale students ki entries
  const attendance = stripHeader(await getSheetData('Attendance'));
  const delAttendance = attendance.filter((r) => STALE_STUDENT_IDS.has(String(r[2] || '').trim()));
  for (const row of delAttendance) await deleteSheetData('Attendance', String(row[6]).trim());
  console.log(`[Attendance] deleted ${delAttendance.length}`);

  // 3) Results — stale students ke results
  const results = stripHeader(await getSheetData('Results'));
  const delResults = results.filter((r) => STALE_STUDENT_IDS.has(String(r[1] || '').trim()));
  for (const row of delResults) await deleteSheetData('Results', String(row[8]).trim());
  console.log(`[Results] deleted ${delResults.length}`);

  // 4) Ratings — stale students ki ratings
  const ratings = stripHeader(await getSheetData('Ratings'));
  const delRatings = ratings.filter((r) => STALE_STUDENT_IDS.has(String(r[1] || '').trim()));
  for (const row of delRatings) await deleteSheetData('Ratings', String(row[6]).trim());
  console.log(`[Ratings] deleted ${delRatings.length}`);

  // 5) Complaints — stale students ke complaints
  const complaints = stripHeader(await getSheetData('Complaints'));
  const delComplaints = complaints.filter((r) => STALE_STUDENT_IDS.has(String(r[1] || '').trim()));
  for (const row of delComplaints) await deleteSheetData('Complaints', String(row[6]).trim());
  console.log(`[Complaints] deleted ${delComplaints.length}`);

  // 6) Notes — stale teachers ki shared notes
  const notes = stripHeader(await getSheetData('Notes'));
  const delNotes = notes.filter((r) => STALE_TEACHER_IDS.has(String(r[1] || '').trim()));
  for (const row of delNotes) await deleteSheetData('Notes', String(row[7]).trim());
  console.log(`[Notes] deleted ${delNotes.length}`);

  console.log(
    `\nBaki Users: ${users.length - toDeleteUsers.length} (sirf demo accounts + original admin)`
  );
};

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});