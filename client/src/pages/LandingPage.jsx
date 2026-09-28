import React, { useEffect, useRef, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users, BookOpen, MessageSquare, Bell, Award, Calendar, ShieldCheck,
  ArrowRight, MapPin, Clock, Star, ChevronRight, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { title: 'Instant messaging', description: 'Direct and class conversations with teachers and classmates.', icon: MessageSquare, tone: 'text-blue-400' },
  { title: 'Attendance', description: 'Daily register with a running percentage for every student.', icon: Users, tone: 'text-cyan-400' },
  { title: 'Results', description: 'Subject-wise marks and a calculated average for each exam.', icon: Award, tone: 'text-violet-400' },
  { title: 'Study material', description: 'Notes and homework shared by teachers in one place.', icon: BookOpen, tone: 'text-emerald-400' },
  { title: 'Notices', description: 'Announcements from the office, delivered as soon as they are posted.', icon: Bell, tone: 'text-orange-400' },
  { title: 'Events', description: 'Functions, sports and examinations on a shared calendar.', icon: Calendar, tone: 'text-rose-400' },
  { title: 'Teacher feedback', description: 'Students can rate their teachers once per subject.', icon: Star, tone: 'text-amber-400' },
  { title: 'Separate portals', description: 'Dedicated dashboards for students, teachers, the office and administrators.', icon: ShieldCheck, tone: 'text-indigo-400' }
];

const PORTALS = [
  { role: 'Students', path: '/login', detail: 'Attendance, results, homework and teacher feedback.' },
  { role: 'Teaching staff', path: '/teacher-login', detail: 'Mark attendance, publish material and upload results.' },
  { role: 'School office', path: '/principal-login', detail: 'Whole-school view and the student complaint desk.' }
];

const LandingPage = () => {
  const rootRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [topTeachers, setTopTeachers] = useState([]);
  const [studyOutlines, setStudyOutlines] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [statsRes, teachersRes] = await Promise.allSettled([
          axios.get('/api/public/portal-stats'),
          axios.get('/api/public/top-teachers')
        ]);
        if (!active) return;
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (teachersRes.status === 'fulfilled') setTopTeachers(teachersRes.value.data.slice(0, 3));
      } catch {
        if (active) setStats(null);
      }
    };

    load();

    // Study Hub outline sab 4 classes ke liye light-weight hai (sirf counts).
    const loadStudy = async () => {
      try {
        const results = await Promise.all(
          [9, 10, 11, 12].map((c) => axios.get(`/api/study/outline?class=${c}&subjects=5`))
        );
        if (!active) return;
        setStudyOutlines(results.map((r) => r.data).filter(Boolean));
      } catch {
        // Outline fail ho to section chhup jata hai.
      }
    };
    loadStudy();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.to('.bg-orb', {
        x: 'random(-70, 70)',
        y: 'random(-70, 70)',
        duration: 'random(12, 22)',
        repeat: -1,
        yoyo: true,
        ease: 'none',
        stagger: { each: 2, from: 'random' }
      });

      gsap.utils.toArray('.stat-value').forEach((node) => {
        const target = Number(node.dataset.target || 0);
        if (!target) return;
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.4,
          ease: 'power2.out',
          snap: { value: 1 },
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
          onUpdate: () => {
            node.textContent = state.value.toLocaleString('en-IN');
          }
        });
      });
    }, rootRef);

    return () => context.revert();
  }, [stats]);

  const dashboardPath = user ? `/${user.role.toLowerCase()}` : null;
  const hasData = stats && (stats.students > 0 || stats.teachers > 0);

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-[110px] bg-orb sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-violet-600/20 blur-[110px] bg-orb sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-cyan-600/10 blur-[100px] bg-orb" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-bold text-primary">
                Digital Janta Portal
              </span>

              <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Janta +2
                <br />
                <span className="text-gradient">High School</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
                The official digital platform of Janta +2 High School, Khalari. Attendance,
                results, study material and school communication for students, teachers and
                the office.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                {user ? (
                  <Link
                    to={dashboardPath}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white transition-all active:scale-[0.99] glow-shadow"
                  >
                    Open my dashboard
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white transition-all active:scale-[0.99] glow-shadow"
                    >
                      Create student account
                      <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 rounded-2xl glass-effect px-8 py-4 text-base font-bold transition-colors hover:bg-white/10"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-effect relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8"
          >
            <dl className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 shrink-0 text-primary" size={20} />
                <div className="min-w-0">
                  <dt className="font-bold">Campus</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-slate-400">
                    Bazar Tand Road, Khalari, Jharkhand 829205
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="mt-1 shrink-0 text-accent" size={20} />
                <div className="min-w-0">
                  <dt className="font-bold">School hours</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-slate-400">
                    Monday to Saturday, 8:00 AM to 2:30 PM
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-white/5 pt-6">
              {PORTALS.map((item) => (
                <Link
                  key={item.role}
                  to={item.path}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-primary/40 hover:text-white"
                >
                  {item.role}
                  <ChevronRight size={13} />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-secondary/30 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasData ? (
            <dl className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {[
                { label: 'Students', value: stats.students, suffix: '' },
                { label: 'Teaching staff', value: stats.teachers, suffix: '' },
                { label: 'Sections', value: stats.sections, suffix: '' },
                { label: 'Average score', value: stats.averageScore, suffix: '%' }
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <dd className="metric-value text-primary">
                    <span className="stat-value" data-target={item.value ?? 0}>
                      0
                    </span>
                    <span className="text-2xl">{item.value ? item.suffix : ''}</span>
                  </dd>
                  <dt className="mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-center text-sm text-slate-500">
              School figures appear here once the portal is in use.
            </p>
          )}
        </div>
      </section>

      {topTeachers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">Faculty feedback</h2>
            <p className="mt-3 text-slate-400">
              Rated by students through the portal.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topTeachers.map((teacher, index) => (
              <motion.article
                key={teacher.id || index}
                whileHover={{ y: -6 }}
                className="glass-effect relative rounded-3xl border border-white/5 p-6 text-center sm:p-7"
              >
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-400">
                  <Star size={12} fill="currentColor" />
                  {teacher.avg}
                </span>

                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white">
                  <Users size={28} />
                </span>

                <h3 className="text-lg font-bold">{teacher.name}</h3>
                <p className="mt-1 text-sm font-bold text-primary">{teacher.subject || 'General'}</p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {teacher.count} ratings
                </p>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {studyOutlines.length > 0 && (
        <section id="study-hub" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 text-center sm:mb-14">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-bold text-primary">
              <GraduationCap size={13} />
              Study Hub
            </span>
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">Class 9–12 study material, free</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Chapter-wise notes, key points and thousands of practice questions — no login needed.
              Students opening it from their portal get their own class locked in automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studyOutlines.map((outline) => {
              const totalQuestions = outline.subjects.reduce((sum, s) => sum + (s.questionCount || 0), 0);
              const totalChapters = outline.subjects.reduce((sum, s) => sum + (s.chapterCount || 0), 0);
              return (
                <motion.a
                  key={outline.class}
                  href={`/study/index.html?class=${outline.class}&locked=1`}
                  whileHover={{ y: -5 }}
                  className="glass-effect group block rounded-3xl border border-white/10 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-gradient">{outline.class}</span>
                    <ChevronRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {outline.label} class
                  </p>
                  <ul className="mt-5 space-y-1.5">
                    {outline.subjects.slice(0, 4).map((subject) => (
                      <li key={subject.id} className="flex items-center gap-2 text-sm text-slate-300">
                        <span>{subject.emoji}</span>
                        <span className="truncate">{subject.name}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-white/5 pt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                    {totalChapters} chapters · {totalQuestions.toLocaleString('en-IN')} questions
                  </p>
                </motion.a>
              );
            })}
          </div>
        </section>
      )}

      <section id="features" className="bg-background/50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">What the portal covers</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              One place for everyday school activity across every role.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.title}
                whileHover={{ y: -4 }}
                className="glass-effect rounded-3xl border border-white/10 p-6"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                  <feature.icon size={22} className={feature.tone} />
                </span>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">Choose your portal</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Each role sees only the tools that apply to them.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PORTALS.map((item) => (
            <Link
              key={item.role}
              to={item.path}
              className="glass-effect group flex flex-col rounded-3xl border border-white/10 p-6 transition-colors hover:border-primary/40"
            >
              <h3 className="text-lg font-bold">{item.role}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{item.detail}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Sign in
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-gradient text-lg font-black">Digital Janta</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                The official digital platform of Janta +2 High School, Khalari.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Portals</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li><Link to="/login" className="transition-colors hover:text-primary">Student sign in</Link></li>
                <li><Link to="/teacher-login" className="transition-colors hover:text-primary">Teacher sign in</Link></li>
                <li><Link to="/principal-login" className="transition-colors hover:text-primary">School office sign in</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Campus</h3>
              <p className="mt-4 flex items-start gap-2 text-sm text-slate-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                Bazar Tand Road, Khalari, Jharkhand 829205
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/5 pt-7 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 sm:flex-row sm:justify-between sm:text-left">
            <span>&copy; {new Date().getFullYear()} Digital Janta, Janta +2 High School</span>
            <Link to="/terms" className="transition-colors hover:text-slate-400">
              Terms and conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
