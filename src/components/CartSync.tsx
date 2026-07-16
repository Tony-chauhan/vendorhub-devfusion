'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomUser } from '@/lib/clerk-client';
import { setCart } from '@/lib/features/cart/cartSlice';

export default function CartSync() {
  const { isLoaded, isSignedIn } = useCustomUser();
  const dispatch = useDispatch();
  const cart = useSelector((state: { cart: { cartItems: Record<string, number>, total: number } }) => state.cart);
  const isFirstRender = useRef(true);
  const syncInitiated = useRef(false);

  // 1. Initialize from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localCart = localStorage.getItem('vendorhub_cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          dispatch(setCart(parsedCart));
        } catch (error) {
          console.error('Failed to parse local cart', error);
        }
      }
    }
  }, [dispatch]);

  // 2. Sync with database when user logs in
  useEffect(() => {
    async function syncWithDB() {
      if (isLoaded && isSignedIn && !syncInitiated.current) {
        syncInitiated.current = true;
        try {
          const res = await fetch('/api/user/cart');
          if (res.ok) {
            const data = await res.json();
            const dbCart = data.cart;
            
            // Merge logic: currently simple overwrite or db-priority.
            // A more complex merge could add quantities together.
            // For now, if local cart has items and db cart is empty, push local to db.
            // If db cart has items, pull to local.
            const localCartStr = localStorage.getItem('vendorhub_cart');
            const localCart = localCartStr ? JSON.parse(localCartStr) : { cartItems: {}, total: 0 };
            
            let mergedCart = { ...dbCart };

            // Very simple merge: if db cart is empty, use local.
            if (!dbCart || Object.keys(dbCart.cartItems || {}).length === 0) {
                mergedCart = localCart;
            }

            dispatch(setCart(mergedCart));
            localStorage.setItem('vendorhub_cart', JSON.stringify(mergedCart));

            // Save merged back to DB
            await fetch('/api/user/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mergedCart),
            });
          }
        } catch (error) {
          console.error('Failed to sync cart with DB', error);
        }
      }
    }
    syncWithDB();
  }, [isLoaded, isSignedIn, dispatch]);

  // 3. Save to localStorage and DB on cart changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('vendorhub_cart', JSON.stringify(cart));
      
      // If signed in, update DB in background
      if (isSignedIn) {
        fetch('/api/user/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cart),
        }).catch(err => console.error('Failed to update DB cart', err));
      }
    }
  }, [cart, isSignedIn]);

  return null; // This is a utility component, no UI
}
