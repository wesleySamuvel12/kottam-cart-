"use client";

import * as React from "react";
import {
  Users,
  Plus,
  RefreshCw,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  XCircle,
  MapPin,
  Sprout,
  Send,
  Star,
  Search,
  Filter,
  Package,
  TrendingUp,
  ExternalLink,
  PhoneCall,
  Clock,
  ShieldCheck,
  Building2,
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
  StatCard,
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
import { generateFarmerRequirementMessage } from "@/lib/koottam/farmer-matcher";

export function FarmersView() {
  const [farmers, setFarmers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFallback, setIsFallback] = React.useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVillage, setSelectedVillage] = React.useState("ALL");
  const [selectedChannel, setSelectedChannel] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  // Add Farmer Dialog State
  const [addOpen, setAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [ta, setTa] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [village, setVillage] = React.useState("Madurai");
  const [crops, setCrops] = React.useState("tomato, onion, potato");
  const [preferredChannel, setPreferredChannel] = React.useState("WHATSAPP");
  const [capacityKg, setCapacityKg] = React.useState("150");
  const [distanceKm, setDistanceKm] = React.useState("10");
  const [rating, setRating] = React.useState("4.8");
  const [reliability, setReliability] = React.useState("95");
  const [saving, setSaving] = React.useState(false);

  // Requirement Message Modal State
  const [msgModalFarmer, setMsgModalFarmer] = React.useState<any | null>(null);
  const [reqCrop, setReqCrop] = React.useState("Tomato");
  const [reqQty, setReqQty] = React.useState(50);
  const [previewMsg, setPreviewMsg] = React.useState("");

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/farmers");
      const json = await res.json();
      if (json.farmers) {
        setFarmers(json.farmers);
        setIsFallback(Boolean(json.isFallback));
      }
    } catch {
      toast.error("Failed to load farmer contacts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFarmers();
  }, []);

  // Filtered farmers list
  const filteredFarmers = React.useMemo(() => {
    return farmers.filter((f) => {
      // Search query (Name, Tamil Name, Village, Phone, Crops)
      const q = searchQuery.toLowerCase().trim();
      const cropsStr = typeof f.crops === "string" ? f.crops : f.crops?.join(", ");
      const matchesSearch =
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.ta?.toLowerCase().includes(q) ||
        f.phone?.includes(q) ||
        f.village?.toLowerCase().includes(q) ||
        cropsStr?.toLowerCase().includes(q);

      // Village filter
      const matchesVillage =
        selectedVillage === "ALL" ||
        f.village?.toLowerCase().includes(selectedVillage.toLowerCase());

      // Preferred channel filter
      const matchesChannel =
        selectedChannel === "ALL" || f.preferredChannel === selectedChannel;

      // Status filter
      const matchesStatus =
        selectedStatus === "ALL" || f.status === selectedStatus;

      return matchesSearch && matchesVillage && matchesChannel && matchesStatus;
    });
  }, [farmers, searchQuery, selectedVillage, selectedChannel, selectedStatus]);

  // Network Aggregated Metrics
  const totalCapacity = React.useMemo(
    () => farmers.reduce((sum, f) => sum + (Number(f.capacityKg) || 0), 0),
    [farmers]
  );
  const avgReliability = React.useMemo(() => {
    if (farmers.length === 0) return 0;
    const total = farmers.reduce((sum, f) => sum + (Number(f.reliability) || 0), 0);
    return (total / farmers.length).toFixed(1);
  }, [farmers]);
  const avgDistance = React.useMemo(() => {
    if (farmers.length === 0) return 0;
    const total = farmers.reduce((sum, f) => sum + (Number(f.distanceKm) || 0), 0);
    return (total / farmers.length).toFixed(1);
  }, [farmers]);

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ta,
          phone,
          village,
          crops,
          preferredChannel,
          capacityKg: parseFloat(capacityKg) || 150,
          distanceKm: parseFloat(distanceKm) || 10,
          rating: parseFloat(rating) || 4.8,
          reliability: parseFloat(reliability) || 95,
          whatsappEnabled: true,
          smsEnabled: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Farmer ${json.farmer.name} added successfully!`);
        setAddOpen(false);
        setName("");
        setTa("");
        setPhone("");
        fetchFarmers();
      } else {
        toast.error(json.error || "Failed to add farmer");
      }
    } catch {
      toast.error("Error adding farmer");
    } finally {
      setSaving(false);
    }
  };

  const openRequirementModal = (farmer: any) => {
    setMsgModalFarmer(farmer);
    const defaultCrop = (typeof farmer.crops === "string" ? farmer.crops.split(",")[0] : farmer.crops?.[0]) || "Tomato";
    setReqCrop(defaultCrop.trim());
    setReqQty(50);
    const msg = generateFarmerRequirementMessage(farmer.name, defaultCrop.trim(), 50, "kg");
    setPreviewMsg(msg);
  };

  const updatePreviewMsg = (crop: string, qty: number) => {
    setReqCrop(crop);
    setReqQty(qty);
    if (msgModalFarmer) {
      const msg = generateFarmerRequirementMessage(msgModalFarmer.name, crop, qty, "kg");
      setPreviewMsg(msg);
    }
  };

  const sendWhatsAppDirect = (phoneNum: string, text: string) => {
    const cleanPhone = phoneNum.replace(/\D/g, "");
    const url = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <Panel>
      <SectionHeading
        title="Farmer Contact & Directory Management"
        subtitle="Manage verified farmer profiles, crop capabilities, procurement capacity, and direct communication"
        icon={<Sprout className="h-5 w-5 text-emerald-500" />}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm">
              <Plus className="h-4 w-4" /> Add Farmer
            </Button>
            <Button size="sm" variant="outline" onClick={fetchFarmers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <DataLabelBadge label="Actual" />
          </div>
        }
      />

      {/* TOP AGGREGATE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Farmers"
          value={farmers.length}
          sub={`${farmers.filter((f) => f.status === "Active").length} active in network`}
          icon={Users}
          accent="emerald"
          dataLabel="Actual"
        />
        <StatCard
          label="Total Supply Capacity"
          value={`${totalCapacity.toLocaleString("en-IN")} kg/day`}
          sub="Combined daily procurement pool"
          icon={Package}
          accent="teal"
          dataLabel="Estimated"
        />
        <StatCard
          label="Avg Reliability Rate"
          value={`${avgReliability}%`}
          sub="Fulfillment rating across hubs"
          icon={ShieldCheck}
          accent="gold"
          dataLabel="Actual"
        />
        <StatCard
          label="Avg Distance to Hub"
          value={`${avgDistance} km`}
          sub="Procurement route proximity"
          icon={MapPin}
          accent="violet"
          dataLabel="Actual"
        />
      </div>

      {/* SEARCH AND FILTER BAR */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, Tamil name, village, crop, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5 text-emerald-500" />
                <span>Filter:</span>
              </div>

              {/* Village Filter */}
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="text-xs rounded-md border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Villages</option>
                <option value="Madurai">Madurai Region</option>
                <option value="Dindigul">Dindigul Region</option>
                <option value="Alanganallur">Alanganallur</option>
                <option value="Melur">Melur</option>
                <option value="Vadipatti">Vadipatti</option>
                <option value="Usilampatti">Usilampatti</option>
                <option value="Thirumangalam">Thirumangalam</option>
                <option value="Oddanchatram">Oddanchatram</option>
              </select>

              {/* Channel Filter */}
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="text-xs rounded-md border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs rounded-md border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>

              {(searchQuery || selectedVillage !== "ALL" || selectedChannel !== "ALL" || selectedStatus !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedVillage("ALL");
                    setSelectedChannel("ALL");
                    setSelectedStatus("ALL");
                  }}
                  className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FARMERS DIRECTORY TABLE WITH ALL FIELDS */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" /> Active Farmer Directory & Capabilities
            </span>
            <div className="flex items-center gap-2">
              {isFallback && (
                <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                  Sample Data Mode
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-normal">
                {filteredFarmers.length} of {farmers.length} Farmers
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFarmers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-8 text-center">No farmers found matching filter criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/60 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="p-3">Farmer & Tamil Name</th>
                    <th className="p-3">Phone & Channel</th>
                    <th className="p-3">Village & Distance</th>
                    <th className="p-3">Crops Supplied</th>
                    <th className="p-3 text-right">Daily Capacity</th>
                    <th className="p-3 text-center">Reliability & Rating</th>
                    <th className="p-3 text-center">Channels</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFarmers.map((f) => {
                    const cropList =
                      typeof f.crops === "string"
                        ? f.crops.split(",").map((c: string) => c.trim())
                        : f.crops || [];

                    return (
                      <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                        {/* Farmer Name & Tamil Name */}
                        <td className="p-3 font-medium text-foreground min-w-[160px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm">{f.name}</span>
                            {f.ta && (
                              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-normal">
                                ({f.ta})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 font-mono">
                              ID: {f.id}
                            </Badge>
                            {f.rating && (
                              <span className="flex items-center text-[10px] text-amber-600 font-semibold">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-0.5" />
                                {f.rating}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone & Preferred Channel */}
                        <td className="p-3 font-mono text-muted-foreground min-w-[140px]">
                          <div className="flex items-center gap-1 font-semibold text-foreground">
                            +{f.phone}
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            {f.preferredChannel === "WHATSAPP" ? (
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5">
                                Preferred: WhatsApp
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-600 text-white text-[10px] py-0 px-1.5">
                                Preferred: SMS
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Village & Distance */}
                        <td className="p-3 text-muted-foreground min-w-[150px]">
                          <div className="flex items-center gap-1 text-foreground font-medium">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{f.village}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            📍 {f.distanceKm ?? 10} km from Central Hub
                          </span>
                        </td>

                        {/* Crops Supplied */}
                        <td className="p-3 min-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {cropList.map((crop: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="capitalize text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              >
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        {/* Daily Capacity */}
                        <td className="p-3 text-right font-semibold text-foreground min-w-[110px]">
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {f.capacityKg} kg
                          </div>
                          <span className="text-[10px] text-muted-foreground block font-normal">
                            per day
                          </span>
                        </td>

                        {/* Reliability & Rating */}
                        <td className="p-3 text-center min-w-[130px]">
                          <div className="flex items-center justify-center gap-1 font-semibold text-xs">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{f.reliability}%</span>
                          </div>
                          <div className="w-20 mx-auto bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, f.reliability)}%` }}
                            />
                          </div>
                        </td>

                        {/* Channels */}
                        <td className="p-3 text-center min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            {f.whatsappEnabled ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] py-0 px-1.5"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> WhatsApp
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground text-[10px] py-0 px-1.5">
                                <XCircle className="h-3 w-3 mr-1" /> WhatsApp
                              </Badge>
                            )}

                            {f.smsEnabled ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] py-0 px-1.5"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> SMS
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground text-[10px] py-0 px-1.5">
                                <XCircle className="h-3 w-3 mr-1" /> SMS
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center min-w-[90px]">
                          <Badge className={f.status === "Active" ? "bg-emerald-600" : "bg-zinc-500"}>
                            {f.status}
                          </Badge>
                          {f.lastOrderDays !== undefined && (
                            <span className="text-[10px] text-muted-foreground block mt-1">
                              {f.lastOrderDays === 0 ? "Today" : `${f.lastOrderDays}d ago`}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right min-w-[130px]">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRequirementModal(f)}
                              className="h-7 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 gap-1 px-2"
                            >
                              <Send className="h-3 w-3 text-emerald-600" /> WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                sendWhatsAppDirect(
                                  f.phone,
                                  `Hello ${f.name}, greetings from KottamCart! We have a crop procurement request for your farm.`
                                )
                              }
                              className="h-7 w-7 p-0"
                              title="Direct WhatsApp link"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WHATSAPP REQUIREMENT QUICK DISPATCH MODAL */}
      <Dialog open={Boolean(msgModalFarmer)} onOpenChange={(open) => !open && setMsgModalFarmer(null)}>
        <DialogContent className="max-w-md">
          {msgModalFarmer && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600">
                  <MessageSquare className="h-5 w-5" /> Send WhatsApp Requirement
                </DialogTitle>
                <DialogDescription>
                  Send formatted crop procurement message to <strong>{msgModalFarmer.name}</strong> (+{msgModalFarmer.phone})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Select Crop *</label>
                    <select
                      value={reqCrop}
                      onChange={(e) => updatePreviewMsg(e.target.value, reqQty)}
                      className="w-full rounded-md border p-2 text-xs bg-background focus:ring-2 focus:ring-primary capitalize"
                    >
                      {(typeof msgModalFarmer.crops === "string"
                        ? msgModalFarmer.crops.split(",")
                        : msgModalFarmer.crops || ["Tomato"]
                      ).map((c: string, idx: number) => (
                        <option key={idx} value={c.trim()}>
                          {c.trim()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Required Quantity (kg) *</label>
                    <input
                      type="number"
                      value={reqQty}
                      onChange={(e) => updatePreviewMsg(reqCrop, parseFloat(e.target.value) || 10)}
                      className="w-full rounded-md border p-2 text-xs bg-background focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Generated WhatsApp Message Preview</label>
                  <textarea
                    readOnly
                    rows={6}
                    value={previewMsg}
                    className="w-full rounded-md border p-2.5 text-xs font-mono bg-muted/60 text-foreground resize-none leading-relaxed"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setMsgModalFarmer(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    sendWhatsAppDirect(msgModalFarmer.phone, previewMsg);
                    toast.success(`Requirement sent to ${msgModalFarmer.name}!`);
                    setMsgModalFarmer(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                >
                  <Send className="h-4 w-4" /> Open WhatsApp & Send
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD FARMER DIALOG - WITH ALL FIELDS */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddFarmer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" /> Add New Farmer Contact
              </DialogTitle>
              <DialogDescription>
                Register a new verified farmer with complete operational capabilities & fields.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Farmer Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Tamil Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ரமேஷ் குமார்"
                    value={ta}
                    onChange={(e) => setTa(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 9876543201"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Location / Village *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Alanganallur, Madurai"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Crops Supplied (comma separated) *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. tomato, brinjal, bhindi"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Preferred Communication</label>
                  <select
                    value={preferredChannel}
                    onChange={(e) => setPreferredChannel(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="WHATSAPP">WhatsApp Business</option>
                    <option value="SMS">SMS Message</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Capacity (kg) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 160"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Distance (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.8"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Reliability (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 96"
                    value={reliability}
                    onChange={(e) => setReliability(e.target.value)}
                    className="w-full rounded-md border p-2 text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {saving ? "Saving..." : "Save Farmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
