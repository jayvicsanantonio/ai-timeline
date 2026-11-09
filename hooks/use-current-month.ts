// Reports the reader's current month, as months counted from year 0 (`monthCountOf`), once the page runs in the browser.
// The page is prerendered, so it reads null on the server and while hydrating, and the month from the reader's clock after.
'use client';

import { useSyncExternalStore } from 'react';
import { monthCountOf } from '@/lib/relative-time';

// The month changes too rarely to watch for while the page is open
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return monthCountOf(new Date());
}

function getServerSnapshot() {
  return null;
}

export function useCurrentMonth() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
