import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "apple-store-compare";

function loadCompare(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveCompare(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

interface CompareContextValue {
  productIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>(loadCompare);

  const add = useCallback((id: string) => {
    setProductIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, id];
      saveCompare(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setProductIds((prev) => {
      const next = prev.filter((x) => x !== id);
      saveCompare(next);
      return next;
    });
  }, []);

  const has = useCallback(
    (id: string) => productIds.includes(id),
    [productIds]
  );

  const value = useMemo(
    () => ({
      productIds,
      add,
      remove,
      has,
      count: productIds.length,
      canAdd: productIds.length < MAX_COMPARE,
    }),
    [productIds, add, remove, has]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
