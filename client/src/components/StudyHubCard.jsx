import React, { useContext, useEffect, useState } from 'react';
import {
  GraduationCap, BookOpen, FileQuestion, Layers, ArrowRight, Loader2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

/** Sirf 9–12 ke valid class; baaki sab default 10. */
const normalise = (value) => {
  const n = Number(value);
  return n >= 9 && n <= 12 ? n : 10;
};

const CLASS_NAME = { 9: 'नव', 10: 'दशम', 11: 'उत्तर', 12: 'द्वादश' };

/**
 * Dashboard ka Study Hub card.
 * Numbers API se aate hain, guess nahi kiye jaate.
 */
const StudyHubCard = ({ className = '', compact = false }) => {
  const { user } = useContext(AuthContext);
  const studentClass = normalise(user?.class);
  const [activeClass, setActiveClass] = useState(studentClass);
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    axios
      .get(`/api/study/outline?class=${activeClass}`)
      .then((res) => {
        if (active) setOutline(res.data);
      })
      .catch(() => {
        if (active) {
          setOutline(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeClass]);

  // Students ko sirf apni class — switch sirf teacher/principal/admin ko
  const canSwitch = user?.role !== 'student';
  // index.html explicitly — dev me "/study/" React SPA fallback se home dikha deta hai
  const href = `/study/index.html?class=${activeClass}&locked=1`;

  const subjects = outline?.subjects || [];
  const chapterCount = subjects.reduce((sum, s) => sum + (s.chapterCount || 0), 0);

  return (
    <section className={`glass-effect relative overflow-hidden rounded-3xl border border-primary/25 p-5 sm:p-6 ${className}`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            <GraduationCap size={14} />
            Study Hub
          </p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">
            Digital Janta +2 Study Hub
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            {outline
              ? `कक्षा ${activeClass} — ${subjects.length} विषय, ${chapterCount} अध्याय, नोट्स और अभ्यास प्रश्न`
              : 'अध्याय, नोट्स, क्विज़, फॉर्मूले और प्रयोग — एक ही जगह'}
          </p>
        </div>

        {canSwitch && (
          <div className="flex gap-1.5" role="group" aria-label="Select class">
            {[9, 10, 11, 12].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveClass(c)}
                aria-pressed={activeClass === c}
                className={`min-w-[2.75rem] rounded-xl border px-2.5 py-2 text-xs font-black transition-colors ${
                  activeClass === c
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="relative mt-6 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Study material load ho raha hai…
        </div>
      ) : failed ? (
        <p className="relative mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          Numbers abhi load nahi hue (backend server bhad hai), lekin Study Hub khulne par apni
          offline notes aur questions dikha deta hai.
        </p>
      ) : (
        <>
          <dl className="relative mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'विषय', value: subjects.length, icon: BookOpen },
              { label: 'अध्याय', value: chapterCount, icon: Layers },
              { label: 'कक्षा', value: CLASS_NAME[activeClass], icon: GraduationCap }
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-white/5 px-3 py-3 text-center">
                <dd className="flex items-center justify-center gap-1.5 text-xl font-black text-primary sm:text-2xl">
                  <Icon size={16} className="opacity-70" />
                  {value}
                </dd>
                <dt className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
              </div>
            ))}
          </dl>

          {!compact && subjects.length > 0 && (
            <ul className="relative mt-4 flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300"
                >
                  {s.emoji} {s.name}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <a
        href={href}
        className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.99] glow-shadow sm:w-auto"
      >
        <FileQuestion size={17} />
        खोलें — {user?.role === 'student' ? `कक्षा ${activeClass}` : `Class ${activeClass} material`}
        <ArrowRight size={16} />
      </a>

      <p className="relative mt-3 text-[11px] leading-relaxed text-slate-600">
        {activeClass === 10
          ? 'कक्षा 10 की सामग्री JAC बोर्ड प्रश्न-बैंक (3000 प्रश्न) पर आधारित है।'
          : `कक्षा ${activeClass} के अभ्यास प्रश इस साइट पर बनाए गए हैं — परीक्षा में बोर्ड प्रश्न-पत्र ही आएँगे।`}
      </p>
    </section>
  );
};

export default StudyHubCard;
