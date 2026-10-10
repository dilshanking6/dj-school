const { appendSheetData, getSheetData, updateSheetData, deleteSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { stripHeader } = require('../utils/rows');
const { findUserById } = require('./authController');

/**
 * Principal/Admin form banate hain, students bharte hain, wapas principal ke
 * paas aata hai.
 *
 * Do sheets:
 *   Forms           - form ka definition (title, text, fields)
 *   FormSubmissions - har student ka bhara hua ek row
 *
 * Sirf principal/admin form ka text aur fields badal sakte hain. Student ke
 * paas sirf read + fill karne ka access hai.
 */

const FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'select', 'file'];
const FORM_STATUSES = ['draft', 'open', 'closed'];
const SUBMISSION_STATUSES = ['submitted', 'reviewing', 'accepted', 'returned'];
const CLASSES = ['All', '9', '10', '11', '12'];
const MAX_FIELDS = 40;

const STAFF_ROLES = ['principal', 'admin'];
const isStaff = (user) => STAFF_ROLES.includes(user.role);

const safeJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
};

/**
 * Principal ka likha HTML students ko dikhta hai. Sirf principal/admin likh
 * sakte hain, phir bhi `<script>` aur `on*=` handlers hata dete hain — taaki
 * galti se koi clipboard se script paste kar ke stored XSS na chhod jaaye.
 * React `dangerouslySetInnerHTML` se render hota hai, isliye ye line zaroori hai.
 */
const sanitizeHtml = (input) =>
  String(input || '')
    // Pehle poora <script>...</script> block hatao — including unclosed tag
    // ka case: agar `</script>` hi nahi likha, to uske baad ka text bhi hata
    // dete hain, warna `alert(1)` jaisa content HTML me reh jaata.
    .replace(/<\s*(script|iframe|object|embed|form)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi, '')
    // Ab bacha hua ekla opening/closing tag (jaise `<script src=...>`) bhi.
    .replace(/<\s*\/?\s*(script|iframe|object|embed|form)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .slice(0, 20000);

/**
 * Form ka field definition. Principal ka "canvas" yahi hai — har field ka
 * key, label, type, required aur options yahan se aate hain.
 */
const normaliseFields = (value) => {
  const list = v.array(value, 'Fields', { min: 1, max: MAX_FIELDS });
  const seen = new Set();

  return list.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new HttpError(400, `Field ${index + 1} is not valid`);
    }

    const label = v.text(raw.label, `Field ${index + 1} label`, { max: 160 });
    const type = v.oneOf(raw.type, FIELD_TYPES, `Field ${index + 1} type`);
    const key = v.text(raw.key || `f${index + 1}`, `Field ${index + 1} key`, { max: 40 })
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    if (!key) throw new HttpError(400, `Field ${index + 1} key is not valid`);
    if (seen.has(key)) throw new HttpError(400, `Duplicate field key "${key}" — each field needs its own key`);
    seen.add(key);

    const required = Boolean(raw.required);

    let options = [];
    if (type === 'select') {
      options = v.array(raw.options, `${label} options`, { min: 1, max: 60 }).map((option, i) =>
        v.text(option, `${label} option ${i + 1}`, { max: 120 })
      );
    }

    return { key, label, type, required, options };
  });
};

const toForm = (row) => ({
  id: row[0],
  title: row[1],
  content: row[2],
  fields: safeJson(row[3], []),
  audience: row[4] || 'All',
  status: row[5] || 'draft',
  createdBy: row[6],
  createdByName: row[7],
  createdAt: row[8],
  updatedAt: row[9]
});

const toSubmission = (row) => ({
  id: row[0],
  formId: row[1],
  studentId: row[2],
  studentName: row[3],
  className: row[4],
  answers: safeJson(row[5], {}),
  attachments: safeJson(row[6], []),
  status: row[7] || 'submitted',
  submittedAt: row[8],
  reviewedBy: row[9],
  reviewNote: row[10] || ''
});

const loadForms = async () => stripHeader(await getSheetData('Forms'));
const loadSubmissions = async () => stripHeader(await getSheetData('FormSubmissions'));

const findForm = async (id) => {
  const rows = await loadForms();
  const row = rows.find((item) => String(item[0] || '').trim() === String(id));
  return row ? { row, form: toForm(row) } : null;
};

/**
 * Student ko kaunsa form dikhta hai: status `open` hona chahiye, aur audience
 * ya `All` ho ya uski apni class. `draft`/`closed` forms students ko kabhi
 * nahi dikhte — warna adhura form bharna shuru ho jaata.
 */
const visibleToStudent = (form, user) => {
  if (form.status !== 'open') return false;
  return form.audience === 'All' || form.audience === String(user.class || '');
};

// ---------------------------------------------------------------------------
//  Principal / Admin - form banana aur badalna
// ---------------------------------------------------------------------------

const createForm = asyncRoute(async (req, res) => {
  const title = v.text(req.body.title, 'Title', { max: 160 });
  const content = sanitizeHtml(req.body.content ?? '');
  const fields = normaliseFields(req.body.fields);
  const audience = v.oneOf(req.body.audience || 'All', CLASSES, 'Audience');
  const status = v.oneOf(req.body.status || 'draft', FORM_STATUSES, 'Status');

  const now = new Date().toISOString();
  const id = `FRM${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const found = await findUserById(req.user.id);
  const createdByName = found?.user?.name || req.user.role;

  const row = [
    id, title, content, JSON.stringify(fields), audience, status,
    req.user.id, createdByName, now, now
  ];
  await appendSheetData('Forms', row);

  emitToStudents(req, 'form_created', toForm(row));
  res.status(201).json({ success: true, form: toForm(row) });
});

const updateForm = asyncRoute(async (req, res) => {
  const found = await findForm(req.params.id);
  if (!found) throw new HttpError(404, 'Form not found');

  const updatedRow = [...found.row];

  if (!v.isBlank(req.body.title)) updatedRow[1] = v.text(req.body.title, 'Title', { max: 160 });
  // Content ko hamesha sanitize karte hain, chahe badal raha ho ya na ho —
  // purane rows bhi isse safe ho jaate hain.
  if (req.body.content !== undefined) updatedRow[2] = sanitizeHtml(req.body.content);
  if (req.body.fields !== undefined) updatedRow[3] = JSON.stringify(normaliseFields(req.body.fields));
  if (req.body.audience !== undefined) updatedRow[4] = v.oneOf(req.body.audience, CLASSES, 'Audience');
  if (req.body.status !== undefined) updatedRow[5] = v.oneOf(req.body.status, FORM_STATUSES, 'Status');
  updatedRow[9] = new Date().toISOString();

  await updateSheetData('Forms', found.form.id, updatedRow);

  const form = toForm(updatedRow);
  emitToStudents(req, 'form_updated', { id: form.id, status: form.status, title: form.title });
  res.json({ success: true, form });
});

const deleteForm = asyncRoute(async (req, res) => {
  const found = await findForm(req.params.id);
  if (!found) throw new HttpError(404, 'Form not found');

  const submissions = await loadSubmissions();
  const filled = submissions.filter((row) => String(row[1] || '').trim() === found.form.id).length;
  if (filled > 0) {
    throw new HttpError(
      409,
      `This form has ${filled} submission(s). Close it instead of deleting — deleting would throw away student work.`
    );
  }

  await deleteSheetData('Forms', found.form.id);
  emitToStudents(req, 'form_deleted', { id: found.form.id });
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
//  Reading
// ---------------------------------------------------------------------------

const listForms = asyncRoute(async (req, res) => {
  const rows = await loadForms();
  const forms = rows.map(toForm);

  if (isStaff(req.user)) {
    // Staff ko sab dikhta hai, submission count ke saath — taaki dashboard par
    // pata chale kaunsa form bhara ja raha hai.
    const submissions = await loadSubmissions();
    return res.json(
      forms
        .map((form) => ({
          ...form,
          submissionCount: submissions.filter((row) => String(row[1] || '').trim() === form.id).length
        }))
        .reverse()
    );
  }

  res.json(forms.filter((form) => visibleToStudent(form, req.user)).reverse());
});

const getForm = asyncRoute(async (req, res) => {
  const found = await findForm(req.params.id);
  if (!found) throw new HttpError(404, 'Form not found');
  if (!isStaff(req.user) && !visibleToStudent(found.form, req.user)) {
    throw new HttpError(404, 'Form not found');
  }

  let mine = null;
  if (!isStaff(req.user)) {
    const submissions = await loadSubmissions();
    const own = submissions.find(
      (row) => String(row[1] || '').trim() === found.form.id && String(row[2] || '').trim() === req.user.id
    );
    mine = own ? toSubmission(own) : null;
  }

  res.json({ form: found.form, mine });
});

// ---------------------------------------------------------------------------
//  Student - form bharna
// ---------------------------------------------------------------------------

/**
 * Principal ka form khali chhod sakta hai (instruction sheet), student ka
 * answer hamesha required hona chahiye. `select` ke liye option se match
 * karna padta warna koi bhi value daal kar chala jaata.
 */
const validateAnswers = (fields, answers) => {
  const source = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
  const clean = {};

  for (const field of fields) {
    const raw = source[field.key];
    const value = typeof raw === 'string' ? raw.trim() : raw;

    if (value === undefined || value === null || value === '') {
      if (field.required) throw new HttpError(400, `"${field.label}" is required`);
      clean[field.key] = '';
      continue;
    }

    switch (field.type) {
      case 'number': {
        const num = Number(value);
        if (!Number.isFinite(num)) throw new HttpError(400, `"${field.label}" must be a number`);
        clean[field.key] = String(num);
        break;
      }
      case 'date': {
        const text = String(value);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new HttpError(400, `"${field.label}" must be a date`);
        clean[field.key] = text;
        break;
      }
      case 'select': {
        const picked = String(value);
        if (!field.options.includes(picked)) {
          throw new HttpError(400, `"${field.label}" must be one of: ${field.options.join(', ')}`);
        }
        clean[field.key] = picked;
        break;
      }
      case 'file':
        // File ka link ya data URL — detailed validation fileStore karta hai.
        clean[field.key] = v.optionalUrl(value, `${field.label} link`) || String(value).slice(0, 4000);
        break;
      default: {
        const text = String(value);
        if (text.length > 4000) throw new HttpError(400, `"${field.label}" is too long (max 4000 characters)`);
        clean[field.key] = text;
      }
    }
  }

  return clean;
};

const validateAttachments = (value) => {
  if (value === undefined || value === null || value === '') return [];
  const list = v.array(value, 'Attachments', { max: 6 });

  return list.map((item, index) => {
    if (!item || typeof item !== 'object') throw new HttpError(400, `Attachment ${index + 1} is not valid`);
    return {
      name: v.text(item.name, `Attachment ${index + 1} name`, { max: 180 }),
      url: v.url(item.url, `Attachment ${index + 1} link`),
      type: String(item.type || '').slice(0, 80),
      size: Math.max(0, Number(item.size) || 0)
    };
  });
};

const submitForm = asyncRoute(async (req, res) => {
  const found = await findForm(req.params.id);
  if (!found) throw new HttpError(404, 'Form not found');
  if (!visibleToStudent(found.form, req.user)) {
    throw new HttpError(404, 'Form not found');
  }

  const existing = await loadSubmissions();
  const already = existing.find(
    (row) => String(row[1] || '').trim() === found.form.id && String(row[2] || '').trim() === req.user.id
  );
  if (already) {
    throw new HttpError(409, 'You have already submitted this form. Wait for the school office to review it.');
  }

  const answers = validateAnswers(found.form.fields, req.body.answers);
  const attachments = validateAttachments(req.body.attachments);

  const user = await findUserById(req.user.id);
  const now = new Date().toISOString();
  const id = `SUB${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const row = [
    id, found.form.id, req.user.id, user?.user?.name || 'Student',
    String(user?.user?.class || req.user.class || ''), JSON.stringify(answers),
    JSON.stringify(attachments), 'submitted', now, '', ''
  ];

  await appendSheetData('FormSubmissions', row);

  // Principal/Admin ko turant pata chal jaaye ki naya form bhara gaya.
  const io = req.app.get('socketio');
  if (io) {
    const payload = {
      ...toSubmission(row),
      formTitle: found.form.title
    };
    io.to('role:principal').emit('form_submission', payload);
    io.to('role:admin').emit('form_submission', payload);
  }

  res.status(201).json({ success: true, message: 'Form submitted', submission: toSubmission(row) });
});

const getMySubmissions = asyncRoute(async (req, res) => {
  const rows = await loadSubmissions();
  const mine = rows.filter((row) => String(row[2] || '').trim() === req.user.id).map(toSubmission).reverse();
  res.json(mine);
});

// ---------------------------------------------------------------------------
//  Principal / Admin - submissions dekhna aur review karna
// ---------------------------------------------------------------------------

const getFormSubmissions = asyncRoute(async (req, res) => {
  const found = await findForm(req.params.id);
  if (!found) throw new HttpError(404, 'Form not found');

  const rows = await loadSubmissions();
  const list = rows
    .filter((row) => String(row[1] || '').trim() === found.form.id)
    .map(toSubmission)
    .reverse();

  res.json({ form: found.form, submissions: list });
});

const reviewSubmission = asyncRoute(async (req, res) => {
  const status = v.oneOf(req.body.status, SUBMISSION_STATUSES, 'Status');
  const note = v.optionalText(req.body.note, 'Note', { max: 1200 });

  const rows = await loadSubmissions();
  const row = rows.find((item) => String(item[0] || '').trim() === String(req.params.id));
  if (!row) throw new HttpError(404, 'Submission not found');

  const updatedRow = [...row];
  updatedRow[7] = status;
  updatedRow[9] = req.user.id;
  updatedRow[10] = note || '';

  await updateSheetData('FormSubmissions', String(row[0]), updatedRow);

  const io = req.app.get('socketio');
  if (io) {
    const ownerRoom = `user:${updatedRow[2]}`;
    io.to(ownerRoom).emit('form_submission_reviewed', {
      id: updatedRow[0],
      formId: updatedRow[1],
      status,
      note: note || ''
    });
    io.to(ownerRoom).emit('notification', {
      title: 'Form update',
      message: `Your submission was marked ${status}.`
    });
  }

  res.json({ success: true, status });
});

/** Principal/Admin ki taraf se students ko bhejne wala broadcast. */
const emitToStudents = (req, event, payload) => {
  const io = req.app.get('socketio');
  if (!io) return;
  io.to('role:student').emit(event, payload);
  io.to('role:teacher').emit(event, payload);
};

module.exports = {
  createForm, updateForm, deleteForm, listForms, getForm,
  submitForm, getMySubmissions, getFormSubmissions, reviewSubmission,
  FIELD_TYPES, FORM_STATUSES, SUBMISSION_STATUSES,
  // Pure helpers — tests inhi ko direct test karte hain (HTTP ke bina).
  sanitizeHtml, normaliseFields, validateAnswers, visibleToStudent
};
