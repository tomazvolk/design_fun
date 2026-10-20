import type { Combination } from "./types";

/**
 * IndexedDB for saved combinations and recents (PRD: localStorage is too small and synchronous for the
 * data that matters). Two stores: "combinations" keyed by id, "kv" for small lists. iOS Safari may evict
 * this after 7 days without use; the UI nudges to install after a save for that reason.
 */
const NAME = "pairing-explorer";
const VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no indexeddb"));
    const req = indexedDB.open(NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("combinations")) db.createObjectStore("combinations", { keyPath: "id" });
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        t.oncomplete = () => { db.close(); resolve(req ? (req.result as T) : (undefined as T)); };
        t.onerror = () => { db.close(); reject(t.error); };
        t.onabort = () => { db.close(); reject(t.error); };
      }),
  );
}

export const db = {
  allCombinations: () => tx<Combination[]>("combinations", "readonly", (s) => s.getAll()).catch(() => [] as Combination[]),
  putCombination: (c: Combination) => tx<IDBValidKey>("combinations", "readwrite", (s) => s.put(c)),
  deleteCombination: (id: string) => tx<undefined>("combinations", "readwrite", (s) => s.delete(id)),
  getKv: <T>(key: string) => tx<T | undefined>("kv", "readonly", (s) => s.get(key) as IDBRequest<T | undefined>).catch(() => undefined),
  setKv: <T>(key: string, value: T) => tx<IDBValidKey>("kv", "readwrite", (s) => s.put(value, key)),
};

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
