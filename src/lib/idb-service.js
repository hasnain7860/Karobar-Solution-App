import { openDB } from 'idb';

const DB_NAME = 'KarobarAppDB';
const DB_VERSION = 3;

// --- 1. INITIALIZE DATABASE ---
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Stores wese hi rahenge
      if (!db.objectStoreNames.contains('parties')) {
        const store = db.createObjectStore('parties', { keyPath: '_id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('phone', 'phone', { unique: false });
      }
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: '_id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('barcode', 'barcode', { unique: false });
      }
      if (!db.objectStoreNames.contains('business')) {
        db.createObjectStore('business', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
      }
            if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: '_id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('barcode', 'barcode', { unique: false });
      }

      // 2. Units
      if (!db.objectStoreNames.contains('units')) {
        db.createObjectStore('units', { keyPath: '_id' });
      }

      // 3. Companies
      if (!db.objectStoreNames.contains('companies')) {
        db.createObjectStore('companies', { keyPath: '_id' });
      }
    },
  });
};

// --- GENERIC SAVE (SYNC DOWNLOAD) ---
export const saveToIndexedDB = async (storeName, data) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  if (Array.isArray(data)) {
    for (const item of data) await store.put(item);
  } else if (data) {
    await store.put(data);
  }
  await tx.done;
};



export const updateItemLocal = async (storeName, item, apiPath) => {
  const db = await initDB();
  const tx = db.transaction([storeName, 'pendingSync'], 'readwrite');
  
  // 1. Local Update
  await tx.objectStore(storeName).put(item);
  
  // 2. Sync Queue (PUT)
  await tx.objectStore('pendingSync').add({
    url: apiPath, // e.g., /api/products
    method: 'PUT',
    body: item,
    type: `${storeName}_update`,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  await tx.done;
};

// --- GENERIC DELETE ---
export const deleteItemLocal = async (storeName, id, apiPath) => {
  const db = await initDB();
  const tx = db.transaction([storeName, 'pendingSync'], 'readwrite');
  
  // 1. Local Delete
  await tx.objectStore(storeName).delete(id);
  
  // 2. Sync Queue (DELETE)
  await tx.objectStore('pendingSync').add({
    url: `${apiPath}?id=${id}`, // /api/products?id=123
    method: 'DELETE',
    body: null,
    type: `${storeName}_delete`,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  await tx.done;
};

export const addItemLocal = async (storeName, item, apiPath) => {
  const db = await initDB();
  const tx = db.transaction([storeName, 'pendingSync'], 'readwrite');
  
  await tx.objectStore(storeName).put(item);
  await tx.objectStore('pendingSync').add({
    url: apiPath,
    method: 'POST',
    body: item,
    type: `${storeName}_create`,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  await tx.done;
};

// Generic Get All
export const getAllItemsLocal = async (storeName) => {
  const db = await initDB();
  return await db.getAll(storeName);
};


// --- PARTIES ACTIONS (USER SIDE) ---

export const addPartyLocal = async (party) => {
  const db = await initDB();
  const tx = db.transaction(['parties', 'pendingSync'], 'readwrite');
  await tx.objectStore('parties').put(party);
  await tx.objectStore('pendingSync').add({
    url: '/api/parties',
    method: 'POST',
    body: party,
    type: 'party_create',
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  await tx.done;
};

// [NEW] Update Party Function
export const updatePartyLocal = async (party) => {
  const db = await initDB();
  const tx = db.transaction(['parties', 'pendingSync'], 'readwrite');
  
  // 1. Local DB update karo (Instant UI reflection)
  await tx.objectStore('parties').put(party);
  
  // 2. Sync Queue mein 'PUT' request daalo
  await tx.objectStore('pendingSync').add({
    url: `/api/parties?id=${party._id}`, // Query param or body, API structure pe depend karta hai. Body is safer.
    // Note: Hum body mein ID bhej rahe hain, so URL simple rakhte hain
    url: '/api/parties', 
    method: 'PUT', // API route mein PUT handle karna padega
    body: party,
    type: 'party_update',
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  await tx.done;
};

// --- GETTERS ---
export const getAllPartiesLocal = async () => {
  const db = await initDB();
  return await db.getAll('parties');
};
export const getAllProductsLocal = async () => {
  const db = await initDB();
  return await db.getAll('products');
};

// --- SYNC WORKER HELPERS ---
export const getPendingSyncItems = async () => {
  const db = await initDB();
  return await db.getAll('pendingSync');
};
export const removeSyncItem = async (id) => {
  const db = await initDB();
  await db.delete('pendingSync', id);
};












export const deletePartyLocal = async (id) => {
  const db = await initDB();
  const tx = db.transaction(['parties', 'pendingSync'], 'readwrite');
  
  // 1. Local se uda do (Instant)
  await tx.objectStore('parties').delete(id);
  
  // 2. Sync Queue mein DELETE job daalo
  await tx.objectStore('pendingSync').add({
    url: `/api/parties?id=${id}`, // ID URL params mein bhej rahe hain
    method: 'DELETE',
    body: null, // DELETE mein body ki zaroorat nahi hoti
    type: 'party_delete',
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  await tx.done;
};



