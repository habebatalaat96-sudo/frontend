import React from 'react';
import { Star, ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';

const reviews = [
  {
    name: 'Sarah Johnson',
    rating: 5,
    date: '2 days ago',
    comment: 'Loved the facilities! Clean equipment and friendly staff. Highly recommend!',
    helpful: 12,
    hasResponse: false
  },
  {
    name: 'Michael Chen',
    rating: 4,
    date: '1 week ago',
    comment: 'Great gym overall. Equipment is top-notch. Gets crowded during peak hours.',
    helpful: 8,
    hasResponse: true,
    response: 'Thank you Michael! We\'re working on expanding our space for peak times.'
  }
];

export const ReviewResponseMockup: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-2xl max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl text-white mb-1">Customer Reviews</h3>
        <p className="text-gray-400 text-sm">Manage and respond to feedback</p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div 
            key={index}
            className="bg-slate-800/50 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">{review.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div className="text-white text-sm">{review.name}</div>
                  <div className="text-gray-400 text-xs">{review.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Review Content */}
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{review.comment}</p>

            {/* Review Actions */}
            <div className="flex items-center gap-4 mb-3">
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition-colors text-xs">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.helpful} helpful</span>
              </button>
            </div>

            {/* Business Response */}
            {review.hasResponse ? (
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-lg p-3 border border-cyan-500/20 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400 text-xs">Your Response</span>
                </div>
                <p className="text-gray-300 text-sm">{review.response}</p>
              </div>
            ) : (
              <div className="mt-3">
                <div className="bg-slate-700/50 rounded-lg border border-purple-500/30 overflow-hidden">
                  <textarea 
                    placeholder="Write a response..."
                    className="w-full bg-transparent text-white text-sm p-2.5 outline-none resize-none"
                    rows={2}
                    defaultValue=""
                  />
                  <div className="flex justify-end p-2 border-t border-white/10">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                      <Send className="w-3 h-3" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
