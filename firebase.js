import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo5Qjmr1grMpAS_iVCERjOV1vopmd4uYQ",
  authDomain: "inspectmoto-9b0d5.firebaseapp.com",
  databaseURL: "https://inspectmoto-9b0d5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inspectmoto-9b0d5",
  storageBucket: "inspectmoto-9b0d5.firebasestorage.app",
  messagingSenderId: "487219726207",
  appId: "1:487219726207:web:23d739d17a1808eec0fc4a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

// ── Bookings ──────────────────────────────────────────────
export async function createBooking(data) {
  const ref = await addDoc(collection(db, "bookings"), {
    ...data,
    status: "pending", // pending → assigned → in_progress → completed
    createdAt: new Date().toISOString(),
    assignedTo: null,
    inspectorName: null,
    reportId: null,
  });
  return ref.id;
}

export async function fetchAllBookings() {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingsByInspector(inspectorName) {
  const q = query(
    collection(db, "bookings"),
    where("inspectorName", "==", inspectorName),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingsByPhone(phone) {
  const clean = phone.replace(/\D/g, "").slice(-10);
  const snap = await getDocs(collection(db, "bookings"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => (b.phone || "").replace(/\D/g, "").slice(-10) === clean);
}

export async function assignBooking(bookingId, inspectorName) {
  await updateDoc(doc(db, "bookings", bookingId), {
    assignedTo: inspectorName,
    inspectorName,
    status: "assigned",
    assignedAt: new Date().toISOString(),
  });
}

export async function updateBookingStatus(bookingId, status) {
  await updateDoc(doc(db, "bookings", bookingId), { status });
}

// ── Reports ───────────────────────────────────────────────
export async function saveReport(data) {
  const ref = await addDoc(collection(db, "reports"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, "bookings", data.bookingId), {
    reportId: ref.id,
    status: "completed",
  });
  return ref.id;
}

export async function fetchReportByBooking(bookingId) {
  const q = query(collection(db, "reports"), where("bookingId", "==", bookingId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ── Inspectors ────────────────────────────────────────────
export async function fetchInspectors() {
  const snap = await getDocs(collection(db, "inspectors"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function validateInspectorLogin(name, pin) {
  const q = query(
    collection(db, "inspectors"),
    where("name", "==", name),
    where("pin", "==", pin)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function addInspector(name, pin, phone) {
  const ref = await addDoc(collection(db, "inspectors"), { name, pin, phone });
  return ref.id;
}

export async function deleteInspector(id) {
  await deleteDoc(doc(db, "inspectors", id));
}
