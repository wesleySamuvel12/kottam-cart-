"use client";

import * as React from "react";
import {
  TrendingUp,
  RefreshCw,
  Send,
  MessageSquare,
  Smartphone,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  FileEdit,
  Wheat,
} from "lucide-react";
import {
  SectionHeading,
  DataLabelBadge,
  Panel,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/components/koottam/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function DemandAnalysisView() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Dialog State Machine
  const [selectedCrop, setSelectedCrop] = React.useState<any>(null);
  const [step, setStep] = React.useState<"CHANNEL" | "FARMER" | "PREVIEW" | null>(null);

  const [channel, setChannel] = React.useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [farmers, setFarmers] = React.useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = React.useState<any>(null);
  const [aiMatch, setAiMatch] = React.useState<any>(null);
  const [messageText, setMessageText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [whyModalCrop, setWhyModalCrop] = React.useState<any>(null);

  const fetchDemandAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demand/analysis");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load demand analysis data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDemandAnalysis();
  }, []);

  const handleStartSendToFarmer = (crop: any) => {
    setSelectedCrop(crop);
    setStep("CHANNEL");
  };

  const handleSelectChannel = async (selectedChannel: "WHATSAPP" | "SMS") => {
    setChannel(selectedChannel);
    try {
      const res = await fetch(`/api/farmers?cropId=${selectedCrop.productId}&requiredKg=${selectedCrop.recommendedProcurement || 10}&channel=${selectedChannel}`);
      const json = await res.json();
      setFarmers(json.candidates || []);
      setAiMatch(json.bestMatch || null);
      if (json.bestMatch) {
        setSelectedFarmer(json.bestMatch);
      }
      setStep("FARMER");
    } catch {
      toast.error("Could not fetch farmers");
    }
  };

  const handleFarmerChosen = (farmer: any) => {
    setSelectedFarmer(farmer);
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const text = `🌾 *FARMER CROP REQUIREMENT*

Hello ${farmer.farmerName || farmer.name},

KottamCart requires the following crop supply for our community market:

📦 *${selectedCrop.cropName}* — ${selectedCrop.recommendedProcurement || 10} ${selectedCrop.unit}

📅 Required Date: ${dateStr}
📍 Delivery Location: Madurai Central Hub

Please reply to confirm your availability and price.

Regards,
KottamCart Operations Team 🌱`;

    setMessageText(text);
    setStep("PREVIEW");
  };

  const handleExecuteSend = async () => {
    if (!selectedFarmer || !messageText) return;
    setSending(true);

    try {
      const res = await fetch("/api/communication/send-farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: selectedFarmer.farmerId || selectedFarmer.id,
          channel,
          cropName: selectedCrop.cropName,
          quantity: selectedCrop.recommendedProcurement || 10,
          message: messageText,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Requirement sent to ${selectedFarmer.farmerName || selectedFarmer.name} via ${channel}!`);
        setStep(null);
        setSelectedCrop(null);
      } else {
        toast.error(json.error || "Sending failed");
      }
    } catch {
      toast.error("Failed to send message to farmer");
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel>
      <SectionHeading
        title="AI Demand Analysis & Farmer Requirement Dispatch"
        subtitle="Aggregates live customer orders, calculates crop shortages, and sends requirements to farmers"
        icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={fetchDemandAnalysis} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <DataLabelBadge label="Actual" />
          </div>
        }
      />

      {/* Today's Aggregated Demand Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed DB orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data?.totalCustomers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique active households</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Total Customer Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalDemandKg ?? 0} <span className="text-sm font-normal">kg</span></div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated produce required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Estimated Procurement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{data?.totalProcurementKg ?? 0} <span className="text-sm font-normal">kg</span></div>
            <p className="text-xs text-muted-foreground mt-1">Includes 15% safety buffer</p>
          </CardContent>
        </Card>
      </div>

      {/* Crop Analysis & Shortage Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-emerald-500" /> Crop Demand & Shortage Analysis
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {data?.crops?.length ?? 0} Crops Analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.crops || data.crops.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">Loading crop analysis...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-xs text-muted-foreground uppercase">
                    <th className="p-3">Crop</th>
                    <th className="p-3">Customer Demand</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Shortage</th>
                    <th className="p-3">Recommended Procurement</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.crops.map((crop: any) => (
                    <tr key={crop.productId} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{crop.cropName}</span>
                          <span className="text-xs text-muted-foreground">({crop.ta})</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{crop.customerDemand} {crop.unit}</td>
                      <td className="p-3 text-muted-foreground">{crop.availableStock} {crop.unit}</td>
                      <td className="p-3 font-semibold">
                        {crop.shortage > 0 ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> {crop.shortage} {crop.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-600">0 {crop.unit}</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-amber-600">
                        {crop.recommendedProcurement} {crop.unit}
                      </td>
                      <td className="p-3">
                        <PriorityBadge priority={crop.priority} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs gap-1"
                            onClick={() => setWhyModalCrop(crop)}
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-blue-500" /> Why?
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => handleStartSendToFarmer(crop)}
                          >
                            <Send className="h-3.5 w-3.5" /> Send to Farmer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WHY EXPLANATION MODAL */}
      {whyModalCrop && (
        <Dialog open={!!whyModalCrop} onOpenChange={() => setWhyModalCrop(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" /> AI Shortage Explanation — {whyModalCrop.cropName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 leading-relaxed">
                {whyModalCrop.explanation}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border rounded">
                  <span className="text-muted-foreground">Confirmed Orders:</span> <span className="font-bold">{whyModalCrop.customerDemand} {whyModalCrop.unit}</span>
                </div>
                <div className="p-2 border rounded">
                  <span className="text-muted-foreground">Safety Buffer:</span> <span className="font-bold">+15%</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWhyModalCrop(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* STEP 1: COMMUNICATION CHANNEL DIALOG */}
      <Dialog open={step === "CHANNEL"} onOpenChange={() => setStep(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Crop Requirement — {selectedCrop?.cropName}</DialogTitle>
            <DialogDescription>
              How would you like to contact the farmer for {selectedCrop?.recommendedProcurement || 10} {selectedCrop?.unit} of {selectedCrop?.cropName}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <button
              onClick={() => handleSelectChannel("WHATSAPP")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-foreground">🟢 WhatsApp</p>
                <p className="text-xs text-muted-foreground">Send through official WhatsApp Business API</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectChannel("SMS")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-left group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-foreground">💬 SMS Message</p>
                <p className="text-xs text-muted-foreground">Send through SMS Gateway provider</p>
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STEP 2: FARMER SELECTION DIALOG */}
      <Dialog open={step === "FARMER"} onOpenChange={() => setStep(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Farmer ({channel})</span>
              {aiMatch && (
                <Badge className="bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Recommended: {aiMatch.farmerName}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Choose an active farmer to supply {selectedCrop?.recommendedProcurement || 10} {selectedCrop?.unit} of {selectedCrop?.cropName}:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
            {farmers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">No active farmers available for {channel}.</p>
            ) : (
              farmers.map((f) => {
                const isBest = aiMatch?.farmerId === f.farmerId;
                return (
                  <div
                    key={f.farmerId || f.id}
                    onClick={() => handleFarmerChosen(f)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isBest ? "border-amber-500 bg-amber-500/10" : "hover:border-primary"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{f.farmerName || f.name}</span>
                        {isBest && <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-700">Best Match</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        +{f.phone} • Village: {f.village} • Reliability: {f.reliability}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Crops: {Array.isArray(f.crops) ? f.crops.join(", ") : f.crops}
                      </p>
                    </div>
                    <Button size="sm" variant={isBest ? "default" : "outline"} className="h-8">
                      Select
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("CHANNEL")}>Back</Button>
            <Button variant="outline" onClick={() => setStep(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STEP 3: MESSAGE PREVIEW & EDIT DIALOG */}
      <Dialog open={step === "PREVIEW"} onOpenChange={() => setStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-emerald-600" /> Preview & Edit Requirement Message
            </DialogTitle>
            <DialogDescription>
              Review the message before sending to <span className="font-semibold text-foreground">{selectedFarmer?.farmerName || selectedFarmer?.name}</span> via {channel}:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={8}
              className="w-full rounded-lg border p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("FARMER")}>Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(null)}>Cancel</Button>
              <Button
                onClick={handleExecuteSend}
                disabled={sending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
              >
                <Send className={`h-4 w-4 ${sending ? "animate-spin" : ""}`} />
                {sending ? "Sending..." : "Confirm & Send"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "HIGH") {
    return <Badge className="bg-red-500 text-white">HIGH</Badge>;
  }
  if (priority === "MEDIUM") {
    return <Badge className="bg-amber-500 text-white">MEDIUM</Badge>;
  }
  return <Badge variant="secondary" className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">LOW</Badge>;
}
