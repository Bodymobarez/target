import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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

type PurchaseRow = {
  id: string;
  supplier: string;
  total: number;
  currency: string;
  status: string;
  date: string;
};

const statusOptions = ["PENDING", "ORDERED", "PARTIAL", "RECEIVED", "CANCELLED"] as const;

const initialPurchases: PurchaseRow[] = [
  {
    id: "PO-001",
    supplier: "Apple Inc.",
    total: 50000,
    currency: "USD",
    status: "RECEIVED",
    date: "2025-01-20",
  },
  {
    id: "PO-002",
    supplier: "Tech Distributors",
    total: 12000,
    currency: "USD",
    status: "PENDING",
    date: "2025-01-25",
  },
];

const statusKeys: Record<string, string> = {
  PENDING: "admin.pending",
  ORDERED: "Ordered",
  PARTIAL: "Partial",
  RECEIVED: "admin.delivered",
  CANCELLED: "admin.cancelled",
};

export default function AdminPurchases() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<PurchaseRow[]>(initialPurchases);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplier: "",
    total: "",
    currency: "USD",
    status: "PENDING",
    date: new Date().toISOString().slice(0, 10),
  });

  const filtered = list.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({
      supplier: "",
      total: "",
      currency: "USD",
      status: "PENDING",
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (p: PurchaseRow) => {
    setEditingId(p.id);
    setForm({
      supplier: p.supplier,
      total: String(p.total),
      currency: p.currency,
      status: p.status,
      date: p.date,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(form.total) || 0;
    if (editingId) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                supplier: form.supplier,
                total,
                currency: form.currency,
                status: form.status,
                date: form.date,
              }
            : item
        )
      );
    } else {
      const id = `PO-${String(list.length + 1).padStart(3, "0")}-${Date.now().toString(36).slice(-4)}`;
      setList((prev) => [
        ...prev,
        {
          id,
          supplier: form.supplier,
          total,
          currency: form.currency,
          status: form.status,
          date: form.date,
        },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.purchases")}</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchPurchases")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={() => { openAdd(); setOpen(true); }}>
              <Plus className="w-4 h-4" />
              {t("admin.addPurchase")}
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("admin.edit") : t("admin.addPurchase")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t("admin.supplier")}</Label>
                  <Input
                    value={form.supplier}
                    onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                    placeholder="Supplier name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("admin.total")}</Label>
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
                    <Label>{t("admin.columnPrice")}</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    >
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid gap-2">
                    <Label>{t("admin.date")}</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      required
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
              <TableHead>PO #</TableHead>
              <TableHead>{t("admin.supplier")}</TableHead>
              <TableHead>{t("admin.columnPrice")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.date")}</TableHead>
              <TableHead className="w-24">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-medium">{p.id}</TableCell>
                <TableCell>{p.supplier}</TableCell>
                <TableCell>
                  {p.currency} {p.total.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "RECEIVED" ? "default" : "secondary"}>
                    {t(statusKeys[p.status] ?? p.status)}
                  </Badge>
                </TableCell>
                <TableCell>{p.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(p.id)}
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
