const toText = (value) => (value === undefined || value === null ? '' : String(value).trim());

/**
 * Google Sheets se aata hua raw data hamesha header row ke saath aata hai.
 * Isliye har sheet ke liye pehli row ko hata dete hain.
 * Ye helper email-column heuristic par depend NAHI karta, isliye
 * Attendance / Results / Notes jaise sheets ka pehla data row safe rehta hai.
 */
const stripHeader = (rows) => (Array.isArray(rows) ? rows.slice(1) : []);

/**
 * 'Users' sheet ke liye defensive helper. Purane sheet format mein header
 * row na ho to bhi kaam karta hai, kyunki Users sheet ka column 1 email hota hai.
 */
const userRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const firstRow = rows[0];
  const firstName = toText(firstRow[0]).toLowerCase();
  const second = toText(firstRow[1]).toLowerCase();
  const looksLikeHeader =
    second.includes('email') ||
    firstName === 'name' ||
    firstName === 'full name' ||
    firstName === 'id' ||
    (!second.includes('@') && second !== '');
  return looksLikeHeader ? rows.slice(1) : rows;
};

/** Header-aware read: sheet ka naam se decide karta hai. */
const readRows = (sheetName, rows) => (sheetName === 'Users' ? userRows(rows) : stripHeader(rows));

const parseIntSafe = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Google Sheets dates ko Date object ke roop me return karta hai aur
 * writing par 'YYYY-MM-DD' string IST midnight ke hisaab se UTC ban jata hai.
 * School ka 'din' hamesha India (Asia/Kolkata) me tab hota hai — isliye
 * har date cell ko yahan wapas 'YYYY-MM-DD' me normalize karte hain.
 */
const djDate = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

module.exports = { stripHeader, userRows, readRows, toText, parseIntSafe, toNumber, djDate };
