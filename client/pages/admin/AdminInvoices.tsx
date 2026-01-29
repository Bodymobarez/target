import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Search, FileText, Plus, Pencil, Trash2 } from "lucide-react";
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

type InvoiceRow = {
  id: string;
  number: string;
  orderId: string;
  total: number;
  currency: string;
  status: string;
  date: string;
};

const statusOptions = ["DRAFT", "ISSUED", "PAID", "CANCELLED"] as const;

const initialInvoices: InvoiceRow[] = [
  {
    id: "1",
    number: "INV-2025-001",
    orderId: "ORD-001",
    total: 1299,
    currency: "USD",
    status: "ISSUED",
    date: "2025-01-22",
  },
  {
    id: "2",
    number: "INV-2025-002",
    orderId: "ORD-002",
    total: 2499,
    currency: "USD",
    status: "PAID",
    date: "2025-01-23",
  },
];

const statusKeys: Record<string, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PAID: "admin.delivered",
  CANCELLED: "admin.cancelled",
};

export default function AdminInvoices() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<InvoiceRow[]>(initialInvoices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    number: "",
    orderId: "",
    total: "",
    currency: "USD",
    status: "DRAFT",
    date: new Date().toISOString().slice(0, 10),
  });

  const filtered = list.filter(
    (i) =>
      i.number.toLowerCase().includes(search.toLowerCase()) ||
      i.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    const nextNum = list.length + 1;
    setForm({
      number: `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, "0")}`,
      orderId: "",
      total: "",
      currency: "USD",
      status: "DRAFT",
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (i: InvoiceRow) => {
    setEditingId(i.id);
    setForm({
      number: i.number,
      orderId: i.orderId,
      total: String(i.total),
      currency: i.currency,
      status: i.status,
      date: i.date,
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
                number: form.number,
                orderId: form.orderId,
                total,
                currency: form.currency,
                status: form.status,
                date: form.date,
              }
            : item
        )
      );
    } else {
      const id = `inv-${Date.now()}`;
      setList((prev) => [
        ...prev,
        {
          id,
          number: form.number,
          orderId: form.orderId,
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
    setList((prev) => prev.filter((i) => i.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.invoices")}</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchInvoices")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={() => { openAdd(); setOpen(true); }}>
              <Plus className="w-4 h-4" />
              {t("admin.addInvoice")}
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("admin.edit") : t("admin.addInvoice")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t("admin.invoiceNumber")}</Label>
                  <Input
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    placeholder="INV-2025-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.orderId")}</Label>
                  <Input
                    value={form.orderId}
                    onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                    placeholder="ORD-001"
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
              <TableHead>{t("admin.invoiceNumber")}</TableHead>
              <TableHead>{t("admin.orderId")}</TableHead>
              <TableHead>{t("admin.columnPrice")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.date")}</TableHead>
              <TableHead className="w-24">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {i.number}
                </TableCell>
                <TableCell>{i.orderId}</TableCell>
                <TableCell>
                  {i.currency} {i.total.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={i.status === "PAID" ? "default" : "secondary"}>
                    {t(statusKeys[i.status] ?? i.status)}
                  </Badge>
                </TableCell>
                <TableCell>{i.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(i.id)}
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
