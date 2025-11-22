import { getPendingSyncItems, removeSyncItem } from './idb-service';

let isSyncing = false;

export const startSyncLoop = () => {
  setInterval(async () => {
    if (isSyncing || !navigator.onLine) return;

    isSyncing = true;
    
    try {
      const pendingItems = await getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        isSyncing = false;
        return;
      }

      console.log(`Syncing ${pendingItems.length} items...`);

      for (const item of pendingItems) {
        try {
          // Body handling: Agar GET/HEAD nahi hai aur body exist karti hai tabhi stringify karo
          const options = {
            method: item.method,
            headers: { 'Content-Type': 'application/json' },
          };

          if (item.body && item.method !== 'GET' && item.method !== 'DELETE') {
            options.body = JSON.stringify(item.body);
          }

          const response = await fetch(item.url, options);

          // --- SUCCESS CRITERIA ---
          // 1. response.ok (200-299)
          // 2. 409 (Conflict - Already exists)
          // 3. 404 (Not Found - DELETE ke case mein iska matlab success hai)
          const isSuccess = response.ok || response.status === 409 || (item.method === 'DELETE' && response.status === 404);

          if (isSuccess) {
             await removeSyncItem(item.id);
             console.log(`Synced (${item.method}): ${item.id}`);
          } else {
             // Server ne 500 ya koi aur error diya -> Retry later
             console.error(`Sync Failed for ${item.id}: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          // Network error (fetch failed) -> Queue mein rehne do, next time try hoga
          console.error('Network Error skipping item:', err);
        }
      }

    } catch (error) {
      console.error('SYNC_LOOP_ERROR', error);
    } finally {
      isSyncing = false;
    }

  }, 2000); 
};

