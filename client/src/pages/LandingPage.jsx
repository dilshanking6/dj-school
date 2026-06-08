import React, { useEffect, useRef, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Users, BookOpen, MessageSquare, Bell, 
  Award, Calendar, ShieldCheck, Zap, 
  ArrowRight, Sparkles, MapPin, Phone, Mail, Clock, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const bgRef = useRef(null);
  const statsRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [topTeachers, setTopTeachers] = useState([]);
  const [portalStats, setPortalStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    successRate: 0
  });
  const [allRealTeachers, setAllRealTeachers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, statsRes, allTeachersRes] = await Promise.all([
          axios.get('/api/ratings/top'),
          axios.get('/api/school/portal-stats'),
          axios.get('/api/auth/teachers')
        ]);
        setTopTeachers(teachersRes.data.slice(0, 3));
        setPortalStats(statsRes.data);
        setAllRealTeachers(allTeachersRes.data.slice(0, 3));
      } catch (err) {
        console.log('Error fetching portal data');
      }
    };
    fetchData();
  }, []);

  const displayTeachers = topTeachers.length > 0 ? topTeachers : allRealTeachers;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".bg-circle", {
        x: "random(-100, 100)",
        y: "random(-100, 100)",
        duration: "random(10, 20)",
        repeat: -1,
        yoyo: true,
        ease: "none",
        stagger: {
          each: 2,
          from: "random"
        }
      });

      const stats = gsap.utils.toArray(".stat-number");
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-target"));
        gsap.to(stat, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: stat,
            start: "top 80%",
          }
        });
      });
    }, bgRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { title: 'Real-time Chat', icon: <MessageSquare className="text-blue-400" />, desc: 'Connect with classmates and teachers instantly.' },
    { title: 'Attendance', icon: <Users className="text-cyan-400" />, desc: 'Track your daily attendance with live updates.' },
    { title: 'Results', icon: <Award className="text-purple-400" />, desc: 'View and analyze your academic performance.' },
    { title: 'Homework', icon: <BookOpen className="text-emerald-400" />, desc: 'Access assignments and submit them digitally.' },
    { title: 'AI Assistant', icon: <Sparkles className="text-amber-400" />, desc: 'Get instant help from our smart school bot.' },
    { title: 'Events', icon: <Calendar className="text-rose-400" />, desc: 'Stay updated with school functions and sports.' },
    { title: 'Notifications', icon: <Bell className="text-orange-400" />, desc: 'Never miss an announcement with live alerts.' },
    { title: 'Admin Control', icon: <ShieldCheck className="text-indigo-400" />, desc: 'Secure and powerful management tools.' },
  ];

  return (
    <div ref={bgRef} className="relative overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-[#0F172A]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full bg-circle"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full bg-circle"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full bg-circle"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <Sparkles size={14} /> NEW: DIGITAL JANTA PORTAL V1.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              Janta +2 <br />
              <span className="text-gradient">High School</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Located in the heart of Khalari, Jharkhand. We provide quality education and a connected digital ecosystem for our students to Learn, Connect, and Grow.
            </p>
            
            {user ? (
              <Link to={`/${user.role.toLowerCase()}`} className="inline-flex items-center gap-2 px-10 py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20">
                Go to My Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                  Join School <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-4 glass-effect rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Student Login
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex-1 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-[3rem] p-10 border border-white/10 relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1" />
                <div>
                  <h3 className="font-bold">Address</h3>
                  <p className="text-sm text-gray-400">MX2Q+4JC, Bazar tand Road, Khalari, Jharkhand 829205, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="text-accent mt-1" />
                <div>
                  <h3 className="font-bold">School Hours</h3>
                  <p className="text-sm text-gray-400">Monday - Saturday: 08:00 AM - 02:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-purple-400 mt-1" />
                <div>
                  <h3 className="font-bold">Contact</h3>
                  <p className="text-sm text-gray-400">+91 (Waiting for update)</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black">DJ</div>
                <div>
                  <h4 className="font-bold text-sm">Digital Janta Platform</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Official Smart School System</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-secondary/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Students', target: portalStats.students, suffix: '+' },
            { label: 'Teachers', target: portalStats.teachers, suffix: '+' },
            { label: 'Courses', target: portalStats.courses, suffix: '+' },
            { label: 'Success Rate', target: portalStats.successRate, suffix: '%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl lg:text-6xl font-black text-primary mb-2">
                <span className="stat-number" data-target={stat.target}>0</span>{stat.suffix}
              </div>
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Teachers Section */}
      <section className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Our Best <span className="text-primary">Teachers</span></h2>
          <p className="text-gray-400">Guiding our students towards a brighter future with excellence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTeachers.map((teacher, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass-effect p-8 rounded-[2.5rem] border border-white/5 text-center relative group"
            >
              <div className="absolute top-6 right-6 flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-black">
                <Star size={12} fill="currentColor" /> {teacher.avg}
              </div>
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
              <p className="text-sm text-primary font-bold mb-4">{teacher.subject || teacher.sub}</p>
              <div className="inline-block px-4 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                {teacher.count} TOTAL VOTES
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">Smart Campus Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Modern tools for modern learning. All integrated into one seamless platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 glass-effect rounded-[2rem] border border-white/10 group transition-all"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                  {React.cloneElement(feature.icon, { size: 24 })}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
            <div>
              <h3 className="text-xl font-black mb-6 text-gradient inline-block">Digital Janta</h3>
              <p className="text-sm text-gray-500 leading-relaxed">The official digital portal for Janta +2 High School, Khalari. Empowering education through technology.</p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-primary transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Apply for Admission</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Location</h4>
              <p className="text-sm text-gray-400 flex gap-2">
                <MapPin size={16} className="shrink-0 text-primary" />
                Khalari, Jharkhand 829205, India
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
            &copy; 2026 Digital Janta | Janta +2 High School | Built by DILSHAN
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
