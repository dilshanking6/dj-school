/**
 * Super Admin account banao. Ye script koi bhi account tab bana sakti hai —
 * isliye ise sirf school office chalata hai, kabhi public endpoint nahi.
 *
 *   node scripts/createAdmin.js
 *
 * Password yahan se aata hai, ya env se: ADMIN_PASSWORD
 */
process.env.SHEET_READ_TIMEOUT = '90000';
process.env.SHEET_READ_ATTEMPTS = '2';
process.env.SHEET_WRITE_TIMEOUT = '90000';
process.env.SHEET_CACHE_TTL_MS = '0';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { appendSheetData, getSheetData } = require('../utils/googleSheets');
const { userRows } = require('../utils/rows');
const v = require('../middleware/validate');

const EMAIL = process.env.ADMIN_EMAIL || 'dilshan@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) {
  console.error('STOP: ADMIN_PASSWORD env me set karo. Password code me kabhi likha nahi jata.');
  process.exit(1);
}
const NAME = process.env.ADMIN_NAME || 'Super Admin';
const ID = process.env.ADMIN_ID || 'ADMIN_001';

(async () => {
  // Yehi validation registration par lagti hai — admin ka password bhi
  // kamzor nahi ho sakta, warna poora portal weak password par khula rahega.
  const email = v.email(EMAIL);
  const password = v.password(PASSWORD);
  console.log(`Admin email: ${email} (validated)`);

  const existing = userRows(await getSheetData('Users'));
  const clash = existing.find((r) => String(r[1] || '').trim().toLowerCase() === email);
  if (clash) {
    console.error(`STOP: ${email} already exists (id ${r6(clash)}). Delete it first or pick another email.`);
    process.exit(1);
  }

  await appendSheetData('Users', [
    NAME,
    email,
    await bcrypt.hash(password, 12),
    'admin',
    'N/A',
    JSON.stringify({ status: 'active' }),
    ID,
    '',            // avatar
    '',            // phone
    'Management',  // subject
    'Master',      // degree
    '10',          // experience
    'Super',       // firstName
    'Admin',       // lastName
    'A'            // section
  ]);

  console.log(`\nSuper Admin created.`);
  console.log(`  email    : ${email}`);
  console.log(`  login at : /admin-login (ADMIN_PASSWORD jo aapne env me diya tha wahi chalta hai)`);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

function r6(row) { return String(row[6] || '').trim(); }
