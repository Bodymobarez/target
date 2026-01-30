import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Truck, Plus, Pencil, Trash2, Banknote, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type OrderRow = {
  id: string;
  customer: string;
  phone?: string;
  total: number;
  currency: string;
  status: string;
  rawStatus?: string;
  date: string;
  tracking: string | null;
  paidAt?: string | null;
  shippingAddress?: { address?: string; governorate?: string; phone?: string };
  items?: { productId: string; name: string; price: number; quantity: number }[];
  disbursement?: {
    id: string;
    warehouseName: string;
    warehouseCode: string;
    status: string;
    completedAt?: string | null;
  } | null;
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function apiStatusToRow(s: string): string {
  const map: Record<string, string> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "cancelled",
  };
  return map[s] ?? s.toLowerCase();
}

const initialOrders: OrderRow[] = [];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  processing: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-400",
  confirmed: "bg-green-500/20 text-green-700 dark:text-green-400",
};

const statusLabel: Record<string, string> = {
  pending: "admin.pending",
  processing: "admin.processing",
  shipped: "admin.shipped",
  delivered: "admin.delivered",
  cancelled: "admin.cancelled",
  confirmed: "admin.confirmed",
};

export default function AdminOrders() {
  const { t, formatPrice, formatPriceFromUsd } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [list, setList] = useState<OrderRow[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [disbursementOrderId, setDisbursementOrderId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [creatingDisbursement, setCreatingDisbursement] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    total: "",
    status: "pending",
    date: new Date().toISOString().slice(0, 10),
    tracking: "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/orders/all", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: OrderRow[]) => {
        setList(
          (Array.isArray(data) ? data : []).map((o: OrderRow & { rawStatus?: string; disbursement?: unknown }) => ({
            id: o.id,
            customer: o.customer,
            phone: o.phone,
            total: o.total,
            currency: o.currency ?? "EGP",
            status: apiStatusToRow(o.status),
            rawStatus: o.status,
            date: (o as { date?: string }).date?.slice(0, 10) ?? "",
            tracking: o.tracking ?? null,
            paidAt: (o as { paidAt?: string }).paidAt,
            shippingAddress: (o as { shippingAddress?: OrderRow["shippingAddress"] }).shippingAddress,
            items: (o as { items?: OrderRow["items"] }).items,
            disbursement: (o as { disbursement?: OrderRow["disbursement"] }).disbursement,
          }))
        );
      })
      .catch(() => setList(initialOrders))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = list.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({
      customer: "",
      total: "",
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      tracking: "",
    });
    setOpen(true);
  };

  const openEdit = (o: OrderRow) => {
    setEditingId(o.id);
    setForm({
      customer: o.customer,
      total: String(o.total),
      status: o.status,
      date: o.date,
      tracking: o.tracking ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(form.total) || 0;
    const tracking = form.tracking.trim() || null;
    if (editingId) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                customer: form.customer,
                total,
                status: form.status,
                date: form.date,
                tracking,
              }
            : item
        )
      );
    } else {
      const id = `ORD-${2840 + list.length + 1}`;
      setList((prev) => [
        ...prev,
        {
          id,
          customer: form.customer,
          total,
          status: form.status,
          date: form.date,
          tracking,
        },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((o) => o.id !== id));
    setDeleteId(null);
    if (viewOrder?.id === id) setViewOrder(null);
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!token) return;
    setMarkingPaidId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message ?? t("error"));
        return;
      }
      setList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed" as const, rawStatus: "CONFIRMED" } : o)));
      if (viewOrder?.id === orderId) setViewOrder((v) => (v ? { ...v, status: "confirmed" } : null));
      toast.success(data?.message ?? (t("admin.paidConfirmed") || "Payment confirmed."));
      if (data?.customerPhone) {
        toast.info((t("admin.notifyCustomerWhatsApp") || "Notify customer on WhatsApp:") + " " + data.customerPhone);
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setMarkingPaidId(null);
    }
  };

  const openDisbursement = (orderId: string) => {
    setDisbursementOrderId(orderId);
    setSelectedWarehouseId("");
    if (token) {
      fetch("/api/warehouses", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: { id: string; name: string; code: string }[]) => setWarehouses(Array.isArray(data) ? data : []))
        .catch(() => setWarehouses([]));
    }
  };

  const handleCreateDisbursement = async () => {
    if (!token || !disbursementOrderId || !selectedWarehouseId) return;
    setCreatingDisbursement(true);
    try {
      const res = await fetch("/api/disbursements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: disbursementOrderId, warehouseId: selectedWarehouseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message ?? t("error"));
        return;
      }
      toast.success(t("admin.disbursementCreated"));
      setDisbursementOrderId(null);
      fetch("/api/orders/all", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: (OrderRow & { status?: string; date?: string; paidAt?: string; disbursement?: OrderRow["disbursement"] })[]) => {
          setList(
            (Array.isArray(data) ? data : []).map((o) => ({
              id: o.id,
              customer: o.customer,
              phone: o.phone,
              total: o.total,
              currency: o.currency ?? "EGP",
              status: apiStatusToRow(o.status ?? o.rawStatus ?? ""),
              rawStatus: o.status ?? o.rawStatus,
              date: (o.date ?? "").toString().slice(0, 10),
              tracking: o.tracking ?? null,
              paidAt: o.paidAt,
              shippingAddress: o.shippingAddress,
              items: o.items,
              disbursement: o.disbursement,
            }))
          );
        });
    } catch {
      toast.error(t("error"));
    } finally {
      setCreatingDisbursement(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.orders")}</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchOrders")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={() => { openAdd(); setOpen(true); }}>
              <Plus className="w-4 h-4" />
              {t("admin.addOrder")}
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("admin.edit") : t("admin.addOrder")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t("admin.customer")}</Label>
                  <Input
                    value={form.customer}
                    onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("total")}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.total}
                      onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("admin.status")}</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {t(statusLabel[s] ?? s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("admin.date")}</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("admin.trackingNumber")}</Label>
                    <Input
                      value={form.tracking}
                      onChange={(e) => setForm((f) => ({ ...f, tracking: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit">{t("save")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="card-premium rounded-2xl overflow-x-auto min-w-0">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.orderId")}</TableHead>
              <TableHead>{t("admin.customer")}</TableHead>
              <TableHead>{t("admin.date")}</TableHead>
              <TableHead>{t("total")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead className="w-32">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t("admin.noOrders")}
                </TableCell>
              </TableRow>
            ) : (
            filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.currency === "EGP" ? formatPrice(order.total) : formatPriceFromUsd(order.total)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status] ?? "bg-secondary"}>
                    {statusLabel[order.status] ? t(statusLabel[order.status]) : order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("admin.view")}
                      onClick={() => setViewOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("admin.markPaid")}
                      disabled={markingPaidId === order.id || order.status === "delivered" || order.status === "confirmed"}
                      onClick={() => handleMarkPaid(order.id)}
                    >
                      <Banknote className="w-4 h-4" />
                    </Button>
                    {order.rawStatus === "CONFIRMED" && !order.disbursement && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("admin.sendToWarehouse")}
                        onClick={() => openDisbursement(order.id)}
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("admin.goToDelivery")}
                      onClick={() => navigate(`/admin/delivery?orderId=${order.id}`)}
                    >
                      <Truck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      title={t("admin.delete")}
                      onClick={() => setDeleteId(order.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View order dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.orderId")}: {viewOrder?.id}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="grid gap-3 py-2">
              <p><span className="font-medium">{t("admin.customer")}:</span> {viewOrder.customer}</p>
              {viewOrder.phone && (
                <p><span className="font-medium">{t("phone")}:</span> {viewOrder.phone}</p>
              )}
              {viewOrder.shippingAddress?.address && (
                <p><span className="font-medium">{t("checkout.address")}:</span> {viewOrder.shippingAddress.address}</p>
              )}
              {viewOrder.shippingAddress?.governorate && (
                <p><span className="font-medium">{t("checkout.governorate")}:</span> {viewOrder.shippingAddress.governorate}</p>
              )}
              <p><span className="font-medium">{t("admin.date")}:</span> {viewOrder.date}</p>
              <p><span className="font-medium">{t("total")}:</span> {viewOrder.currency === "EGP" ? formatPrice(viewOrder.total) : formatPriceFromUsd(viewOrder.total)}</p>
              <p>
                <span className="font-medium">{t("admin.status")}:</span>{" "}
                {statusLabel[viewOrder.status] ? t(statusLabel[viewOrder.status]) : viewOrder.status}
              </p>
              {viewOrder.disbursement && (
                <p>
                  <span className="font-medium">{t("admin.disbursement")}:</span>{" "}
                  {viewOrder.disbursement.warehouseName} ({viewOrder.disbursement.warehouseCode}) — {viewOrder.disbursement.status}
                </p>
              )}
              {viewOrder.items && viewOrder.items.length > 0 && (
                <div className="border-t pt-3 mt-2">
                  <p className="font-medium mb-2">{t("admin.items")}</p>
                  <ul className="text-sm space-y-1">
                    {viewOrder.items.map((item, i) => (
                      <li key={i}>{item.name} × {item.quantity}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewOrder.tracking && (
                <p><span className="font-medium">{t("admin.trackingNumber")}:</span> {viewOrder.tracking}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!disbursementOrderId} onOpenChange={() => !creatingDisbursement && setDisbursementOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.sendToWarehouse")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin.warehouse")}</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                <option value="">{t("admin.selectWarehouse")}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDisbursementOrderId(null)} disabled={creatingDisbursement}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCreateDisbursement} disabled={!selectedWarehouseId || creatingDisbursement}>
                {creatingDisbursement ? t("loading") : t("admin.createDisbursement")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
