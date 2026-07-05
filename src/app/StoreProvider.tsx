'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { hydrateCart } from '@/lib/features/cart/cartSlice';

const CART_STORAGE_KEY = 'vendorhub_cart';

function loadPersistedCart() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Hydrate from localStorage (and persist future changes) only after the initial
  // client render, so the first paint always matches the server's empty cart and
  // we don't trigger a hydration mismatch.
  useEffect(() => {
    const store = storeRef.current!;
    const persistedCart = loadPersistedCart();
    if (persistedCart) {
      store.dispatch(hydrateCart(persistedCart));
    }

    return store.subscribe(() => {
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart));
      } catch {
        // localStorage may be unavailable (private browsing, quota) — cart just won't persist.
      }
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
