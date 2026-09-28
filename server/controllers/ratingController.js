const { appendSheetData, getSheetData } = require('../utils/googleSheets');
const { HttpError } = require('../middleware/auth');
const v = require('../middleware/validate');
const asyncRoute = require('../utils/asyncRoute');
const { stripHeader, userRows } = require('../utils/rows');
const { toUser } = require('./authController');

/** Ek rating se "top teacher" banana misleading hota hai, isliye minimum votes. */
const MIN_VOTES = 3;

const loadTeachers = async () => {
  const rows = userRows(await getSheetData('Users'));
  return rows.map(toUser).filter((u) => u.role === 'teacher' && u.status !== 'banned');
};

const submitRating = asyncRoute(async (req, res) => {
  const teacherId = v.text(req.body.teacherId, 'Teacher', { max: 40 });
  const rating = v.int(req.body.rating, 'Rating', { min: 1, max: 5 });
  const comment = v.optionalText(req.body.comment, 'Comment', { max: 600 });

  if (teacherId === req.user.id) throw new HttpError(400, 'You cannot rate yourself');

  const teacher = (await loadTeachers()).find((t) => t.id === teacherId);
  if (!teacher) throw new HttpError(404, 'Teacher not found');

  const rows = stripHeader(await getSheetData('Ratings'));
  const alreadyRated = rows.some(
    (row) => String(row[1] || '').trim() === req.user.id && String(row[2] || '').trim() === teacherId
  );
  if (alreadyRated) throw new HttpError(409, 'You have already rated this teacher');

  const date = new Date().toISOString();
  const id = `RAT${Date.now()}${Math.floor(Math.random() * 1000)}`;

  await appendSheetData('Ratings', [date, req.user.id, teacherId, teacher.name, rating, comment, id]);

  const io = req.app.get('socketio');
  if (io) io.to('role:principal').emit('new_rating', { teacherId, rating });

  res.status(201).json({ success: true, message: 'Rating submitted' });
});

const getTopTeachers = asyncRoute(async (req, res) => {
  const [rows, teachers] = await Promise.all([getSheetData('Ratings'), loadTeachers()]);
  const subjectById = new Map(teachers.map((t) => [t.id, t.subject || 'General']));

  const stats = new Map();
  stripHeader(rows).forEach((row) => {
    const teacherId = String(row[2] || '').trim();
    const score = Number(row[4]);
    if (!teacherId || !Number.isFinite(score)) return;
    if (score < 1 || score > 5) return;

    const entry = stats.get(teacherId) || { id: teacherId, name: row[3], total: 0, count: 0 };
    entry.total += score;
    entry.count += 1;
    stats.set(teacherId, entry);
  });

  const ranked = [...stats.values()]
    .filter((t) => t.count >= MIN_VOTES && subjectById.has(t.id))
    .map((t) => ({
      id: t.id,
      name: t.name,
      subject: subjectById.get(t.id),
      votes: t.count,
      avg: Number((t.total / t.count).toFixed(1))
    }))
    .sort((a, b) => b.avg - a.avg || b.votes - a.votes)
    .slice(0, 6);

  res.json(ranked);
});

module.exports = { submitRating, getTopTeachers };
