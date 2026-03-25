"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { PGListing } from "@/data/listings";

type CompareContextType = {
  compareList: PGListing[];
  addToCompare: (pg: PGListing) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  toggleCompare: (pg: PGListing) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
};

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<PGListing[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addToCompare = useCallback((pg: PGListing) => {
    setCompareList((prev) => {
      if (prev.length >= 3 || prev.find((c) => c.id === pg.id)) return prev;
      return [...prev, pg];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setShowModal(false);
  }, []);

  const isInCompare = useCallback(
    (id: string) => compareList.some((c) => c.id === id),
    [compareList]
  );

  const toggleCompare = useCallback(
    (pg: PGListing) => {
      if (compareList.find((c) => c.id === pg.id)) {
        removeFromCompare(pg.id);
      } else {
        addToCompare(pg);
      }
    },
    [compareList, addToCompare, removeFromCompare]
  );

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompare,
        showModal,
        setShowModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
