"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  HandCoins,
  Coins,
  Receipt,
  X,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  Loader2,
  Gamepad2,
  Gift,
  Award,
  RotateCw,
  ShoppingCart,
  PenSquare,
  ArrowLeft,
  Wallet,
  Landmark,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Types
interface Item {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  prices?: any[];
}

interface CartItem extends Item {
  quantity: number;
}

interface SpinResult {
  id: string;
  type: "item" | "thankyou" | "discount";
  itemId?: string | number;
  itemName?: string;
  message?: string;
  discountAmount?: number;
  timestamp: Date;
}

export default function PosPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [spinQuantity, setSpinQuantity] = useState<number>(0);
  const [spinResults, setSpinResults] = useState<SpinResult[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TELEBIRR" | "CBE"
  >("CASH");
  const [customTip, setCustomTip] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // Modal state for recording spin results
  const [isSpinModalOpen, setIsSpinModalOpen] = useState<boolean>(false);
  const [selectedPrizeType, setSelectedPrizeType] = useState<
    "item" | "thankyou" | "discount"
  >("item");
  const [selectedItemId, setSelectedItemId] = useState<string | number>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      // Map backend structure to local Item type
      const formatted = response.data.map((i: any) => ({
        ...i,
        name: i.name,
        sku: i.sku || "",
        price: Number(i.prices?.[0]?.price || 0),
        stock: Number(i.totalStock || 0),
        category: "General",
      }));
      setItems(formatted);
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  // Spin price constant
  const SPIN_PRICE = 30;

  // Filter items based on search AND stock availability
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Calculations
  const normalSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const spinTotalCharge = (spinQuantity + spinResults.length) * SPIN_PRICE;
  const subtotal = normalSubtotal + spinTotalCharge;
  const total = subtotal + tipAmount;
  const change = Math.max(0, paidAmount - total);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format money
  const formatMoney = (value: number) => `${value.toFixed(2)} ETB`;

  // Cart functions
  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity < 1) return null;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Spin functions
  const addSpin = () => {
    setSpinQuantity((prev) => prev + 1);
  };

  const removeSpin = () => {
    setSpinQuantity((prev) => Math.max(0, prev - 1));
  };

  // Open modal to record spin result
  const openSpinModal = () => {
    if (spinQuantity === 0) {
      alert("Add spins first!");
      return;
    }

    // Reset modal state
    setSelectedPrizeType("item");
    setSelectedItemId("");
    setCustomMessage("");
    setDiscountAmount(0);
    setIsSpinModalOpen(true);
  };

  // Save spin result from modal
  const saveSpinResult = () => {
    if (spinQuantity === 0) return;

    let result: SpinResult;

    if (selectedPrizeType === "item") {
      if (!selectedItemId) {
        alert("Select an item won");
        return;
      }
      const item = items.find((i) => String(i.id) === String(selectedItemId));
      if (!item) return;

      result = {
        id: Date.now().toString() + Math.random(),
        type: "item",
        itemId: item.id,
        itemName: item.name,
        timestamp: new Date(),
      };
    } else if (selectedPrizeType === "thankyou") {
      result = {
        id: Date.now().toString() + Math.random(),
        type: "thankyou",
        message: customMessage || "Thanks for playing!",
        timestamp: new Date(),
      };
    } else {
      // discount
      result = {
        id: Date.now().toString() + Math.random(),
        type: "discount",
        discountAmount: discountAmount || 10,
        message: `${discountAmount || 10} ETB discount on next purchase`,
        timestamp: new Date(),
      };
    }

    setSpinResults((prev) => [result, ...prev]);
    setSpinQuantity((prev) => prev - 1);
    setIsSpinModalOpen(false);
  };

  const deleteSpinResult = (id: string) => {
    setSpinResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearSpinResults = () => {
    setSpinResults([]);
  };

  // Clear all
  const clearAll = () => {
    setCart([]);
    setSpinQuantity(0);
    setSpinResults([]);
    setTipAmount(0);
    setPaidAmount(0);
    setCustomTip("");
  };

  // Tip functions
  const handleTipPreset = (amount: number) => {
    setTipAmount(amount);
    setCustomTip("");
  };

  const applyCustomTip = () => {
    const amount = parseFloat(customTip);
    if (!isNaN(amount) && amount >= 0) {
      setTipAmount(amount);
    }
  };

  const useChangeAsTip = () => {
    if (change > 0) {
      setTipAmount((prev) => prev + change);
      setCustomTip((tipAmount + change).toFixed(0));
      setPaidAmount(0);
    }
  };

  // Select item from dropdown
  const selectItem = (item: Item) => {
    addToCart(item);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Complete sale
  const handleCompleteSale = async () => {
    if (cart.length === 0 && spinQuantity === 0 && spinResults.length === 0) {
      alert("No items or spins in cart");
      return;
    }

    if (paidAmount < total - 0.01 && paidAmount > 0) {
      alert(`Customer owes ${(total - paidAmount).toFixed(2)} ETB`);
      return;
    }

    setProcessing(true);

    try {
      // 1. Process all Spin Results
      for (const result of spinResults) {
        await api.post("/sales/spin", {
          spinResult:
            result.type === "thankyou"
              ? result.message
              : result.type === "item"
                ? `Won: ${result.itemName}`
                : result.message,
          rewardItemId:
            result.type === "item" ? Number(result.itemId) : undefined,
          tipAmount: 0,
        });
      }

      // 2. Process remaining unplayed spins
      for (let i = 0; i < spinQuantity; i++) {
        await api.post("/sales/spin", {
          spinResult: "Purchased but not played",
          tipAmount: 0,
        });
      }

      // 3. Process main cart
      const itemsToBuy = cart.map((cartItem) => ({
        itemId: Number(cartItem.id),
        quantity: cartItem.quantity,
      }));

      if (itemsToBuy.length > 0 || tipAmount > 0) {
        const response = await api.post("/sales", {
          items: itemsToBuy,
          tipAmount: tipAmount,
          paymentMethod: paymentMethod,
        });
        setLastTransaction(response.data);
      } else {
        setLastTransaction({ id: "SPIN-ONLY" });
      }

      clearAll();
      setTimeout(() => setLastTransaction(null), 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Error completing sale. Check console for details.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-8 text-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Syncing Terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="mx-auto max-w-md p-4 pb-12">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-100 bg-white p-2 text-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                Limat <span className="text-indigo-600">POS</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {user?.name || "Operator"} · ETB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-2xl bg-white px-2 py-1 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2">
              <Gamepad2 className="h-3.5 w-3.5 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Spin & Shop
              </span>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="mb-6" ref={dropdownRef}>
          <div className="relative">
            <div
              className={cn(
                "flex items-center rounded-2xl border bg-white p-1 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800",
                isDropdownOpen
                  ? "ring-2 ring-indigo-600/20 border-indigo-600/30"
                  : "border-slate-100",
              )}
            >
              <Search className="ml-4 h-4 w-4 text-slate-300" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Find items to buy..."
                className="w-full bg-transparent px-3 py-3 text-sm font-bold outline-none placeholder:text-slate-300"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="mr-2 rounded-full p-1 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5 text-slate-300" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "mr-3 h-4 w-4 text-slate-300 transition-transform",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-xs font-bold">No items found</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectItem(item)}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{item.name}</p>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded-full text-slate-400">
                            {item.category || "General"}
                          </span>
                          <span
                            className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                              item.stock > 0
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-500",
                            )}
                          >
                            {item.stock > 0
                              ? `${item.stock} in stock`
                              : "Out of Stock"}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">
                          {item.price.toFixed(2)} ETB
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-slate-200" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spin Card */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                <RotateCw className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest">
                  Lucky Spin
                </h2>
                <p className="text-[10px] font-bold text-white/70">
                  Terminal recording mode
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={removeSpin}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[24px] text-center text-xl font-black tabular-nums">
                {spinQuantity}
              </span>
              <button
                onClick={addSpin}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                Entry Price
              </span>
              <span className="text-sm font-black">{SPIN_PRICE}.00 ETB</span>
            </div>
            <button
              onClick={openSpinModal}
              disabled={spinQuantity === 0}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-md transition-all active:scale-95",
                spinQuantity === 0 &&
                  "cursor-not-allowed opacity-50 shadow-none",
              )}
            >
              <PenSquare className="h-3.5 w-3.5" />
              Log Result
            </button>
          </div>
        </div>

        {/* Order Sheet */}
        <div className="bento-card mb-4 p-5 border-none shadow-sm bg-white dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Order Sheet
              </h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} ITEMS
            </span>
          </div>

          <div className="max-h-60 space-y-3 overflow-y-auto custom-scrollbar">
            {cart.length === 0 &&
            spinQuantity === 0 &&
            spinResults.length === 0 ? (
              <div className="py-10 text-center opacity-20">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Terminal Ready
                </p>
              </div>
            ) : (
              <>
                {/* Regular Items */}
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-lg bg-white border border-slate-100 p-1 dark:bg-slate-900 dark:border-slate-800">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {formatMoney(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">
                        {(item.price * item.quantity).toFixed(0)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Spin Results (Prizes) */}
                {spinResults.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                          Spin Prizes Logged
                        </span>
                      </div>
                      <button
                        onClick={clearSpinResults}
                        className="text-[8px] font-black uppercase text-slate-400 hover:text-rose-500"
                      >
                        Drop All
                      </button>
                    </div>
                    {spinResults.map((result) => (
                      <div
                        key={result.id}
                        className="mb-2 flex items-center justify-between rounded-xl bg-purple-50/50 p-2 dark:bg-purple-900/10 last:mb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-white p-2 border border-purple-100 dark:bg-slate-900 dark:border-purple-900/30">
                            {result.type === "item" ? (
                              <Gift className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                              {result.type === "item"
                                ? result.itemName
                                : result.type === "discount"
                                  ? `${result.discountAmount} ETB Discount`
                                  : result.message}
                            </p>
                            <span className="text-[8px] font-black uppercase text-purple-400">
                              {result.type === "item"
                                ? "Inventory Reward"
                                : "Participant Mark"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSpinResult(result.id)}
                          className="p-2 text-purple-300 hover:text-rose-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {(cart.length > 0 || spinQuantity > 0 || spinResults.length > 0) && (
            <button
              onClick={clearAll}
              className="mt-4 w-full rounded-xl border border-rose-50 bg-rose-50/30 py-2.5 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50/50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Totals & Tip */}
        <div className="space-y-4">
          <div className="bento-card p-5 border-none shadow-sm bg-white dark:bg-slate-900">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatMoney(normalSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>
                  Spins ({spinQuantity + spinResults.length} × {SPIN_PRICE})
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatMoney(spinTotalCharge)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Service Tip</span>
                <span className="font-bold text-indigo-600">
                  {formatMoney(tipAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest">
                  Total Amount
                </span>
                <span className="text-xl font-black tracking-tight">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            <div className="mb-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <HandCoins className="h-3 w-3" /> Quick Tip
              </p>
              <div className="flex gap-2 mb-3">
                {[0, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTipPreset(amount)}
                    className={cn(
                      "flex-1 rounded-xl py-3 text-xs font-bold transition-all border",
                      tipAmount === amount && !customTip
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-slate-400 border-slate-100 hover:border-indigo-100 dark:bg-slate-800 dark:border-slate-800",
                    )}
                  >
                    {amount === 0 ? "None" : `+${amount}`}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Custom amount..."
                  className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold outline-none focus:border-indigo-600 dark:bg-slate-800 dark:border-slate-800"
                />
                <button
                  onClick={applyCustomTip}
                  className="rounded-xl bg-slate-100 px-6 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Wallet className="h-3 w-3" /> Payment Method
            </p>
            <div className="flex gap-2">
              {[
                { id: "CASH", label: "Cash", icon: HandCoins },
                { id: "TELEBIRR", label: "Telebirr", icon: Smartphone },
                { id: "CBE", label: "CBE", icon: Landmark },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 rounded-xl py-4 border transition-all",
                    paymentMethod === method.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-400 border-slate-100 hover:border-indigo-100 dark:bg-slate-800 dark:border-slate-800",
                  )}
                >
                  <method.icon className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bento-card p-5 border-none shadow-sm bg-white dark:bg-slate-900">
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> Cash Received
              </label>
              <input
                type="number"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-100 bg-slate-100 px-4 py-5 text-3xl font-black outline-none focus:border-indigo-600 dark:bg-slate-800/50 dark:border-slate-800"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                Give Change
              </span>
              <span className="text-xl font-black text-indigo-600 tabular-nums">
                {formatMoney(change)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={useChangeAsTip}
                disabled={change <= 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  change > 0
                    ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm"
                    : "border-slate-50 bg-slate-50 text-slate-200 cursor-not-allowed",
                )}
              >
                <Coins className="h-3 w-3" /> Use Change
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={
                  processing ||
                  (cart.length === 0 &&
                    spinQuantity === 0 &&
                    spinResults.length === 0)
                }
                className={cn(
                  "flex-[1.8] flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-100",
                  processing ||
                    (cart.length === 0 &&
                      spinQuantity === 0 &&
                      spinResults.length === 0)
                    ? "bg-slate-100 text-slate-300 dark:bg-slate-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700",
                )}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Complete Sale
              </button>
            </div>
          </div>
        </div>

        {/* Spin Result Modal */}
        {isSpinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              ref={modalRef}
              className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Spin Result
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Capture the prize outcome
                  </p>
                </div>
                <button
                  onClick={() => setIsSpinModalOpen(false)}
                  className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Win Category
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedPrizeType("item")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                      selectedPrizeType === "item"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-400",
                    )}
                  >
                    <Gift className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase">
                      Item
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedPrizeType("thankyou")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                      selectedPrizeType === "thankyou"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-400",
                    )}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase">
                      Thanks
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedPrizeType("discount")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                      selectedPrizeType === "discount"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-400",
                    )}
                  >
                    <Coins className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase">
                      Coins
                    </span>
                  </button>
                </div>
              </div>

              {selectedPrizeType === "item" && (
                <div className="mb-8">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Select Won Item
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Search Inventory...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Stock: {item.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPrizeType === "thankyou" && (
                <div className="mb-8">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Message (Optional)
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Better luck next time!"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {selectedPrizeType === "discount" && (
                <div className="mb-8">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Coins Amount (ETB)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) =>
                      setDiscountAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 20"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-xl font-black outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={saveSpinResult}
                  className="w-full rounded-2xl bg-indigo-600 py-5 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  Record Result
                </button>
                <button
                  onClick={() => setIsSpinModalOpen(false)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast / Modal */}
        {lastTransaction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[3rem] bg-white dark:bg-slate-900 p-10 text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-800">
                Paid Out
              </h3>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Logged as TX-
                {lastTransaction.id.toString().slice(-6).toUpperCase()}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Receipt className="h-3 w-3" /> Total
                  </span>
                  <p className="text-lg font-black mt-1 text-slate-900">
                    {Number(lastTransaction.totalAmount || total).toFixed(0)}{" "}
                    ETB
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                  <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center justify-center gap-1">
                    <HandCoins className="h-3 w-3" /> Tip
                  </span>
                  <p className="text-lg font-black mt-1 text-indigo-600">
                    {Number(
                      lastTransaction.tipAmount || tipAmount || 0,
                    ).toFixed(0)}{" "}
                    ETB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLastTransaction(null)}
                className="mt-8 w-full rounded-2xl bg-slate-900 py-5 text-xs font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl active:scale-[0.98]"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
