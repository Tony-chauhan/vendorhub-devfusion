'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { Star, Sparkles, ShoppingCart, Percent, Globe, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { addToCart } from '@/lib/features/cart/cartSlice';
import { getAIRecommendations } from '@/app/actions/ai';
import { toggleWishlist, getWishlistedProductIds } from '@/app/actions/wishlist';
import Counter from './Counter';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    mrp: number;
    price: number;
    images: string[];
    category: string;
    rating?: { rating: number }[];
  };
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  // Redux items
  const cartItems = useSelector((state: { cart: { cartItems: Record<string, number> } }) => state.cart?.cartItems || {});
  const productsList = useSelector((state: { product: { list: ProductDetailsProps['product'][] } }) => state.product?.list || []);

  // Component local states
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [isWished, setIsWished] = useState(false);

  // Gemini recommendations state
  const [aiRecs, setAiRecs] = useState<{ message: string; products: ProductDetailsProps['product'][] } | null>(null);
  const [, startTransition] = useTransition();

  const productId = product.id;
  const inCart = !!cartItems[productId];

  // Sync main image when product changes
  useEffect(() => {
    setMainImage(product.images[0]);
  }, [product]);

  // Hydrate wishlist state for this product from the server
  useEffect(() => {
    getWishlistedProductIds().then((result) => {
      if (result.success) {
        setIsWished(result.productIds.includes(productId));
      }
    });
  }, [productId]);

  const handleToggleWishlist = () => {
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.success) {
        setIsWished(result.wishlisted);
        toast.success(result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
      } else {
        toast.error(result.error);
      }
    });
  };

  // Load Gemini recommendations
  useEffect(() => {
    startTransition(async () => {
      try {
        const rawRecs = productsList.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
        }));

        const res = await getAIRecommendations(
          product.id,
          product.name,
          product.category,
          rawRecs
        );

        if (res?.success && res.data) {
          // Resolve full product objects from the catalogue using recommendations IDs
          const resolvedProducts = res.data.recommendedProductIds
            .map((recId: string) => productsList.find((p) => p.id === recId))
            .filter(Boolean);

          setAiRecs({
            ...res.data,
            message: res.data.recommendationReason || res.data.luxuryMessage || "Based on this item, we recommend these.",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            products: resolvedProducts as any[],
          });
        }
      } catch (e) {
        console.error('Failed to get Gemini recommendations:', e);
      }
    });
  }, [product, productsList]);

  const handleAddToCart = () => {
    dispatch(addToCart({ productId }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddBundle = () => {
    if (!aiRecs || aiRecs.products.length === 0) return;

    // Add main product to cart if not in cart
    if (!inCart) {
      dispatch(addToCart({ productId }));
    }

    // Add all recommended products in bundle to cart
    aiRecs.products.forEach((p) => {
      if (!cartItems[p.id]) {
        dispatch(addToCart({ productId: p.id }));
      }
    });

    // Trigger fireworks confetti!
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#a855f7', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    toast.success('⚡ Gemini Curated Complementary Bundle added to cart!');
  };

  // Safe average rating calculation
  const totalReviews = product.rating?.length || 0;
  const averageRating =
    totalReviews > 0
      ? product.rating!.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / totalReviews
      : 5;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 my-8">
      {/* Left Column: Image Gallery */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 flex-1">
        {/* Thumbnails list */}
        <div className="flex sm:flex-col gap-3">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                mainImage === img ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
              }`}
            >
              <Image
                src={img}
                alt={`${product.name} Thumbnail ${idx + 1}`}
                width={60}
                height={60}
                className="object-contain max-h-[70%] max-w-[70%]"
              />
            </button>
          ))}
        </div>

        {/* Primary View */}
        <div className="flex-grow aspect-square bg-slate-100/70 border border-slate-200/50 rounded-3xl flex items-center justify-center overflow-hidden shadow-sm relative">
          <Image
            src={mainImage}
            alt={product.name}
            width={320}
            height={320}
            className="object-contain max-h-[75%] max-w-[75%] transition-transform duration-500 hover:scale-105"
            priority
          />
          <button
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/60 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition-all duration-300 cursor-pointer"
          >
            <Heart className={`w-4.5 h-4.5 ${isWished ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Right Column: Descriptions & Actions */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-full">
              {product.category}
            </span>
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-full">
              In Stock
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-0.5">
              {Array(5)
                .fill('')
                .map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4"
                    fill={averageRating >= idx + 1 ? '#F59E0B' : '#E2E8F0'}
                    color={averageRating >= idx + 1 ? '#F59E0B' : '#E2E8F0'}
                  />
                ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {averageRating.toFixed(1)} / 5.0
            </span>
            <span className="text-slate-350 text-xs">|</span>
            <span className="text-xs font-semibold text-slate-400">
              {totalReviews} Verified Customer Reviews
            </span>
          </div>
        </div>

        {/* Pricing block */}
        <div className="bg-slate-100/50 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">
                {currency}
                {product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {currency}
                  {product.mrp}
                </span>
              )}
            </div>
            {product.mrp > product.price && (
              <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold">
                <Percent className="w-3 h-3" />
                <span>Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}% Instantly</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Local Tax
            </span>
            <span className="text-xs font-extrabold text-slate-700">Included</span>
          </div>
        </div>

        {/* Order Counters & Shopping Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 pt-2">
          {inCart && (
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Quantity
              </span>
              <Counter productId={productId} />
            </div>
          )}

          <div className="flex-1 flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-8 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center space-x-2 border shadow-sm ${
                inCart
                  ? 'bg-slate-100 hover:bg-slate-150 border-slate-200 text-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-indigo-600/10'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{inCart ? 'Add Another to Cart' : 'Add to Shopping Cart'}</span>
            </button>

            {inCart && (
              <button
                onClick={() => router.push('/cart')}
                className="py-3 px-8 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center"
              >
                Checkout Now
              </button>
            )}
          </div>
        </div>

        {/* Standard features badge */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6 text-[10px] sm:text-xs text-slate-500">
          <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-150 rounded-2xl space-y-1 shadow-sm">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span className="font-extrabold text-slate-800">Free Delivery</span>
            <span className="text-[9px] text-slate-400">On all local orders</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-150 rounded-2xl space-y-1 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="font-extrabold text-slate-800">Secured Gateways</span>
            <span className="text-[9px] text-slate-400">100% encrypted checkout</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-150 rounded-2xl space-y-1 shadow-sm">
            <Award className="w-5 h-5 text-indigo-500" />
            <span className="font-extrabold text-slate-800">Premium Brands</span>
            <span className="text-[9px] text-slate-400">Fully vetted suppliers</span>
          </div>
        </div>

        {/* AI Curated complementary bundles drawer */}
        {aiRecs && aiRecs.products.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border border-indigo-200/60 rounded-3xl p-6 flex flex-col space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center space-x-2 text-xs font-black text-indigo-700 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>⚡ Gemini Curation: {(aiRecs as any).complementaryTitle || "Related Premium Items"}</span>
            </div>

            <div className="text-xs text-slate-500 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-700 italic">
                &quot;{(aiRecs as any).recommendationReason}&quot;
              </p>
              <p className="text-[10px] text-slate-400">
                {(aiRecs as any).luxuryMessage}
              </p>
            </div>

            {/* List recommended products with image/name */}
            <div className="flex flex-col space-y-2.5 pt-2">
              {aiRecs.products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 bg-white/70 border border-slate-150 rounded-2xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/50">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        width={30}
                        height={30}
                        className="object-contain max-h-[80%] max-w-[80%]"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-850 truncate max-w-[140px] sm:max-w-[200px]">
                        {p.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {p.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">
                      {currency}
                      {p.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddBundle}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] active:scale-95"
            >
              <span>Add Curation Bundle to Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
