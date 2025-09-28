import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp, serverTimestamp, WhereFilterOp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const getFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // Check if all required Firebase config values are present
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    // During build time, don't throw error - just return null config
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn('Firebase configuration missing during build. This is expected and will be resolved at runtime.');
      return null;
    }
    throw new Error('Missing Firebase configuration. Please check your environment variables.');
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  };
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let initialized = false;

const initializeFirebase = () => {
  if (initialized) return; // Already initialized

  try {
    const firebaseConfig = getFirebaseConfig();

    // If config is null (during build time), skip initialization
    if (!firebaseConfig) {
      console.warn('Firebase initialization skipped - configuration not available');
      return;
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    initialized = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    // In development, provide fallback values to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using fallback Firebase configuration for development');
      app = null;
      auth = null;
      db = null;
      storage = null;
      initialized = false;
    } else {
      throw error; // Re-throw in production
    }
  }
};

// Remove immediate initialization - will be called lazily
// initializeFirebase();

export { app, auth, db, storage };

// Authentication services
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    initializeFirebase(); // Lazy initialization
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
    }
    return await signInWithEmailAndPassword(auth, email, password);
  },

  signUp: async (email: string, password: string) => {
    initializeFirebase(); // Lazy initialization
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
    }
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  signOut: async () => {
    initializeFirebase(); // Lazy initialization
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
    }
    return await signOut(auth);
  },

  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    initializeFirebase(); // Lazy initialization
    if (!auth) {
      console.warn('Firebase Auth is not initialized. Auth state changes will not be monitored.');
      return () => { }; // Return a no-op unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    initializeFirebase(); // Lazy initialization
    if (!auth) {
      return null;
    }
    return auth.currentUser;
  }
};

// Firestore services
export const firestoreService = {
  // Generic CRUD operations
  create: async (collectionName: string, data: any, docId?: string) => {
    initializeFirebase(); // Lazy initialization
    if (!db) {
      throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
    }
    const docRef = docId ? doc(db, collectionName, docId) : doc(db, collectionName);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  read: async (collectionName: string, docId: string) => {
    initializeFirebase(); // Lazy initialization
    if (!db) {
      throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  readAll: async (collectionName: string, filters?: Array<{ field: string; operator: string; value: any }>) => {
    initializeFirebase(); // Lazy initialization
    if (!db) {
      throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
    }
    let q: any = collection(db, collectionName);

    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator as WhereFilterOp, filter.value));
      });
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()! }));
  },

  update: async (collectionName: string, docId: string, data: any) => {
    initializeFirebase(); // Lazy initialization
    if (!db) {
      throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // Storage services
  uploadFile: async (path: string, file: File) => {
    initializeFirebase(); // Lazy initialization
    if (!storage) {
      throw new Error('Firebase Storage is not initialized. Please check your Firebase configuration.');
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
};

// Type definitions
export interface Tenant {
  id?: string;
  name: string;
  domain: string;
  settings: {
    theme: string;
    branding: {
      logo: string;
      colors: {
        primary: string;
        secondary: string;
      };
    };
  };
  subscription: {
    plan: string;
    status: 'active' | 'cancelled' | 'expired';
    expiresAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  tenantId: string;
  avatar?: string;
  settings: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Client {
  id?: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  tags: string[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id?: string;
  tenantId: string;
  clientId: string;
  name: string;
  description?: string;
  status: 'inquiry' | 'active' | 'completed' | 'cancelled';
  startDate?: Timestamp;
  endDate?: Timestamp;
  budget?: number;
  tags: string[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Invoice {
  id?: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  number: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Timestamp;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contract {
  id?: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  signedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default app;