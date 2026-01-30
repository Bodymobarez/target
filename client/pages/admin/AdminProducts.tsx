import { useState, useRef } from "react";
import { products as initialProducts, categories } from "@/data/mockProducts";
import type { Product } from "@shared/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AdminProduct = Product & { sku?: string; stockQuantity?: number };

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function AdminProducts() {
  const { t, formatPriceFromUsd } = useLanguage();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState<AdminProduct[]>(() =>
    initialProducts.map((p) => ({
      ...p,
      sku: (p as AdminProduct).sku ?? p.id,
      stockQuantity: (p as AdminProduct).stockQuantity ?? 0,
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "iphone",
    categoryName: "iPhone",
    condition: "NEW" as "NEW" | "USED",
    sku: "",
    stockQuantity: "0",
    description: "",
    imageUrl: "",
  });

  const filtered = list.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      categoryId: "iphone",
      categoryName: categories[0].name,
      condition: "NEW",
      sku: "",
      stockQuantity: "0",
      description: "",
      imageUrl: "",
    });
    setOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      condition: p.condition === "USED" ? "USED" : "NEW",
      sku: p.sku ?? "",
      stockQuantity: String(p.stockQuantity ?? 0),
      description: p.description ?? "",
      imageUrl: p.images?.[0] ?? "",
    });
    setOpen(true);
  };

  const openAddDialog = () => {
    openAdd();
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      toast.error(t("admin.uploadImageOnly") ?? "Only JPEG, PNG, GIF or WebP images");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("admin.uploadMaxSize") ?? "Max size 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message ?? t("error"));
        return;
      }
      if (data.url) {
        setForm((f) => ({ ...f, imageUrl: data.url }));
        toast.success(t("admin.imageUploaded") ?? "Image uploaded");
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setUploading(false);
      e.target.value = "";
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price) || 0;
    const stockQuantity = parseInt(form.stockQuantity, 10) || 0;
    const category = categories.find((c) => c.id === form.categoryId) ?? categories[0];
    const images = form.imageUrl ? [form.imageUrl] : ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop"];

    if (editingId) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name,
                price,
                categoryId: category.id,
                categoryName: category.name,
                condition: form.condition,
                sku: form.sku || undefined,
                stockQuantity,
                description: form.description,
                images,
                inStock: stockQuantity > 0,
              }
            : item
        )
      );
    } else {
      const slug = form.sku ? toSlug(form.sku) : toSlug(form.name);
      const id = form.sku || `${slug}-${Date.now()}`;
      const newProduct: AdminProduct = {
        id,
        slug: slug || id,
        name: form.name,
        categoryId: category.id,
        categoryName: category.name,
        condition: form.condition,
        description: form.description,
        shortDescription: form.description.slice(0, 80),
        price,
        currency: "USD",
        images,
        rating: 0,
        reviewCount: 0,
        specs: [],
        colors: [],
        inStock: stockQuantity > 0,
        sku: form.sku || id,
        stockQuantity,
      };
      setList((prev) => [...prev, newProduct]);
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
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.products")}</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchProducts")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
              {t("admin.addProduct")}
            </Button>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t("admin.edit") : t("admin.addProduct")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("admin.columnName")}</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Product name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">{t("admin.columnPrice")} (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="999"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stockQuantity">{t("admin.columnQuantity")}</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={form.stockQuantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stockQuantity: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t("admin.columnCategory")}</Label>
                  <select
                    id="category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={form.categoryId}
                    onChange={(e) => {
                      const c = categories.find((x) => x.id === e.target.value);
                      if (c)
                        setForm((f) => ({
                          ...f,
                          categoryId: c.id,
                          categoryName: c.name,
                        }));
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">{t("admin.columnCondition")}</Label>
                  <select
                    id="condition"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={form.condition}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, condition: e.target.value as "NEW" | "USED" }))
                    }
                  >
                    <option value="NEW">{t("products.conditionNew")}</option>
                    <option value="USED">{t("products.conditionUsed")}</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">{t("admin.columnSKU")}</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("admin.description")}</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">{t("admin.imageUrl")}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                      }
                      placeholder="https://... أو ارفع صورة"
                      className="flex-1"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 shrink-0"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? t("loading") : (t("admin.uploadImage") ?? "رفع صورة")}
                    </Button>
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={form.imageUrl}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover border border-border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
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
              <TableHead className="w-14">{t("admin.columnImage")}</TableHead>
              <TableHead>{t("admin.columnName")}</TableHead>
              <TableHead>{t("admin.columnCategory")}</TableHead>
              <TableHead>{t("admin.columnCondition")}</TableHead>
              <TableHead>{t("admin.columnSKU")}</TableHead>
              <TableHead>{t("admin.columnPrice")}</TableHead>
              <TableHead>{t("admin.columnStock")}</TableHead>
              <TableHead>{t("admin.columnQuantity")}</TableHead>
              <TableHead className="w-24">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>
                  <span className={product.condition === "USED" ? "text-amber-600 font-medium" : ""}>
                    {product.condition === "USED" ? t("products.conditionUsed") : t("products.conditionNew")}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {product.sku ?? product.id}
                </TableCell>
                <TableCell>{formatPriceFromUsd(product.price)}</TableCell>
                <TableCell>
                  {product.inStock ? t("inStock") : t("outOfStock")}
                </TableCell>
                <TableCell>{product.stockQuantity ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(product.id)}
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
            <AlertDialogDescription>
              {t("admin.confirmDelete")}
            </AlertDialogDescription>
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
