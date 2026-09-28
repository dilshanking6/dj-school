import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Lock, Users, KeyRound, Bell } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileText,
    tone: 'text-primary',
    title: '1. Introduction',
    body: 'The Digital Janta Portal is the digital management system used by Janta +2 High School, Khalari, for attendance, results, study material, events, notices and school communication. By using the portal you agree to the rules below. These rules apply to students, teachers, the principal’s office and the administrator.'
  },
  {
    icon: KeyRound,
    tone: 'text-accent',
    title: '2. Accounts and sign-in',
    body: 'Students and teachers may register themselves. A teacher account stays inactive until the school office approves it; the principal and administrator accounts are created by the school office only. You sign in with your email and password, or with a one-time code sent to your registered phone number. Keep your credentials private — anyone using your account is treated as you. Telling or lending your sign-in details to another person can lead to your account being suspended.'
  },
  {
    icon: Lock,
    tone: 'text-purple-400',
    title: '3. Your data',
    body: 'The portal stores your name, class, contact details, attendance, results and messages. This information is used only for school purposes and is visible to the staff who need it — for example, a teacher sees the attendance of their own class only. Staff roles are separated so that each person sees only what their work requires. We do not sell or share personal data for commercial use. If you find an error in your record, correct it from Account settings or report it to the school office.'
  },
  {
    icon: Users,
    tone: 'text-emerald-400',
    title: '4. Conduct in chat and complaints',
    body: 'Class channels and direct messages are for school communication. Harassment, bullying, rude language, or sharing unsuitable content is not allowed and can be acted on by the principal’s office. Students can send a complaint to the principal from the Help & Complaints section and follow its status there. Complaints should be genuine; knowingly false complaints may lead to disciplinary action.'
  },
  {
    icon: Bell,
    tone: 'text-amber-400',
    title: '5. Content shared on the portal',
    body: 'Study material and links shared by teachers are for classroom use. Do not upload or forward material that belongs to someone else or that is not meant for the class. The school may remove content that breaks these rules, and may correct or withdraw a notice that was published by mistake.'
  },
  {
    icon: ShieldCheck,
    tone: 'text-sky-400',
    title: '6. Availability and changes',
    body: 'The portal depends on school internet and on the school’s data service, so a feature may be temporarily unavailable. We may update these rules as the portal improves; the version published on this page is the one that applies.'
  }
];

const TermsPage = () => (
  <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-3xl border border-white/10 p-6 shadow-2xl sm:rounded-[3rem] sm:p-10 lg:p-14"
    >
      <div className="mb-10 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <ShieldCheck size={28} />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Terms &amp; Conditions</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Janta +2 High School, Khalari
          </p>
        </div>
      </div>

      <div className="space-y-9 leading-relaxed text-slate-300">
        {SECTIONS.map(({ icon: Icon, tone, title, body }) => (
          <section key={title}>
            <div className="mb-3 flex items-center gap-3">
              <Icon size={19} className={tone} />
              <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed sm:text-base">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-white/5 pt-8 text-center">
        <p className="text-sm text-slate-500">
          Questions about these rules? Ask the school office.
        </p>
      </div>
    </motion.div>
  </div>
);

export default TermsPage;
