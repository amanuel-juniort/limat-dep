"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Loader2,
  Edit3,
  MoreVertical,
  Activity,
} from "lucide-react";
import api from "@/lib/api";
import { Item } from "@/types/pos";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    initialQuantity: "0",
    totalStock: "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        sku: item.sku || "",
        price: item.prices?.[0]?.price.toString() || "",
        description: item.description || "",
        initialQuantity: "0",
        totalStock: (item.totalStock !== undefined
          ? item.totalStock
          : 0
        ).toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        sku: "",
        price: "",
        description: "",
        initialQuantity: "0",
        totalStock: "0",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let itemId = editingItem?.id;

      if (editingItem) {
        // Update item details
        await api.patch(`/items/${editingItem.id}`, {
          name: formData.name,
          sku: formData.sku.trim() || null,
          description: formData.description,
        });
      } else {
        // Create new item
        const itemRes = await api.post("/items", {
          name: formData.name,
          sku: formData.sku.trim() || null,
          description: formData.description,
          initialQuantity: Number(formData.initialQuantity),
        });
        itemId = itemRes.data.id;
      }

      // Update price if itemId exists
      if (itemId) {
        const currentPrice = editingItem?.prices?.[0]?.price;
        if (!editingItem || Number(formData.price) !== Number(currentPrice)) {
          await api.post("/prices", {
            itemId: itemId,
            price: Number(formData.price),
          });
        }

        // Set total stock if provided and changed
        if (
          editingItem &&
          formData.totalStock !== undefined &&
          Number(formData.totalStock) !== editingItem.totalStock
        ) {
          await api.post(`/items/${itemId}/set-stock`, {
            quantity: Number(formData.totalStock),
          });
        }
      }

      await fetchItems();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save item", error);
      alert("Error saving item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!editingItem) return;
    if (!confirm(`Are you sure you want to deactivate ${editingItem.name}?`))
      return;

    setIsSubmitting(true);
    try {
      await api.delete(`/items/${editingItem.id}`);
      await fetchItems();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete item", error);
      alert("Error deleting item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-zinc-50 overflow-x-hidden">
      <div className="mx-auto max-w-lg px-6 py-8 pb-12">
        <header className="mb-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all shadow-sm active:scale-95 dark:bg-slate-900 dark:border-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Inventory <span className="text-indigo-600">Stock</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Storage Management
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg active:scale-95 transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="bento-card overflow-hidden border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50 dark:bg-white/5 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Item
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenModal(item)}
                      className="group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                            <Package className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight mb-1">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-black text-indigo-600/50 uppercase">
                              {item.sku || "NO SKU"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-black tabular-nums",
                            (item.totalStock || 0) <= 5
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                              : "bg-slate-50 text-slate-600 dark:bg-slate-800",
                          )}
                        >
                          {item.totalStock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black tabular-nums">
                          {Number(item.prices?.[0]?.price || 0).toFixed(2)}{" "}
                          <span className="text-[10px] opacity-30">ETB</span>
                        </p>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                          Active
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bento-card p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 dark:bg-slate-900">
              <Activity className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-black tracking-tight">
              No Matches Found
            </h3>
            <p className="mt-2 text-xs text-slate-400 font-medium max-w-[200px] mx-auto">
              Zero results for "{searchQuery}".
            </p>
          </div>
        )}
      </div>

      {/* Indigo Stark Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/20 backdrop-blur-md sm:items-center p-4">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300 bento-card p-8 bg-white dark:bg-slate-950 border-none shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  {editingItem ? "Edit" : "New"}{" "}
                  <span className="text-indigo-600">Product</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {editingItem ? "Update existing stock" : "Add to catalog"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Product Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Arabica Roast"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-white/5 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    SKU Code
                  </label>
                  <input
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="SKU-001"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-white/5 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Unit Price (ETB)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-black tabular-nums outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-white/5 dark:border-slate-800"
                  />
                </div>
              </div>

              {editingItem ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Current Stock Level
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.totalStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalStock: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-black tabular-nums outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-white/5 dark:border-slate-800"
                    />
                    <div className="flex items-center px-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                      Unit(s)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.initialQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialQuantity: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-black tabular-nums outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-white/5 dark:border-slate-800"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {editingItem && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isSubmitting}
                    className="flex-1 rounded-2xl border border-slate-100 bg-white py-4 font-black text-rose-500 hover:bg-rose-50 transition-all active:scale-95 dark:bg-slate-900 dark:border-slate-800"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {editingItem ? "Update Item" : "Create Product"}
                      <Plus className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
