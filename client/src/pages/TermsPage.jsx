import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Lock, Users } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-[3rem] p-10 lg:p-16 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Terms & Conditions</h1>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Last Updated: June 2026</p>
          </div>
        </div>

        <div className="space-y-12 text-gray-300 leading-relaxed">
          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <FileText size={20} className="text-primary" />
              <h2 className="text-xl font-bold">1. Introduction</h2>
            </div>
            <p>
              Welcome to the Digital Janta Portal ("Platform"), the official digital management system of Janta +2 High School, Khalari. By accessing or using this platform, you agree to comply with and be bound by these Terms and Conditions. This platform is designed to facilitate educational communication, attendance tracking, result management, and community interaction for students, teachers, and administration.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <Users size={20} className="text-accent" />
              <h2 className="text-xl font-bold">2. User Accounts and Security</h2>
            </div>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials (email and password). Any activity performed under a user's account is their sole responsibility. Unauthorized sharing of accounts or attempting to access restricted portals (Teacher, Principal, or Admin) without proper authorization is strictly prohibited and may result in permanent suspension of access.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <Lock size={20} className="text-purple-400" />
              <h2 className="text-xl font-bold">3. Data Privacy and Usage</h2>
            </div>
            <p>
              Digital Janta collects and stores data related to student academic performance, attendance, and communication for educational purposes only. We utilize Google Sheets as our primary database engine. While we implement security measures, users acknowledge that the platform operates on web-based infrastructure. Personal data will not be shared with third parties for commercial use.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h2 className="text-xl font-bold">4. Code of Conduct</h2>
            </div>
            <p>
              The Public Chat Rooms and community sections are for educational discussion only. Harassment, bullying, sharing of inappropriate content, or any form of cyber-misconduct will result in immediate disciplinary action by the Principal's office. The school reserves the right to moderate all content shared on the platform.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-white">
              <FileText size={20} className="text-amber-400" />
              <h2 className="text-xl font-bold">5. Complaint System</h2>
            </div>
            <p>
              Students may submit complaints directly to the Principal's office via the portal. The Principal reserves the right to accept, reject, or mark complaints as resolved. The status of a complaint reflected on the portal is final. False or malicious complaints may lead to disciplinary measures.
            </p>
          </section>

          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500 italic">
              "Dedicated to providing a safe and smart learning environment for every student at Janta +2 High School."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
