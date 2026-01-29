import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Search, PackageCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { EGYPT_SHIPPING_CARRIERS } from "@/data/egypt";

type DeliveryRow = {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt: string;
  deliveredAt: string | null;
};

const statusOptions = ["PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"] as const;

/** رقم طلب واحد لكل الخطوات (مبيعات + شحن) - شركات شحن مصرية */
const initialDeliveries: DeliveryRow[] = [
  {
    id: "1",
    orderId: "ORD-2847",
    carrier: "DHL Egypt",
    trackingNumber: "1Z999AA10123456784",
    status: "DELIVERED",
    shippedAt: "2025-01-21",
    deliveredAt: "2025-01-24",
  },
  {
    id: "2",
    orderId: "ORD-2846",
    carrier: "Bosta",
    trackingNumber: "1Z999AA10123456785",
    status: "IN_TRANSIT",
    shippedAt: "2025-01-25",
    deliveredAt: null,
  },
];

function generateTrackingNumber(): string {
  return "TRK-" + Date.now().toString(36).toUpperCase().slice(-8) + Math.random().toString(36).slice(2, 6).toUpperCase();
}

const statusKeys: Record<string, string> = {
  PENDING: "admin.pending",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "admin.processing",
  DELIVERED: "admin.delivered",
  FAILED: "Failed",
};

export default function AdminDelivery() {
  const { t, locale } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<DeliveryRow[]>(initialDeliveries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    orderId: "",
    carrierId: "",
    trackingNumber: "",
    status: "PENDING",
    shippedAt: "",
    deliveredAt: "",
  });

  /** عند القدوم من المبيعات بزر الشحن: فتح نموذج الشحن مع رقم الطلب + توليد رقم تتبع أوتوماتيك */
  useEffect(() => {
    if (!orderIdFromUrl) return;
    setForm({
      orderId: orderIdFromUrl,
      carrierId: "",
      trackingNumber: generateTrackingNumber(),
      status: "PENDING",
      shippedAt: new Date().toISOString().slice(0, 10),
      deliveredAt: "",
    });
    setEditingId(null);
    setOpen(true);
    setSearchParams({}); // مسح الـ query بعد الفتح لتفادي إعادة فتح عند إعادة الرندر
  }, [orderIdFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = (prefillOrderId?: string) => {
    setEditingId(null);
    setForm({
      orderId: prefillOrderId ?? "",
      carrierId: "",
      trackingNumber: generateTrackingNumber(),
      status: "PENDING",
      shippedAt: new Date().toISOString().slice(0, 10),
      deliveredAt: "",
    });
    setOpen(true);
  };

  const filtered = list.filter(
    (d) =>
      d.orderId.toLowerCase().includes(search.toLowerCase()) ||
      d.trackingNumber.includes(search)
  );

  const openEdit = (d: DeliveryRow) => {
    setEditingId(d.id);
    const carrierId =
      EGYPT_SHIPPING_CARRIERS.find(
        (c) => c.nameEn === d.carrier || c.nameAr === d.carrier
      )?.id ?? "other";
    setForm({
      orderId: d.orderId,
      carrierId,
      trackingNumber: d.trackingNumber,
      status: d.status,
      shippedAt: d.shippedAt,
      deliveredAt: d.deliveredAt ?? "",
    });
    setOpen(true);
  };

  const getCarrierDisplayName = (id: string) =>
    locale === "ar"
      ? EGYPT_SHIPPING_CARRIERS.find((c) => c.id === id)?.nameAr ?? id
      : EGYPT_SHIPPING_CARRIERS.find((c) => c.id === id)?.nameEn ?? id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const carrierName = getCarrierDisplayName(form.carrierId) || form.carrierId;
    if (editingId) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                orderId: form.orderId,
                carrier: carrierName,
                trackingNumber: form.trackingNumber,
                status: form.status,
                shippedAt: form.shippedAt,
                deliveredAt: form.deliveredAt || null,
              }
            : item
        )
      );
    } else {
      const id = `del-${Date.now()}`;
      setList((prev) => [
        ...prev,
        {
          id,
          orderId: form.orderId,
          carrier: carrierName,
          trackingNumber: form.trackingNumber,
          status: form.status,
          shippedAt: form.shippedAt,
          deliveredAt: form.deliveredAt || null,
        },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((d) => d.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.delivery")}</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.trackingNumber")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={() => { openAdd(); }}>
              <Plus className="w-4 h-4" />
              {t("admin.addDelivery")}
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("admin.edit") : t("admin.addDelivery")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t("admin.orderId")}</Label>
                  <Input
                    value={form.orderId}
                    onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                    placeholder="ORD-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.carrier")}</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.carrierId}
                    onChange={(e) => setForm((f) => ({ ...f, carrierId: e.target.value }))}
                    required
                  >
                    <option value="">{t("admin.selectCarrier")}</option>
                    {EGYPT_SHIPPING_CARRIERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.trackingNumber")}</Label>
                  <Input
                    value={form.trackingNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trackingNumber: e.target.value }))
                    }
                    placeholder="1234567890"
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
                        {t(statusKeys[s] ?? s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("admin.shippedAt")}</Label>
                    <Input
                      type="date"
                      value={form.shippedAt}
                      onChange={(e) => setForm((f) => ({ ...f, shippedAt: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("admin.deliveredAt")}</Label>
                    <Input
                      type="date"
                      value={form.deliveredAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, deliveredAt: e.target.value }))
                      }
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
              <TableHead>{t("admin.carrier")}</TableHead>
              <TableHead>{t("admin.trackingNumber")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.shippedAt")}</TableHead>
              <TableHead>{t("admin.deliveredAt")}</TableHead>
              <TableHead className="w-24">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono">{d.orderId}</TableCell>
                <TableCell>{d.carrier}</TableCell>
                <TableCell className="font-mono flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-muted-foreground" />
                  {d.trackingNumber}
                </TableCell>
                <TableCell>
                  <Badge variant={d.status === "DELIVERED" ? "default" : "secondary"}>
                    {t(statusKeys[d.status] ?? d.status)}
                  </Badge>
                </TableCell>
                <TableCell>{d.shippedAt}</TableCell>
                <TableCell>{d.deliveredAt ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
