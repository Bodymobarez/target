import { useState } from "react";
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
import { Search, Eye, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";

const mockOrders = [
  { id: "ORD-2847", customer: "John Doe", total: 1199, status: "shipped", date: "2025-01-29", tracking: "1Z999AA10123456784" },
  { id: "ORD-2846", customer: "Jane Smith", total: 249, status: "delivered", date: "2025-01-28", tracking: "1Z999AA10123456785" },
  { id: "ORD-2845", customer: "Ahmed Ali", total: 3499, status: "processing", date: "2025-01-28", tracking: null },
  { id: "ORD-2844", customer: "Sara Lee", total: 799, status: "pending", date: "2025-01-27", tracking: null },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  processing: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400",
};

export default function AdminOrders() {
  const { t, formatPriceFromUsd } = useLanguage();
  const [search, setSearch] = useState("");

  const statusLabel: Record<string, string> = {
    pending: "admin.pending",
    processing: "admin.processing",
    shipped: "admin.shipped",
    delivered: "admin.delivered",
  };

  const filtered = mockOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.orders")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchOrders")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{formatPriceFromUsd(order.total)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status] ?? "bg-secondary"}>
                    {statusLabel[order.status] ? t(statusLabel[order.status]) : order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.tracking && (
                      <Button variant="ghost" size="icon" title="Tracking">
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
