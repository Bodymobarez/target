import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Warehouse as WarehouseIcon, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

type WarehouseRow = { id: string; name: string; code: string; address?: string; isActive: boolean };

export default function AdminWarehouses() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [list, setList] = useState<WarehouseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", address: "" });

  const fetchList = () => {
    if (!token) return;
    fetch("/api/warehouses", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WarehouseRow[]) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", code: "", address: "" });
    setOpen(true);
  };

  const openEdit = (w: WarehouseRow) => {
    setEditingId(w.id);
    setForm({ name: w.name, code: w.code, address: w.address ?? "" });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const url = editingId ? `/api/warehouses/${editingId}` : "/api/warehouses";
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { name: form.name.trim(), code: form.code.trim(), address: form.address.trim() || null } : form;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? t("error"));
        return;
      }
      toast.success(editingId ? t("admin.updated") : t("admin.added"));
      setOpen(false);
      fetchList();
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.warehouses")}</h1>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          {t("admin.addWarehouse")}
        </Button>
      </div>
      <div className="card-premium rounded-2xl overflow-x-auto min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.columnName")}</TableHead>
              <TableHead>{t("admin.warehouseCode")}</TableHead>
              <TableHead>{t("checkout.address")}</TableHead>
              <TableHead className="w-24">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noWarehouses")}</TableCell>
              </TableRow>
            ) : (
              list.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell className="font-mono">{w.code}</TableCell>
                  <TableCell className="text-muted-foreground">{w.address ?? "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" title={t("admin.edit")} onClick={() => openEdit(w)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("admin.edit") : t("admin.addWarehouse")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("admin.columnName")}</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("admin.warehouseNamePlaceholder")} required />
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.warehouseCode")}</Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="MAIN" required />
            </div>
            <div className="grid gap-2">
              <Label>{t("checkout.address")}</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button type="submit">{editingId ? t("admin.save") : t("admin.add")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
