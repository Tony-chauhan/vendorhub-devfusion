'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import CartSync from '@/components/CartSync';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(() => makeStore());

  return (
    <Provider store={store}>
      <CartSync />
      {children}
    </Provider>
  );
}
