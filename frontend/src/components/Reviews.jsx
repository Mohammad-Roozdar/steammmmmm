'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { toast } from '@/components/Toast';
import { Star, Trash2, MessageSquare, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Reviews({ gameId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0, distribution: {} });
  const [userReactions, setUserReactions] = useState({});
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [sort, setSort] = useState('top'); // top, new, old

  const load = () => {
    api.get(`/reviews/game/${gameId}`).then((r) => {
      setReviews(r.data.reviews);
      setStats({
        total: r.data.total,
        average: r.data.average,
        distribution: r.data.distribution
      });
      setUserReactions(r.data.userReactions || {});
      const me = getUser();
      if (me) {
        setMyReview(r.data.reviews.find((rv) => rv.UserId === me.id) || null);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    setUser(getUser());
  }, [gameId]);

  const submit = async () => {
    if (!user) return (window.location.href = '/login');
    if (comment.trim().length < 3) return toast('نظر خیلی کوتاهه', 'error');
    setSubmitting(true);
    try {
      await api.post(`/reviews/game/${gameId}`, { rating, comment });
      setComment('');
      setRating(5);
      load();
      toast('نظر شما ثبت شد', 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id) => {
    if (!confirm('حذف شود؟')) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
      toast('حذف شد', 'success');
    } catch {}
  };

  const react = async (reviewId, type) => {
    if (!user) {
      toast('برای واکنش، وارد شوید', 'info');
      return window.location.href = '/login';
    }
    try {
      const { data } = await api.post(`/reviews/${reviewId}/react`, { type });
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, likes: data.likes, dislikes: data.dislikes } : r
      ));
      setUserReactions(prev => {
        const copy = { ...prev };
        if (data.action === 'removed') delete copy[reviewId];
        else copy[reviewId] = type;
        return copy;
      });
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    }
  };

  let sortedReviews = [...reviews];
  if (sort === 'top') sortedReviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  else if (sort === 'new') sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'old') sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="text-[#66c0f4]" />
        نظرات کاربران ({stats.total})
      </h2>

      {/* خلاصه آمار */}
      {stats.total > 0 && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#66c0f4]">
                {stats.average.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(stats.average)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-600'}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                از {stats.total} نظر
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.distribution[s] || 0;
              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-16">
                    <span>{s}</span>
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-[#0f1922] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-yellow-500 to-orange-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-12 text-left text-gray-500">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* فرم نظر */}
      {user && !myReview && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">✍️ نظر خودت رو بنویس</h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">امتیاز:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="transition hover:scale-125"
                >
                  <Star
                    size={28}
                    className={s <= (hover || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-bold text-[#66c0f4] mr-2">{rating}/۵</span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="تجربه‌ات از این بازی چطور بود؟"
            className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition"
          />

          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className="mt-3 bg-[#66c0f4] text-[#171a21] font-bold px-6 py-3 rounded-lg hover:bg-[#4fa8d8] disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Send size={16} /> {submitting ? 'در حال ارسال...' : 'ارسال نظر'}
          </button>
        </div>
      )}

      {!user && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 mb-6 text-center">
          <a href="/login" className="text-[#66c0f4] hover:underline">
            برای ثبت نظر وارد شوید
          </a>
        </div>
      )}

      {/* فیلتر مرتب‌سازی */}
      {reviews.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSort('top')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              sort === 'top' ? 'bg-[#66c0f4] text-[#171a21] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
            }`}
          >
            🔥 محبوب‌ترین
          </button>
          <button
            onClick={() => setSort('new')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              sort === 'new' ? 'bg-[#66c0f4] text-[#171a21] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
            }`}
          >
            🆕 جدیدترین
          </button>
          <button
            onClick={() => setSort('old')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              sort === 'old' ? 'bg-[#66c0f4] text-[#171a21] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
            }`}
          >
            🕰️ قدیمی‌ترین
          </button>
        </div>
      )}

      {/* لیست نظرات */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          هنوز نظری ثبت نشده. اولین نفر باش!
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((r) => {
            const myReaction = userReactions[r.id];
            return (
              <div
                key={r.id}
                className={`bg-[#171a21] border rounded-xl p-4 transition ${
                  myReview?.id === r.id
                    ? 'border-[#66c0f4]/50 bg-[#66c0f4]/5'
                    : 'border-[#2a475e] hover:border-[#66c0f4]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#66c0f4] to-[#2a475e] flex items-center justify-center font-bold text-[#171a21] shrink-0 overflow-hidden">
                    {r.User?.avatar ? (
                      <img src={r.User.avatar} className="w-full h-full object-cover" />
                    ) : (
                      r.User?.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold">{r.User?.username}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                      {myReview?.id === r.id && (
                        <span className="text-xs bg-[#66c0f4] text-[#171a21] px-2 py-0.5 rounded">
                          نظر شما
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {r.comment}
                    </p>

                    {/* دکمه‌های لایک/دیس‌لایک */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a475e]">
                      <button
                        onClick={() => react(r.id, 'like')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                          myReaction === 'like'
                            ? 'bg-green-500/20 text-green-400'
                            : 'hover:bg-[#2a475e] text-gray-400'
                        }`}
                      >
                        <ThumbsUp size={14} className={myReaction === 'like' ? 'fill-green-400' : ''} />
                        {r.likes || 0}
                      </button>

                      <button
                        onClick={() => react(r.id, 'dislike')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                          myReaction === 'dislike'
                            ? 'bg-red-500/20 text-red-400'
                            : 'hover:bg-[#2a475e] text-gray-400'
                        }`}
                      >
                        <ThumbsDown size={14} className={myReaction === 'dislike' ? 'fill-red-400' : ''} />
                        {r.dislikes || 0}
                      </button>

                      {(r.UserId === user?.id || user?.role === 'admin') && (
                        <button
                          onClick={() => del(r.id)}
                          className="mr-auto text-red-400 hover:text-red-300 p-1.5"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}