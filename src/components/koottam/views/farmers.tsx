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

export function FarmersView() {
  const [farmers, setFarmers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Add Farmer Dialog State
  const [addOpen, setAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [village, setVillage] = React.useState("Madurai");
  const [crops, setCrops] = React.useState("tomato,onion,potato");
  const [preferredChannel, setPreferredChannel] = React.useState("WHATSAPP");
  const [saving, setSaving] = React.useState(false);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/farmers");
      const json = await res.json();
      if (json.farmers) setFarmers(json.farmers);
    } catch {
      toast.error("Failed to load farmer contacts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFarmers();
  }, []);

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          village,
          crops,
          preferredChannel,
          whatsappEnabled: true,
          smsEnabled: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Farmer ${json.farmer.name} added successfully!`);
        setAddOpen(false);
        setName("");
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

  return (
    <Panel>
      <SectionHeading
        title="Farmer Contact & Directory Management"
        subtitle="Manage verified farmer profiles, crop capabilities, and direct communication preferences"
        icon={<Sprout className="h-5 w-5 text-emerald-500" />}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1">
              <Plus className="h-4 w-4" /> Add Farmer
            </Button>
            <Button size="sm" variant="outline" onClick={fetchFarmers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <DataLabelBadge label="Actual" />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" /> Active Farmer Network
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {farmers.length} Registered Farmers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {farmers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No farmers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-xs text-muted-foreground uppercase">
                    <th className="p-3">Farmer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Crops Supplied</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">SMS</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {farmers.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        {f.name}
                        <span className="block text-[11px] font-normal text-muted-foreground">ID: {f.id}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">+{f.phone}</td>
                      <td className="p-3 text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {f.village}
                      </td>
                      <td className="p-3 text-xs">
                        <span className="capitalize">{f.crops}</span>
                      </td>
                      <td className="p-3">
                        {f.whatsappEnabled ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">Disabled</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {f.smsEnabled ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">Disabled</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={f.status === "Active" ? "bg-emerald-600" : "bg-zinc-500"}>
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD FARMER DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddFarmer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" /> Add New Farmer Contact
              </DialogTitle>
              <DialogDescription>
                Register a new verified farmer for crop demand procurement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Farmer Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location / Village</label>
                <input
                  type="text"
                  placeholder="e.g. Madurai"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Crops Supplied (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. tomato,onion,brinjal"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Preferred Communication</label>
                <select
                  value={preferredChannel}
                  onChange={(e) => setPreferredChannel(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="SMS">SMS Message</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
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
