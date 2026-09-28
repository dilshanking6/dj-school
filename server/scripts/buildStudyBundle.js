// Offline fallback bundle banao: class 9/11/12 ke liye static JSON.
// Class 10 ke liye js/allquestions.js pehle se maujood hai.
//
// Notes bhi bundle me daalte hain taaki net band ho tab bhi notes padhe ja sakein
// (notes.html page API par depend karta tha, isliye offline khali chhota tha).
//
//   node scripts/buildStudyBundle.js
const fs = require('fs');
const path = require('path');
const { getClassBundle, getSubjectNotes, CLASSES } = require('../utils/studyContent');

const OUT_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'study', 'js', 'hub');
const SUBJECTS_INDEX = path.join(OUT_DIR, 'subjects.json');

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value), 'utf8');
  return fs.statSync(file).size;
};

const index = {};
let totalBytes = 0;

[9, 11, 12].forEach((classNo) => {
  if (!CLASSES.includes(classNo)) return;
  const bundle = getClassBundle(classNo);
  const files = [];
  Object.entries(bundle.subjects).forEach(([id, subject]) => {
    const file = `${id}.json`;
    const notes = (getSubjectNotes(classNo, id)?.notes || []).map((n) => ({
      title: n.title,
      points: n.points || [],
      details: n.details || []
    }));
    const bytes = writeJson(path.join(OUT_DIR, `class${classNo}`, file), {
      subject: subject.name,
      nameEn: subject.nameEn,
      emoji: subject.emoji,
      color: subject.color,
      desc: subject.desc,
      source: subject.source,
      chapters: subject.chapters,
      notes,
      questions: subject.questions
    });
    totalBytes += bytes;
    files.push({ id, file });
  });
  index[classNo] = files;
});

writeJson(SUBJECTS_INDEX, index);

console.log(`study bundle written -> ${OUT_DIR}`);
console.log(`  classes: ${Object.keys(index).join(', ')}`);
console.log(`  total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
