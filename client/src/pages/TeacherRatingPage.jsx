import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, Award, User, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TeacherRatingPage = () => {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchTeachers = async () => {
    try {
      const res = await axios.post('/api/auth/list-teachers'); // Need to implement this endpoint
      setTeachers(res.data);
    } catch (err) {
      // Mock teachers if API fails
      setTeachers([
        { id: 'T001', name: 'Mr. A.K. Singh', subject: 'Math' },
        { id: 'T002', name: 'Mrs. S. Parween', subject: 'Science' },
        { id: 'T003', name: 'Mr. Rajesh Kumar', subject: 'CS' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleRate = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return alert('Select a teacher first');
    setSubmitting(true);
    try {
      await axios.post('/api/ratings', {
        studentId: user.id,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        rating,
        comment
      });
      alert('Rating submitted! Thank you.');
      setSelectedTeacher(null);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Rating failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><Star /></div>
        Rate Your Teachers
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest text-xs font-black">Select Teacher</h2>
          <div className="grid grid-cols-1 gap-4">
            {teachers.map((t) => (
              <motion.div 
                key={t.id}
                onClick={() => setSelectedTeacher(t)}
                whileHover={{ x: 10 }}
                className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${
                  selectedTeacher?.id === t.id ? 'bg-primary/20 border-primary' : 'glass-effect border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary"><User /></div>
                  <div>
                    <h4 className="font-bold">{t.name}</h4>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{t.subject}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="glass-effect p-10 rounded-[3rem] border border-white/10 shadow-2xl sticky top-24">
            <h2 className="text-2xl font-black mb-8">Share Your Review</h2>
            {!selectedTeacher ? (
              <p className="text-gray-500 text-center py-10 italic">Please select a teacher from the list to start rating.</p>
            ) : (
              <form onSubmit={handleRate} className="space-y-8">
                <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rating for</p>
                  <p className="text-xl font-black text-primary">{selectedTeacher.name}</p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block text-center">Your Score</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setRating(s)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          rating >= s ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        <Star size={20} fill={rating >= s ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Feedback (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-6 top-6 text-gray-500" size={18} />
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 pl-14 outline-none focus:border-primary/50 transition-all text-sm resize-none"
                      placeholder="What do you like about this teacher's teaching style?"
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all glow-shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <>Submit My Vote <Send size={20} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRatingPage;
