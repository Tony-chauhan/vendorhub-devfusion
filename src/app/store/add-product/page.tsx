'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { assets } from '@/assets/assets';
import { getAIPriceSuggestions } from '@/app/actions/ai';
import { addProduct } from '@/app/actions/products';
import { categories } from '@/assets/assets';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

export default function StoreAddProduct() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [images, setImages] = useState<Record<number, File | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    mrp: '',
    price: '',
    category: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  // Triggers Gemini AI Pricing Advisor
  const triggerAiAdvisor = () => {
    if (!productInfo.name || !productInfo.category) {
      toast.error('Please enter a Product Name and Category first to activate the AI Advisor');
      return;
    }

    startTransition(async () => {
      try {
        const res = await getAIPriceSuggestions(
          productInfo.name,
          productInfo.category,
          productInfo.description
        );

        if (res?.success && res.data) {
          setAiSuggestions(res.data);
          toast.success('Gemini AI Pricing & Marketing Copy Advisor activated!');
        } else {
          toast.error('Failed to retrieve AI pricing suggestions.');
        }
      } catch (e) {
        console.error(e);
        toast.error('AI analysis encountered an error.');
      }
    });
  };

  // Apply suggestions from AI to inputs
  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;
    setProductInfo({
      ...productInfo,
      mrp: aiSuggestions.maxPrice.toString(),
      price: aiSuggestions.recommendedPrice.toString(),
      description: aiSuggestions.marketingCopy,
    });
    toast.success('AI Pricing and Marketing Copy applied successfully!');
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productInfo.name || !productInfo.category || !productInfo.price) {
      toast.error('Please fill in all required primary fields.');
      return;
    }

    startTransition(async () => {
      const imageUrls = Object.values(images)
        .filter((file): file is File => file !== null)
        .map(() => DEFAULT_IMAGE);

      const result = await addProduct({
        name: productInfo.name.trim(),
        description: productInfo.description.trim() || productInfo.name.trim(),
        price: parseFloat(productInfo.price),
        stock: 10,
        category: productInfo.category,
        images: imageUrls.length > 0 ? imageUrls : [DEFAULT_IMAGE],
      });

      if (result.success) {
        toast.success('Product added to inventory catalog');
        router.push('/store/manage-product');
      } else {
        toast.error(result.error ?? 'Product insertion failed.');
      }
    });
  };

  return (
    <div className="space-y-8 pb-24 max-w-2xl animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Add New Hyperlocal Product
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Insert new inventory catalog items with real-time merchant controls
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6 text-xs font-semibold text-slate-500">
        {/* Upload grids */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Showcase Galleries
          </span>
          <div className="grid grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((key) => (
              <label
                key={key}
                htmlFor={`images${key}`}
                className="aspect-square bg-white border border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-500/50 shadow-sm relative group"
              >
                {images[key] ? (
                  <Image
                    width={120}
                    height={120}
                    className="object-contain max-h-[85%] max-w-[85%] p-1"
                    src={URL.createObjectURL(images[key]!)}
                    alt=""
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1 text-slate-400 group-hover:text-indigo-650 transition-colors">
                    <Upload className="w-4.5 h-4.5" />
                    <span className="text-[9px] font-bold">Img {key}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id={`images${key}`}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImages({ ...images, [key]: e.target.files[0] });
                    }
                  }}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            onChange={onChangeHandler}
            value={productInfo.name}
            placeholder="e.g. Sony Over-Ear Premium Headphones"
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
            required
          />
        </div>

        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Category
          </label>
          <select
            name="category"
            onChange={onChangeHandler}
            value={productInfo.category}
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-semibold"
            required
          >
            <option value="">-- Choose Catalog Category --</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* AI Advisor Trigger Box */}
        <div className="bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border border-indigo-250/60 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black text-indigo-700 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>⚡ Gemini Curation pricing advisor</span>
            </div>
            <button
              type="button"
              onClick={triggerAiAdvisor}
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase rounded-full shadow-sm active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Activate Analysis</span>
              )}
            </button>
          </div>

          {aiSuggestions ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <p className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                    Min limit
                  </p>
                  <p className="text-sm font-black text-slate-800">${aiSuggestions.minPrice}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-[9px] text-indigo-650 font-bold block uppercase tracking-wider">
                    Ideal suggested
                  </p>
                  <p className="text-sm font-black text-indigo-750">${aiSuggestions.recommendedPrice}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <p className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                    Max ceiling
                  </p>
                  <p className="text-sm font-black text-slate-800">${aiSuggestions.maxPrice}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-550 leading-relaxed space-y-2 border-t border-slate-100 pt-3">
                <p className="font-semibold text-slate-700">
                  💡 Demand insight: {aiSuggestions.localMarketInsights}
                </p>
                <div className="p-3 bg-white border border-slate-150 rounded-2xl font-bold text-slate-600 italic">
                  "{aiSuggestions.marketingCopy}"
                </div>
              </div>

              <button
                type="button"
                onClick={applyAiSuggestions}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[10px] uppercase rounded-full cursor-pointer flex items-center justify-center space-x-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Gemini Pricing & Description copy</span>
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Enter product name and select a category, then click "Activate Analysis". Gemini AI will analyze the competitive hyperlocal market and suggest price parameters, a persuasive description copy, and SEO hashtags.
            </p>
          )}
        </div>

        {/* Pricing Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Manufacturer List Price (MRP $)
            </label>
            <input
              type="number"
              name="mrp"
              onChange={onChangeHandler}
              value={productInfo.mrp}
              placeholder="e.g. 299"
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Vendor Special Offer Price ($)
            </label>
            <input
              type="number"
              name="price"
              onChange={onChangeHandler}
              value={productInfo.price}
              placeholder="e.g. 199"
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Description
          </label>
          <textarea
            name="description"
            onChange={onChangeHandler}
            value={productInfo.description}
            placeholder="Describe product highlights and accessory parameters..."
            rows={5}
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4.5 h-4.5 text-emerald-450" />
          <span>Publish Catalog Item</span>
        </button>
      </form>
    </div>
  );
}
