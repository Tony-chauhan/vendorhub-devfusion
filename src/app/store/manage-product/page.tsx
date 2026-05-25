'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { RefreshCw, Sliders, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { productDummyData } from '@/assets/assets';

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setProducts(productDummyData);
  }, []);

  const toggleStock = (productId: string) => {
    startTransition(async () => {
      // Simulate API call toggle
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const nextStock = !p.inStock;
            toast.success(`${p.name} status updated: ${nextStock ? 'In Stock' : 'Out of Stock'}`);
            return { ...p, inStock: nextStock };
          }
          return p;
        })
      );
    });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Manage Catalog Products
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit inventory listings, toggle stock status, and monitor parameters
          </p>
        </div>
        {isPending && <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />}
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm max-w-4xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 text-left">Product details</th>
              <th className="px-5 py-4 hidden md:table-cell">Description summary</th>
              <th className="px-5 py-4 text-center hidden md:table-cell">List Price</th>
              <th className="px-5 py-4 text-center">Offer Price</th>
              <th className="px-5 py-4 text-center">Stock status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-650">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-5 py-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200/60 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      width={32}
                      height={32}
                      className="object-contain max-h-[85%] max-w-[85%]"
                      src={product.images[0]}
                      alt=""
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-800">{product.name}</p>
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                      {product.category}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 max-w-xs truncate hidden md:table-cell text-slate-500 font-medium">
                  {product.description}
                </td>
                <td className="px-5 py-4 text-center hidden md:table-cell font-bold text-slate-400 line-through">
                  {currency}
                  {product.mrp}
                </td>
                <td className="px-5 py-4 text-center font-extrabold text-slate-800">
                  {currency}
                  {product.price}
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => toggleStock(product.id)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-colors ${
                      product.inStock
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100'
                        : 'text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100'
                    }`}
                  >
                    {product.inStock ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase tracking-wider">In Stock</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase tracking-wider">Sold Out</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
