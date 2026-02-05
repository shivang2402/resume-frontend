"use client";

import { useState, useEffect, useCallback } from "react";
import { TempEdit, TempEdits } from "@/types/jd-matcher";

const STORAGE_KEY = "jd-matcher-temp-edits";

export function useTempEdits() {
  const [tempEdits, setTempEdits] = useState<TempEdits>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTempEdits(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse temp edits:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempEdits));
  }, [tempEdits]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(tempEdits).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tempEdits]);

  const getSectionId = (type: string, key: string, flavor: string) =>
    `${type}:${key}:${flavor}`;

  const addTempEdit = useCallback(
    (
      type: string,
      key: string,
      flavor: string,
      originalVersion: string,
      content: TempEdit["content"]
    ) => {
      const sectionId = getSectionId(type, key, flavor);
      setTempEdits((prev) => ({
        ...prev,
        [sectionId]: {
          type: type as TempEdit["type"],
          key,
          flavor,
          originalVersion,
          content,
          editedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const removeTempEdit = useCallback(
    (type: string, key: string, flavor: string) => {
      const sectionId = getSectionId(type, key, flavor);
      setTempEdits((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    },
    []
  );

  const getTempEdit = useCallback(
    (type: string, key: string, flavor: string) => {
      const sectionId = getSectionId(type, key, flavor);
      return tempEdits[sectionId];
    },
    [tempEdits]
  );

  const clearAllTempEdits = useCallback(() => {
    setTempEdits({});
  }, []);

  return {
    tempEdits,
    addTempEdit,
    removeTempEdit,
    getTempEdit,
    clearAllTempEdits,
    hasTempEdits: Object.keys(tempEdits).length > 0,
    tempEditCount: Object.keys(tempEdits).length,
  };
}
