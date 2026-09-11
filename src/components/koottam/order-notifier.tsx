"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShoppingBag, Bell, ArrowRight } from "lucide-react";

interface OrderNotifierProps {
  onNavigate?: (viewId: string) => void;
}

export function OrderNotifier({ onNavigate }: OrderNotifierProps) {
  const lastKnownOrderIdRef = React.useRef<string | null>(null);
  const isFirstRunRef = React.useRef<boolean>(true);

  // Play subtle notification audio chime using Web Audio API
  const playNotificationSound = React.useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay restrictions ignored silently
    }
  }, []);

  const checkNewOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/admin");
      const data = await res.json();

      if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
        const latestOrder = data.orders[0];

        // On initial page load, record the latest order ID without firing toast
        if (isFirstRunRef.current) {
          lastKnownOrderIdRef.current = latestOrder.id;
          isFirstRunRef.current = false;
          return;
        }

        // If a new order ID is detected
        if (latestOrder.id !== lastKnownOrderIdRef.current) {
          lastKnownOrderIdRef.current = latestOrder.id;
          playNotificationSound();

          const customerName = latestOrder.customer?.name || "WhatsApp Customer";
          const groupName = latestOrder.customer?.group || "General Group";
          const totalAmount = latestOrder.totalAmount;
          const itemsSummary = latestOrder.items
            ?.map((i: any) => `${i.productName} (${i.quantity}${i.unit})`)
            .join(", ");

          // Show prominent interactive notification toast
          toast.custom((t) => (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border-2 border-emerald-500 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    New Order: {latestOrder.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">₹{totalAmount}</span>
                </div>
                <p className="text-xs font-medium text-foreground/90 mt-0.5">
                  {customerName} • <span className="text-muted-foreground">{groupName}</span>
                </p>
                {itemsSummary && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Items: {itemsSummary}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                    Demand Analysis Updated
                  </span>
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                      if (onNavigate) onNavigate("whatsapp");
                    }}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    View Orders <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ), { duration: 8000 });
        }
      }
    } catch {
      // Ignore background poll errors
    }
  }, [onNavigate, playNotificationSound]);

  React.useEffect(() => {
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [checkNewOrders]);

  return null;
}
