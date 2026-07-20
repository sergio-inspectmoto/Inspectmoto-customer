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
  apiKey: "AIzaSyDukHdbUYBKBnV5Fw_Grzz7erbqtKwrmZM",
  authDomain: "inspectmoto-a82d1.firebaseapp.com",
  projectId: "inspectmoto-a82d1",
  storageBucket: "inspectmoto-a82d1.firebasestorage.app",
  messagingSenderId: "697281844288",
  appId: "1:697281844288:web:1b2cc6d60a8dd973bcbba5"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

// ── Helpers ───────────────────────────────────────────────
function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IM-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function generateBookingId() {
  const snap = await getDocs(collection(db, "bookings"));
  const count = snap.size + 1;
  return "IM" + String(count).padStart(6, "0");
}

// ── Bookings ──────────────────────────────────────────────
export async function createBooking(data) {
  const accessCode = generateAccessCode();
  const bookingId = await generateBookingId();
  const ref = await addDoc(collection(db, "bookings"), {
    ...data,
    bookingId,
    accessCode,
    status: "pending",
    createdAt: new Date().toISOString(),
    assignedTo: null,
    inspectorName: null,
    reportId: null,
  });
  return { id: ref.id, bookingId, accessCode };
}

export async function fetchAllBookings() {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingsByPhoneAndCode(phone, accessCode) {
  const clean = phone.replace(/\D/g, "").slice(-10);
  const snap = await getDocs(collection(db, "bookings"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) =>
      (b.phone || "").replace(/\D/g, "").slice(-10) === clean &&
      (b.accessCode || "").trim().toUpperCase() === accessCode.trim().toUpperCase()
    );
}

export async function fetchBookingsByInspector(inspectorName) {
  const q = query(collection(db, "bookings"), where("inspectorName", "==", inspectorName), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

export async function regenerateAccessCode(bookingId) {
  const newCode = generateAccessCode();
  await updateDoc(doc(db, "bookings", bookingId), { accessCode: newCode });
  return newCode;
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
  const q = query(collection(db, "inspectors"), where("name", "==", name), where("pin", "==", pin));
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
