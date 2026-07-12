'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import CartSync from '@/components/CartSync';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <CartSync />
      {children}
    </Provider>
  );
}
