// ============================================================
//  STUDY CONTENT CONTROLLER
//  Read  -> public (ye school website ka public hissa hai)
//  Write -> sirf principal + admin
// ============================================================

const {
  CLASSES,
  isValidClass,
  listClasses,
  getClassOutline,
  getSubjectNotes,
  getSubjectQuestions,
  getClassBundle
} = require('../utils/studyContent');

const { appendSheetData, updateSheetData, deleteSheetData, getSheetData } = require('../utils/googleSheets');
const { stripHeader, toText } = require('../utils/rows');
const { HttpError } = require('../middleware/auth');
const { text, oneOf } = require('../middleware/validate');

const SHEET = 'StudyContent';

// Sheet columns: ID | Class | Subject | Title | Points(;) | Details(;;) | UpdatedAt | UpdatedBy
const COL = { id: 0, classNo: 1, subject: 2, title: 3, points: 4, details: 5, updatedAt: 6, updatedBy: 7 };

const newId = () => `SC_${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;

// Points ';' se alag hote hain, Details ';;' se — isliye do alag splitter chahiye.
// Pehle dono ';' se split ho rahe the, jisse ek detail me '; ' aane par
// note ke points tukde tukde ho jaate the.
const splitPoints = (value) =>
  toText(value)
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

const splitDetails = (value) => {
  const raw = toText(value).trim();
  if (!raw) return [];
  const parts = raw.includes(';;')
    ? raw.split(';;')
    : // Purane single ';' wale rows bhi padh lena chahiye
      raw.split(';');
  return parts.map((item) => item.trim()).filter(Boolean);
};

const shapeRow = (row) => ({
  id: toText(row[COL.id]),
  classNo: toText(row[COL.classNo]),
  subject: toText(row[COL.subject]),
  title: toText(row[COL.title]),
  points: splitPoints(row[COL.points]),
  details: splitDetails(row[COL.details]),
  updatedAt: toText(row[COL.updatedAt]),
  updatedBy: toText(row[COL.updatedBy])
});

const isUsable = (row) => row.id && row.classNo && row.subject && row.title;

// Public notes har page-load par padhe jaate hain, isliye sheet read ko
// short TTL ke saath cache karte hain — Apps Script quota bachta hai aur
// flaky cold-start se user ko dikhta nahi. Write ke baad cache turant drop.
const OVERRIDE_TTL_MS = Number(process.env.STUDY_OVERRIDE_TTL_MS || 120000);
let overrideCache = null;
let overrideCachedAt = 0;

const invalidateOverrides = () => {
  overrideCache = null;
  overrideCachedAt = 0;
};

const fetchOverrides = async () => {
  try {
    const rows = stripHeader(await getSheetData(SHEET));
    return rows.map(shapeRow).filter(isUsable);
  } catch {
    // Sheet missing ya Apps Script busy — content abhi base content hi rahega
    return overrideCache || [];
  }
};

/** Principal/admin ke notes read karo (sheet na ho to koi edit nahi). */
const readOverrides = async () => {
  const fresh = overrideCache && Date.now() - overrideCachedAt < OVERRIDE_TTL_MS;
  if (fresh) return overrideCache;
  const rows = await fetchOverrides();
  overrideCache = rows;
  overrideCachedAt = Date.now();
  return rows;
};

/** Base content + overrides merge. Principal ka likha hua point/notes upar aata hai. */
const mergeNotes = (baseNotes, overrides) => {
  const byTitle = new Map();
  baseNotes.forEach((note, index) => {
    byTitle.set(note.title, { ...note, baseIndex: index, edited: false });
  });
  overrides.forEach((row) => {
    const existing = byTitle.get(row.title);
    if (existing) {
      existing.points = row.points.length ? row.points.map((p) => `• ${p}`) : existing.points;
      existing.details = row.details.length ? row.details : existing.details;
      existing.edited = true;
      existing.updatedAt = row.updatedAt;
    } else {
      byTitle.set(row.title, {
        title: row.title,
        colors: { title: '#0ea5e9', points: '#94a3b8' },
        points: row.points.map((p) => `• ${p}`),
        details: row.details,
        edited: true,
        updatedAt: row.updatedAt
      });
    }
  });
  return Array.from(byTitle.values());
};

// ---------------- Public reads ----------------

const getClasses = (req, res) => {
  res.json({ classes: listClasses() });
};

const requireClass = (value) => {
  if (!isValidClass(value)) {
    throw new HttpError(400, `Class must be one of: ${CLASSES.join(', ')}`);
  }
  return Number(value);
};

const getOutline = (req, res) => {
  const classNo = requireClass(req.query.class);
  res.json(getClassOutline(classNo));
};

const getBundle = (req, res) => {
  const classNo = requireClass(req.query.class);
  res.json(getClassBundle(classNo));
};

const getNotes = async (req, res) => {
  const classNo = requireClass(req.query.class);
  const subject = text(req.query.subject, 'Subject', { max: 40 }).toLowerCase();
  const result = getSubjectNotes(classNo, subject);
  if (!result) throw new HttpError(404, 'That subject is not part of this class');

  const overrides = (await readOverrides()).filter(
    (row) => Number(row.classNo) === classNo && row.subject === subject
  );
  res.json({ ...result, notes: mergeNotes(result.notes, overrides) });
};

const getQuestions = (req, res) => {
  const classNo = requireClass(req.query.class);
  const subject = text(req.query.subject, 'Subject', { max: 40 }).toLowerCase();
  const result = getSubjectQuestions(classNo, subject);
  if (!result) throw new HttpError(404, 'That subject is not part of this class');
  res.json(result);
};

// ---------------- Principal / admin writes ----------------

const assertManager = (user) => {
  if (!user || !['principal', 'admin'].includes(user.role)) {
    throw new HttpError(403, 'Only the principal or an administrator can change study content');
  }
};

const saveNote = async (req, res) => {
  assertManager(req.user);
  const classNo = requireClass(req.body.class);
  const subject = oneOf(req.body.subject, Object.keys(getClassOutline(classNo).subjects), 'Subject');
  const title = text(req.body.title, 'Chapter or note title', { max: 200 });
  const points = Array.isArray(req.body.points) ? req.body.points.map((p) => text(p, 'Point', { max: 500 })) : [];
  const details = Array.isArray(req.body.details) ? req.body.details.map((d) => text(d, 'Detail', { max: 2000 })) : [];
  if (!points.length && !details.length) {
    throw new HttpError(400, 'Add at least one point or one detail for this chapter');
  }
  if (points.length > 40) throw new HttpError(400, 'A chapter can have at most 40 points');

  const existing = (await readOverrides()).find(
    (row) => Number(row.classNo) === classNo && row.subject === subject && row.title === title
  );

  const values = [
    existing?.id || newId(),
    String(classNo),
    subject,
    title,
    points.join('; '),
    details.join(' ;; '),
    new Date().toISOString(),
    toText(req.user.name) || req.user.id
  ];

  if (existing) await updateSheetData(SHEET, existing.id, values);
  else await appendSheetData(SHEET, values);

  invalidateOverrides();
  res.status(existing ? 200 : 201).json({ ok: true, updated: !!existing, id: values[0] });
};

const removeNote = async (req, res) => {
  assertManager(req.user);
  const id = text(req.params.id, 'Note id', { max: 60 });
  const existing = (await readOverrides()).find((row) => row.id === id);
  if (!existing) throw new HttpError(404, 'That note is not in the school content list');
  await deleteSheetData(SHEET, id);
  invalidateOverrides();
  res.json({ ok: true, deleted: true });
};

/** Principal/admin ko dikhne ke liye ki content me kya badla gaya hai. */
const listOverrides = async (req, res) => {
  assertManager(req.user);
  const classFilter = req.query.class ? requireClass(req.query.class) : null;
  const rows = await readOverrides();
  res.json({
    overrides: classFilter ? rows.filter((row) => Number(row.classNo) === classFilter) : rows
  });
};

module.exports = {
  getClasses,
  getOutline,
  getBundle,
  getNotes,
  getQuestions,
  saveNote,
  removeNote,
  listOverrides
};
