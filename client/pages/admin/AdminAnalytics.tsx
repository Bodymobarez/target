import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const mockMetrics = {
  totalRevenue: 124500,
  ordersCount: 2847,
  avgOrder: 43.8,
  topProducts: [
    { name: "iPhone 15 Pro Max", units: 420, revenue: 503580 },
    { name: "MacBook Pro 14\"", units: 198, revenue: 395802 },
    { name: "AirPods Pro", units: 856, revenue: 213944 },
  ],
};

export default function AdminAnalytics() {
  const { t, formatPriceFromUsd } = useLanguage();
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-01-31");
  const [metrics] = useState(mockMetrics);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.analytics")}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">{t("admin.dateRange")}</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t("admin.export")}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.totalRevenue")}
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPriceFromUsd(metrics.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {t("admin.vsLastPeriod")}
            </p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.ordersCount")}
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.ordersCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {t("admin.vsLastPeriod")}
            </p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.avgOrder")}
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPriceFromUsd(metrics.avgOrder)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("admin.perOrder")}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.period")}
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{dateFrom}</p>
            <p className="text-sm text-muted-foreground">{dateTo}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top products table */}
      <Card className="card-premium rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t("admin.topProducts")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("admin.columnName")}</TableHead>
                  <TableHead>{t("admin.quantity")}</TableHead>
                  <TableHead>{t("admin.totalRevenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topProducts.map((p, i) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.units.toLocaleString()}</TableCell>
                    <TableCell>{formatPriceFromUsd(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart placeholder */}
      <Card className={cn("card-premium rounded-2xl mt-6")}>
        <CardHeader>
          <CardTitle>{t("admin.revenueChart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground border border-dashed">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("admin.chartPlaceholder")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
