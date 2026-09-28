import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GraduationCap, BookOpen, Layers, FileQuestion, Plus, Trash2,
  Save, Loader2, AlertTriangle, Check, Pencil, RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-all active:scale-[0.99] glow-shadow disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-50';
const field =
  'w-full rounded-2xl border border-white/10 bg-secondary/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-primary/60';

const CLASSES = [9, 10, 11, 12];

/** Class 10 board content, baaki classes practice notes. */
const sourceLabel = (classNo) =>
  classNo === 10
    ? 'कक्षा 10 — JAC बोर्ड प्रश्न-बैंक (3000 प्रश्न)। यहाँ edits school notes par lagte hain.'
    : `कक्षा ${classNo} — यहाँ के अभ्यास प्रश इस साइट पर बने हैं। परीक्षा में बोर्ड प्रश्न-पत्र आएँगे।`;

/**
 * Principal / admin ke liye study content manager.
 * Base content code me hai (padha nahi jaata); sirf notes/points edit hote hain,
 * jo `StudyContent` sheet me save hote hain aur public notes API me merge ho jaate hain.
 */
const StudyContentManager = () => {
  const [classNo, setClassNo] = useState(10);
  const [subject, setSubject] = useState('');
  const [outline, setOutline] = useState(null);
  const [outlineLoading, setOutlineLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [overrides, setOverrides] = useState([]);
  const [overridesLoading, setOverridesLoading] = useState(false);

  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newPoint, setNewPoint] = useState('');

  const loadOutline = useCallback(async () => {
    setOutlineLoading(true);
    try {
      const res = await axios.get(`/api/study/outline?class=${classNo}`);
      setOutline(res.data);
      setSubject((current) =>
        res.data.subjects.some((s) => s.id === current) ? current : res.data.subjects[0]?.id || ''
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subjects could not be loaded');
      setOutline(null);
    } finally {
      setOutlineLoading(false);
    }
  }, [classNo]);

  const loadOverrides = useCallback(async () => {
    setOverridesLoading(true);
    try {
      const res = await axios.get('/api/study/overrides', { params: { class: classNo } });
      setOverrides(res.data.overrides || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Saved edits could not be loaded');
    } finally {
      setOverridesLoading(false);
    }
  }, [classNo]);

  const loadNotes = useCallback(async () => {
    if (!subject) return;
    setNotesLoading(true);
    setDraft(null);
    try {
      const res = await axios.get('/api/study/notes', { params: { class: classNo, subject } });
      setNotes(res.data.notes || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Notes could not be loaded');
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [classNo, subject]);

  useEffect(() => {
    loadOutline();
  }, [loadOutline]);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const subjectMeta = useMemo(
    () => outline?.subjects.find((s) => s.id === subject) || null,
    [outline, subject]
  );

  const chapterCount = useMemo(
    () => (outline?.subjects || []).reduce((sum, s) => sum + (s.chapterCount || 0), 0),
    [outline]
  );

  const startEdit = (note) => {
    setDraft({
      title: note.title,
      points: note.points.map((p) => p.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean),
      details: note.details || []
    });
    setNewPoint('');
  };

  const startCreate = () => {
    setDraft({ title: '', points: [], details: [] });
    setNewPoint('');
  };

  const addPoint = () => {
    const value = newPoint.trim();
    if (!value) return;
    setDraft((d) => ({ ...d, points: [...d.points, value] }));
    setNewPoint('');
  };

  const updatePoint = (index, value) => {
    setDraft((d) => ({ ...d, points: d.points.map((p, i) => (i === index ? value : p)) }));
  };

  const removePoint = (index) => {
    setDraft((d) => ({ ...d, points: d.points.filter((_, i) => i !== index) }));
  };

  const save = async () => {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) {
      toast.error('Note ka title लिखें');
      return;
    }
    const points = draft.points.map((p) => p.trim()).filter(Boolean);
    if (!points.length) {
      toast.error('Kam se kam ek point likhein');
      return;
    }
    setSaving(true);
    try {
      await axios.post('/api/study/notes', {
        class: classNo,
        subject,
        title,
        points,
        details: draft.details
      });
      toast.success(`"${draft.title}" सहेज दिया गया`);
      setDraft(null);
      await Promise.all([loadNotes(), loadOverrides()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save नहीं हो पाया');
    } finally {
      setSaving(false);
    }
  };

  const reset = async (title) => {
    const match = overrides.find((row) => row.title === title);
    if (!match) return;
    if (!window.confirm(`"${title}" ke school edits हटा दें? Base content वापस आ जाएगा।`)) return;
    try {
      await axios.delete(`/api/study/notes/${encodeURIComponent(match.id)}`);
      toast.success('School edit हटा दिया गया');
      await Promise.all([loadNotes(), loadOverrides()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete नहीं हो पाया');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          <GraduationCap size={14} />
          Study content
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Content manager</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          किसी भी विषय का अध्याय चुनें, उसके नोट्स के points यहाँ सुधारें। आपका बदलाव
          `StudyContent` sheet में save होता है और students/teacher को तुरंत दिखता है।
          विषय, अध्याय या प्रश्न-संख्या यहाँ से नहीं बदली जाती — वह code में हैं।
        </p>
      </header>

      <div className={`${card} mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Class</span>
          {CLASSES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setClassNo(c)}
              aria-pressed={classNo === c}
              className={`min-w-[3rem] rounded-xl border px-3 py-2.5 text-sm font-black transition-colors ${
                classNo === c
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5">
              <BookOpen size={12} /> {outline?.subjects?.length ?? '–'} subjects
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5">
              <Layers size={12} /> {chapterCount} chapters
            </span>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
          {sourceLabel(classNo)}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[16rem_1fr] lg:gap-6">
        <aside className={card}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Subjects</h2>
          {outlineLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={22} />
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {(outline?.subjects || []).map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSubject(s.id)}
                    aria-pressed={subject === s.id}
                    className={`flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-sm font-bold transition-colors ${
                      subject === s.id
                        ? 'border-primary/50 bg-primary/15 text-white'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <span className="shrink-0 text-[10px] font-bold text-slate-500">{s.chapterCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="min-w-0 space-y-5">
          {subjectMeta && (
            <div className={card}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl">{subjectMeta.emoji}</span>
                <div className="min-w-0">
                  <h2 className="text-lg font-black">{subjectMeta.name}</h2>
                  <p className="truncate text-xs text-slate-500">{subjectMeta.nameEn}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-slate-400">
                  <FileQuestion size={12} /> {subjectMeta.questionCount} questions
                </span>
              </div>
            </div>
          )}

          {draft && (
            <div className="rounded-3xl border border-primary/40 bg-primary/5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="shrink-0 font-black">
                  {draft.title ? 'Editing' : 'नया नोट'}
                </h3>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Chapter / note ka title…"
                  aria-label="Note title"
                  className={`${field} flex-1 min-w-[12rem]`}
                />
              </div>
              <ul className="mt-4 space-y-2">
                {draft.points.map((point, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      value={point}
                      onChange={(e) => updatePoint(index, e.target.value)}
                      className={field}
                      aria-label={`Point ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePoint(index)}
                      className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-400 transition-colors hover:bg-rose-500/20"
                      aria-label="Remove point"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPoint();
                    }
                  }}
                  placeholder="नया point लिखें…"
                  className={`${field} flex-1 min-w-[12rem]`}
                />
                <button type="button" onClick={addPoint} className={btnGhost}>
                  <Plus size={15} /> जोड़ें
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save करें
                </button>
                <button type="button" onClick={() => setDraft(null)} className={btnGhost}>
                  रद्द करें
                </button>
              </div>
            </div>
          )}

          <section className={card}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Chapters &amp; notes
              </h2>
              <button
                type="button"
                onClick={startCreate}
                disabled={!!draft}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
              >
                <Plus size={14} /> नया नोट
              </button>
            </div>

            {notesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-slate-500">इस विषय के नोट्स अभी उपलब्ध नहीं हैं।</p>
            ) : (
              <ul className="space-y-2.5">
                {notes.map((note) => {
                  const saved = overrides.find((row) => row.title === note.title);
                  return (
                    <li
                      key={note.title}
                      className="rounded-2xl border border-white/5 bg-white/5 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 flex-1 font-bold">{note.title}</p>
                        {saved && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-[10px] font-black uppercase text-emerald-400">
                            <Check size={11} /> school edit
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Pencil size={13} /> सुधारें
                        </button>
                        {saved && (
                          <button
                            type="button"
                            onClick={() => reset(note.title)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <RotateCcw size={13} /> reset
                          </button>
                        )}
                      </div>
                      <ul className="mt-2.5 space-y-1 text-sm leading-relaxed text-slate-400">
                        {note.points.slice(0, 4).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {note.points.length > 4 && (
                          <li className="text-xs text-slate-600">+{note.points.length - 4} और points</li>
                        )}
                      </ul>
                      {saved?.updatedBy && (
                        <p className="mt-2 text-[11px] text-slate-600">
                          Last updated by {saved.updatedBy}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={card}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              School edits ({overridesLoading ? '…' : overrides.length})
            </h2>
            {overrides.length === 0 && !overridesLoading ? (
              <p className="text-sm text-slate-500">
                कक्षा {classNo} में अभी कोई school edit नहीं है।
              </p>
            ) : (
              <ul className="space-y-2">
                {overrides.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.title}</span>
                    <span className="text-[11px] text-slate-500">{row.subject}</span>
                    <button
                      type="button"
                      onClick={() => reset(row.title)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
                    >
                      <Trash2 size={13} /> हटाएँ
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudyContentManager;
