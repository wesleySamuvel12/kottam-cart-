"use client";

import * as React from "react";
import {
  MessageSquare,
  RefreshCw,
  Send,
  CheckCheck,
  AlertTriangle,
  ShoppingBag,
  UserCheck,
  ShieldCheck,
  Radio,
  Plus,
  Truck,
  PackageCheck,
  Clock,
  Trash2,
  Sparkles,
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
import { PRODUCTS, GROUPS } from "@/lib/koottam/data";
import { toast } from "sonner";

export function WhatsappView() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  // New WhatsApp Order Modal State
  const [isAddOrderOpen, setIsAddOrderOpen] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState(GROUPS[0]);
  const [orderItems, setOrderItems] = React.useState<{ productId: string; quantity: number }[]>([
    { productId: "tomato", quantity: 2 },
    { productId: "onion", quantity: 2 },
  ]);
  const [submittingOrder, setSubmittingOrder] = React.useState(false);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(null);

  const fetchWhatsAppAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/admin");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setOrders(data.orders || []);
        setStats(data.stats);
      }
    } catch {
      toast.error("Failed to load WhatsApp monitoring logs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWhatsAppAdminData();
    const interval = setInterval(fetchWhatsAppAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryMessage = async (messageId: string) => {
    setRetryingId(messageId);
    try {
      const res = await fetch("/api/whatsapp/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", messageId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("WhatsApp message re-sent successfully!");
        fetchWhatsAppAdminData();
      } else {
        toast.error(data.error || "Retry failed");
      }
    } catch {
      toast.error("Error retrying message");
    } finally {
      setRetryingId(null);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: "potato", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: "productId" | "quantity", value: any) => {
    const next = [...orderItems];
    if (field === "productId") {
      next[index].productId = value;
    } else {
      next[index].quantity = Math.max(0.5, parseFloat(value) || 1);
    }
    setOrderItems(next);
  };

  const calculateTotal = () => {
    let subtotal = 0;
    orderItems.forEach((item) => {
      const prod = PRODUCTS.find((p) => p.id === item.productId);
      if (prod) {
        subtotal += prod.sellPrice * (item.quantity || 1);
      }
    });
    const delivery = subtotal > 300 ? 0 : 25;
    return { subtotal, delivery, total: subtotal + delivery };
  };

  const handleCreateWhatsAppOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please enter customer name and 10-digit mobile number");
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/whatsapp/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          group: selectedGroup,
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`WhatsApp Order ${data.order.id} created successfully!`);
        setIsAddOrderOpen(false);
        setCustomerName("");
        setCustomerPhone("");
        setOrderItems([
          { productId: "tomato", quantity: 2 },
          { productId: "onion", quantity: 2 },
        ]);
        fetchWhatsAppAdminData();
      } else {
        toast.error(data.error || "Failed to create WhatsApp order");
      }
    } catch {
      toast.error("Error creating WhatsApp order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/whatsapp/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Order ${orderId} updated to ${status}`);
        fetchWhatsAppAdminData();
      } else {
        toast.error(data.error || "Failed to update order status");
      }
    } catch {
      toast.error("Error updating order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totals = calculateTotal();

  return (
    <Panel>
      <SectionHeading
        title="Admin WhatsApp Business Control & Monitoring"
        subtitle="Real-time message status, customer order placement, and dispatching operations"
        icon={<MessageSquare className="h-5 w-5 text-emerald-500" />}
        right={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
              onClick={() => setIsAddOrderOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add WhatsApp Order
            </Button>
            <Button size="sm" variant="outline" onClick={fetchWhatsAppAdminData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <DataLabelBadge label="Actual" />
          </div>
        }
      />

      {/* Webhook & Service Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase flex items-center justify-between">
              <span>Webhook Status</span>
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5" /> Active & Verified
            </div>
            <p className="text-xs text-muted-foreground mt-1">Meta Graph API v21.0 Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages ?? logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Processed by state engine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">WhatsApp Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalOrders ?? orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Live orders created in DB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Departing / Dispatched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "Departing" || o.status === "Dispatched").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orders in logistics transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Orders Created Via WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> Live Customer WhatsApp Orders
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {orders.length} Active Orders
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No WhatsApp orders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex flex-col lg:flex-row lg:items-center justify-between rounded-lg border p-4 gap-4 bg-card hover:border-muted-foreground/30 transition-all">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground">{o.id}</span>
                      <OrderStatusBadge status={o.status} />
                      <Badge variant="secondary" className="text-xs">
                        Payment: {o.paymentStatus}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Customer: <span className="font-semibold text-foreground">{o.customer?.name || "WhatsApp Customer"}</span> ({o.customerPhone}) • Group: {o.customer?.group || "General"}
                    </p>

                    <div className="text-xs text-foreground bg-muted/40 p-2 rounded border">
                      <span className="font-semibold text-muted-foreground">Items Ordered: </span>
                      {o.items?.map((i: any) => `${i.productName} (${i.quantity} ${i.unit})`).join(", ")}
                    </div>

                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Created: {new Date(o.createdAt).toLocaleTimeString()} • Pickup/Delivery: {o.pickupLocation}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">₹{o.totalAmount}</div>
                      <div className="text-[11px] text-muted-foreground">Subtotal: ₹{o.subtotal} {o.deliveryCharge > 0 ? `(+₹${o.deliveryCharge} delivery)` : "(Free delivery)"}</div>
                    </div>

                    {/* Order Departure & Dispatch Action Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {o.status === "Confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-300"
                          onClick={() => handleUpdateOrderStatus(o.id, "Cultivation Requested")}
                          disabled={updatingOrderId === o.id}
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> Cultivation Req
                        </Button>
                      )}

                      {o.status !== "Departing" && o.status !== "Dispatched" && o.status !== "Completed" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                          onClick={() => handleUpdateOrderStatus(o.id, "Departing")}
                          disabled={updatingOrderId === o.id}
                        >
                          <Truck className="h-3 w-3 mr-1" /> Mark Departing
                        </Button>
                      )}

                      {o.status === "Departing" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                          onClick={() => handleUpdateOrderStatus(o.id, "Dispatched")}
                          disabled={updatingOrderId === o.id}
                        >
                          <Truck className="h-3 w-3 mr-1" /> Confirm Dispatched
                        </Button>
                      )}

                      {o.status !== "Completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/40"
                          onClick={() => handleUpdateOrderStatus(o.id, "Completed")}
                          disabled={updatingOrderId === o.id}
                        >
                          <PackageCheck className="h-3 w-3 mr-1" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Audit Log & Message Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-500" /> WhatsApp Activity & Webhook Logs
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {logs.length} Recent Logs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No WhatsApp activity logs yet.</p>
          ) : (
            <div className="space-y-2.5">
              {logs.map((log) => {
                const isInbound = log.direction === "INBOUND";
                return (
                  <div
                    key={log.id || log.messageId}
                    className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isInbound ? "bg-muted/40" : "bg-emerald-500/5"
                    }`}
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={
                            isInbound
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          }
                        >
                          {isInbound ? "INBOUND" : "OUTBOUND"}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">+{log.phone}</span>
                        {log.customer?.name && (
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> {log.customer.name}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground whitespace-pre-line">{log.body}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">ID: {log.messageId}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <LogStatusBadge status={log.status} />
                      {log.status === "Failed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRetryMessage(log.messageId)}
                          disabled={retryingId === log.messageId}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${retryingId === log.messageId ? "animate-spin" : ""}`} />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: ADD CUSTOMER WHATSAPP ORDER */}
      <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <ShoppingBag className="h-5 w-5" /> Receive Customer Order via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Enter the incoming WhatsApp customer order details. This order will automatically update live demand and farmer crop requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meenakshi Sundaram"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Mobile Phone (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">SHG Group Location</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground">Ordered Produce Items</label>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-emerald-600 gap-1" onClick={handleAddItem}>
                  <Plus className="h-3 w-3" /> Add Crop
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => {
                  const currentProd = PRODUCTS.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="flex items-center gap-2 border p-2 rounded-lg bg-muted/30">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        className="flex-1 rounded border p-1.5 text-xs bg-background"
                      >
                        {PRODUCTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.ta}) — ₹{p.sellPrice}/{p.unit}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 w-28">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-16 rounded border p-1 text-xs text-center bg-background"
                        />
                        <span className="text-[11px] text-muted-foreground">{currentProd?.unit || "kg"}</span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Order Total:</span>
                <span className="text-xs text-muted-foreground">
                  Subtotal: ₹{totals.subtotal} • Delivery: {totals.delivery === 0 ? "FREE" : `₹${totals.delivery}`}
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-600">₹{totals.total}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWhatsAppOrder}
              disabled={submittingOrder}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              <Send className={`h-4 w-4 ${submittingOrder ? "animate-spin" : ""}`} />
              {submittingOrder ? "Creating..." : "Confirm & Save Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  if (status === "Departing") {
    return (
      <Badge className="bg-blue-600 text-white animate-pulse flex items-center gap-1">
        <Truck className="h-3 w-3" /> Departing
      </Badge>
    );
  }
  if (status === "Dispatched") {
    return (
      <Badge className="bg-indigo-600 text-white flex items-center gap-1">
        <Truck className="h-3 w-3" /> Dispatched
      </Badge>
    );
  }
  if (status === "Cultivation Requested") {
    return (
      <Badge className="bg-amber-500 text-white flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> Cultivation Req
      </Badge>
    );
  }
  if (status === "Completed") {
    return (
      <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950">
        <PackageCheck className="h-3 w-3 mr-1" /> Completed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
      {status}
    </Badge>
  );
}

function LogStatusBadge({ status }: { status: string }) {
  if (status === "Sent") {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Send className="h-3 w-3 mr-1" /> Sent
      </Badge>
    );
  }
  if (status === "Delivered") {
    return (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
        <CheckCheck className="h-3 w-3 mr-1" /> Delivered
      </Badge>
    );
  }
  if (status === "Read") {
    return (
      <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50 dark:bg-sky-950">
        <CheckCheck className="h-3 w-3 mr-1 text-sky-500" /> Read
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
