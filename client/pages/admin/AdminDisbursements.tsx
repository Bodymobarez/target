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
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";

type DisbursementRow = {
  id: string;
  orderId: string;
  warehouseId: string;
  warehouse: { id: string; name: string; code: string };
  status: string;
  completedAt?: string | null;
  createdAt: string;
  order: { id: string; status: string; total: number; currency: string; shippingAddress?: { fullName?: string; phone?: string } };
  items: { productId: string; productName: string; quantity: number; pickedQuantity: number }[];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  IN_PROGRESS: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-green-500/20 text-green-700 dark:text-green-400",
  CANCELLED: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const statusLabel: Record<string, string> = {
  PENDING: "admin.disbursementPending",
  IN_PROGRESS: "admin.disbursementInProgress",
  COMPLETED: "admin.disbursementCompleted",
  CANCELLED: "admin.cancelled",
};

export default function AdminDisbursements() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [list, setList] = useState<DisbursementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = () => {
    if (!token) return;
    const q = filterStatus ? `?status=${filterStatus}` : "";
    fetch(`/api/disbursements${q}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: DisbursementRow[]) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [token, filterStatus]);

  const updateStatus = async (id: string, status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/disbursements/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? t("error"));
        return;
      }
      toast.success(t("admin.updated"));
      fetchList();
    } catch {
      toast.error(t("error"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.disbursements")}</h1>
        <select
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="PENDING">{t("admin.disbursementPending")}</option>
          <option value="IN_PROGRESS">{t("admin.disbursementInProgress")}</option>
          <option value="COMPLETED">{t("admin.disbursementCompleted")}</option>
          <option value="CANCELLED">{t("admin.cancelled")}</option>
        </select>
      </div>
      <div className="card-premium rounded-2xl overflow-x-auto min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.orderId")}</TableHead>
              <TableHead>{t("admin.warehouse")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.date")}</TableHead>
              <TableHead className="w-40">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("admin.noDisbursements")}</TableCell>
              </TableRow>
            ) : (
              list.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium">{d.orderId.slice(0, 12)}…</TableCell>
                  <TableCell>{d.warehouse?.name ?? "—"} ({d.warehouse?.code ?? "—"})</TableCell>
                  <TableCell>
                    <Badge className={statusColors[d.status] ?? "bg-secondary"}>{t(statusLabel[d.status] ?? d.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {d.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        disabled={updatingId === d.id}
                        onClick={() => updateStatus(d.id, "IN_PROGRESS")}
                      >
                        <Package className="w-4 h-4" />
                        {t("admin.startPicking")}
                      </Button>
                    )}
                    {d.status === "IN_PROGRESS" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-green-600"
                        disabled={updatingId === d.id}
                        onClick={() => updateStatus(d.id, "COMPLETED")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t("admin.markCompleted")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
