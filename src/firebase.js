// Lightweight Firebase helper — uses Vite env vars `VITE_FIREBASE_*`
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const enabled = Boolean(cfg.apiKey && cfg.projectId);
let db = null;
if (enabled) {
  try {
    const app = initializeApp(cfg);
    db = getFirestore(app);
    console.log('Firebase initialized');
  } catch (e) {
    console.warn('Failed to init Firebase', e);
  }
}

export function isFirebaseEnabled() {
  return enabled && db;
}

export function subscribeToEvents(cb) {
  if (!isFirebaseEnabled()) return () => {};
  const q = query(collection(db, 'events'), orderBy('start', 'asc'));
  return onSnapshot(q, (snap) => {
    const out = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(out);
  });
}

export async function addEventToDb(ev) {
  if (!isFirebaseEnabled()) throw new Error('firebase-not-enabled');
  // omit id if present so Firestore generates one
  const copy = { ...ev };
  delete copy.id;
  const ref = await addDoc(collection(db, 'events'), copy);
  return { id: ref.id };
}

export async function deleteEventFromDb(id) {
  if (!isFirebaseEnabled()) throw new Error('firebase-not-enabled');
  await deleteDoc(doc(db, 'events', id));
}
