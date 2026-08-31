"use client";

import * as React from "react";
import { ShoppingBag, Mic, Sparkles, IndianRupee, Utensils, Volume2, Square, Send, ChefHat, Plus } from "lucide-react";
import {
  PERSONAL_SHOPPING,
  PRODUCTS,
  getProduct,
  inr,
} from "@/lib/koottam/data";
import {
  StatCard,
  InsightCard,
  SectionHeading,
  ConfidenceMeter,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ====================== PERSONAL SHOPPING AI (with Budget + Meal) ====================== */
export function ShoppingView() {
  const [budget, setBudget] = React.useState(500);
  const [budgetBasket, setBudgetBasket] = React.useState<{ items: any[]; total: number; savings: number; note: string } | null>(null);
  const [loadingBudget, setLoadingBudget] = React.useState(false);

  const [meals, setMeals] = React.useState<any[] | null>(null);
  const [loadingMeals, setLoadingMeals] = React.useState(false);

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

  return (
    <Panel>
      <SectionHeading
        title="Personal Shopping AI"
        subtitle="Predicts next order, optimizes budget, suggests Tamil meals"
        icon={<ShoppingBag className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />

      {/* Predicted basket */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Your Predicted Basket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PERSONAL_SHOPPING.predictedBasket.map((item) => {
            const p = getProduct(item.productId)!;
            return (
              <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">🥬</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{p.name} <span className="text-xs text-muted-foreground">{p.ta}</span></p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.qty} {p.unit}</p>
                  <p className="text-[11px] text-muted-foreground">{inr(item.qty * p.sellPrice)}</p>
                </div>
              </div>
            );
          })}
          <Button className="w-full" onClick={() => toast.success("Predicted basket added to cart")}>
            <Plus className="h-4 w-4" /> Add Predicted Basket
          </Button>
        </CardContent>
      </Card>

      {/* Budget optimizer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> Budget Optimizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">I have</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">₹</span>
              <input
                type="range"
                min={200}
                max={1500}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
            <Button size="sm" onClick={optimizeBudget} disabled={loadingBudget}>
              {loadingBudget ? "Optimizing…" : "Optimize Basket"}
            </Button>
          </div>
          {budgetBasket && (
            <div className="rounded-lg border p-3 space-y-2">
              {budgetBasket.items.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{it.name} × {it.qty} {it.unit}</span>
                  <span className="font-medium">{inr(it.price)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated total</span>
                <span className="font-bold">{inr(budgetBasket.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600">Estimated savings</span>
                <span className="font-bold text-emerald-600">{inr(budgetBasket.savings)}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={optimizeBudget}>Optimize Again</Button>
                <Button size="sm" onClick={() => toast.success("Basket added to cart")}>Add to Cart</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal planner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" /> AI Meal Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DemoNote>Uses your current basket contents to suggest Tamil-cuisine meals that minimize unused ingredients.</DemoNote>
          <Button variant="outline" size="sm" onClick={() => generateMeals(["Tomato", "Onion", "Brinjal", "Spinach"])} disabled={loadingMeals}>
            <ChefHat className="h-4 w-4" /> {loadingMeals ? "Cooking up ideas…" : "Generate meals from my basket"}
          </Button>
          {meals && (
            <div className="grid gap-3 sm:grid-cols-3">
              {meals.map((m: any, i: number) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{m.name}</p>
                    <Badge variant="outline" className="text-[10px]">{m.time}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.ta}</p>
                  <div className="text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground">Uses:</p>
                    <p>{m.uses?.join(", ")}</p>
                  </div>
                  {m.missing?.length > 0 && (
                    <div className="text-[11px]">
                      <p className="text-amber-700 dark:text-amber-300 font-medium">Missing:</p>
                      <p className="text-muted-foreground">{m.missing.join(", ")}</p>
                    </div>
                  )}
                  <Button size="sm" variant="ghost" className="w-full text-xs h-7" onClick={() => toast.success("Missing ingredients added to cart")}>
                    <Plus className="h-3 w-3" /> Add missing to cart
                  </Button>
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
        icon={<Mic className="h-5 w-5" />}
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
              recording ? "bg-red-500 text-white" : "bg-primary text-primary-foreground hover:scale-105",
              recording && "animate-pulse-ring"
            )}
          >
            {recording ? <Square className="h-8 w-8" /> : <Mic className="h-10 w-10" />}
          </button>
          <p className="mt-4 text-sm font-medium">
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
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
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
                <p className="text-sm">{transcription}</p>
              </CardContent>
            </Card>
          )}
          {reply && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Koottam AI</p>
                  {audioUrl && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => new Audio(audioUrl).play()}>
                      <Volume2 className="h-3.5 w-3.5" /> Play voice
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
