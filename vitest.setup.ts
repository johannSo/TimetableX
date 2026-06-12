// Node 26+ defines a non-functional `localStorage`/`sessionStorage` global
// (a getter that returns undefined unless --localstorage-file is set). Vitest's
// jsdom environment only installs its own working implementation for globals
// that are *not already present* on `globalThis`, so on Node 26 jsdom's
// localStorage/sessionStorage never get wired up. Provide a minimal in-memory
// Storage polyfill for jsdom-environment test files instead.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, String(value)),
  } as Storage;
}

if (typeof globalThis.window !== 'undefined') {
  if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
  }

  if (typeof globalThis.sessionStorage === 'undefined') {
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
  }
}
