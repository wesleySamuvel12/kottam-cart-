"use client";

import * as React from "react";
import {
  ShoppingBag,
  Mic,
  Sparkles,
  IndianRupee,
  Utensils,
  Volume2,
  Square,
  Send,
  ChefHat,
  Plus,
  Minus,
  MessageSquare,
  ShoppingCart,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  PERSONAL_SHOPPING,
  PRODUCTS,
  getProduct,
  inr,
  Product,
} from "@/lib/koottam/data";
import {
  SectionHeading,
  DataLabelBadge,
  Panel,
  DemoNote,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Button,
} from "@/components/koottam/ui";
import {
  openWhatsAppOrder,
  getProductEmoji,
  CartItem,
} from "@/lib/koottam/whatsapp-link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ====================== PERSONAL SHOPPING & STOREFRONT AI ====================== */
export function ShoppingView() {
  // Storefront & Cart State
  const [quantities, setQuantities] = React.useState<Record<string, number>>({
    tomato: 2,
    onion: 1,
  });

  const [budget, setBudget] = React.useState(500);
  const [budgetBasket, setBudgetBasket] = React.useState<{ items: any[]; total: number; savings: number; note: string } | null>(null);
  const [loadingBudget, setLoadingBudget] = React.useState(false);

  const [meals, setMeals] = React.useState<any[] | null>(null);
  const [loadingMeals, setLoadingMeals] = React.useState(false);

  // Quantity Handlers
  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, parseFloat((current + delta).toFixed(1)));
      return { ...prev, [productId]: next };
    });
  };

  const handleSetExactQuantity = (productId: string, val: number) => {
    const next = Math.max(0, parseFloat(val.toFixed(1)) || 0);
    setQuantities((prev) => ({ ...prev, [productId]: next }));
  };

  // Get active cart items
  const getActiveCartItems = (): CartItem[] => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const prod = getProduct(id);
        return {
          productId: id,
          name: prod?.name || id,
          ta: prod?.ta,
          quantity: qty,
          unit: prod?.unit || "kg",
          price: prod?.sellPrice,
        };
      });
  };

  // Single Product WhatsApp Order Trigger
  const handleSingleProductWhatsAppOrder = (prod: Product) => {
    const qty = quantities[prod.id] || 1;
    if (qty <= 0) {
      toast.error("Please add at least one product before ordering.");
      return;
    }

    const item: CartItem = {
      productId: prod.id,
      name: prod.name,
      ta: prod.ta,
      quantity: qty,
      unit: prod.unit,
      price: prod.sellPrice,
    };

    const res = openWhatsAppOrder([item]);
    if (res.success) {
      toast.success(`Opening WhatsApp for ${prod.name} (${qty} ${prod.unit})!`, {
        description: "Review message in WhatsApp and tap SEND.",
      });
    } else {
      toast.error(res.error || "Please select a quantity > 0.");
    }
  };

  // Entire Cart WhatsApp Order Trigger
  const handleCartWhatsAppOrder = () => {
    const cartItems = getActiveCartItems();
    const res = openWhatsAppOrder(cartItems);

    if (res.success) {
      toast.success(`Opening WhatsApp for ${cartItems.length} cart items!`, {
        description: "Review your pre-filled cart in WhatsApp and tap SEND.",
      });
    } else {
      toast.error(res.error || "Please add at least one product before ordering.");
    }
  };

  // Predicted Basket WhatsApp Order Trigger
  const handlePredictedBasketWhatsAppOrder = () => {
    const items: CartItem[] = PERSONAL_SHOPPING.predictedBasket.map((it) => {
      const p = getProduct(it.productId)!;
      return {
        productId: it.productId,
        name: p.name,
        ta: p.ta,
        quantity: it.qty,
        unit: p.unit,
        price: p.sellPrice,
      };
    });

    const res = openWhatsAppOrder(items);
    if (res.success) {
      toast.success("Opening WhatsApp for Predicted Basket!");
    } else {
      toast.error(res.error || "Basket is empty.");
    }
  };

  // Budget Optimizer API Call
  const optimizeBudget = async () => {
    setLoadingBudget(true);
    try {
      const res = await fetch("/api/ai/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget }),
      });
      const data = await res.json();
      if (data.items) {
        setBudgetBasket(data);
        toast.success("Basket optimized", { description: `${data.items.length} items within ₹${budget}` });
      }
    } catch {
      toast.error("Could not optimize basket");
    } finally {
      setLoadingBudget(false);
    }
  };

  // Budget Basket WhatsApp Order Trigger
  const handleBudgetBasketWhatsAppOrder = () => {
    if (!budgetBasket || !budgetBasket.items) return;
    const items: CartItem[] = budgetBasket.items.map((it: any) => {
      const p = PRODUCTS.find((prod) => prod.name.toLowerCase() === it.name.toLowerCase()) || {
        id: it.name.toLowerCase(),
        name: it.name,
        ta: "",
        unit: it.unit || "kg",
        sellPrice: it.price,
      };
      return {
        productId: p.id,
        name: p.name,
        ta: p.ta,
        quantity: it.qty,
        unit: it.unit || "kg",
        price: it.price,
      };
    });

    const res = openWhatsAppOrder(items);
    if (res.success) {
      toast.success("Opening WhatsApp for Optimized Budget Basket!");
    } else {
      toast.error(res.error || "Basket is empty.");
    }
  };

  // AI Meal Planner Call
  const generateMeals = async (available: string[]) => {
    setLoadingMeals(true);
    try {
      const res = await fetch("/api/ai/meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      const data = await res.json();
      if (data.meals) setMeals(data.meals);
    } catch {
      toast.error("Could not generate meal ideas");
    } finally {
      setLoadingMeals(false);
    }
  };

  const activeCartItems = getActiveCartItems();
  const cartTotal = activeCartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <Panel>
      <SectionHeading
        title="Storefront & Personal Shopping AI"
        subtitle="Select fresh produce, order directly via WhatsApp, or let AI optimize your weekly basket"
        icon={<ShoppingBag className="h-5 w-5 text-emerald-500" />}
        right={<DataLabelBadge label="Predicted" />}
      />

      <DemoNote>
        Select produce items below and click <strong>Order via WhatsApp</strong>. Clicking opens WhatsApp with a dynamic, pre-filled message formatted for KottamCart WhatsApp ordering.
      </DemoNote>

      {/* Main Grid: Storefront Catalog + Cart Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Fresh Produce Catalog Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" /> Fresh Produce Storefront
                </span>
                <Badge variant="outline" className="text-xs font-normal">
                  {PRODUCTS.length} Fresh Items Available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRODUCTS.map((prod) => {
                  const qty = quantities[prod.id] || 0;
                  const emoji = getProductEmoji(prod.id, prod.name);
                  return (
                    <div
                      key={prod.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 bg-card",
                        qty > 0 ? "border-emerald-500/50 bg-emerald-500/5" : "hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-xl flex items-center justify-center shrink-0">
                            {emoji}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              {prod.name}
                              <span className="text-xs font-medium text-emerald-600">({prod.ta})</span>
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {prod.category} • Shelf life: {prod.shelfLifeDays} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-base text-emerald-600">{inr(prod.sellPrice)}</span>
                          <span className="text-[11px] text-muted-foreground block">/ {prod.unit}</span>
                        </div>
                      </div>

                      {/* Quantity Selector & WhatsApp Button */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Quantity:</span>
                          <div className="flex items-center gap-1.5 bg-background border rounded-lg p-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQuantityChange(prod.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={qty}
                              onChange={(e) => handleSetExactQuantity(prod.id, parseFloat(e.target.value) || 0)}
                              className="w-12 text-center text-xs font-bold bg-transparent focus:outline-none"
                            />
                            <span className="text-[11px] text-muted-foreground pr-1">{prod.unit}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQuantityChange(prod.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                          onClick={() => handleSingleProductWhatsAppOrder(prod)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 fill-current" />
                          Order {prod.name} via WhatsApp
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Cart Summary Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 border-emerald-500/40 shadow-lg bg-card sticky top-20">
            <CardHeader className="pb-3 border-b bg-emerald-500/5">
              <CardTitle className="text-base flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" /> Current Cart
                </span>
                <Badge className="bg-emerald-600 text-white font-bold">
                  {activeCartItems.length} Items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {activeCartItems.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium">Your cart is empty.</p>
                  <p className="text-xs text-muted-foreground">Select quantities on products to add items.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {activeCartItems.map((item) => {
                      const emoji = getProductEmoji(item.productId, item.name);
                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{emoji}</span>
                            <div>
                              <span className="font-bold text-foreground">{item.name}</span>
                              {item.ta && <span className="text-muted-foreground ml-1">({item.ta})</span>}
                              <p className="text-[11px] text-muted-foreground">
                                {item.quantity} {item.unit} × {inr(item.price || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-600 text-sm">
                              {inr((item.price || 0) * item.quantity)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleSetExactQuantity(item.productId, 0)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{inr(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Est. Delivery</span>
                      <span className="text-emerald-600 font-semibold">
                        {cartTotal > 300 ? "FREE" : "₹25"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t">
                      <span>Total Estimated</span>
                      <span className="text-emerald-600 text-base">{inr(cartTotal + (cartTotal > 300 ? 0 : 25))}</span>
                    </div>
                  </div>

                  {/* Order Entire Cart via WhatsApp Button */}
                  <Button
                    onClick={handleCartWhatsAppOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <MessageSquare className="h-5 w-5 fill-current" />
                    Order Entire Cart via WhatsApp
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* AI Predicted Basket & Budget Optimizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Predicted Basket */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" /> AI Predicted Household Basket
              </span>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
                onClick={handlePredictedBasketWhatsAppOrder}
              >
                <MessageSquare className="h-3.5 w-3.5 fill-current" /> Order via WhatsApp
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PERSONAL_SHOPPING.predictedBasket.map((item) => {
              const p = getProduct(item.productId)!;
              const emoji = getProductEmoji(item.productId, p.name);
              return (
                <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 text-lg">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">
                      {p.name} <span className="text-xs font-normal text-muted-foreground">({p.ta})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{item.qty} {p.unit}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">{inr(item.qty * p.sellPrice)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Budget Optimizer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" /> AI Budget Optimizer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Budget:</span>
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-sm font-bold">₹</span>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-20 rounded-md border bg-background px-2 py-1 text-xs text-center font-bold"
                />
              </div>
              <Button size="sm" onClick={optimizeBudget} disabled={loadingBudget} className="text-xs">
                {loadingBudget ? "Optimizing…" : "Optimize"}
              </Button>
            </div>

            {budgetBasket && (
              <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                {budgetBasket.items.map((it: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span>{it.name} × {it.qty} {it.unit}</span>
                    <span className="font-semibold">{inr(it.price)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Estimated total</span>
                  <span className="font-bold text-emerald-600">{inr(budgetBasket.total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600">Estimated savings</span>
                  <span className="font-bold text-emerald-600">{inr(budgetBasket.savings)}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 mt-2"
                  onClick={handleBudgetBasketWhatsAppOrder}
                >
                  <MessageSquare className="h-3.5 w-3.5 fill-current" /> Order Optimized Basket via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meal planner */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-4 w-4 text-emerald-600" /> AI Tamil Meal Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DemoNote>Uses your current basket contents to suggest Tamil-cuisine meals that minimize unused produce.</DemoNote>
          <Button variant="outline" size="sm" onClick={() => generateMeals(["Tomato", "Onion", "Brinjal", "Spinach"])} disabled={loadingMeals}>
            <ChefHat className="h-4 w-4 mr-1 text-emerald-600" /> {loadingMeals ? "Cooking up ideas…" : "Generate meals from my basket"}
          </Button>
          {meals && (
            <div className="grid gap-3 sm:grid-cols-3">
              {meals.map((m: any, i: number) => (
                <div key={i} className="rounded-lg border p-3 space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">{m.name}</p>
                    <Badge variant="outline" className="text-[10px]">{m.time}</Badge>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium">{m.ta}</p>
                  <div className="text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground">Uses:</p>
                    <p>{m.uses?.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Panel>
  );
}

/* ====================== VOICE ASSISTANT ====================== */
export function VoiceView() {
  const [recording, setRecording] = React.useState(false);
  const [mediaRec, setMediaRec] = React.useState<MediaRecorder | null>(null);
  const [transcription, setTranscription] = React.useState("");
  const [reply, setReply] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [typedInput, setTypedInput] = React.useState("");
  const chunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await sendVoice(blob);
      };
      rec.start();
      setMediaRec(rec);
      setRecording(true);
    } catch {
      toast.error("Microphone access denied. Type your question instead.");
    }
  };

  const stopRecording = () => {
    mediaRec?.stop();
    setRecording(false);
  };

  const sendVoice = async (audioBlob: Blob) => {
    setLoading(true);
    setTranscription("");
    setReply("");
    setAudioUrl("");
    try {
      const base64 = await blobToBase64(audioBlob);
      const res = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64.split(",")[1], speak: true }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscription(data.transcription || "");
      setReply(data.reply || "");
      if (data.audio) setAudioUrl(data.audio);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Voice AI failed");
    } finally {
      setLoading(false);
    }
  };

  const sendText = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setTranscription(text);
    setReply("");
    setAudioUrl("");
    try {
      const res = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speak: true }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReply(data.reply || "");
      if (data.audio) setAudioUrl(data.audio);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Voice AI failed");
    } finally {
      setLoading(false);
      setTypedInput("");
    }
  };

  const suggestions = [
    "நாளைக்கு காய்கறி வேண்டும்.",
    "What's the weather tomorrow in Madurai?",
    "நாளைக்கு எவ்வளவு தக்காளி கொண்டு வர வேண்டும்?",
    "How much tomato demand tomorrow?",
  ];

  return (
    <Panel>
      <SectionHeading
        title="AI Voice Assistant"
        subtitle="Tamil + English voice ordering & farming assistant"
        icon={<Mic className="h-5 w-5 text-emerald-500" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <DemoNote>
        Speak Tamil or English. The assistant uses speech-to-text (ASR), the Koottam AI orchestrator, and text-to-speech (TTS) to reply aloud. Mixed Tamil-English input is supported.
      </DemoNote>

      <Card>
        <CardContent className="p-6 flex flex-col items-center text-center">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className={cn(
              "relative flex h-24 w-24 items-center justify-center rounded-full transition-all",
              recording ? "bg-red-500 text-white" : "bg-emerald-600 text-white hover:scale-105",
              recording && "animate-pulse"
            )}
          >
            {recording ? <Square className="h-8 w-8" /> : <Mic className="h-10 w-10" />}
          </button>
          <p className="mt-4 text-sm font-bold">
            {loading ? "AI is thinking…" : recording ? "Listening… tap to stop" : "Tap to speak"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tamil · English · mixed</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText(typedInput)}
              placeholder="Type your question (Tamil or English)…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-xs"
              disabled={loading}
            />
            <Button size="icon" onClick={() => sendText(typedInput)} disabled={loading || !typedInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendText(s)}
                disabled={loading}
                className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(transcription || reply) && (
        <div className="space-y-3">
          {transcription && (
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">You said</p>
                <p className="text-sm font-medium">{transcription}</p>
              </CardContent>
            </Card>
          )}
          {reply && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Koottam AI</p>
                  {audioUrl && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => new Audio(audioUrl).play()}>
                      <Volume2 className="h-3.5 w-3.5 mr-1" /> Play voice
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Panel>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
