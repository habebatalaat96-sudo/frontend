import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  Search, 
  Image as ImageIcon,
  Shield,
  AlertCircle,
  Edit2,
  Check,
  X,
  ChevronDown,
  Building2,
  Heart,
  ThumbsUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OwnerReply {
  text: string;
  repliedAt: string;
  editedAt?: string;
}

type OwnerReaction = 'like' | 'love' | null;

interface Review {
  _id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  createdAt: string;
  comment: string;
  images?: string[];
  ownerReply?: OwnerReply;
  ownerReaction?: OwnerReaction;
  status: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5000';

const getToken = () => localStorage.getItem('business_token') || '';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json.data as T;
}

const reviewsApi = {
  getOwnerReviews: (businessId: string) =>
    apiFetch<Review[]>(`/reviews/owner/${businessId}`),

  replyToReview: (reviewId: string, text: string) =>
    apiFetch<Review>(`/reviews/owner/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  reactToReview: (reviewId: string, reaction: 'like' | 'love') =>
    apiFetch<Review>(`/reviews/owner/${reviewId}/react`, {
      method: 'PATCH',
      body: JSON.stringify({ reaction }),
    }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const canEditReply = (repliedAt: string) => {
  const fifteenMinutes = 15 * 60 * 1000;
  return Date.now() - new Date(repliedAt).getTime() < fifteenMinutes;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface BusinessReviewsProps {
  businessId?: string; // ✅ optional — هنجيبه من localStorage لو مش موجود
}

export const BusinessReviews: React.FC<BusinessReviewsProps> = ({ businessId: propBusinessId }) => {

  // ✅ جيب الـ businessId من الـ prop أو من localStorage
  const businessId = propBusinessId || (() => {
    try {
      const stored = localStorage.getItem('business');
      if (!stored) return localStorage.getItem('businessId') || '';
      const parsed = JSON.parse(stored);
      // الـ business field هو الـ ID الحقيقي للبيزنيس (مش الـ owner)
      return parsed?.business || parsed?._id || '';
    } catch {
      return localStorage.getItem('businessId') || '';
    }
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'replied' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [reacting, setReacting] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    // ✅ Guard: لو businessId مش موجود متعملش request
    if (!businessId) {
      setError('Business ID is missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await reviewsApi.getOwnerReviews(businessId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTexts[reviewId]?.trim();
    if (!text) { toast.error('Please enter a response'); return; }
    setSubmitting(reviewId);
    try {
      const updated = await reviewsApi.replyToReview(reviewId, text);
      setReviews(prev => prev.map(r => r._id === reviewId ? updated : r));
      setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
      setReplyingTo(null);
      toast.success('Response posted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post response');
    } finally {
      setSubmitting(null);
    }
  };

  const handleUpdateReply = async (reviewId: string) => {
    const text = replyTexts[reviewId]?.trim();
    if (!text) { toast.error('Please enter a response'); return; }
    setSubmitting(reviewId);
    try {
      const updated = await reviewsApi.replyToReview(reviewId, text);
      setReviews(prev => prev.map(r => r._id === reviewId ? updated : r));
      setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
      setEditingReply(null);
      toast.success('Response updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update response');
    } finally {
      setSubmitting(null);
    }
  };

  const handleReact = async (reviewId: string, reaction: 'like' | 'love') => {
    setReacting(reviewId);
    try {
      const updated = await reviewsApi.reactToReview(reviewId, reaction);
      setReviews(prev => prev.map(r => r._id === reviewId ? updated : r));
      toast.success('Reaction added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add reaction');
    } finally {
      setReacting(null);
    }
  };

  const handleEditReply = (review: Review) => {
    if (review.ownerReply) {
      setReplyTexts(prev => ({ ...prev, [review._id]: review.ownerReply!.text }));
      setEditingReply(review._id);
    }
  };

  const handleCancelReply = (reviewId: string) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
    setReplyingTo(null);
    setEditingReply(null);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredReviews = reviews
    .filter(review => {
      if (
        searchQuery &&
        !review.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;
      if (filterRating !== 'all' && review.rating !== filterRating) return false;
      if (filterStatus === 'replied' && !review.ownerReply?.text) return false;
      if (filterStatus === 'pending' && review.ownerReply?.text) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest': return b.rating - a.rating;
        case 'lowest': return a.rating - b.rating;
        default: return 0;
      }
    });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.ownerReply?.text).length,
    replied: reviews.filter(r => !!r.ownerReply?.text).length,
    averageRating: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
  <h1 className="text-4xl text-white mb-2">
    Customer Reviews
  </h1>

  <p className="text-gray-400">
    Manage and respond to customer feedback
  </p>
</div>
   <Button
  onClick={fetchReviews}
  // disabled={loading}
  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-5 rounded-[18px] flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-300"
>
  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
  Refresh
</Button>
      </div>

      {/* Trust Notice */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white mb-2">Review Policy &amp; Trust</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              <strong>Reviews cannot be deleted or removed.</strong> This policy ensures authenticity and
              builds trust with customers. All reviews on SPOT are genuine customer experiences.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              You can respond to reviews to address concerns. Responses can be edited within{' '}
              <strong>15 minutes</strong> of posting.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total, Icon: MessageSquare, color: 'text-cyan-400' },
          { label: 'Pending Replies', value: stats.pending, Icon: AlertCircle, color: 'text-orange-400' },
          { label: 'Replied', value: stats.replied, Icon: Check, color: 'text-green-400' },
          { label: 'Average Rating', value: stats.averageRating, Icon: Star, color: 'text-yellow-400' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-slate-900 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reviews by customer name or content..."
              className="pl-10 bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-[18px] border border-white/20 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <label className="text-white text-sm mb-2 block">Filter by Rating</label>
              <select
                value={filterRating}
                onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending Reply</option>
                <option value="replied">Replied</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-gray-400">Loading reviews…</p>
        </div>
      ) : error ? (
        <div className="bg-slate-900 rounded-2xl p-12 border border-red-500/20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-4">{error}</p>
          <Button onClick={fetchReviews} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-[18px]">
            Try Again
          </Button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No reviews found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review._id} className="bg-slate-900 rounded-2xl p-6 border border-white/10">

              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                    {review.userAvatar
                      ? <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                      : review.userName.charAt(0)
                    }
                  </div>
                  <div>
                    <h4 className="text-white mb-1">{review.userName}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${idx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {review.ownerReply?.text ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Replied</Badge>
                ) : (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pending</Badge>
                )}
              </div>

              {/* Comment */}
              <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {review.images.map((image, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(image)}
                      className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img src={image} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reaction Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleReact(review._id, 'like')}
                  disabled={reacting === review._id}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    review.ownerReaction === 'like'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'border-white/10 text-gray-400 hover:border-cyan-500/30 hover:text-cyan-400'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" /> Like
                </button>
                <button
                  onClick={() => handleReact(review._id, 'love')}
                  disabled={reacting === review._id}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    review.ownerReaction === 'love'
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-400'
                      : 'border-white/10 text-gray-400 hover:border-pink-500/30 hover:text-pink-400'
                  }`}
                >
                  <Heart className="w-4 h-4" /> Love
                </button>
              </div>

              {/* Owner Reply (view) */}
              {review.ownerReply?.text && editingReply !== review._id && (
                <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-cyan-500 mt-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 text-sm">Your Response</span>
                      <span className="text-gray-500 text-xs">• {formatDate(review.ownerReply.repliedAt)}</span>
                      {review.ownerReply.editedAt && (
                        <span className="text-gray-600 text-xs">(edited)</span>
                      )}
                    </div>
                    {canEditReply(review.ownerReply.repliedAt) && (
                      <Button
                        onClick={() => handleEditReply(review)}
                        size="sm"
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.ownerReply.text}</p>
                  {!canEditReply(review.ownerReply.repliedAt) && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Response can no longer be edited (15 minute window expired)
                    </p>
                  )}
                </div>
              )}

              {/* Reply / Edit Form */}
              {(replyingTo === review._id || editingReply === review._id) && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={replyTexts[review._id] || ''}
                    onChange={e => setReplyTexts(prev => ({ ...prev, [review._id]: e.target.value }))}
                    placeholder="Write your professional response..."
                    rows={4}
                    className="bg-slate-800/50 border-white/10 text-white resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        editingReply === review._id
                          ? handleUpdateReply(review._id)
                          : handleReplySubmit(review._id)
                      }
                      disabled={submitting === review._id}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 rounded-[18px] flex items-center gap-2"
                    >
                      {submitting === review._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Check className="w-4 h-4" />
                      }
                      {editingReply === review._id ? 'Update Response' : 'Post Response'}
                    </Button>
                    <Button
                      onClick={() => handleCancelReply(review._id)}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-[18px] border border-white/20 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {!review.ownerReply?.text && replyingTo !== review._id && (
                <div className="mt-4">
                  <Button
                    onClick={() => setReplyingTo(review._id)}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 rounded-[18px] flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Reply to Review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImage} alt="Review" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};
