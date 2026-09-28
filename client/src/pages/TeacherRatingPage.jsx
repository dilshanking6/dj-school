import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, User, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const TeacherRatingPage = () => {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/teachers');
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Teachers could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleRate = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      toast.error('Choose a teacher first');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting your review');
    try {
      await axios.post('/api/ratings', { teacherId: selectedTeacher.id, rating, comment });
      toast.success('Thank you, your review was recorded', { id: loadingToast });
      setSelectedTeacher(null);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review could not be submitted', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-black sm:mb-8 sm:gap-4 sm:text-3xl">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Star size={24} />
        </span>
        Teacher feedback
      </h1>

      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-slate-400">
        Reviews are anonymous to teachers and each student can rate a teacher once. Results are shared
        with the school office, never back to the teacher as a score.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">Choose a teacher</h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : teachers.length === 0 ? (
            <div className="glass-effect rounded-3xl border border-white/5 px-5 py-14 text-center">
              <Users className="mx-auto mb-4 text-slate-600" size={40} />
              <p className="text-sm text-slate-500">No teachers are listed yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                    selectedTeacher?.id === teacher.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/5 bg-white/5 hover:border-white/15'
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-primary">
                    <User size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{teacher.name}</span>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      {teacher.subject || 'Faculty'}
                    </span>
                  </span>
                  <Link
                    to={`/student/chat?userId=${teacher.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                    aria-label={`Message ${teacher.name}`}
                  >
                    <MessageSquare size={16} />
                  </Link>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="glass-effect rounded-3xl border border-white/5 p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-bold">Your review</h2>

            {!selectedTeacher ? (
              <p className="py-12 text-center text-sm text-slate-500">
                Select a teacher from the list to continue.
              </p>
            ) : (
              <form onSubmit={handleRate} className="space-y-5">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Reviewing</p>
                  <p className="text-lg font-black text-primary">{selectedTeacher.name}</p>
                </div>

                <div>
                  <span className={label}>Your score</span>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                          rating >= star
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        <Star size={20} fill={rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={label} htmlFor="rating-comment">Feedback (optional)</label>
                  <textarea
                    id="rating-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={600}
                    placeholder="What worked well in this teacher's class?"
                    className={`${field} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Submit review
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherRatingPage;
