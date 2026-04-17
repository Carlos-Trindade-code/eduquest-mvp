import '@testing-library/jest-dom/vitest';

// Node 25 ships a built-in experimental `localStorage` global that shadows jsdom's
// implementation and lacks getItem/setItem/clear. Replace it with a minimal
// spec-compliant Storage polyfill so tests behave like a browser.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, name, { value: storage, writable: true, configurable: true });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, { value: storage, writable: true, configurable: true });
  }
}
