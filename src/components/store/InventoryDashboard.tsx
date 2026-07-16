"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  PlusCircle,
  X,
  Save,
  Loader2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVendorProducts,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  type CatalogProduct,
} from "@/app/actions/products";
import { categories } from "@/assets/assets";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80";

export default function InventoryDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const loadProducts = () => {
    setLoading(true);
    getVendorProducts().then((result) => {
      if (result.success) {
        setProducts(result.products);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const openEdit = (product: CatalogProduct) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    startTransition(async () => {
      const result = await updateProduct({
        id: editingProduct.id,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        category: editForm.category,
        images: editingProduct.images,
      });

      if (result.success) {
        toast.success("Product updated successfully");
        setEditingProduct(null);
        loadProducts();
      } else {
        toast.error(result.error || "Failed to update product");
      }
    });
  };

  const handleDelete = (product: CatalogProduct) => {
    if (!confirm(`Delete "${product.name}" from your catalog?`)) return;

    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success("Product removed from inventory");
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        toast.error(result.error || "Failed to remove product");
      }
    });
  };

  const handleToggleStock = (productId: string) => {
    startTransition(async () => {
      const result = await toggleProductStock(productId);
      if (result.success && result.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? result.product! : p))
        );
        toast.success(result.inStock ? "Product marked in stock" : "Product marked out of stock");
      } else {
        toast.error(result.error ?? "Failed to update stock");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Manage catalog listings, stock levels, pricing, and product details
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPending && <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />}
          <Link
            href="/store/add-product"
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-extrabold text-slate-800">No products in your catalog</h2>
          <p className="text-xs text-slate-500">Add your first product to start selling on VendorHub.</p>
          <Link
            href="/store/add-product"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full"
          >
            Add First Product
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4 text-center">Price</th>
                  <th className="px-5 py-4 text-center">Stock</th>
                  <th className="px-5 py-4 text-center">Rating</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 border border-slate-200/60 rounded-xl overflow-hidden shrink-0">
                          <Image
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            src={product.images[0] || DEFAULT_IMAGE}
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">{product.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{product.category}</td>
                    <td className="px-5 py-4 text-center font-extrabold text-slate-800">
                      {currency}
                      {product.price}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors ${
                          product.inStock
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100"
                            : "text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100"
                        }`}
                      >
                        {product.inStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[9px] uppercase">{product.inStock ? `${product.stock} in stock` : "Out of stock"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-amber-600">{product.avgRating.toFixed(1)}★</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    <Image
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      src={product.images[0] || DEFAULT_IMAGE}
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-800 truncate">{product.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{product.category}</p>
                    <p className="text-sm font-black text-indigo-600 mt-1">
                      {currency}
                      {product.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-600">{product.avgRating.toFixed(1)}★ rating</span>
                  <button
                    onClick={() => handleToggleStock(product.id)}
                    className={`px-2.5 py-1 rounded-full font-bold ${
                      product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Sold Out"}
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 text-slate-600 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-full flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
