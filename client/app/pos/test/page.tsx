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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

interface CartItem extends Item {
  quantity: number;
}

interface SpinResult {
  id: string;
  type: "item" | "thankyou" | "discount";
  itemId?: string;
  itemName?: string;
  message?: string;
  discountAmount?: number;
  timestamp: Date;
}

// Mock items
const MOCK_ITEMS: Item[] = [
  { id: "i1", name: "Matcha latte", price: 185, stock: 12, category: "Coffee" },
  { id: "i2", name: "Cold brew", price: 140, stock: 8, category: "Coffee" },
  { id: "i3", name: "Croissant", price: 95, stock: 15, category: "Pastry" },
  { id: "i4", name: "Brownie", price: 110, stock: 6, category: "Pastry" },
  { id: "i5", name: "Sandwich", price: 290, stock: 7, category: "Food" },
  { id: "i6", name: "Smoothie", price: 220, stock: 9, category: "Drinks" },
  { id: "i7", name: "Espresso", price: 70, stock: 20, category: "Coffee" },
  { id: "i8", name: "Cappuccino", price: 150, stock: 13, category: "Coffee" },
  { id: "i9", name: "Muffin", price: 85, stock: 18, category: "Pastry" },
  { id: "i10", name: "Bagel", price: 65, stock: 22, category: "Pastry" },
  { id: "i11", name: "Tea", price: 55, stock: 30, category: "Drinks" },
  {
    id: "i12",
    name: "Hot chocolate",
    price: 120,
    stock: 14,
    category: "Drinks",
  },
  { id: "i13", name: "Wrap", price: 245, stock: 8, category: "Food" },
  { id: "i14", name: "Salad", price: 180, stock: 10, category: "Food" },
  { id: "i15", name: "Cookie", price: 45, stock: 35, category: "Pastry" },
  { id: "i16", name: "Banana bread", price: 95, stock: 11, category: "Pastry" },
  { id: "i17", name: "Latte", price: 150, stock: 25, category: "Coffee" },
  { id: "i18", name: "Mocha", price: 165, stock: 17, category: "Coffee" },
  { id: "i19", name: "Iced coffee", price: 130, stock: 19, category: "Coffee" },
  { id: "i20", name: "Lemonade", price: 100, stock: 16, category: "Drinks" },
];

export default function MobilePosPage() {
  const [items] = useState<Item[]>(MOCK_ITEMS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [spinQuantity, setSpinQuantity] = useState<number>(0);
  const [spinResults, setSpinResults] = useState<SpinResult[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  // Modal state for recording spin results
  const [isSpinModalOpen, setIsSpinModalOpen] = useState<boolean>(false);
  const [currentSpinIndex, setCurrentSpinIndex] = useState<number>(0);
  const [selectedPrizeType, setSelectedPrizeType] = useState<
    "item" | "thankyou" | "discount"
  >("item");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Spin price constant
  const SPIN_PRICE = 30;

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculations
  const normalSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const spinSubtotal = spinQuantity * SPIN_PRICE;
  const subtotal = normalSubtotal + spinSubtotal;
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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        // Don't close modal when clicking outside - require explicit close
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
        if (existing.quantity < item.stock) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        } else {
          alert(`Only ${item.stock} left`);
          return prev;
        }
      }
      if (item.stock > 0) {
        return [...prev, { ...item, quantity: 1 }];
      }
      alert("Out of stock");
      return prev;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity < 1) return null;
            if (newQuantity > item.stock) {
              alert(`Only ${item.stock} available`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeFromCart = (id: string) => {
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
    setCurrentSpinIndex(spinResults.length);
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
      const item = items.find((i) => i.id === selectedItemId);
      if (!item) return;

      result = {
        id: Date.now().toString() + Math.random(),
        type: "item",
        itemId: item.id,
        itemName: item.name,
        timestamp: new Date(),
      };

      // Add the item to cart for free
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
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
    // Find the result to potentially remove the free item from cart
    const result = spinResults.find((r) => r.id === id);
    if (result?.type === "item" && result.itemId) {
      // Remove one quantity of that item from cart
      setCart((prev) => {
        const existing = prev.find((i) => i.id === result.itemId);
        if (existing && existing.quantity > 1) {
          return prev.map((i) =>
            i.id === result.itemId ? { ...i, quantity: i.quantity - 1 } : i,
          );
        } else {
          return prev.filter((i) => i.id !== result.itemId);
        }
      });
    }

    setSpinResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearSpinResults = () => {
    // Remove all free items from cart
    spinResults.forEach((result) => {
      if (result.type === "item" && result.itemId) {
        setCart((prev) => {
          const existing = prev.find((i) => i.id === result.itemId);
          if (existing && existing.quantity > 1) {
            return prev.map((i) =>
              i.id === result.itemId ? { ...i, quantity: i.quantity - 1 } : i,
            );
          } else {
            return prev.filter((i) => i.id !== result.itemId);
          }
        });
      }
    });
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
    } else {
      alert("Enter a valid tip amount");
    }
  };

  const useChangeAsTip = () => {
    if (change > 0) {
      setTipAmount((prev) => prev + change);
      setCustomTip((tipAmount + change).toFixed(0));
      setPaidAmount(0);
    } else {
      alert("No positive change to add as tip");
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

    if (paidAmount < total - 0.01) {
      alert(`Customer owes ${(total - paidAmount).toFixed(2)} ETB`);
      return;
    }

    setProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const transactionId = Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase();
      setLastTransaction(transactionId);

      // Log the transaction details
      console.log({
        type: "combined_sale",
        items: cart,
        spins_purchased: spinQuantity, // Remaining spins that weren't used
        spins_played: spinResults.length,
        spin_results: spinResults,
        tip: tipAmount,
        subtotal: subtotal,
        total: total,
        paid: paidAmount,
        change: change,
      });

      // Show summary
      alert(`
        ✅ Sale Complete!
        Items: ${cart.reduce((sum, i) => sum + i.quantity, 0)} items
        Spins: ${spinResults.length} played
        Total: ${formatMoney(total)}
        Change: ${formatMoney(change)}
      `);

      clearAll();

      setTimeout(() => setLastTransaction(null), 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Error completing sale");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100">
      <div className="mx-auto max-w-md p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">
              Limat <span className="text-indigo-600">POS</span>
            </h1>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Ethiopian Birr · ETB
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-2xl bg-white/80 px-2 py-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2">
              <Gamepad2 className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                Spin & Shop
              </span>
            </div>
          </div>
        </div>

        {/* Search/Dropdown - Always visible */}
        <div className="mb-4" ref={dropdownRef}>
          <div className="relative">
            <div
              className={cn(
                "flex items-center rounded-2xl border-2 bg-white/90 backdrop-blur-sm transition-all",
                isDropdownOpen
                  ? "border-indigo-500 shadow-lg"
                  : "border-transparent shadow-md",
              )}
            >
              <Search className="ml-4 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search items to buy..."
                className="w-full rounded-2xl bg-transparent px-3 py-4 text-base outline-none placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="mr-2 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "mr-4 h-5 w-5 text-gray-400 transition-transform",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </div>

            {/* Dropdown Results */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur-sm">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p>No items found</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectItem(item)}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-indigo-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {item.name}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-bold text-indigo-600">
                            {item.price} ETB
                          </span>
                          <span className="text-gray-400">•</span>
                          <span
                            className={cn(
                              "text-xs",
                              item.stock <= 3
                                ? "text-rose-500"
                                : "text-gray-500",
                            )}
                          >
                            {item.stock} left
                          </span>
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-indigo-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spin the Wheel Card - Always visible */}
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold">Spin the Wheel</h2>
                <p className="text-sm text-white/80">Record what they won!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={removeSpin}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[30px] text-center text-xl font-bold">
                {spinQuantity}
              </span>
              <button
                onClick={addSpin}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-white/80">{SPIN_PRICE} ETB per spin</p>
            <button
              onClick={openSpinModal}
              disabled={spinQuantity === 0}
              className={cn(
                "flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-indigo-600 shadow-lg transition-all",
                spinQuantity === 0 && "cursor-not-allowed opacity-50",
              )}
            >
              <PenSquare className="h-4 w-4" />
              Record Spin Result
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Cart Summary */}
          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-700">Current Order</h2>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
                {spinQuantity} spins left
              </span>
            </div>

            {/* Normal Items */}
            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex items-center justify-between rounded-2xl bg-gray-50/80 p-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-indigo-600">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.price} ETB each
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600">
                    {(item.price * item.quantity).toFixed(0)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            ))}

            {/* Spin Results - Display prizes won */}
            {spinResults.length > 0 && (
              <div className="mt-3 rounded-xl bg-purple-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-700">
                    <Award className="mr-1 inline h-4 w-4" />
                    Spins Results ({spinResults.length})
                  </span>
                  <button
                    onClick={clearSpinResults}
                    className="text-xs text-purple-500 hover:text-purple-700"
                  >
                    Clear All
                  </button>
                </div>
                {spinResults.map((result) => (
                  <div
                    key={result.id}
                    className="mb-1 flex items-center justify-between rounded-lg bg-white p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {result.type === "item" ? (
                        <>
                          <Gift className="h-4 w-4 text-green-500" />
                          <span>
                            🎉 Won: <strong>{result.itemName}</strong> (free!)
                          </span>
                        </>
                      ) : result.type === "discount" ? (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>🏷️ {result.discountAmount} ETB discount</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="text-gray-600">
                            {result.message}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSpinResult(result.id)}
                      className="rounded-full p-1 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cart.length === 0 &&
              spinQuantity === 0 &&
              spinResults.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">
                    Search items to buy or add spins to play!
                  </p>
                </div>
              )}

            {(cart.length > 0 ||
              spinQuantity > 0 ||
              spinResults.length > 0) && (
              <button
                onClick={clearAll}
                className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50/50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Totals Card */}
          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-xl backdrop-blur-md">
            <div className="space-y-2">
              {normalSubtotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-medium">
                    {formatMoney(normalSubtotal)}
                  </span>
                </div>
              )}
              {spinSubtotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>
                    Spins ({spinQuantity} × {SPIN_PRICE})
                  </span>
                  <span className="font-medium">
                    {formatMoney(spinSubtotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tip</span>
                <span className="font-medium">{formatMoney(tipAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Tip Card */}
          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-gray-700">
              <HandCoins className="h-5 w-5 text-indigo-600" />
              <h3 className="font-medium">Add Tip</h3>
            </div>

            <div className="mb-3 flex gap-2">
              {[0, 10, 20, 50].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleTipPreset(amount)}
                  className={cn(
                    "flex-1 rounded-xl border py-3 font-medium transition-all",
                    tipAmount === amount && !customTip
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {amount === 0 ? "No tip" : `${amount} ETB`}
                </button>
              ))}
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="number"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:border-indigo-500"
              />
              <button
                onClick={applyCustomTip}
                className="rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
              >
                Apply
              </button>
            </div>

            <button
              onClick={useChangeAsTip}
              disabled={change <= 0}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-medium transition-all",
                change > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400",
              )}
            >
              <Coins className="h-4 w-4" />
              Use change as tip {change > 0 && `(${formatMoney(change)})`}
            </button>
          </div>

          {/* Payment Card */}
          <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-gray-700">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <h3 className="font-medium">Payment</h3>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-600">
                Amount Paid
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-indigo-500"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
              <span className="font-medium text-indigo-700">Change</span>
              <span className="text-xl font-bold text-indigo-700">
                {formatMoney(change)}
              </span>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={
                processing ||
                (cart.length === 0 &&
                  spinQuantity === 0 &&
                  spinResults.length === 0)
              }
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white transition-all",
                processing ||
                  (cart.length === 0 &&
                    spinQuantity === 0 &&
                    spinResults.length === 0)
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-indigo-600 hover:bg-indigo-700",
              )}
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              Complete Sale
            </button>
          </div>
        </div>

        {/* Spin Result Modal */}
        {isSpinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              ref={modalRef}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Record Spin Result
                </h3>
                <button
                  onClick={() => setIsSpinModalOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  What did they win?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPrizeType("item")}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-sm font-medium transition-all",
                      selectedPrizeType === "item"
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700",
                    )}
                  >
                    <Gift className="mx-auto h-5 w-5" />
                    Item
                  </button>
                  <button
                    onClick={() => setSelectedPrizeType("thankyou")}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-sm font-medium transition-all",
                      selectedPrizeType === "thankyou"
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700",
                    )}
                  >
                    <Sparkles className="mx-auto h-5 w-5" />
                    Thank You
                  </button>
                  <button
                    onClick={() => setSelectedPrizeType("discount")}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-sm font-medium transition-all",
                      selectedPrizeType === "discount"
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700",
                    )}
                  >
                    <Coins className="mx-auto h-5 w-5" />
                    Discount
                  </button>
                </div>
              </div>

              {selectedPrizeType === "item" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select Item Won
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                  >
                    <option value="">Choose an item...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.price} ETB
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPrizeType === "thankyou" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Message (optional)
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g., Better luck next time!"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {selectedPrizeType === "discount" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Discount Amount (ETB)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) =>
                      setDiscountAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 10"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={saveSpinResult}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
                >
                  Save Result
                </button>
                <button
                  onClick={() => setIsSpinModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Toast */}
        {lastTransaction && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
            <Sparkles className="mr-1 inline h-4 w-4" />
            Transaction #{lastTransaction} completed
          </div>
        )}
      </div>
    </div>
  );
}
