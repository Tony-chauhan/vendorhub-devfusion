'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

interface RatingModalProps {
  productId: string;
  onClose: () => void;
}

export default function RatingModal({ productId, onClose }: RatingModalProps) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating between 1 and 5');
      return;
    }
    if (review.trim().length < 5) {
      toast.error('Please write a short review (minimum 5 characters)');
      return;
    }

    setIsSubmitting(true);

    const submissionPromise = new Promise((resolve) => {
      setTimeout(() => {
        // Dispatch to rating slice
        dispatch(
          addRating({
            id: `rat_${Date.now()}`,
            rating,
            review,
            productId,
            createdAt: new Date().toString(),
            user: {
              name: 'Dharmender Chauhan',
              image: '/assets/profile_pic1.jpg',
            },
          })
        );
        resolve(true);
      }, 1000);
    });

    toast.promise(submissionPromise, {
      loading: 'Saving your review...',
      success: () => {
        setIsSubmitting(false);
        onClose();
        return 'Review posted successfully!';
      },
      error: 'Failed to post review. Try again.',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm relative mx-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-extrabold text-slate-800 mb-2">Rate This Product</h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">
          Share your honest shopping experience with our community
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center space-x-2 py-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setRating(i + 1)}
                className="hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating > i ? 'text-amber-400 fill-amber-450' : 'text-slate-250'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Written Review
            </label>
            <textarea
              className="w-full p-3 text-xs bg-slate-50 border border-slate-250 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium resize-none placeholder:text-slate-400"
              placeholder="Tell us what you liked or disliked about this product..."
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 font-bold text-white bg-indigo-650 hover:bg-indigo-700 text-xs rounded-full shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
