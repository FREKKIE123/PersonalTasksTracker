import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// Base path for all user data
export const userCol = (uid: string, col: string) =>
  collection(db, "users", uid, col);

export const userDoc = (uid: string, col: string, id: string) =>
  doc(db, "users", uid, col, id);

// Generic CRUD helpers
export async function addItem<T extends object>(uid: string, col: string, data: T) {
  return addDoc(userCol(uid, col), { ...data, createdAt: serverTimestamp() });
}

export async function updateItem<T extends object>(uid: string, col: string, id: string, data: Partial<T>) {
  return updateDoc(userDoc(uid, col, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteItem(uid: string, col: string, id: string) {
  return deleteDoc(userDoc(uid, col, id));
}

export async function getItems<T>(uid: string, col: string, ...constraints: QueryConstraint[]) {
  const q = query(userCol(uid, col), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
}

// Collection constants
export const COLLECTIONS = {
  jobs: "jobApplications",
  trades: "trades",
  certs: "certifications",
  events: "events",
  reminders: "reminders",
  reviews: "monthlyReviews",
  profile: "profile",
} as const;

export { orderBy, where };
