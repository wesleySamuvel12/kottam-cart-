"use client";

import * as React from "react";
import {
  FileText,
  RefreshCw,
  MessageSquare,
  Smartphone,
  CheckCheck,
  Send,
  AlertTriangle,
  User,
  Sprout,
  Filter,
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
import { toast } from "sonner";

export function CommunicationHistoryView() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [recipientType, setRecipientType] = React.useState<"ALL" | "FARMER" | "CUSTOMER">("ALL");
  const [channel, setChannel] = React.useState<"ALL" | "WHATSAPP" | "SMS">("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        recipientType,
        channel,
        status: statusFilter,
      }).toString();

      const res = await fetch(`/api/communication/history?${query}`);
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load communication history");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [recipientType, channel, statusFilter]);

  // Combine & normalize logs
  const commLogs = (data?.communicationLogs || []).map((l: any) => ({
    id: l.id || l.messageId,
    recipientType: l.recipientType || "FARMER",
    recipientName: l.recipientName || l.farmer?.name || "Farmer",
    phone: l.phone,
    channel: l.channel || "WHATSAPP",
    purpose: l.purpose || "CROP_REQUIREMENT",
    body: l.body,
    status: l.status,
    createdAt: l.createdAt,
    messageId: l.messageId,
    error: l.error,
  }));

  const waLogs = (data?.whatsAppLogs || []).map((l: any) => ({
    id: l.id || l.messageId,
    recipientType: "CUSTOMER",
    recipientName: l.customer?.name || "Customer",
    phone: l.phone,
    channel: "WHATSAPP",
    purpose: l.direction === "INBOUND" ? "INCOMING_ORDER" : "ORDER_NOTIF",
    body: l.body,
    status: l.status,
    createdAt: l.createdAt,
    messageId: l.messageId,
    error: l.error,
  }));

  const allLogs = [...commLogs, ...waLogs]
    .filter((l) => recipientType === "ALL" || l.recipientType === recipientType)
    .filter((l) => channel === "ALL" || l.channel === channel)
    .filter((l) => statusFilter === "ALL" || l.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Panel>
      <SectionHeading
        title="Unified Communication History & Delivery Auditing"
        subtitle="Complete logs for Customer and Farmer communications across WhatsApp and SMS channels"
        icon={<FileText className="h-5 w-5 text-emerald-500" />}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={fetchHistory} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <DataLabelBadge label="Actual" />
          </div>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded audit events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Farmer Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {allLogs.filter((l) => l.recipientType === "FARMER").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Crop requirements sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Customer Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {allLogs.filter((l) => l.recipientType === "CUSTOMER").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inbound & outbound WhatsApp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">SMS Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {allLogs.filter((l) => l.channel === "SMS").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dispatched via SMS gateway</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-500" /> Filter Logs
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Recipient Type Tabs */}
              <div className="flex items-center rounded-lg border p-0.5 bg-muted/40">
                {(["ALL", "FARMER", "CUSTOMER"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setRecipientType(type)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      recipientType === type
                        ? "bg-background font-semibold shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "ALL" ? "All Recipient Types" : type}
                  </button>
                ))}
              </div>

              {/* Channel Filter */}
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="rounded-lg border px-2.5 py-1 text-xs outline-none bg-background cursor-pointer"
              >
                <option value="ALL">All Channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">No logs found matching selected filters.</p>
          ) : (
            <div className="space-y-2.5">
              {allLogs.map((log) => (
                <div
                  key={log.id || log.messageId}
                  className="p-3.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Recipient Type Badge */}
                      {log.recipientType === "FARMER" ? (
                        <Badge className="bg-amber-500 text-white flex items-center gap-1">
                          <Sprout className="h-3 w-3" /> FARMER
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-600 text-white flex items-center gap-1">
                          <User className="h-3 w-3" /> CUSTOMER
                        </Badge>
                      )}

                      {/* Channel Badge */}
                      <Badge variant="outline" className="text-xs">
                        {log.channel === "WHATSAPP" ? "🟢 WhatsApp" : "💬 SMS"}
                      </Badge>

                      <span className="font-semibold text-xs text-foreground">{log.recipientName}</span>
                      <span className="font-mono text-xs text-muted-foreground">+{log.phone}</span>

                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-foreground whitespace-pre-line">{log.body}</p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      ID: {log.messageId} {log.error ? `• Error: ${log.error}` : ""}
                    </p>
                  </div>

                  <div className="self-end md:self-center">
                    <DeliveryStatusBadge status={log.status} />
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

function DeliveryStatusBadge({ status }: { status: string }) {
  if (status === "Delivered") {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCheck className="h-3 w-3 mr-1" /> Delivered
      </Badge>
    );
  }
  if (status === "Sent") {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
        <Send className="h-3 w-3 mr-1" /> Sent
      </Badge>
    );
  }
  if (status === "Read") {
    return (
      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300">
        <CheckCheck className="h-3 w-3 mr-1 text-sky-500" /> Read
      </Badge>
    );
  }
  if (status === "Queued") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Queued
      </Badge>
    );
  }
  if (status === "Failed") {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" /> Failed
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}
